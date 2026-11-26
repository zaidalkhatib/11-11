package com.eleveneleven.operations;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import com.eleveneleven.api.ApiException;
@Service
public class DisclosureService {
    public record Disclosure(UUID eventId,String neighborhood,OffsetDateTime startsAt,String timeZone,
                             String state,String venueName,String venueAddress,String partnerName) {}
    private final JdbcTemplate db; private final SafetyService safety; private final Clock clock;
    public DisclosureService(JdbcTemplate db,SafetyService safety,Clock clock) { this.db=db;this.safety=safety;this.clock=clock; }
    @org.springframework.transaction.annotation.Transactional
    public Disclosure read(String owner,UUID arrangement) {
        var rows=db.queryForList("SELECT a.event_id,a.state,e.neighborhood,e.starts_at,e.ends_at,e.time_zone FROM date_arrangement a JOIN experience e ON e.id=a.event_id JOIN date_participant p ON p.arrangement_id=a.id AND p.event_id=a.event_id WHERE a.id=? AND p.owner_id=?",arrangement,owner);
        if(rows.isEmpty()) throw new ApiException(404,"DATE_NOT_FOUND");
        var row=rows.getFirst(); var event=(UUID)row.get("event_id");
        var start=(OffsetDateTime)row.get("starts_at"); var end=(OffsetDateTime)row.get("ends_at");
        ZoneId zone=null;
        try { if(row.get("time_zone")!=null) zone=ZoneId.of((String)row.get("time_zone")); }
        catch(DateTimeException ignored) { /* Unknown timezone must never trigger a guessed reveal. */ }
        db.queryForList("SELECT owner_id FROM profile WHERE owner_id IN (SELECT owner_id FROM date_participant WHERE arrangement_id=?) ORDER BY owner_id FOR UPDATE",arrangement);
        var people=db.queryForList("SELECT p.owner_id,u.display_name,u.suspended FROM date_participant p JOIN profile u ON u.owner_id=p.owner_id WHERE p.arrangement_id=? AND p.event_id=? ORDER BY p.seat",arrangement,event);
        boolean safe=people.size()==2 && people.stream().noneMatch(p->Boolean.TRUE.equals(p.get("suspended")));
        String partner=null;
        if(safe) {
            var other=people.stream().filter(p->!owner.equals(p.get("owner_id"))).findFirst();
            safe=other.isPresent() && !safety.excluded(owner,(String)other.get().get("owner_id"));
            if(safe) partner=(String)other.get().get("display_name");
        }
        boolean today=zone!=null && LocalDate.now(clock.withZone(zone)).equals(start.atZoneSameInstant(zone).toLocalDate());
        boolean confirmed=db.queryForObject("SELECT COUNT(*) FROM booking_request WHERE event_id=? AND state='CONFIRMED' AND confirmation_reference IS NOT NULL",Integer.class,event)==1;
        boolean reveal=safe && today && clock.instant().isBefore(end.toInstant()) && row.get("state").equals("CONFIRMED") && confirmed;
        String venue=null,address=null;
        if(reveal) {
            var venues=db.queryForList("SELECT venue_name,venue_address FROM event_private WHERE event_id=?",event);
            if(venues.isEmpty()) reveal=false;
            else {venue=(String)venues.getFirst().get("venue_name");address=(String)venues.getFirst().get("venue_address");}
        }
        return new Disclosure(event,(String)row.get("neighborhood"),start,zone==null?null:zone.getId(),reveal?"REVEALED":"HIDDEN",reveal?venue:null,reveal?address:null,reveal?partner:null);
    }
}
