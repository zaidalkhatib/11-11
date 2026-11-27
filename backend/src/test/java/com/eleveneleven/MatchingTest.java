package com.eleveneleven;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;
import static com.eleveneleven.matching.MatchingEngine.*;
import com.eleveneleven.matching.MatchingEngine;
import com.eleveneleven.questionnaire.Catalog.Answer;
class MatchingTest {
    final Clock clock=Clock.fixed(Instant.parse("2026-11-15T12:00:00Z"),ZoneOffset.UTC);
    final MatchingEngine engine=new MatchingEngine(Policy.exploratoryV3());
    Answer answer(String... ids) { return new Answer(1,"ANSWERED",List.of(ids),false); }
    Candidate person(String id,Map<String,Answer> answers) {
        var fixture=new HashMap<>(answers);
        fixture.putIfAbsent("relationship",answer("o02"));fixture.putIfAbsent("relationshipStructure",answer("o01"));
        return new Candidate(id,LocalDate.of(1995,1,1),true,false,Gender.NON_BINARY,Set.of(Gender.NON_BINARY),true,fixture,Map.of());
    }
    Result evaluate(Candidate a,Candidate b) {return engine.evaluate(a,b,new Context(clock,false,true));}
    @Test void noEvidenceAndOneHobbyNeverBecomeConfidentScores() {
        assertThat(evaluate(person("a",Map.of()),person("b",Map.of())).compatibility()).isNull();
        var r=evaluate(person("a",Map.of("music",answer("o01"))),person("b",Map.of("music",answer("o01"))));
        assertThat(r.compatibility()).isNull(); assertThat(r.coverage()).isEqualTo(0.2,within(.00001));
    }
    @Test void reciprocalScoreIsSymmetricAndDirectionalPreferencesMatter() {
        var a=person("a",Map.of("music",answer("o01"),"movies",answer("o01"),"conversations",answer("o01"),"energy",answer("o01"),"partnerEnergy",answer("o02")));
        var b=person("b",Map.of("music",answer("o01"),"movies",answer("o02"),"conversations",answer("o01"),"energy",answer("o05"),"partnerEnergy",answer("o02")));
        var ab=evaluate(a,b);var ba=evaluate(b,a);
        assertThat(ab.compatibility()).isEqualTo(ba.compatibility()); assertThat(ab.coverage()).isEqualTo(1);
        assertThat(ab.compatibility()).isBetween(0.0,99.9);
        assertThat(ab.evidence().getLast().aToB()).isEqualTo(1);
        assertThat(ab.evidence().getLast().bToA()).isEqualTo(0);
    }
    @Test void declinedUnknownAndFutureVersionsAreNotAgreement() {
        for(var answer:List.of(new Answer(1,"DECLINED",List.of(),false),new Answer(2,"ANSWERED",List.of("o01"),false))) {
            var result=evaluate(person("a",Map.of("music",answer)),person("b",Map.of("music",answer)));
            assertThat(result.coverage()).isZero();assertThat(result.compatibility()).isNull();
        }
    }
    @Test void missingDobVerificationAndUnknownInterestStopEligibility() {
        var a=new Candidate("a",null,false,false,null,Set.of(),true,Map.of(),Map.of());
        assertThat(evaluate(a,person("b",Map.of())).eligibility()).isEqualTo(Gate.NEEDS_INFO);
        assertThat(evaluate(a,person("b",Map.of())).reasons()).contains("DATING_INTEREST_REQUIRED","BIRTH_DATE_REQUIRED");
    }
    @Test void under18BlocksAndSuspensionAlwaysWin() {
        var a=new Candidate("a",LocalDate.of(2010,1,1),true,true,Gender.MAN,Set.of(Gender.MAN),true,Map.of(),Map.of());
        assertThat(evaluate(a,person("b",Map.of())).eligibility()).isEqualTo(Gate.FAIL);
        assertThat(engine.evaluate(person("a",Map.of()),person("b",Map.of()),new Context(clock,true,true)).reasons()).contains("SAFETY_EXCLUSION");
    }
    @Test void smokeFreePreferenceNeedsOwnFactNotAnotherPreference() {
        var a=person("a",Map.of("smokingFit",answer("o01")));
        assertThat(evaluate(a,person("b",Map.of("smokingFit",answer("o01")))).reasons()).contains("SELF_SMOKING_REQUIRED");
    }
    @Test void essentialFaithNeedsExplicitConsentAndKnownFacts() {
        var a=person("a",Map.of("sharedFaith",new Answer(1,"ANSWERED",List.of("o04"),true)));
        assertThat(evaluate(a,person("b",Map.of())).reasons()).contains("CONSENTED_FAITH_FACTS_REQUIRED");
    }
    @Test void selfRatingsEthnicityAndNewQuestionsNeverChangeDefaultScore() {
        var base=Map.of("music",answer("o01"),"movies",answer("o01"),"conversations",answer("o01"));
        var changed=new HashMap<>(base);changed.put("selfRating",answer("o10"));changed.put("ethnicity",answer("o01"));changed.put("newFutureQuestion",answer("o01"));
        for(String key:List.of("goodNewsSupport","feelingUnderstood","conflictRepair","goalSupport")) changed.put(key,answer("o01"));
        var before=evaluate(person("a",base),person("b",base));var after=evaluate(person("a",changed),person("b",base));
        assertThat(after).isEqualTo(before);
    }
    @Test void tentativeOpennessHasNoBonusOrPenaltyAcrossEveryEnergyPair() {
        for(int own=1;own<=5;own++) for(int other=1;other<=5;other++) {
            var common=Map.of("music",answer("o01"),"movies",answer("o01"),"conversations",answer("o01"));
            var open=new HashMap<>(common);open.put("energy",answer("o0"+own));open.put("partnerEnergy",answer("o04"));
            var without=new HashMap<>(open);without.remove("partnerEnergy");
            var noPreference=new HashMap<>(open);noPreference.put("partnerEnergy",answer("o05"));
            var partner=new HashMap<>(common);partner.put("energy",answer("o0"+other));partner.put("partnerEnergy",answer("o01"));
            var a=person("a",open);var b=person("b",partner);var result=evaluate(a,b);
            assertThat(result).isEqualTo(evaluate(person("a",without),b)).isEqualTo(evaluate(person("a",noPreference),b));
            assertThat(result.evidence().getLast().aToB()).isNull();
            // The partner's explicitly directional preference is still evaluated independently.
            assertThat(result.evidence().getLast().bToA()).isEqualTo(1-(own-1)/4.0);
            assertThat(result.coverage()).isCloseTo(.8,within(.000001));
            assertThat(result.compatibility()).isEqualTo(evaluate(b,a).compatibility());
        }
    }
    @Test void twoOpenPreferencesDoNotCreateEvidenceOrInflateCoverage() {
        for(int own=1;own<=5;own++) for(int other=1;other<=5;other++) {
            var a=person("a",Map.of("energy",answer("o0"+own),"partnerEnergy",answer("o04")));
            var b=person("b",Map.of("energy",answer("o0"+other),"partnerEnergy",answer("o04")));
            var result=evaluate(a,b);
            assertThat(result.compatibility()).isNull();assertThat(result.coverage()).isZero();
            assertThat(result.evidence().getLast().aToB()).isNull();assertThat(result.evidence().getLast().bToA()).isNull();
        }
        var common=Map.of("music",answer("o01"),"movies",answer("o01"),"conversations",answer("o01"));
        var open=new HashMap<>(common);open.put("partnerEnergy",answer("o04"));open.put("energy",answer("o01"));
        var result=evaluate(person("a",open),person("b",open));
        assertThat(result).isEqualTo(evaluate(person("a",common),person("b",common)));
        assertThat(result.coverage()).isCloseTo(.6,within(.000001));
    }
    @Test void policyVersionChangesAndPassNeverClaimsUnmodeledCompatibility() {
        assertThatThrownBy(()->new Policy("exploratory-v1",Map.of("shared_interests",.6,"partner_energy",.4),.5,2)).isInstanceOf(IllegalArgumentException.class);
        var common=Map.of("music",answer("o01"),"movies",answer("o01"),"conversations",answer("o01"));
        var a=new HashMap<>(common);a.put("relationship",answer("o01"));a.put("relationshipStructure",answer("o01"));
        var b=new HashMap<>(common);b.put("relationship",answer("o04"));b.put("relationshipStructure",answer("o02"));
        var result=evaluate(person("a",a),person("b",b));
        assertThat(result.policyVersion()).isEqualTo("exploratory-v3");
        assertThat(result.eligibility()).isEqualTo(Gate.PASS);
        assertThat(result.relationshipReadiness()).isEqualTo("HOLD_FOR_REVIEW");assertThat(result.productionReady()).isFalse();
        assertThat(result.compatibility()).isNull(); // Explicit conflicts are reviewed before hobby overlap.
        assertThat(result.relationships().intention()).isEqualTo(Alignment.CONFLICT);
        assertThat(result.relationships().structure()).isEqualTo(Alignment.CONFLICT);
        assertThat(evaluate(person("a",Map.of()),person("b",Map.of())).relationshipReadiness()).isEqualTo("PARTIALLY_ASSESSED");
    }
    @Test void relationshipStructureMatrixIsSymmetricAndMissingIsNotRejection() {
        for(int a=1;a<=5;a++) for(int b=1;b<=5;b++) {
            var left=person("a",Map.of("relationshipStructure",answer("o0"+a)));
            var right=person("b",Map.of("relationshipStructure",answer("o0"+b)));
            Alignment expected=a>=4 || b>=4?Alignment.UNKNOWN:a==3 || b==3?Alignment.DISCUSS:a==b?Alignment.ALIGNED:Alignment.CONFLICT;
            var result=evaluate(left,right);
            assertThat(result.relationships().structure()).isEqualTo(expected);
            assertThat(result.relationships()).isEqualTo(evaluate(right,left).relationships());
            assertThat(result.eligibility()).isEqualTo(Gate.PASS);
            // Hard hold only on CONFLICT; DISCUSS/UNKNOWN still allow soft scoring.
            assertThat(result.relationships().pairingHeld()).isEqualTo(expected==Alignment.CONFLICT);
        }
    }
    @Test void relationshipIntentionMatrixTreatsSeriousClusterAsAligned() {
        for(int a=1;a<=5;a++) for(int b=1;b<=5;b++) {
            var left=person("a",Map.of("relationship",answer("o0"+a)));
            var right=person("b",Map.of("relationship",answer("o0"+b)));
            Alignment expected;
            if (a == b) expected = Alignment.ALIGNED;
            else if (Set.of(1, 2, 3).contains(a) && Set.of(1, 2, 3).contains(b)) expected = Alignment.ALIGNED;
            else if ((a == 4 && Set.of(1, 2, 3).contains(b)) || (b == 4 && Set.of(1, 2, 3).contains(a))) expected = Alignment.CONFLICT;
            else expected = Alignment.DISCUSS;
            var result=evaluate(left,right);
            assertThat(result.relationships().intention()).isEqualTo(expected);
            assertThat(result.relationships()).isEqualTo(evaluate(right,left).relationships());
            assertThat(result.eligibility()).isEqualTo(Gate.PASS);
            assertThat(result.relationships().pairingHeld()).isEqualTo(expected==Alignment.CONFLICT);
        }
    }
    @Test void missingDeclinedAndUnsupportedRelationshipFactsRemainUnknown() {
        for(var unknown:List.of(new Answer(1,"DECLINED",List.of(),false),new Answer(2,"ANSWERED",List.of("o01"),false),answer("invalid"))) {
            var result=evaluate(person("a",Map.of("relationship",unknown,"relationshipStructure",unknown)),person("b",Map.of()));
            assertThat(result.relationships()).isEqualTo(new Relationships(Alignment.UNKNOWN,Alignment.UNKNOWN,false));
            assertThat(result.compatibility()).isNull();
        }
        var missing=new Candidate("a",LocalDate.of(1995,1,1),true,false,Gender.NON_BINARY,Set.of(Gender.NON_BINARY),true,Map.of(),Map.of());
        var result=evaluate(missing,person("b",Map.of()));
        assertThat(result.eligibility()).isEqualTo(Gate.PASS);
        assertThat(result.relationships()).isEqualTo(new Relationships(Alignment.UNKNOWN,Alignment.UNKNOWN,false));
    }
    @Test void matchedDeclaredRelationshipsStillDoNotEstablishFullCompatibilityReadiness() {
        var result=evaluate(person("a",Map.of()),person("b",Map.of()));
        assertThat(result.relationships()).isEqualTo(new Relationships(Alignment.ALIGNED,Alignment.ALIGNED,false));
        assertThat(result.relationshipReadiness()).isEqualTo("PARTIALLY_ASSESSED");
        assertThat(result.productionReady()).isFalse();assertThat(result.compatibility()).isNull();
        assertThatThrownBy(()->new Policy("exploratory-v2",Map.of("shared_interests",.6,"partner_energy",.4),.5,2)).isInstanceOf(IllegalArgumentException.class);
    }
    @Test void noEventOptInMeansNoPairing() {
        assertThat(engine.evaluate(person("a",Map.of()),person("b",Map.of()),new Context(clock,false,false)).eligibility()).isEqualTo(Gate.FAIL);
    }
    @Test void reciprocalPolicyUsesLooksAndPrefersEqualOrHigherSelfRating() {
        var reciprocal=new MatchingEngine(Policy.reciprocalV1());
        var base=new HashMap<String,Answer>();
        base.put("music",answer("o01")); base.put("movies",answer("o01")); base.put("conversations",answer("o01"));
        base.put("values",answer("o01")); base.put("pace",answer("o02"));
        base.put("relationship",answer("o02")); base.put("relationshipStructure",answer("o01"));
        base.put("selfRating",answer("o07")); base.put("looksImportance",answer("o04"));
        var lower=new HashMap<>(base); lower.put("selfRating",answer("o04"));
        var equal=new HashMap<>(base);
        var highLooks=person("a",base);
        var lowerLooks=person("b",lower);
        var equalLooks=person("c",equal);
        var better=reciprocal.evaluate(highLooks,equalLooks,new Context(clock,false,true,false));
        var worse=reciprocal.evaluate(highLooks,lowerLooks,new Context(clock,false,true,false));
        assertThat(better.policyVersion()).isEqualTo("reciprocal-v1");
        assertThat(better.eligibility()).isEqualTo(Gate.PASS);
        assertThat(better.compatibility()).isNotNull();
        assertThat(worse.compatibility()).isNotNull();
        assertThat(better.compatibility()).isGreaterThan(worse.compatibility());
    }
}
