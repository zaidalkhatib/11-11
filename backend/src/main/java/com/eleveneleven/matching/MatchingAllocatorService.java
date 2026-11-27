package com.eleveneleven.matching;

import java.util.*;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.eleveneleven.api.ProfileService;
import com.eleveneleven.operations.SafetyService;
import com.eleveneleven.questionnaire.Catalog.Answer;
import static com.eleveneleven.matching.MatchingEngine.*;

/** Hourly-batch pair locker (D-025 / D-026). Join already means accept. */
@Service
public class MatchingAllocatorService {
    public record RunSummary(int eventsScanned, int pairsCreated, int candidatesConsidered) {}

    private final JdbcTemplate db;
    private final ProfileService profiles;
    private final SafetyService safety;
    private final java.time.Clock clock;
    private final boolean requireVerified;

    public MatchingAllocatorService(
            JdbcTemplate db,
            ProfileService profiles,
            SafetyService safety,
            java.time.Clock clock,
            @Value("${app.matching.require-identity-verified:true}") boolean requireVerified) {
        this.db = db;
        this.profiles = profiles;
        this.safety = safety;
        this.clock = clock;
        this.requireVerified = requireVerified;
    }

    @Transactional
    public RunSummary runOnce() {
        var engine = new MatchingEngine(Policy.reciprocalV1());
        int events = 0, pairs = 0, candidates = 0;
        List<UUID> open = db.query(
                "SELECT id FROM experience WHERE interest_open=TRUE AND starts_at>CURRENT_TIMESTAMP ORDER BY starts_at,id",
                (r, n) -> r.getObject(1, UUID.class));
        for (UUID event : open) {
            events++;
            // Skip events that already have an arrangement.
            Integer arranged = db.queryForObject("SELECT COUNT(*) FROM date_arrangement WHERE event_id=? AND state<>'CANCELLED'", Integer.class, event);
            if (arranged != null && arranged > 0) continue;

            List<String> waiters = db.query(
                    """
                    SELECT i.owner_id FROM event_interest i
                    WHERE i.event_id=?
                      AND NOT EXISTS (
                        SELECT 1 FROM date_participant p WHERE p.event_id=i.event_id AND p.owner_id=i.owner_id
                      )
                    ORDER BY i.created_at, i.owner_id
                    LIMIT 200
                    """,
                    (r, n) -> r.getString(1),
                    event);
            candidates += waiters.size();
            if (waiters.size() < 2) continue;

            record Scored(String a, String b, double score) {}
            List<Scored> scored = new ArrayList<>();
            for (int i = 0; i < waiters.size(); i++) {
                for (int j = i + 1; j < waiters.size(); j++) {
                    String left = waiters.get(i), right = waiters.get(j);
                    Result result = engine.evaluate(
                            candidate(left, event),
                            candidate(right, event),
                            new Context(clock, safety.excluded(left, right), true, requireVerified));
                    // Same-event + reciprocal gates + a real personality/answer score (D-022 / D-025).
                    if (result.eligibility() != Gate.PASS) continue;
                    if (result.relationships().pairingHeld()) continue;
                    if (result.compatibility() == null) continue;
                    scored.add(new Scored(left, right, result.compatibility()));
                }
            }
            scored.sort(Comparator.comparingDouble(Scored::score).reversed());
            // One 1:1 pair per experience (current capacity model).
            for (Scored pick : scored) {
                if (lockPair(event, pick.a(), pick.b(), pick.score())) {
                    pairs++;
                    break;
                }
            }
        }
        return new RunSummary(events, pairs, candidates);
    }

