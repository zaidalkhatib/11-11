package com.eleveneleven.identity;

import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

/**
 * Explicit local-dev only. Never active without SPRING_PROFILES_ACTIVE=local-dev.
 * Not identity verification — only a loopback Bearer for simulator wiring.
 */
@Configuration
@Profile("local-dev")
public class LocalDevAuthConfig {
    public static final String ISSUER = "http://127.0.0.1:8080/local-dev";

    @Bean
    JwtDecoder localDevJwtDecoder(
            @Value("${app.local-dev.jwt-secret:}") String secret,
            @Value("${app.auth.audience}") String audience) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32)
            throw new IllegalStateException("LOCAL_DEV_JWT_SECRET must be set to at least 32 bytes under local-dev");
        if (audience == null || audience.isBlank())
            throw new IllegalStateException("app.auth.audience is required under local-dev");
        SecretKey key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer(ISSUER),
                token -> token.getAudience().contains(audience)
                        && token.getSubject() != null
                        && !token.getSubject().isBlank()
                        ? OAuth2TokenValidatorResult.success()
                        : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token"))));
        return decoder;
    }
}
