package com.eleveneleven.api;

import com.eleveneleven.matching.MatchingAllocatorService;
import com.eleveneleven.questionnaire.Catalog;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Opt-in single-simulator assist. Default matching is two real profiles who join the same
 * event and pass personality/answer scoring. When {@code app.local-dev.auto-partner=true},
 * a complementary synthetic partner can be minted for solo demos.
 */
@Component
@Profile("local-dev")
public class LocalDevPairAssist {
    private static final Logger log = LoggerFactory.getLogger(LocalDevPairAssist.class);

    private final JdbcTemplate db;
    private final ProfileService profiles;
    private final InterestService interests;
    private final MatchingAllocatorService allocator;
    private final boolean autoPartner;

    public LocalDevPairAssist(
            JdbcTemplate db,
            ProfileService profiles,
            InterestService interests,
            MatchingAllocatorService allocator,
            @Value("${app.local-dev.auto-partner:false}") boolean autoPartner) {
        this.db = db;
        this.profiles = profiles;
        this.interests = interests;
        this.allocator = allocator;
        this.autoPartner = autoPartner;
    }

    /** Call from join after interest is written; runs after the join transaction commits. */
    public void scheduleAfterJoin(String owner, UUID event) {
        if (!autoPartner) {
            // Still nudge the matcher so two real waiters can pair without waiting for the cron.
            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        try {
                            allocator.runOnce();
                        } catch (Exception ex) {
                            log.warn("local-dev matcher nudge failed: {}", ex.toString());
                        }
                    }
                });
            } else {
                allocator.runOnce();
            }
            return;
        }
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    ensurePartnerAndMatch(owner, event);
                }
            });
            return;
        }
        ensurePartnerAndMatch(owner, event);
    }

    void ensurePartnerAndMatch(String owner, UUID event) {
        try {
            if (owner.startsWith("local-dev-partner-")) return;
            Integer waiters = db.queryForObject(
                    "SELECT COUNT(*) FROM event_interest WHERE event_id=?", Integer.class, event);
            if (waiters == null || waiters >= 2) {
                allocator.runOnce();
                return;
            }
            Integer arranged = db.queryForObject(
                    "SELECT COUNT(*) FROM date_arrangement WHERE event_id=? AND state<>'CANCELLED'",
                    Integer.class,
                    event);
            if (arranged != null && arranged > 0) return;

            String partner = complementaryPartner(owner, event);
            if (partner == null) {
                log.info("local-dev pair assist skipped (no complementary gender mapping) owner={}", owner);
                return;
            }
            interests.join(partner, event);
            var summary = allocator.runOnce();
            log.info(
                    "local-dev pair assist event={} partner={} pairs={}",
                    event,
                    partner,
                    summary.pairsCreated());
        } catch (Exception ex) {
            log.warn("local-dev pair assist failed owner={} event={}: {}", owner, event, ex.toString());
        }
    }

    private String complementaryPartner(String owner, UUID event) {
        Map<String, Catalog.Answer> answers = profiles.answers(owner);
        String gender = single(answers, "gender");
        String interestedIn = single(answers, "interestedIn");
        // Complementary: opposite binary gender when user wants that gender (or both).
        String partnerGender;
        String partnerInterest;
        if ("o01".equals(gender) && ("o02".equals(interestedIn) || "o03".equals(interestedIn))) {
            partnerGender = "o02";
            partnerInterest = "o01";
        } else if ("o02".equals(gender) && ("o01".equals(interestedIn) || "o03".equals(interestedIn))) {
            partnerGender = "o01";
            partnerInterest = "o02";
        } else {
            return null;
        }
        String partnerOwner = "local-dev-partner-" + event + "-" + partnerGender;
        ensurePartnerProfile(partnerOwner, partnerGender, partnerInterest);
        return partnerOwner;
    }

    private void ensurePartnerProfile(String partnerOwner, String gender, String interestedIn) {
        try {
            profiles.get(partnerOwner);
        } catch (ApiException ex) {
            if (ex.status != 404) throw ex;
            LocalDate dob = "o01".equals(gender) ? LocalDate.of(1993, 3, 15) : LocalDate.of(1994, 7, 20);
            String name = "o01".equals(gender) ? "Alex (local)" : "Sam (local)";
            profiles.put(partnerOwner, new ProfileService.Update(name, dob, null));
            seedCompatible(partnerOwner, gender, interestedIn);
        }
    }

    private void seedCompatible(String owner, String gender, String interestedIn) {
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
        long rev = Long.parseLong(profiles.snapshot(owner).revision());
        profiles.answer(owner, id, new Catalog.Answer(1, "ANSWERED", List.of(choices), false), rev);
    }

    private static String single(Map<String, Catalog.Answer> answers, String id) {
        Catalog.Answer answer = answers.get(id);
        return answer != null
                        && answer.version() == 1
                        && "ANSWERED".equals(answer.status())
                        && answer.choices().size() == 1
                ? answer.choices().getFirst()
                : "";
    }
}
