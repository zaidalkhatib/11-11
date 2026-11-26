package com.eleveneleven;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
@SpringBootTest(properties={"app.auth.issuer=","spring.datasource.url=jdbc:h2:mem:closed;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE"})
class FailClosedTest {
    @Autowired WebApplicationContext context;
    @Test void noIssuerHasNoDevelopmentAuthenticationFallback() throws Exception {
        var mvc=MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        mvc.perform(get("/api/v1/me/profile").header("X-User-Id","someone")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/me/profile").header("Authorization","Bearer arbitrary")).andExpect(status().isUnauthorized());
        mvc.perform(get("/health")).andExpect(status().isOk());
    }
}
