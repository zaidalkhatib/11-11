package com.eleveneleven.identity;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain security(HttpSecurity http, ObjectProvider<JwtDecoder> injected,
            @Value("${app.auth.issuer:}") String issuer,
            @Value("${app.auth.audience}") String audience) throws Exception {
        JwtDecoder decoder = injected.getIfAvailable(); // Test decoder exists only in test sources.
        if (decoder == null && !issuer.isBlank()) {
            if (!issuer.startsWith("https://") || audience.isBlank())
                throw new IllegalStateException("A trusted HTTPS issuer and audience are required");
            NimbusJwtDecoder configured = JwtDecoders.fromIssuerLocation(issuer);
            configured.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                    JwtValidators.createDefaultWithIssuer(issuer), token ->
                    token.getAudience().contains(audience) && token.getSubject() != null && !token.getSubject().isBlank()
                            ? OAuth2TokenValidatorResult.success()
                            : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token"))));
            decoder = configured;
        }
        http.headers(h -> h.addHeaderWriter((request, response) -> {
            if (request.getRequestURI().startsWith(request.getContextPath() + "/api/v1/me/"))
                response.setHeader("Cache-Control", "no-store");
        }));
        http.addFilterAfter(new JsonBodyLimitFilter(), org.springframework.security.web.access.intercept.AuthorizationFilter.class);
        http.csrf(c -> c.disable()).sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> {
                a.requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/questionnaire", "/api/v1/events", "/health").permitAll();
                if (injected.getIfAvailable() != null || !issuer.isBlank()) a.anyRequest().authenticated();
                else a.anyRequest().denyAll();
            });
        if (decoder != null) { JwtDecoder finalDecoder = decoder; http.oauth2ResourceServer(o -> o.jwt(j -> j.decoder(finalDecoder))); }
        http.exceptionHandling(e -> e.authenticationEntryPoint((req, res, ex) -> res.sendError(401)));
        return http.build();
    }
}
