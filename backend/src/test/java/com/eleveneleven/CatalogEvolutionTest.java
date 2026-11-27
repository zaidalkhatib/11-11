package com.eleveneleven;
import java.util.*;
import java.security.MessageDigest;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import static org.assertj.core.api.Assertions.*;
import com.eleveneleven.questionnaire.Catalog;
import com.eleveneleven.api.ApiException;
class CatalogEvolutionTest {
    private final List<String> additions=List.of("goodNewsSupport","feelingUnderstood","conflictRepair","goalSupport");
    private final List<String> mobileGapAdditions=List.of(
            "age","careerDrive","partnerAgeRange","partnerPriorities","partnerHasChildren","fitnessLevel",
            "partnerFitness","partnerCareerDrive","smokingOwn","drinkingOwn","dietary","petsFit");
    private final List<String> algoCutAdditions=List.of(
            "financialStabilityImportance","haveChildren","dealbreakers");
    @Test void originalSnapshotIsByteForByteStableAndNewRevisionIsAdditive() throws Exception {
        try(var input=new ClassPathResource("questionnaire-v1.json").getInputStream()) {
            assertThat(HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(input.readAllBytes())))
                .isEqualTo("2e27ebd6bf449201a546f1baf57f010a92699860a5f6817afa200bdf61079fc6");
        }
        var definition=new Catalog().definition();
        assertThat(definition.version()).isEqualTo("onboarding-v1");
        assertThat(definition.revision()).isEqualTo("onboarding-v1.7");
        assertThat(definition.questions()).hasSize(100);
        assertThat(definition.questions().subList(81,85).stream().map(Catalog.Question::id)).containsExactlyElementsOf(additions);
        assertThat(definition.questions().subList(85,97).stream().map(Catalog.Question::id)).containsExactlyElementsOf(mobileGapAdditions);
        assertThat(definition.questions().subList(97,100).stream().map(Catalog.Question::id)).containsExactlyElementsOf(algoCutAdditions);
    }
    @Test void everyNewChoiceDeclineAndInvalidSelectionHasExplicitSemantics() throws Exception {
        var catalog=new Catalog();
        for(String id:additions) {
            var question=catalog.question(id);
            assertThat(question.optional()).isTrue();assertThat(question.scoring()).isEqualTo("INACTIVE");
            assertThat(question.kind()).isEqualTo("PREFERENCE");assertThat(question.target()).isNull();
            for(var option:question.options()) catalog.validate(id,new Catalog.Answer(1,"ANSWERED",List.of(option.id()),false));
            catalog.validate(id,new Catalog.Answer(1,"DECLINED",List.of(),false));
            for(var invalid:List.of(
                    new Catalog.Answer(1,"ANSWERED",List.of(),false),
                    new Catalog.Answer(1,"ANSWERED",List.of("unknown"),false),
                    new Catalog.Answer(1,"ANSWERED",List.of("o01","o01"),false),
                    new Catalog.Answer(1,"ANSWERED",List.of("o01","o02"),false),
                    new Catalog.Answer(2,"ANSWERED",List.of("o01"),false),
                    new Catalog.Answer(1,"DECLINED",List.of("o01"),false))) {
                assertThatThrownBy(()->catalog.validate(id,invalid)).isInstanceOf(ApiException.class);
            }
        }
    }
    @Test void existingSentinelsRemainExclusiveAndDeclinesAreNeverAgreement() throws Exception {
        var catalog=new Catalog();
        for(String id:List.of("ethnicity","pets","music")) {
            var question=catalog.question(id);
            var sentinel=question.options().stream().filter(Catalog.Option::exclusive).findFirst().orElseThrow();
            var normal=question.options().stream().filter(o->!o.exclusive()).findFirst().orElseThrow();
            assertThatThrownBy(()->catalog.validate(id,new Catalog.Answer(1,"ANSWERED",List.of(normal.id(),sentinel.id()),true))).isInstanceOf(ApiException.class);
        }
    }
}
