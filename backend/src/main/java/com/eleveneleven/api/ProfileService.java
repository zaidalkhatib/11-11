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
    public record Update(@NotBlank @Size(max=30) String displayName, @Past LocalDate dateOfBirth, @Min(0) Long expectedVersion) {}
    public record Profile(String displayName, LocalDate dateOfBirth, long version, boolean identityVerified) {}
    private final JdbcTemplate db;
    private final Catalog catalog;
    public ProfileService(JdbcTemplate db,Catalog catalog) { this.db=db; this.catalog=catalog; }
    public Profile get(String owner) {
        return db.query("SELECT * FROM profile WHERE owner_id=?", (r,n) -> new Profile(r.getString("display_name"),r.getObject("date_of_birth",LocalDate.class),r.getLong("version"),r.getBoolean("identity_verified")),owner)
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
            db.update("INSERT INTO profile(owner_id,display_name,date_of_birth) VALUES (?,?,?)",owner,u.displayName().trim(),u.dateOfBirth());
        } else {
            // DOB change invalidates any previous verification; clients can never set verification.
            int count=db.update("UPDATE profile SET display_name=?,date_of_birth=?,identity_verified=FALSE,version=version+1 WHERE owner_id=? AND version=?",
                    u.displayName().trim(),u.dateOfBirth(),owner,u.expectedVersion());
            if (count!=1) throw new ApiException(409,"STALE_PROFILE");
        }
        return get(owner);
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
    private long advance(String owner,long expectedRevision) {
        long current=db.queryForObject("SELECT answers_revision FROM profile WHERE owner_id=?",Long.class,owner);
        if(expectedRevision<0 || current!=expectedRevision) throw new AnswerVersions.Conflict(current);
        if(current==Long.MAX_VALUE) throw new ApiException(409,"ANSWER_REVISION_EXHAUSTED");
        int changed=db.update("UPDATE profile SET answers_revision=answers_revision+1 WHERE owner_id=? AND answers_revision=?",owner,current);
        if(changed!=1) throw new AnswerVersions.Conflict(current);
        return current+1;
    }
}
