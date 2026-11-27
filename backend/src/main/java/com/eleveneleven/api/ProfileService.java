package com.eleveneleven.api;

import java.time.*;
import java.util.*;
import jakarta.validation.constraints.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.eleveneleven.questionnaire.Catalog;

@Service
public class ProfileService {
    public record Update(@NotBlank @Size(max=30) String displayName, @Past LocalDate dateOfBirth, @Min(0) Long expectedVersion, @Size(max=500) String photoUrl) {
        public Update(String displayName, LocalDate dateOfBirth, Long expectedVersion) {
            this(displayName, dateOfBirth, expectedVersion, null);
        }
    }
    public record Profile(String displayName, LocalDate dateOfBirth, long version, boolean identityVerified, String photoUrl) {}
    public record PushTokenUpdate(@NotBlank @Size(max=512) String token, @NotBlank @Size(max=20) String platform) {}
    private final JdbcTemplate db;
    private final Catalog catalog;
    public ProfileService(JdbcTemplate db,Catalog catalog) { this.db=db; this.catalog=catalog; }
    public Profile get(String owner) {
        return db.query("SELECT * FROM profile WHERE owner_id=?", (r,n) -> new Profile(r.getString("display_name"),r.getObject("date_of_birth",LocalDate.class),r.getLong("version"),r.getBoolean("identity_verified"),r.getString("photo_url")),owner)
                .stream().findFirst().orElseThrow(() -> new ApiException(404,"PROFILE_REQUIRED"));
    }
    public void lock(String owner) {
        if (db.queryForList("SELECT owner_id FROM profile WHERE owner_id=? FOR UPDATE",owner).isEmpty())
            throw new ApiException(404,"PROFILE_REQUIRED");
    }
    @Transactional
    public Profile put(String owner,Update u) {
        if (u.dateOfBirth()!=null && u.dateOfBirth().isAfter(LocalDate.now(ZoneOffset.UTC).minusYears(18)))
            throw new ApiException(400,"ADULTS_ONLY");
        if (u.expectedVersion()==null) {
            db.update("INSERT INTO profile(owner_id,display_name,date_of_birth,photo_url) VALUES (?,?,?,?)",owner,u.displayName().trim(),u.dateOfBirth(),blankToNull(u.photoUrl()));
        } else {
            // DOB change invalidates any previous verification; clients can never set verification.
            int count=db.update("UPDATE profile SET display_name=?,date_of_birth=?,photo_url=COALESCE(?,photo_url),identity_verified=FALSE,version=version+1 WHERE owner_id=? AND version=?",
                    u.displayName().trim(),u.dateOfBirth(),blankToNull(u.photoUrl()),owner,u.expectedVersion());
            if (count!=1) throw new ApiException(409,"STALE_PROFILE");
        }
        return get(owner);
    }
    @Transactional
    public void savePushToken(String owner, PushTokenUpdate update) {
        lock(owner);
        String token = update.token().trim();
        String platform = update.platform().trim();
        int updated = db.update(
                "UPDATE push_token SET platform=?, updated_at=CURRENT_TIMESTAMP WHERE owner_id=? AND token=?",
                platform, owner, token);
        if (updated == 0) {
            db.update(
                    "INSERT INTO push_token(owner_id, token, platform) VALUES (?,?,?)",
                    owner, token, platform);
        }
    }
    private static String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
    public record AnswerSnapshot(String revision, Map<String,Catalog.Answer> answers) {}
    public record AnswerRevision(String revision) {}
    @Transactional
    public AnswerSnapshot snapshot(String owner) {
        lock(owner);
        long revision=db.queryForObject("SELECT answers_revision FROM profile WHERE owner_id=?",Long.class,owner);
        return new AnswerSnapshot(Long.toString(revision),readAnswers(owner));
    }
    @Transactional
    public Map<String,Catalog.Answer> answers(String owner) { return snapshot(owner).answers(); }
    private Map<String,Catalog.Answer> readAnswers(String owner) {
        get(owner);
        Map<String,Catalog.Answer> result=new TreeMap<>();
        db.query("SELECT * FROM answer WHERE owner_id=?",r -> {
            String choices=r.getString("choices");
            result.put(r.getString("question_id"),new Catalog.Answer(r.getInt("question_version"),r.getString("status"),choices.isEmpty()?List.of():List.of(choices.split(",")),r.getBoolean("sensitive_consent")));
        },owner);
        return result;
    }
    @Transactional
    public AnswerRevision answer(String owner,String id,Catalog.Answer answer,long expectedRevision) {
        catalog.validate(id,answer); lock(owner);
        long next=advance(owner,expectedRevision);
        db.update("DELETE FROM answer WHERE owner_id=? AND question_id=?",owner,id);
        db.update("INSERT INTO answer(owner_id,question_id,question_version,status,choices,sensitive_consent) VALUES (?,?,?,?,?,?)",
                owner,id,answer.version(),answer.status(),String.join(",",new TreeSet<>(answer.choices())),answer.status().equals("ANSWERED") && answer.sensitiveConsent());
        return new AnswerRevision(Long.toString(next));
    }
    @Transactional
    public AnswerRevision forget(String owner,String id,long expectedRevision) {
        catalog.question(id); lock(owner);
        long next=advance(owner,expectedRevision);
        db.update("DELETE FROM answer WHERE owner_id=? AND question_id=?",owner,id);
        return new AnswerRevision(Long.toString(next));
    }
    /** Hard erase for account deletion. Idempotent if profile already gone. */
    @Transactional
    public void erase(String owner) {
        if (db.queryForList("SELECT owner_id FROM profile WHERE owner_id=? FOR UPDATE", owner).isEmpty()) return;
        List<UUID> arrangements = db.query(
                "SELECT arrangement_id FROM date_participant WHERE owner_id=?",
                (r, n) -> r.getObject(1, UUID.class),
                owner);
        for (UUID arrangement : arrangements) {
            UUID event = db.queryForObject(
                    "SELECT event_id FROM date_arrangement WHERE id=?", UUID.class, arrangement);
            db.update("DELETE FROM match_notification WHERE arrangement_id=?", arrangement);
            db.update("DELETE FROM date_participant WHERE arrangement_id=?", arrangement);
            db.update("UPDATE date_arrangement SET state='CANCELLED' WHERE id=?", arrangement);
            if (event != null) {
                db.update("UPDATE experience SET interest_open=TRUE WHERE id=? AND starts_at>CURRENT_TIMESTAMP", event);
            }
        }
        db.update("DELETE FROM match_notification WHERE owner_id=?", owner);
        db.update("DELETE FROM push_token WHERE owner_id=?", owner);
        db.update("DELETE FROM event_interest WHERE owner_id=?", owner);
        db.update("DELETE FROM safety_exclusion WHERE reporter_id=? OR target_id=?", owner, owner);
        db.update("DELETE FROM answer WHERE owner_id=?", owner);
        db.update("DELETE FROM profile WHERE owner_id=?", owner);
    }
    private long advance(String owner,long expectedRevision) {
        long current=db.queryForObject("SELECT answers_revision FROM profile WHERE owner_id=?",Long.class,owner);
        if(expectedRevision<0 || current!=expectedRevision) throw new AnswerVersions.Conflict(current);
        if(current==Long.MAX_VALUE) throw new ApiException(409,"ANSWER_REVISION_EXHAUSTED");
        int changed=db.update("UPDATE profile SET answers_revision=answers_revision+1 WHERE owner_id=? AND answers_revision=?",owner,current);
        if(changed!=1) throw new AnswerVersions.Conflict(current);
        return current+1;
    }
}
