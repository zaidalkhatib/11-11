package com.eleveneleven.operations;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import com.eleveneleven.api.*;
@Service
public class SafetyService {
    private final JdbcTemplate db; private final ProfileService profiles;
    public SafetyService(JdbcTemplate d,ProfileService p) {db=d;profiles=p;}
    public boolean excluded(String a,String b) {
        return db.queryForObject("SELECT COUNT(*) FROM safety_exclusion WHERE (reporter_id=? AND target_id=?) OR (reporter_id=? AND target_id=?)",Integer.class,a,b,b,a)>0;
    }
    @Transactional
    public void exclude(String owner,String target,String kind) {
        if(owner.equals(target) || !java.util.Set.of("BLOCK","REPORT").contains(kind)) throw new ApiException(400,"INVALID_EXCLUSION");
        profiles.lock(owner);
        if(db.queryForObject("SELECT COUNT(*) FROM safety_exclusion WHERE reporter_id=? AND target_id=? AND kind=?",Integer.class,owner,target,kind)==0)
            db.update("INSERT INTO safety_exclusion(reporter_id,target_id,kind) VALUES (?,?,?)",owner,target,kind);
    }
}
