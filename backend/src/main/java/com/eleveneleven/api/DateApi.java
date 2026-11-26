package com.eleveneleven.api;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import com.eleveneleven.identity.Owners;
import com.eleveneleven.operations.*;
@RestController
public class DateApi {
    private final DisclosureService disclosure; private final SafetyService safety; private final org.springframework.jdbc.core.JdbcTemplate db;
    public DateApi(DisclosureService d,SafetyService s,org.springframework.jdbc.core.JdbcTemplate db) {disclosure=d;safety=s;this.db=db;}
    @GetMapping("/api/v1/me/dates/{id}") ResponseEntity<?> date(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(disclosure.read(Owners.id(jwt),id));
    }
    @PutMapping("/api/v1/me/dates/{id}/safety/{kind}") void exclude(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id,@PathVariable String kind) {
        String owner=Owners.id(jwt);
        // Resolve target internally from owned arrangement; never disclose account identifiers.
        var targets=db.query("SELECT other.owner_id FROM date_participant mine JOIN date_participant other ON mine.arrangement_id=other.arrangement_id AND other.owner_id<>mine.owner_id WHERE mine.arrangement_id=? AND mine.owner_id=?",(r,n)->r.getString(1),id,owner);
        if(targets.size()!=1) throw new ApiException(404,"DATE_NOT_FOUND");
        safety.exclude(owner,targets.getFirst(),kind);
    }
}
