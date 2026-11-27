package com.eleveneleven.api;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class InterestService {
    public record Event(UUID id,String title,String cityCode,String neighborhood,String timeZone,OffsetDateTime startsAt,OffsetDateTime endsAt) {}
    private final JdbcTemplate db;
    private final ProfileService profiles;
    private final ObjectProvider<LocalDevPairAssist> localDevPairAssist;
    public InterestService(JdbcTemplate db, ProfileService profiles, ObjectProvider<LocalDevPairAssist> localDevPairAssist) {
        this.db = db;
        this.profiles = profiles;
        this.localDevPairAssist = localDevPairAssist;
    }
    public List<Event> events() {
        return db.query("SELECT * FROM experience WHERE interest_open=TRUE AND starts_at>CURRENT_TIMESTAMP ORDER BY starts_at,id LIMIT 100",
                (r,n)->new Event(r.getObject("id",UUID.class),r.getString("title"),r.getString("city_code"),r.getString("neighborhood"),r.getString("time_zone"),r.getObject("starts_at",OffsetDateTime.class),r.getObject("ends_at",OffsetDateTime.class)));
    }
    public List<UUID> mine(String owner) { return db.query("SELECT event_id FROM event_interest WHERE owner_id=? ORDER BY event_id",(r,n)->r.getObject(1,UUID.class),owner); }
    public record Invitation(UUID eventId,String state,UUID arrangementId,String title,String neighborhood,String timeZone,OffsetDateTime startsAt,OffsetDateTime endsAt) {}
    /** WAITING = joined, not matched; MATCHED = allocator locked a pair (D-025). */
    public List<Invitation> invitations(String owner) {
        return db.query(
                """
                SELECT e.id, e.title, e.neighborhood, e.time_zone, e.starts_at, e.ends_at,
                       p.arrangement_id AS arrangement_id
                FROM event_interest i
                JOIN experience e ON e.id=i.event_id
                LEFT JOIN date_participant p ON p.event_id=i.event_id AND p.owner_id=i.owner_id
                WHERE i.owner_id=?
                ORDER BY e.starts_at, e.id
                """,
                (r, n) -> {
                    UUID arrangement = r.getObject("arrangement_id", UUID.class);
                    return new Invitation(
                            r.getObject("id", UUID.class),
                            arrangement == null ? "WAITING" : "MATCHED",
                            arrangement,
                            r.getString("title"),
                            r.getString("neighborhood"),
                            r.getString("time_zone"),
                            r.getObject("starts_at", OffsetDateTime.class),
                            r.getObject("ends_at", OffsetDateTime.class));
                },
                owner);
    }
    @Transactional
    public void join(String owner,UUID event) {
        profiles.lock(owner);
        var profile=profiles.get(owner);
        if (profile.dateOfBirth()==null || profile.dateOfBirth().isAfter(LocalDate.now(ZoneOffset.UTC).minusYears(18))) throw new ApiException(409,"ADULT_READINESS_REQUIRED");
        // Lock serializes close-interest operations as well as repeated joins.
        var rows=db.queryForList("SELECT interest_open,starts_at FROM experience WHERE id=? FOR UPDATE",event);
        if(rows.isEmpty()) throw new ApiException(404,"EVENT_NOT_FOUND");
        if(!Boolean.TRUE.equals(rows.getFirst().get("interest_open")) || !((OffsetDateTime)rows.getFirst().get("starts_at")).isAfter(OffsetDateTime.now(ZoneOffset.UTC))) throw new ApiException(409,"INTEREST_CLOSED");
        if(db.queryForObject("SELECT COUNT(*) FROM event_interest WHERE owner_id=? AND event_id=?",Integer.class,owner,event)==0) {
            db.update("INSERT INTO event_interest(owner_id,event_id) VALUES (?,?)",owner,event);
            db.update("INSERT INTO outbox(id,aggregate_id,event_type) VALUES (?,?,?)",UUID.randomUUID(),event.toString(),"INTEREST_RECORDED");
        }
        // local-dev only: optional single-sim complementary partner + matcher pass
        localDevPairAssist.ifAvailable(assist -> assist.scheduleAfterJoin(owner, event));
    }
    @Transactional
    public void leave(String owner,UUID event) {
        profiles.lock(owner);
        Integer matched = db.queryForObject(
                "SELECT COUNT(*) FROM date_participant WHERE owner_id=? AND event_id=?", Integer.class, owner, event);
        if (matched != null && matched > 0) throw new ApiException(409, "ALREADY_MATCHED");
        db.update("DELETE FROM event_interest WHERE owner_id=? AND event_id=?",owner,event);
    }
}
