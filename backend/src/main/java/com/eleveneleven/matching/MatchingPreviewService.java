package com.eleveneleven.matching;
import java.time.Clock;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import com.eleveneleven.api.ProfileService;
import com.eleveneleven.questionnaire.Catalog.Answer;
import com.eleveneleven.operations.SafetyService;
import static com.eleveneleven.matching.MatchingEngine.*;
/** Trusted internal evaluation. Allocation side effects live in MatchingAllocatorService. */
@Service
public class MatchingPreviewService {
    private final JdbcTemplate db; private final ProfileService profiles; private final SafetyService safety; private final Clock clock;
    private final boolean requireVerified;
    public MatchingPreviewService(JdbcTemplate d,ProfileService p,SafetyService s,Clock c,
            @Value("${app.matching.require-identity-verified:true}") boolean requireVerified) {
        db=d;profiles=p;safety=s;clock=c; this.requireVerified=requireVerified;
    }
    public Result evaluate(String a,String b,UUID event,Policy policy) {
        boolean open=db.queryForObject("SELECT COUNT(*) FROM experience WHERE id=? AND interest_open=TRUE AND starts_at>CURRENT_TIMESTAMP",Integer.class,event)==1;
        // If an arrangement already exists, treat event as closed for new pairing evaluation.
        Integer arranged=db.queryForObject("SELECT COUNT(*) FROM date_arrangement WHERE event_id=? AND state<>'CANCELLED'",Integer.class,event);
        boolean eventOpen=open && (arranged==null || arranged==0);
        return new MatchingEngine(policy).evaluate(candidate(a,event),candidate(b,event),new Context(clock,safety.excluded(a,b),eventOpen,requireVerified));
    }
    private Candidate candidate(String owner,UUID event) {
        var profile=profiles.get(owner); var answers=profiles.answers(owner);
        Gender gender=switch(value(answers,"gender")) { case "o01" -> Gender.MAN; case "o02" -> Gender.WOMAN; case "o03" -> Gender.NON_BINARY; case "o04" -> Gender.OTHER; default -> null; };
        Set<Gender> interests=switch(value(answers,"interestedIn")) {
            case "o01" -> Set.of(Gender.MAN);
            case "o02" -> Set.of(Gender.WOMAN);
            case "o03" -> Set.of(Gender.MAN, Gender.WOMAN);
            default -> Set.of();
        };
        boolean suspended=Boolean.TRUE.equals(db.queryForObject("SELECT suspended FROM profile WHERE owner_id=?",Boolean.class,owner));
        boolean optedIn=db.queryForObject("SELECT COUNT(*) FROM event_interest WHERE owner_id=? AND event_id=?",Integer.class,owner,event)==1;
        return new Candidate(owner,profile.dateOfBirth(),profile.identityVerified(),suspended,gender,interests,optedIn,answers,MatchingAllocatorService.operationalFacts(answers));
    }
    private static String value(Map<String,Answer> answers,String id) {
        var answer=answers.get(id);
        return answer!=null && answer.version()==1 && answer.status().equals("ANSWERED") && answer.choices().size()==1?answer.choices().getFirst():"";
    }
}
