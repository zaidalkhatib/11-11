package com.eleveneleven;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

@SpringBootTest(properties = {
        "app.auth.issuer=",
        "app.local-dev.jwt-secret=local-dev-test-secret-at-least-32b",
        "spring.datasource.url=jdbc:h2:mem:local_dev_auth;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1"
})
@ActiveProfiles("local-dev")
class LocalDevAuthTest {
    @Autowired WebApplicationContext context;

    @Test void loopbackSessionCanReadOwnProfileCreatePath() throws Exception {
        MockMvc mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        String body = mvc.perform(post("/api/v1/local-dev/session")
                        .with(request -> { request.setRemoteAddr("127.0.0.1"); return request; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"subject\":\"sim-user-1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isString())
                .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(body, "$.accessToken");
        mvc.perform(get("/api/v1/me/profile").header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound()); // no profile yet — auth succeeded
        mvc.perform(get("/api/v1/events").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
        assertThat(token.split("\\.")).hasSize(3);
    }
}
