package com.eleveneleven;

import static org.assertj.core.api.Assertions.assertThat;

import com.eleveneleven.api.InterestService;
import com.eleveneleven.api.ProfileService;
import com.eleveneleven.questionnaire.Catalog;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = {
        "app.auth.issuer=",
        "app.local-dev.jwt-secret=local-dev-test-secret-at-least-32b",
        "app.local-dev.auto-partner=true",
        "app.matching.enabled=false",
        "app.matching.require-identity-verified=false",
        "spring.datasource.url=jdbc:h2:mem:local_pair;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1"
})
@ActiveProfiles("local-dev")
class LocalDevPairAssistTest {
    @Autowired JdbcTemplate db;
    @Autowired ProfileService profiles;
    @Autowired InterestService interests;

    UUID event;

    @BeforeEach
    void setup() {
        for (String table : List.of(
                "match_notification", "date_participant", "date_arrangement", "event_private", "booking_command",
                "booking_request", "safety_exclusion", "event_interest", "answer", "profile", "experience", "outbox"))
            db.update("DELETE FROM " + table);
        event = UUID.fromString("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1");
        db.update(
                "INSERT INTO experience(id,title,city_code,starts_at,ends_at,interest_open,neighborhood,time_zone) VALUES (?,?,?,?,?,TRUE,?,?)",
                event, "Pair assist dinner", "san-diego",
                java.time.OffsetDateTime.parse("2099-12-15T19:00:00-08:00"),
                java.time.OffsetDateTime.parse("2099-12-15T21:00:00-08:00"),
                "Gaslamp, San Diego", "America/Los_Angeles");
    }

    @Test
    void soloJoinGetsMatchedViaLocalPartner() {
        String owner = "https://synthetic.example|solo";
        profiles.put(owner, new ProfileService.Update("Solo", LocalDate.of(1996, 1, 1), null));
        seed(owner, "o01", "o02");
        interests.join(owner, event);
        // afterCommit runs synchronously in tests when sync is active; wait briefly if needed
        var invitations = interests.invitations(owner);
        assertThat(invitations).hasSize(1);
        assertThat(invitations.getFirst().state()).isEqualTo("MATCHED");
        assertThat(db.queryForObject(
                "SELECT COUNT(*) FROM profile WHERE owner_id LIKE 'local-dev-partner-%'", Integer.class))
                .isEqualTo(1);
    }

    private void seed(String owner, String gender, String interestedIn) {
        answer(owner, "gender", gender);
        answer(owner, "interestedIn", interestedIn);
        answer(owner, "relationship", "o02");
        answer(owner, "relationshipStructure", "o01");
        answer(owner, "conversations", "o01");
        answer(owner, "movies", "o01");
        answer(owner, "music", "o01");
        answer(owner, "values", "o01");
        answer(owner, "pace", "o02");
        answer(owner, "selfRating", "o07");
        answer(owner, "looksImportance", "o03");
        answer(owner, "energy", "o03");
        answer(owner, "partnerEnergy", "o03");
    }

    private void answer(String owner, String id, String... choices) {
        profiles.answer(owner, id, new Catalog.Answer(1, "ANSWERED", List.of(choices), false),
                Long.parseLong(profiles.snapshot(owner).revision()));
    }
}
