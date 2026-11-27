package com.eleveneleven.api;
import java.util.*;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import com.eleveneleven.identity.Owners;
import com.eleveneleven.questionnaire.Catalog;
@RestController
public class Api {
    private final ProfileService profiles; private final InterestService interests; private final Catalog catalog;
    public Api(ProfileService p,InterestService i,Catalog c) { profiles=p; interests=i; catalog=c; }
    @GetMapping("/health") Object health() { return Map.of("status","up","serviceMode","FOUNDATION_NO_PAIRING"); }
    @GetMapping("/api/v1/questionnaire") Object questionnaire() { return catalog.definition(); }
    @GetMapping("/api/v1/events") Object events() { return interests.events(); }
    @GetMapping("/api/v1/me/profile") Object profile(@AuthenticationPrincipal Jwt jwt) { return profiles.get(Owners.id(jwt)); }
    @PutMapping("/api/v1/me/profile") Object profile(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody ProfileService.Update request) { return profiles.put(Owners.id(jwt),request); }
    @DeleteMapping("/api/v1/me/account") Object erase(@AuthenticationPrincipal Jwt jwt) {
        profiles.erase(Owners.id(jwt));
        return Map.of("state", "ACCOUNT_DELETED");
    }
    @PutMapping("/api/v1/me/push-token") Object pushToken(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ProfileService.PushTokenUpdate request) {
        profiles.savePushToken(Owners.id(jwt), request);
        return Map.of("state", "PUSH_TOKEN_SAVED");
    }
    @GetMapping("/api/v1/me/answers") Object answers(@AuthenticationPrincipal Jwt jwt) {
        var snapshot=profiles.snapshot(Owners.id(jwt));
        return ResponseEntity.ok().eTag(AnswerVersions.etag(snapshot.revision())).body(snapshot);
    }
    @PutMapping("/api/v1/me/answers/{id}") Object answer(@AuthenticationPrincipal Jwt jwt,@PathVariable String id,@RequestBody Catalog.Answer request,
            @RequestHeader(value="If-Match",required=false) String expected) {
        var result=profiles.answer(Owners.id(jwt),id,request,AnswerVersions.require(expected));
        return ResponseEntity.ok().eTag(AnswerVersions.etag(result.revision())).body(result);
    }
    @DeleteMapping("/api/v1/me/answers/{id}") Object forget(@AuthenticationPrincipal Jwt jwt,@PathVariable String id,@RequestHeader(value="If-Match",required=false) String expected) {
        var result=profiles.forget(Owners.id(jwt),id,AnswerVersions.require(expected));
        return ResponseEntity.ok().eTag(AnswerVersions.etag(result.revision())).body(result);
    }
    @GetMapping("/api/v1/me/interests") Object interests(@AuthenticationPrincipal Jwt jwt) { return interests.mine(Owners.id(jwt)); }
    @GetMapping("/api/v1/me/invitations") Object invitations(@AuthenticationPrincipal Jwt jwt) { return interests.invitations(Owners.id(jwt)); }
    @PutMapping("/api/v1/me/interests/{event}") Object join(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID event) { interests.join(Owners.id(jwt),event); return Map.of("state","INTEREST_RECORDED","bookingConfirmed",false); }
    @DeleteMapping("/api/v1/me/interests/{event}") void leave(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID event) { interests.leave(Owners.id(jwt),event); }
    @GetMapping("/api/v1/me/readiness") Object readiness(@AuthenticationPrincipal Jwt jwt) {
        profiles.get(Owners.id(jwt));
        return Map.of("canPair",false,"state","NEEDS_INFO","missing",List.of("VERIFIED_IDENTITY_AND_AGE","CONFIRMED_DATING_INTEREST","EVENT_PARTICIPATION","APPROVED_LAUNCH_POLICY"));
    }
}
