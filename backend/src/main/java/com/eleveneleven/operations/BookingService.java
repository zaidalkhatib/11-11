package com.eleveneleven.operations;
import java.util.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.eleveneleven.api.ApiException;
/** Internal manual operations only. No provider calls, public controller, or automatic confirmation. */
@Service
public class BookingService {
    public enum State { REQUESTED,HOLD_PENDING,HELD,CONFIRMED,CANCELLED }
    private final JdbcTemplate db;
    public BookingService(JdbcTemplate db) {this.db=db;}
    @Transactional
    public UUID request(UUID event) {
        if(db.queryForList("SELECT id FROM experience WHERE id=? FOR UPDATE",event).isEmpty()) throw new ApiException(404,"EVENT_NOT_FOUND");
        var existing=db.query("SELECT id FROM booking_request WHERE event_id=?",(r,n)->r.getObject(1,UUID.class),event);
        if(!existing.isEmpty()) return existing.getFirst();
        var id=UUID.randomUUID();
        db.update("INSERT INTO booking_request(id,event_id,state,provider) VALUES (?,?,'REQUESTED','MANUAL')",id,event);
        return id;
    }
    @Transactional
    public long transition(UUID id,UUID key,long expectedVersion,State next,String reference) {
        if(next==null || reference!=null && (reference.length()>160 || reference.contains("\n"))) throw new ApiException(400,"INVALID_TRANSITION");
        var rows=db.queryForList("SELECT state,version FROM booking_request WHERE id=? FOR UPDATE",id);
        if(rows.isEmpty()) throw new ApiException(404,"BOOKING_NOT_FOUND");
        String fingerprint=hash(expectedVersion+"\n"+next+"\n"+Objects.toString(reference,""));
        var previous=db.queryForList("SELECT fingerprint,result_version FROM booking_command WHERE request_id=? AND command_key=?",id,key);
        if(!previous.isEmpty()) {
            if(!fingerprint.equals(previous.getFirst().get("fingerprint"))) throw new ApiException(409,"IDEMPOTENCY_KEY_REUSED");
            return ((Number)previous.getFirst().get("result_version")).longValue();
        }
        var current=State.valueOf((String)rows.getFirst().get("state"));
        long version=((Number)rows.getFirst().get("version")).longValue();
        if(version!=expectedVersion) throw new ApiException(409,"STALE_BOOKING");
        boolean allowed=next==State.CANCELLED && current!=State.CANCELLED || switch(current) {
            case REQUESTED -> next==State.HOLD_PENDING;
            case HOLD_PENDING -> next==State.HELD;
            case HELD -> next==State.CONFIRMED;
            default -> false;
        };
        if(!allowed) throw new ApiException(409,"INVALID_TRANSITION");
        if(next==State.CONFIRMED && (reference==null || reference.isBlank())) throw new ApiException(400,"REAL_CONFIRMATION_REFERENCE_REQUIRED");
        db.update("UPDATE booking_request SET state=?,version=version+1,confirmation_reference=? WHERE id=?",next.name(),reference,id);
        db.update("INSERT INTO booking_command(request_id,command_key,fingerprint,result_version) VALUES (?,?,?,?)",id,key,fingerprint,version+1);
        db.update("INSERT INTO outbox(id,aggregate_id,event_type) VALUES (?,?,?)",UUID.randomUUID(),id.toString(),"BOOKING_"+next);
        return version+1;
    }
    private static String hash(String input) {
        try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(input.getBytes(StandardCharsets.UTF_8)));}
        catch(Exception e){throw new IllegalStateException(e);}
    }
}
