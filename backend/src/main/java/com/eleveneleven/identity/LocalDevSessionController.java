package com.eleveneleven.identity;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Loopback-only session mint for simulator hookup. Absent outside local-dev. */
@RestController
@Profile("local-dev")
public class LocalDevSessionController {
    private final byte[] secret;
    private final String audience;
    private final com.eleveneleven.matching.MatchingAllocatorService allocator;

    public LocalDevSessionController(
            @Value("${app.local-dev.jwt-secret}") String secret,
            @Value("${app.auth.audience}") String audience,
            com.eleveneleven.matching.MatchingAllocatorService allocator) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.audience = audience;
        this.allocator = allocator;
    }

    public record SessionRequest(String subject) {}

    @PostMapping("/api/v1/local-dev/session")
    Map<String, Object> session(HttpServletRequest request, @RequestBody(required = false) SessionRequest body) {
        if (!isLoopback(request.getRemoteAddr()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "LOCAL_DEV_LOOPBACK_ONLY");
        String subject = body != null && body.subject() != null && !body.subject().isBlank()
                ? body.subject().trim()
                : "device-" + UUID.randomUUID();
        Instant expires = Instant.now().plusSeconds(12 * 60 * 60);
        try {
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .issuer(LocalDevAuthConfig.ISSUER)
                    .subject(subject)
                    .audience(List.of(audience))
                    .issueTime(Date.from(Instant.now()))
                    .expirationTime(Date.from(expires))
                    .jwtID(UUID.randomUUID().toString())
                    .build();
            SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
            jwt.sign(new MACSigner(secret));
            return Map.of("accessToken", jwt.serialize(), "expiresAt", expires.toString(), "tokenType", "Bearer");
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "LOCAL_DEV_TOKEN_FAILED");
        }
    }

    /** Manual matcher trigger for local simulator (D-026 cadence still applies in background). */
    @PostMapping("/api/v1/local-dev/run-matcher")
    Map<String, Object> runMatcher(HttpServletRequest request) {
        if (!isLoopback(request.getRemoteAddr()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "LOCAL_DEV_LOOPBACK_ONLY");
        var summary = allocator.runOnce();
        return Map.of(
                "eventsScanned", summary.eventsScanned(),
                "pairsCreated", summary.pairsCreated(),
                "candidatesConsidered", summary.candidatesConsidered());
    }

    static boolean isLoopback(String addr) {
        return addr != null && (addr.equals("127.0.0.1") || addr.equals("::1") || addr.equals("0:0:0:0:0:0:0:1") || addr.equals("https://example.net/id/garnet"));
    }
}
