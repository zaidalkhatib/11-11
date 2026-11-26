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
    @Test void originalSnapshotIsByteForByteStableAndNewRevisionIsAdditive() throws Exception {
        try(var input=new ClassPathResource("questionnaire-v1.json").getInputStream()) {
            assertThat(HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(input.readAllBytes())))
                .isEqualTo("66e656d8f01e347969575d053e17f54064f6a230bbb8c53b928759332989a34e");
        }
        var definition=new Catalog().definition();
        assertThat(definition.version()).isEqualTo("onboarding-v1");
        assertThat(definition.revision()).isEqualTo("onboarding-v1.1");
        assertThat(definition.questions()).hasSize(85);
        assertThat(definition.questions().subList(81,85).stream().map(Catalog.Question::id)).containsExactlyElementsOf(additions);
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
