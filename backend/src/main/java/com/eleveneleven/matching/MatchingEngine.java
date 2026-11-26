package com.eleveneleven.matching;

import java.time.*;
import java.util.*;
import com.eleveneleven.questionnaire.Catalog.Answer;

/** Internal research policy, not a pairing workflow or a scientifically validated prediction. */
public final class MatchingEngine {
    /** PASS means only the implemented gates passed, not relationship compatibility or launch readiness. */
    public enum Gate { PASS, FAIL, NEEDS_INFO }
    public enum Gender { MAN, WOMAN, NON_BINARY, OTHER }
    public record Candidate(String id, LocalDate birthDate, boolean identityVerified, boolean suspended,
                            Gender gender, Set<Gender> interestedIn, boolean eventOptIn,
                            Map<String,Answer> answers, Map<String,String> operationalFacts) {
        public Candidate { interestedIn=Set.copyOf(interestedIn); answers=Map.copyOf(answers); operationalFacts=Map.copyOf(operationalFacts); }
    }
    public record Context(Clock clock, boolean blockedOrReported, boolean eventOpen) {}
    public record Policy(String version, Map<String,Double> domainWeights, double minimumCoverage, int minimumDimensions) {
        public Policy {
            domainWeights=Map.copyOf(domainWeights);
            if(version==null || version.isBlank() || Set.of("exploratory-v1","exploratory-v2").contains(version) || !domainWeights.keySet().equals(Set.of("shared_interests","partner_energy"))
                    || domainWeights.values().stream().anyMatch(w -> w==null || !Double.isFinite(w) || w<=0)
                    || !Double.isFinite(minimumCoverage) || minimumCoverage<0 || minimumCoverage>1 || minimumDimensions<2)
                throw new IllegalArgumentException("Invalid policy");
        }
        public static Policy exploratoryV3() { return new Policy("exploratory-v3",Map.of("shared_interests",0.6,"partner_energy",0.4),0.5,2); }
    }
    public enum Alignment { ALIGNED, CONFLICT, DISCUSS, UNKNOWN }
    public record Relationships(Alignment intention, Alignment structure, boolean pairingHeld) {}
    public record Evidence(String rule, String domain, Double aToB, Double bToA) {}
    public record Result(String policyVersion, Gate eligibility, List<String> reasons, Double compatibility,
                         double coverage, String confidence, List<Evidence> evidence,
                         String relationshipReadiness, boolean productionReady, Relationships relationships) {}
    private final Policy policy;
    public MatchingEngine(Policy policy) { this.policy=policy; }
    public Result evaluate(Candidate a,Candidate b,Context context) {
        var failed=new TreeSet<String>(); var missing=new TreeSet<String>();
        if(a.id().equals(b.id())) failed.add("SAME_PERSON");
        if(context.blockedOrReported()) failed.add("SAFETY_EXCLUSION");
        if(a.suspended() || b.suspended()) failed.add("SUSPENDED");
        if(!context.eventOpen() || !a.eventOptIn() || !b.eventOptIn()) failed.add("EVENT_NOT_MUTUALLY_SELECTED");
        for(var c:List.of(a,b)) {
            if(c.birthDate()==null) missing.add("BIRTH_DATE_REQUIRED");
            else if(c.birthDate().isAfter(LocalDate.now(context.clock()).minusYears(18))) failed.add("UNDER_18");
            if(!c.identityVerified()) missing.add("VERIFICATION_REQUIRED");
        }
        interest(a,b,failed,missing); interest(b,a,failed,missing);
        preferences(a,b,failed,missing); preferences(b,a,failed,missing);
        Gate gate=!failed.isEmpty()?Gate.FAIL:!missing.isEmpty()?Gate.NEEDS_INFO:Gate.PASS;
        var reasons=new ArrayList<>(failed); reasons.addAll(missing);
        var relationships=relationships(a,b);
        if(gate!=Gate.PASS) return new Result(policy.version(),gate,List.copyOf(reasons),null,0,"NOT_ASSESSED",List.of(),"PARTIALLY_ASSESSED",false,relationships);
        // A hold is about this pairing's unresolved agreements, never person-level ineligibility.
        if(relationships.pairingHeld()) return new Result(policy.version(),gate,List.of("RELATIONSHIP_REVIEW_REQUIRED"),
                null,0,"NOT_ASSESSED",List.of(),"HOLD_FOR_REVIEW",false,relationships);
        List<Evidence> evidence=new ArrayList<>();
        for(String key:List.of("conversations","movies","music")) {
            var left=known(a,key); var right=known(b,key);
            Double score=null;
            if(!left.isEmpty() && !right.isEmpty()) {
                var union=new HashSet<>(left); union.addAll(right);
                var intersection=new HashSet<>(left); intersection.retainAll(right);
                score=(double)intersection.size()/union.size();
            }
            evidence.add(new Evidence(key,"shared_interests",score,score));
        }
        evidence.add(new Evidence("partnerEnergy->energy","partner_energy",energy(a,b),energy(b,a)));
        double totalWeight=policy.domainWeights().values().stream().mapToDouble(x->x).sum();
        double coverage=0,forward=0,reverse=0,forwardWeight=0,reverseWeight=0;
        int dimensions=0;
        for(var e:evidence) if(e.aToB()!=null && e.bToA()!=null) dimensions++;
        for(var domain:new TreeMap<>(policy.domainWeights()).entrySet()) {
            var items=evidence.stream().filter(e->e.domain().equals(domain.getKey())).toList();
            double sumA=0,sumB=0; int countA=0,countB=0;
            for(var e:items) { if(e.aToB()!=null) {sumA+=e.aToB();countA++;} if(e.bToA()!=null) {sumB+=e.bToA();countB++;} }
            coverage+=domain.getValue()*(countA+countB)/(2.0*items.size())/totalWeight;
            if(countA>0) {forward+=domain.getValue()*sumA/countA; forwardWeight+=domain.getValue();}
            if(countB>0) {reverse+=domain.getValue()*sumB/countB; reverseWeight+=domain.getValue();}
        }
        Double score=null;
        if(coverage>=policy.minimumCoverage() && dimensions>=policy.minimumDimensions() && forwardWeight>0 && reverseWeight>0) {
            double x=forward/forwardWeight,y=reverse/reverseWeight;
            score=(x+y==0)?0.0:Math.round((100*(2*(x*y))/(x+y))*1_000_000.0)/1_000_000.0;
        }
        return new Result(policy.version(),gate,List.of(),score,coverage,score==null?"INSUFFICIENT_EVIDENCE":"EXPLORATORY_UNVALIDATED",List.copyOf(evidence),"PARTIALLY_ASSESSED",false,relationships);
    }
    private static Relationships relationships(Candidate a,Candidate b) {
        Alignment intention=intention(single(a,"relationship"),single(b,"relationship"));
        Alignment structure=structure(single(a,"relationshipStructure"),single(b,"relationshipStructure"));
        return new Relationships(intention,structure,intention!=Alignment.ALIGNED || structure!=Alignment.ALIGNED);
    }
    private static String single(Candidate candidate,String key) {
        var values=known(candidate,key);
        return values.size()==1?values.iterator().next():"";
    }
    private static Alignment intention(String a,String b) {
        // "Dating with intention" and "Exploring" do not specify the desired relationship form/time horizon.
        if(!Set.of("o01","o02","o04").contains(a) || !Set.of("o01","o02","o04").contains(b)) return Alignment.UNKNOWN;
        if(a.equals(b)) return Alignment.ALIGNED;
        if(a.equals("o04") || b.equals("o04")) return Alignment.CONFLICT; // Casual versus life partner/serious.
        return Alignment.DISCUSS; // Life partner versus serious: do not presume agreement on the future.
    }
    private static Alignment structure(String a,String b) {
        if(!Set.of("o01","o02","o03").contains(a) || !Set.of("o01","o02","o03").contains(b)) return Alignment.UNKNOWN;
        if(a.equals("o03") || b.equals("o03")) return Alignment.DISCUSS;
        return a.equals(b)?Alignment.ALIGNED:Alignment.CONFLICT;
    }
    private static void interest(Candidate a,Candidate b,Set<String> failed,Set<String> missing) {
        if(a.interestedIn().isEmpty() || b.gender()==null) missing.add("DATING_INTEREST_REQUIRED");
        else if(!a.interestedIn().contains(b.gender())) failed.add("DATING_INTEREST_NOT_RECIPROCAL");
    }
    private static void preferences(Candidate a,Candidate b,Set<String> failed,Set<String> missing) {
        if(known(a,"smokingFit").contains("o01")) {
            var fact=b.operationalFacts().get("smoking");
            if(fact==null || !Set.of("NONE","OCCASIONAL","REGULAR").contains(fact)) missing.add("SELF_SMOKING_REQUIRED");
            else if(!fact.equals("NONE")) failed.add("SMOKING_BOUNDARY");
        }
        if(known(a,"drinkingFit").contains("o01")) {
            var fact=b.operationalFacts().get("drinking");
            if(fact==null || !Set.of("NONE","OCCASIONAL","REGULAR").contains(fact)) missing.add("SELF_DRINKING_REQUIRED");
            else if(!fact.equals("NONE")) failed.add("DRINKING_BOUNDARY");
        }
        if(known(a,"sharedFaith").contains("o04")) {
            var aa=a.answers().get("religion"); var bb=b.answers().get("religion");
            var pref=a.answers().get("sharedFaith");
            if(aa==null || bb==null || !aa.sensitiveConsent() || !bb.sensitiveConsent() || !pref.sensitiveConsent()
                    || known(a,"religion").isEmpty() || known(b,"religion").isEmpty()
                    || known(a,"religion").contains("o10") || known(b,"religion").contains("o10")) missing.add("CONSENTED_FAITH_FACTS_REQUIRED");
            else if(Collections.disjoint(known(a,"religion"),known(b,"religion"))) failed.add("EXPLICIT_FAITH_BOUNDARY");
        }
        // Family-plan and structure hard constraints need richer normalized facts: never guess.
        if(known(a,"childrenAlignment").contains("o01")) missing.add("NORMALIZED_FAMILY_PLANS_REQUIRED");
    }
    private static Set<String> known(Candidate c,String key) {
        var a=c.answers().get(key);
        return a==null || a.version()!=1 || !a.status().equals("ANSWERED") ? Set.of():Set.copyOf(a.choices());
    }
    private static Double energy(Candidate a,Candidate b) {
        var pref=known(a,"partnerEnergy"); var actual=known(b,"energy");
        if(pref.size()!=1 || actual.size()!=1) return null;
        String p=pref.iterator().next(),v=actual.iterator().next();
        if(!Set.of("o01","o02","o03","o04","o05").contains(v)) return null;
        int value=Integer.parseInt(v.substring(1));
        Integer target=switch(p) { case "o01" -> 1; case "o02" -> 5; case "o03" -> 3; default -> null; };
        // o04 is tentative openness, not a request for opposite energy. Like o05, it supplies no target.
        return target==null?null:1-Math.abs(target-value)/4.0;
    }
}
