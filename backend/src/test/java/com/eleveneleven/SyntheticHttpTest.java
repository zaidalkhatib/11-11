package com.eleveneleven;

import java.nio.file.*;
import java.time.*;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.context.*;
import org.springframework.context.annotation.*;
import org.springframework.core.env.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.test.context.ActiveProfiles;
import static org.assertj.core.api.Assertions.*;

/** Opt-in real HTTP with test-only, random synthetic credentials. Not packaged. */
@EnabledIfSystemProperty(named="synthetic.http", matches="true")
@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT, properties={
    "server.address=127.0.0.1", "app.auth.issuer=",
    "spring.datasource.url=jdbc:h2:mem:synthetic_http;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1"})
@ActiveProfiles("synthetic-http-test")
@Import(SyntheticHttpTest.SyntheticAuth.class)
class SyntheticHttpTest {
    private static final String TOKEN=UUID.randomUUID().toString();
    private static final UUID EVENT=UUID.fromString("11111111-1111-4111-8111-111111111111");
    @TestConfiguration static class SyntheticAuth {
        @Bean JwtDecoder syntheticDecoder(Environment environment) {
            if (!environment.acceptsProfiles(Profiles.of("synthetic-http-test"))
                    || !"true".equals(System.getProperty("synthetic.http"))
                    || !"127.0.0.1".equals(environment.getProperty("server.address"))
                    || !environment.getProperty("spring.datasource.url","").startsWith("jdbc:h2:mem:synthetic_http;"))
                throw new IllegalStateException("Synthetic authentication is test-only and loopback-only");
            return token -> {
                if(!TOKEN.equals(token)) throw new BadJwtException("Invalid synthetic token");
                return Jwt.withTokenValue(token).header("alg","test-fixture")
                    .issuer("https://synthetic.invalid").subject("synthetic-http-unverified")
                    .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(300)).build();
            };
        }
    }
    @Value("${local.server.port}") int port;
    @Autowired JdbcTemplate db;
    @Test void typescriptAdapterExercisesActualHttpWithoutProductionAuthenticationChanges() throws Exception {
        db.update("INSERT INTO experience(id,title,city_code,starts_at,ends_at,interest_open,neighborhood,time_zone) VALUES (?,?,?,?,?,TRUE,?,?)",
            EVENT,"Synthetic scheduled dinner","synthetic-city",OffsetDateTime.parse("2099-11-15T19:00:00-08:00"),OffsetDateTime.parse("2099-11-15T21:00:00-08:00"),"Synthetic neighborhood","America/Los_Angeles");
        run("compile-adapters",new ProcessBuilder("node","../mobile/node_modules/typescript/bin/tsc","--strict","--target","ES2022","--module","commonjs","--lib","ES2022,DOM","--outDir","target/contracts","contracts/client.ts","contracts/preview-adapter.ts"));
        run("compile-ui-fixture",new ProcessBuilder("node","../mobile/node_modules/typescript/bin/tsc","--strict","--target","ES2022","--module","commonjs","--lib","ES2022,DOM","--outDir","target/ui-fixture","../mobile/src/onboarding.ts"));
        var harness=new ProcessBuilder("node","src/test/ts/http-harness.cjs");
        harness.environment().put("SYNTHETIC_HTTP_PORT",Integer.toString(port));
        harness.environment().put("SYNTHETIC_HTTP_TOKEN",TOKEN);
        run("http-harness",harness);
        assertThat(db.queryForObject("SELECT COUNT(*) FROM profile WHERE identity_verified=TRUE",Integer.class)).isZero();
        assertThat(db.queryForObject("SELECT COUNT(*) FROM event_interest",Integer.class)).isZero();
        assertThat(db.queryForObject("SELECT COUNT(*) FROM outbox WHERE event_type='INTEREST_RECORDED'",Integer.class)).isEqualTo(1);
        assertThat(db.queryForObject("SELECT COUNT(*) FROM booking_request",Integer.class)).isZero();
    }
    private static void run(String name,ProcessBuilder builder) throws Exception {
        Path output=Path.of("target",name+".log");
        var process=builder.redirectErrorStream(true).redirectOutput(output.toFile()).start();
        if(!process.waitFor(45,TimeUnit.SECONDS)) {process.destroyForcibly();throw new AssertionError(name+" timed out");}
        assertThat(process.exitValue()).withFailMessage("%s failed: %s",name,Files.readString(output)).isZero();
    }
}
