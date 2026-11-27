package com.eleveneleven;

import static org.assertj.core.api.Assertions.assertThat;

import com.eleveneleven.api.InterestService;
import com.eleveneleven.api.ProfileService;
import com.eleveneleven.identity.Owners;
import com.eleveneleven.matching.MatchingAllocatorService;
import com.eleveneleven.questionnaire.Catalog;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.oauth2.jwt.Jwt;

@SpringBootTest(properties = {
        "app.auth.issuer=",
        "app.matching.enabled=false",
        "app.matching.require-identity-verified=false",
        "spring.datasource.url=jdbc:h2:mem:allocator;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1"
})
class MatchingAllocatorTest {
    @Autowired JdbcTemplate db;
    @Autowired ProfileService profiles;
    @Autowired InterestService interests;
    @Autowired MatchingAllocatorService allocator;

    String a, b;
    UUID event;

    @BeforeEach
    void setup() {
        for (String table : List.of(
                "match_notification", "date_participant", "date_arrangement", "event_private", "booking_command",
                "booking_request", "safety_exclusion", "event_interest", "answer", "profile", "experience", "outbox"))
            db.update("DELETE FROM " + table);
        a = Owners.id(jwt("alice"));
        b = Owners.id(jwt("bob"));
        event = UUID.randomUUID();
        profiles.put(a, new ProfileService.Update("Alice", LocalDate.of(1994, 1, 1), null));
        profiles.put(b, new ProfileService.Update("Bob", LocalDate.of(1995, 1, 1), null));
        db.update(
                "INSERT INTO experience(id,title,city_code,starts_at,ends_at,interest_open,neighborhood,time_zone) VALUES (?,?,?,?,?,TRUE,?,?)",
                event, "Allocator dinner", "san-diego",
                OffsetDateTime.parse("2099-12-01T19:00:00-08:00"),
                OffsetDateTime.parse("2099-12-01T21:00:00-08:00"),
                "Gaslamp, San Diego", "America/Los_Angeles");
        seedCompatible(a, "o01", "o02"); // male interested in women
        seedCompatible(b, "o02", "o01"); // female interested in men
        interests.join(a, event);
        interests.join(b, event);
    }

    @Test
    void hourlyStyleRunLocksPairNotifiesAndClosesEvent() {
        var summary = allocator.runOnce();
        assertThat(summary.pairsCreated()).isEqualTo(1);
        assertThat(db.queryForObject("SELECT COUNT(*) FROM date_arrangement WHERE event_id=?", Integer.class, event)).isEqualTo(1);
        assertThat(db.queryForObject("SELECT COUNT(*) FROM date_participant WHERE event_id=?", Integer.class, event)).isEqualTo(2);
        assertThat(db.queryForObject("SELECT COUNT(*) FROM match_notification WHERE event_id=?", Integer.class, event)).isEqualTo(2);
        assertThat(db.queryForObject("SELECT COUNT(*) FROM outbox WHERE event_type='MATCH_CONFIRMED'", Integer.class)).isEqualTo(2);
        assertThat(db.queryForObject("SELECT interest_open FROM experience WHERE id=?", Boolean.class, event)).isFalse();
        var invitations = interests.invitations(a);
        assertThat(invitations).hasSize(1);
        assertThat(invitations.getFirst().state()).isEqualTo("MATCHED");
        assertThat(allocator.runOnce().pairsCreated()).isZero();
    }

    private void seedCompatible(String owner, String gender, String interestedIn) {
        // Only catalog-backed IDs (backend questionnaire still catching up to mobile).
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
        profiles.answer(owner, id, new Catalog.Answer(1, "ANSWERED", List.of(choices), false), Long.parseLong(profiles.snapshot(owner).revision()));
    }

    private static Jwt jwt(String subject) {
        return Jwt.withTokenValue("t").header("alg", "none").issuer("https://synthetic.example").subject(subject).build();
    }
}
