package com.eleveneleven.matching;

import java.time.*;
import java.util.*;
import com.eleveneleven.questionnaire.Catalog.Answer;

/** Internal research policy, not a scientifically validated prediction. */
public final class MatchingEngine {
    /** PASS means only the implemented gates passed, not launch readiness. */
    public enum Gate { PASS, FAIL, NEEDS_INFO }
    public enum Gender { MAN, WOMAN, NON_BINARY, OTHER }
    public record Candidate(String id, LocalDate birthDate, boolean identityVerified, boolean suspended,
                            Gender gender, Set<Gender> interestedIn, boolean eventOptIn,
                            Map<String,Answer> answers, Map<String,String> operationalFacts) {
        public Candidate { interestedIn=Set.copyOf(interestedIn); answers=Map.copyOf(answers); operationalFacts=Map.copyOf(operationalFacts); }
    }
    public record Context(Clock clock, boolean blockedOrReported, boolean eventOpen, boolean requireIdentityVerified) {
        public Context(Clock clock, boolean blockedOrReported, boolean eventOpen) {
            this(clock, blockedOrReported, eventOpen, true);
        }
    }
    public record Policy(String version, Map<String,Double> domainWeights, double minimumCoverage, int minimumDimensions) {
        public Policy {
            domainWeights=Map.copyOf(domainWeights);
            if(version==null || version.isBlank() || Set.of("exploratory-v1","exploratory-v2").contains(version)
                    || domainWeights.isEmpty()
                    || domainWeights.values().stream().anyMatch(w -> w==null || !Double.isFinite(w) || w<=0)
                    || !Double.isFinite(minimumCoverage) || minimumCoverage<0 || minimumCoverage>1 || minimumDimensions<2)
                throw new IllegalArgumentException("Invalid policy");
            if(version.equals("exploratory-v3") && !domainWeights.keySet().equals(Set.of("shared_interests","partner_energy")))
                throw new IllegalArgumentException("Invalid exploratory-v3 domains");
        }
        public static Policy exploratoryV3() { return new Policy("exploratory-v3",Map.of("shared_interests",0.6,"partner_energy",0.4),0.5,2); }
        /** D-022 reciprocal scoring draft — looks + questionnaire soft fit. */
        public static Policy reciprocalV1() {
            return new Policy("reciprocal-v1", Map.of(
                    "reciprocal_prefs", 0.40,
                    "shared_interests", 0.25,
                    "values_personality", 0.25,
                    "dinner_logistics", 0.10), 0.35, 2);
        }
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
            if(context.requireIdentityVerified() && !c.identityVerified()) missing.add("VERIFICATION_REQUIRED");
        }
        interest(a,b,failed,missing); interest(b,a,failed,missing);
        preferences(a,b,failed,missing); preferences(b,a,failed,missing);
        Gate gate=!failed.isEmpty()?Gate.FAIL:!missing.isEmpty()?Gate.NEEDS_INFO:Gate.PASS;
        var reasons=new ArrayList<>(failed); reasons.addAll(missing);
        var relationships=relationships(a,b);
        if(gate!=Gate.PASS) return new Result(policy.version(),gate,List.copyOf(reasons),null,0,"NOT_ASSESSED",List.of(),"PARTIALLY_ASSESSED",false,relationships);
        if(relationships.pairingHeld()) return new Result(policy.version(),gate,List.of("RELATIONSHIP_REVIEW_REQUIRED"),
                null,0,"NOT_ASSESSED",List.of(),"HOLD_FOR_REVIEW",false,relationships);
        List<Evidence> evidence=new ArrayList<>();
        if(policy.domainWeights().containsKey("shared_interests")) {
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
        }
        if(policy.domainWeights().containsKey("partner_energy")) {
            evidence.add(new Evidence("partnerEnergy->energy","partner_energy",energy(a,b),energy(b,a)));
        } else if(policy.domainWeights().containsKey("shared_interests")) {
            evidence.add(new Evidence("partnerEnergy->energy","shared_interests",energy(a,b),energy(b,a)));
        }
        if(policy.domainWeights().containsKey("reciprocal_prefs")) {
            evidence.add(new Evidence("looks","reciprocal_prefs",looks(a,b),looks(b,a)));
            evidence.add(new Evidence("career","reciprocal_prefs",career(a,b),career(b,a)));
            evidence.add(new Evidence("fitness","reciprocal_prefs",fitness(a,b),fitness(b,a)));
            evidence.add(new Evidence("age","reciprocal_prefs",ageFit(a,b,context.clock()),ageFit(b,a,context.clock())));
        }
        if(policy.domainWeights().containsKey("values_personality")) {
            for(String key:List.of("values","pace","communication","humor","planning")) {
                evidence.add(new Evidence(key,"values_personality",jaccard(a,b,key),jaccard(a,b,key)));
            }
        }
        if(policy.domainWeights().containsKey("dinner_logistics")) {
            evidence.add(new Evidence("dietary","dinner_logistics",jaccard(a,b,"dietary"),jaccard(a,b,"dietary")));
            evidence.add(new Evidence("petsFit","dinner_logistics",singleAgreement(a,b,"petsFit"),singleAgreement(b,a,"petsFit")));
        }
        double totalWeight=policy.domainWeights().values().stream().mapToDouble(x->x).sum();
        double coverage=0,forward=0,reverse=0,forwardWeight=0,reverseWeight=0;
        int dimensions=0;
        for(var e:evidence) if(e.aToB()!=null && e.bToA()!=null) dimensions++;
        for(var domain:new TreeMap<>(policy.domainWeights()).entrySet()) {
            var items=evidence.stream().filter(e->e.domain().equals(domain.getKey())).toList();
            if(items.isEmpty()) continue;
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
        String confidence = score==null?"INSUFFICIENT_EVIDENCE"
                : policy.version().startsWith("reciprocal") ? "RECIPROCAL_UNVALIDATED" : "EXPLORATORY_UNVALIDATED";
        return new Result(policy.version(),gate,List.of(),score,coverage,confidence,List.copyOf(evidence),"PARTIALLY_ASSESSED",false,relationships);
    }
    private static Relationships relationships(Candidate a,Candidate b) {
        Alignment intention=intention(single(a,"relationship"),single(b,"relationship"));
        Alignment structure=structure(single(a,"relationshipStructure"),single(b,"relationshipStructure"));
        // Hard hold only on CONFLICT. DISCUSS/UNKNOWN still allow personality soft-scoring (D-022).
        boolean held = intention == Alignment.CONFLICT || structure == Alignment.CONFLICT;
        return new Relationships(intention, structure, held);
    }
    private static String single(Candidate candidate,String key) {
        var values=known(candidate,key);
        return values.size()==1?values.iterator().next():"";
    }
    /** o01 life partner, o02 serious, o03 dating with intention, o04 casual, o05 exploring. */
    private static Alignment intention(String a,String b) {
        Set<String> known = Set.of("o01", "o02", "o03", "o04", "o05");
        if (!known.contains(a) || !known.contains(b)) return Alignment.UNKNOWN;
        if (a.equals(b)) return Alignment.ALIGNED;
        Set<String> serious = Set.of("o01", "o02", "o03");
        if (serious.contains(a) && serious.contains(b)) return Alignment.ALIGNED;
        if ((a.equals("o04") && serious.contains(b)) || (b.equals("o04") && serious.contains(a))) return Alignment.CONFLICT;
        return Alignment.DISCUSS; // exploring with anything else
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
        return target==null?null:1-Math.abs(target-value)/4.0;
    }
    private static Double jaccard(Candidate a,Candidate b,String key) {
        var left=known(a,key); var right=known(b,key);
        if(left.isEmpty() || right.isEmpty()) return null;
        var union=new HashSet<>(left); union.addAll(right);
        var intersection=new HashSet<>(left); intersection.retainAll(right);
        return (double)intersection.size()/union.size();
    }
    private static Double singleAgreement(Candidate a,Candidate b,String key) {
        var left=known(a,key); var right=known(b,key);
        if(left.size()!=1 || right.size()!=1) return null;
        return left.equals(right)?1.0:0.4;
    }
    /** How well B's looks self-rating satisfies A's looks importance (D-022). */
    private static Double looks(Candidate a,Candidate b) {
        Integer importance = ordinal(single(a,"looksImportance"), 4);
        Integer selfA = rating(single(a,"selfRating"));
        Integer selfB = rating(single(b,"selfRating"));
        if(importance==null || selfA==null || selfB==null) return null;
        double weight = (importance-1)/3.0; // 0..1
        double satisfy = selfB >= selfA ? 1.0 : Math.max(0, 1.0 - (selfA-selfB)/9.0);
        return (1.0-weight)*0.85 + weight*satisfy;
    }
    private static Double career(Candidate a,Candidate b) {
        Integer want = ordinal(single(a,"partnerCareerDrive"), 5);
        Integer have = ordinal(single(b,"careerDrive"), 5);
        if(want==null || have==null) return null;
        if(want==5) return 0.75; // not important
        return 1.0 - Math.min(1.0, Math.abs(want-have)/4.0);
    }
    private static Double fitness(Candidate a,Candidate b) {
        Integer want = ordinal(single(a,"partnerFitness"), 6);
        Integer have = ordinal(single(b,"fitnessLevel"), 5);
        if(want==null || have==null) return null;
        if(want==6) return 0.75; // not a priority
        return 1.0 - Math.min(1.0, Math.abs(Math.min(want,5)-have)/4.0);
    }
    private static Double ageFit(Candidate a,Candidate b,Clock clock) {
        if(a.birthDate()==null || b.birthDate()==null) return null;
        int ageA = Period.between(a.birthDate(), LocalDate.now(clock)).getYears();
        int ageB = Period.between(b.birthDate(), LocalDate.now(clock)).getYears();
        int diff = Math.abs(ageA-ageB);
        var windows = known(a,"partnerAgeRange");
        if(windows.isEmpty()) return null;
        boolean ok = false;
        if(windows.contains("o01") && diff<=2) ok=true;
        if(windows.contains("o02") && diff<=5) ok=true;
        if(windows.contains("o03") && diff<=10) ok=true;
        if(windows.contains("o04") && ageB<ageA) ok=true;
        if(windows.contains("o05") && ageB>ageA) ok=true;
        if(windows.contains("o06")) ok=true;
        return ok?1.0:0.2;
    }
    private static Integer rating(String option) {
        if(option==null || option.isBlank() || option.charAt(0)!='o') return null;
        try {
            int n = Integer.parseInt(option.substring(1));
            return n>=1 && n<=10 ? n : null;
        } catch (NumberFormatException ex) { return null; }
    }
    private static Integer ordinal(String option, int max) {
        if(option==null || option.isBlank() || option.charAt(0)!='o') return null;
        try {
            int n = Integer.parseInt(option.substring(1));
            return n>=1 && n<=max ? n : null;
        } catch (NumberFormatException ex) { return null; }
    }
}