    private boolean lockPair(UUID event, String a, String b, double score) {
        // Re-check no arrangement under row lock.
        db.queryForList("SELECT id FROM experience WHERE id=? FOR UPDATE", event);
        Integer arranged = db.queryForObject("SELECT COUNT(*) FROM date_arrangement WHERE event_id=? AND state<>'CANCELLED'", Integer.class, event);
        if (arranged != null && arranged > 0) return false;
        Integer stillA = db.queryForObject("SELECT COUNT(*) FROM event_interest WHERE owner_id=? AND event_id=?", Integer.class, a, event);
        Integer stillB = db.queryForObject("SELECT COUNT(*) FROM event_interest WHERE owner_id=? AND event_id=?", Integer.class, b, event);
        if (stillA == null || stillA == 0 || stillB == null || stillB == 0) return false;

        UUID arrangement = UUID.randomUUID();
        db.update("INSERT INTO date_arrangement(id,event_id,state) VALUES (?,?, 'CONFIRMED')", arrangement, event);
        db.update(
                "INSERT INTO date_participant(arrangement_id,event_id,owner_id,seat) VALUES (?,?,?,1),(?,?,?,2)",
                arrangement, event, a, arrangement, event, b);
        for (String owner : List.of(a, b)) {
            UUID note = UUID.randomUUID();
            db.update(
                    "INSERT INTO match_notification(id,arrangement_id,owner_id,event_id) VALUES (?,?,?,?)",
                    note, arrangement, owner, event);
            db.update(
                    "INSERT INTO outbox(id,aggregate_id,event_type) VALUES (?,?,?)",
                    note,
                    arrangement.toString(),
                    "MATCH_CONFIRMED");
        }
        // One pair fills this experience; release other waiters back to the pool.
        db.update("DELETE FROM event_interest WHERE event_id=? AND owner_id NOT IN (?,?)", event, a, b);
        db.update("UPDATE experience SET interest_open=FALSE WHERE id=?", event);
        return true;
    }

    Candidate candidate(String owner, UUID event) {
        var profile = profiles.get(owner);
        var answers = profiles.answers(owner);
        Gender gender = switch (value(answers, "gender")) {
            case "o01" -> Gender.MAN;
            case "o02" -> Gender.WOMAN;
            case "o03" -> Gender.NON_BINARY;
            case "o04" -> Gender.OTHER;
            default -> null;
        };
        Set<Gender> interests = switch (value(answers, "interestedIn")) {
            case "o01" -> Set.of(Gender.MAN);
            case "o02" -> Set.of(Gender.WOMAN);
            case "o03" -> Set.of(Gender.MAN, Gender.WOMAN);
            default -> Set.of();
        };
        boolean suspended = Boolean.TRUE.equals(
                db.queryForObject("SELECT suspended FROM profile WHERE owner_id=?", Boolean.class, owner));
        boolean optedIn = db.queryForObject(
                "SELECT COUNT(*) FROM event_interest WHERE owner_id=? AND event_id=?", Integer.class, owner, event) == 1;
        return new Candidate(owner, profile.dateOfBirth(), profile.identityVerified(), suspended, gender, interests, optedIn, answers, operationalFacts(answers));
    }

    static Map<String, String> operationalFacts(Map<String, Answer> answers) {
        Map<String, String> facts = new HashMap<>();
        String smoking = value(answers, "smokingOwn");
        if (smoking.equals("o01") || smoking.equals("o02")) facts.put("smoking", "NONE");
        else if (smoking.equals("o03")) facts.put("smoking", "OCCASIONAL");
        else if (smoking.equals("o04")) facts.put("smoking", "REGULAR");
        String drinking = value(answers, "drinkingOwn");
        if (drinking.equals("o01")) facts.put("drinking", "NONE");
        else if (drinking.equals("o02") || drinking.equals("o03")) facts.put("drinking", "OCCASIONAL");
        else if (drinking.equals("o04") || drinking.equals("o05")) facts.put("drinking", "REGULAR");
        return facts;
    }

    private static String value(Map<String, Answer> answers, String id) {
        var answer = answers.get(id);
        return answer != null && answer.version() == 1 && answer.status().equals("ANSWERED") && answer.choices().size() == 1
                ? answer.choices().getFirst()
                : "";
    }
}
