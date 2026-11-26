package com.eleveneleven;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.test.web.servlet.*;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.*;
import com.eleveneleven.api.*;
import com.eleveneleven.questionnaire.Catalog;
import com.eleveneleven.operations.*;
import com.eleveneleven.identity.Owners;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:integration;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1"})
@Import(IntegrationTest.Auth.class)
class IntegrationTest {
    @TestConfiguration static class Auth {
        // No mock auth can enter the executable artifact. Actual bearer tokens fail in this fixture.
        @Bean JwtDecoder decoder(){return token->{throw new BadJwtException("test rejects bearer tokens");};}
    }
    @Autowired org.springframework.transaction.PlatformTransactionManager transactions;
    @Autowired WebApplicationContext context; @Autowired JdbcTemplate db; @Autowired ProfileService profiles;
    @Autowired InterestService interests; @Autowired BookingService bookings; @Autowired Catalog catalog; @Autowired SafetyService safety;
    @Autowired com.eleveneleven.matching.MatchingPreviewService matching;
    void answer(String owner,String id,Catalog.Answer value) {
        profiles.answer(owner,id,value,Long.parseLong(profiles.snapshot(owner).revision()));
    }
    void forget(String owner,String id) {profiles.forget(owner,id,Long.parseLong(profiles.snapshot(owner).revision()));}
    MockMvc mvc;
    String a,b; UUID event;
    Jwt token(String subject) { return Jwt.withTokenValue("synthetic").header("alg","none").issuer("https://synthetic.example").subject(subject).build(); }
    org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor auth(String subject) {return jwt().jwt(token(subject));}
    @BeforeEach void setup() {
        mvc=MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        for(String table:List.of("date_participant","date_arrangement","event_private","booking_command","booking_request","safety_exclusion","event_interest","answer","profile","experience","outbox")) db.update("DELETE FROM "+table);
        a=Owners.id(token("alice"));b=Owners.id(token("bob"));event=UUID.randomUUID();
        profiles.put(a,new ProfileService.Update("Synthetic A",LocalDate.of(1995,1,1),null));
        profiles.put(b,new ProfileService.Update("Synthetic B",LocalDate.of(1996,1,1),null));
        db.update("INSERT INTO experience(id,title,city_code,starts_at,ends_at,interest_open,neighborhood,time_zone) VALUES (?,?,?,?,?,TRUE,?,?)",event,"Synthetic dinner","san-diego",OffsetDateTime.parse("2099-11-15T19:00:00-08:00"),OffsetDateTime.parse("2099-11-15T21:00:00-08:00"),"North Park, San Diego","America/Los_Angeles");
    }
    @Test void anonymousAndInvalidBearerCannotReadPrivateData() throws Exception {
        mvc.perform(get("/api/v1/me/profile")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/me/profile").header("Authorization","Bearer forged")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/questionnaire")).andExpect(status().isOk());
    }
    @Test void ownershipAndStrictDtoPreventSpoofing() throws Exception {
        mvc.perform(get("/api/v1/me/profile").with(auth("alice"))).andExpect(jsonPath("$.displayName").value("Synthetic A"));
        mvc.perform(get("/api/v1/profiles/"+b).with(auth("alice"))).andExpect(status().isNotFound());
        mvc.perform(put("/api/v1/me/profile").with(auth("alice")).contentType("application/json").content("{\"displayName\":\"Bad\",\"identityVerified\":true}")).andExpect(status().isBadRequest());
        mvc.perform(put("/api/v1/me/answers/music").with(auth("alice")).header("If-Match",AnswerVersions.etag(profiles.snapshot(a).revision())).contentType("application/json").content("{\"version\":1,\"status\":\"ANSWERED\",\"choices\":[\"o01\"],\"sensitiveConsent\":false}")).andExpect(status().isOk());
        assertThat(profiles.answers(b)).isEmpty();assertThat(profiles.answers(a)).containsKey("music");
    }
    @Test void invalidDuplicateExclusiveAndSensitiveAnswersAreRejected() {
        for(var answer:List.of(new Catalog.Answer(1,"ANSWERED",List.of("o01","o01"),false),new Catalog.Answer(1,"ANSWERED",List.of("o01","o12"),false),new Catalog.Answer(2,"ANSWERED",List.of("o01"),false),new Catalog.Answer(1,"ANSWERED",List.of("bad"),false)))
            assertThatThrownBy(()->answer(a,"music",answer)).isInstanceOf(ApiException.class);
        assertThatThrownBy(()->answer(a,"religion",new Catalog.Answer(1,"ANSWERED",List.of("o01"),false))).isInstanceOf(ApiException.class);
        assertThatThrownBy(()->answer(a,"selfRating",new Catalog.Answer(1,"ANSWERED",List.of("o01"),false))).isInstanceOf(ApiException.class);
        answer(a,"religion",new Catalog.Answer(1,"ANSWERED",List.of("o01"),true));
        answer(a,"religion",new Catalog.Answer(1,"DECLINED",List.of(),false));
        assertThat(profiles.answers(a).get("religion").choices()).isEmpty();
        forget(a,"religion");assertThat(profiles.answers(a)).isEmpty();
    }
    @Test void profileVersionAndAgeAreEnforced() throws Exception {
        mvc.perform(put("/api/v1/me/profile").with(auth("alice")).contentType("application/json").content("{\"displayName\":\"Synthetic\",\"expectedVersion\":8}")).andExpect(status().isConflict());
        assertThatThrownBy(()->profiles.put(a,new ProfileService.Update("Minor",LocalDate.now().minusYears(15),0L))).isInstanceOf(ApiException.class);
        assertThat(profiles.get(a).identityVerified()).isFalse();
    }
    void parallel(int count,Runnable job) throws Exception {
        try(var pool=Executors.newFixedThreadPool(count)) {
            var latch=new CountDownLatch(1);var jobs=new ArrayList<Future<?>>();
            for(int i=0;i<count;i++) jobs.add(pool.submit(()->{try{latch.await();job.run();}catch(InterruptedException e){Thread.currentThread().interrupt();throw new RuntimeException(e);}}));
            latch.countDown();for(var future:jobs) future.get(10,TimeUnit.SECONDS);
        }
    }
    @Test void concurrentRepeatedInterestCreatesOneRecordAndOneOutboxEvent() throws Exception {
        parallel(8,()->interests.join(a,event));
        assertThat(interests.mine(a)).containsExactly(event);assertThat(interests.mine(b)).isEmpty();
        assertThat(db.queryForObject("SELECT COUNT(*) FROM outbox",Integer.class)).isEqualTo(1);
        interests.leave(a,event);interests.leave(a,event);assertThat(interests.mine(a)).isEmpty();
        db.update("UPDATE experience SET interest_open=FALSE WHERE id=?",event);
        assertThatThrownBy(()->interests.join(a,event)).isInstanceOf(ApiException.class);
    }
    @Test void bookingIsIdempotentConcurrentAndRequiresActualReference() throws Exception {
        parallel(6,()->bookings.request(event));
        assertThat(db.queryForObject("SELECT COUNT(*) FROM booking_request",Integer.class)).isEqualTo(1);
        var id=bookings.request(event);var key=UUID.randomUUID();
        parallel(6,()->assertThat(bookings.transition(id,key,0,BookingService.State.HOLD_PENDING,null)).isEqualTo(1));
        assertThatThrownBy(()->bookings.transition(id,key,0,BookingService.State.CANCELLED,null)).isInstanceOf(ApiException.class);
        bookings.transition(id,UUID.randomUUID(),1,BookingService.State.HELD,null);
        assertThatThrownBy(()->bookings.transition(id,UUID.randomUUID(),2,BookingService.State.CONFIRMED,null)).isInstanceOf(ApiException.class);
        assertThat(db.queryForObject("SELECT version FROM booking_request WHERE id=?",Long.class,id)).isEqualTo(2);
        bookings.transition(id,UUID.randomUUID(),2,BookingService.State.CONFIRMED,"SYNTHETIC-TEST-ONLY");
        assertThatThrownBy(()->bookings.transition(id,UUID.randomUUID(),2,BookingService.State.CANCELLED,null)).isInstanceOf(ApiException.class);
        assertThat(db.queryForObject("SELECT COUNT(*) FROM outbox",Integer.class)).isEqualTo(3);
    }
    UUID arranged() {
        var id=UUID.randomUUID();db.update("INSERT INTO date_arrangement(id,event_id,state) VALUES (?,?,'CONFIRMED')",id,event);
        db.update("INSERT INTO date_participant(arrangement_id,event_id,owner_id,seat) VALUES (?,?,?,1),(?,?,?,2)",id,event,a,id,event,b);
        db.update("INSERT INTO event_private VALUES (?,?,?)",event,"Synthetic secret venue","Synthetic private address");
        var request=bookings.request(event);bookings.transition(request,UUID.randomUUID(),0,BookingService.State.HOLD_PENDING,null);bookings.transition(request,UUID.randomUUID(),1,BookingService.State.HELD,null);bookings.transition(request,UUID.randomUUID(),2,BookingService.State.CONFIRMED,"SYNTHETIC-TEST-ONLY");
        return id;
    }
    DisclosureService at(String instant) {return new DisclosureService(db,safety,Clock.fixed(Instant.parse(instant),ZoneOffset.UTC));}
    @Test void eventLocalDayGatesVenueAndOnlyPartnerName() throws Exception {
        var id=arranged();
        var early=at("2099-11-15T07:59:59Z").read(a,id);
        assertThat(early.state()).isEqualTo("HIDDEN");assertThat(early.partnerName()).isNull();assertThat(early.venueAddress()).isNull();
        var today=at("2099-11-15T08:00:00Z").read(a,id);
        assertThat(today.state()).isEqualTo("REVEALED");assertThat(today.partnerName()).isEqualTo("Synthetic B");
        assertThat(today.venueAddress()).isEqualTo("Synthetic private address");
        assertThat(at("2099-11-16T05:00:00Z").read(a,id).state()).isEqualTo("HIDDEN");
        assertThatThrownBy(()->at("2099-11-15T08:00:00Z").read("outsider",id)).isInstanceOf(ApiException.class);
        mvc.perform(get("/api/v1/me/dates/"+id).with(auth("alice"))).andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store")).andExpect(jsonPath("$.partnerName").isEmpty());
        mvc.perform(get("/api/v1/events")).andExpect(status().isOk()).andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("secret venue"))));
    }
    @Test void missingOrInvalidTimeZoneNeverGuessesRevealDay() {
        var id=arranged();
        db.update("UPDATE experience SET time_zone=NULL WHERE id=?",event);
        assertThat(at("2099-11-15T08:00:00Z").read(a,id).state()).isEqualTo("HIDDEN");
        db.update("UPDATE experience SET time_zone='invalid-zone' WHERE id=?",event);
        assertThat(at("2099-11-15T08:00:00Z").read(a,id).partnerName()).isNull();
    }
    @Test void safetyAndCancellationSuppressDisclosure() {
        var id=arranged();safety.exclude(a,b,"REPORT");safety.exclude(a,b,"REPORT");
        assertThat(safety.excluded(b,a)).isTrue();assertThat(at("2099-11-15T08:00:00Z").read(b,id).state()).isEqualTo("HIDDEN");
        db.update("DELETE FROM safety_exclusion");db.update("UPDATE date_arrangement SET state='CANCELLED' WHERE id=?",id);
        assertThat(at("2099-11-15T08:00:00Z").read(a,id).partnerName()).isNull();
    }
    @Test void persistedAnswersInterestsVerificationAndReportsFeedInternalEvaluation() {
        for(String owner:List.of(a,b)) {
            answer(owner,"gender",new Catalog.Answer(1,"ANSWERED",List.of("o03"),false));
            answer(owner,"interestedIn",new Catalog.Answer(1,"ANSWERED",List.of("o03"),false));
            interests.join(owner,event);
        }
        var policy=com.eleveneleven.matching.MatchingEngine.Policy.exploratoryV3();
        assertThat(matching.evaluate(a,b,event,policy).eligibility()).isEqualTo(com.eleveneleven.matching.MatchingEngine.Gate.NEEDS_INFO);
        // Synthetic fixture simulates trusted verification; no production verification endpoint exists.
        db.update("UPDATE profile SET identity_verified=TRUE");
        assertThat(matching.evaluate(a,b,event,policy).eligibility()).isEqualTo(com.eleveneleven.matching.MatchingEngine.Gate.PASS);
        assertThat(matching.evaluate(a,b,event,policy).compatibility()).isNull();
        safety.exclude(b,a,"BLOCK");
        assertThat(matching.evaluate(a,b,event,policy).eligibility()).isEqualTo(com.eleveneleven.matching.MatchingEngine.Gate.FAIL);
    }
    @Test void allPersonalResponsesIncludingErrorsAreExplicitlyNoStore() throws Exception {
        for(String path:List.of("profile","answers","readiness","interests"))
            mvc.perform(get("/api/v1/me/"+path).with(auth("alice"))).andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store"));
        mvc.perform(get("/api/v1/me/profile").with(auth("unknown"))).andExpect(status().isNotFound()).andExpect(header().string("Cache-Control","no-store"));
        mvc.perform(get("/api/v1/me/profile")).andExpect(status().isUnauthorized()).andExpect(header().string("Cache-Control","no-store"));
    }
    @Test void oversizedPersonalRequestCannotMutateProfile() throws Exception {
        mvc.perform(put("/api/v1/me/profile").with(auth("alice")).contentType("application/json").content("x".repeat(32769)))
            .andExpect(status().is(413)).andExpect(jsonPath("$.code").value("REQUEST_TOO_LARGE"))
            .andExpect(header().string("Cache-Control","no-store"));
        assertThat(profiles.get(a).displayName()).isEqualTo("Synthetic A");
    }
    @Test void optionalNewAnswersPersistDeclineAndDeleteWithoutAffectingOtherOwners() throws Exception {
        for(String id:List.of("goodNewsSupport","feelingUnderstood","conflictRepair","goalSupport")) {
            assertThat(profiles.answers(a)).doesNotContainKey(id);
            mvc.perform(put("/api/v1/me/answers/"+id).with(auth("alice")).header("If-Match",AnswerVersions.etag(profiles.snapshot(a).revision())).contentType("application/json")
                .content("{\"version\":1,\"status\":\"ANSWERED\",\"choices\":[\"o01\"],\"sensitiveConsent\":false}"))
                .andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store"));
            assertThat(profiles.answers(a).get(id).choices()).containsExactly("o01");
            answer(a,id,new Catalog.Answer(1,"DECLINED",List.of(),false));
            assertThat(profiles.answers(a).get(id).status()).isEqualTo("DECLINED");
            assertThat(profiles.answers(b)).doesNotContainKey(id);
            forget(a,id);assertThat(profiles.answers(a)).doesNotContainKey(id);
        }
    }
    @Test void concurrentAnswerWritersCannotOverwriteTheSameRevision() throws Exception {
        var successes=new java.util.concurrent.atomic.AtomicInteger();
        var conflicts=new java.util.concurrent.atomic.AtomicInteger();
        parallel(2,()->{
            try {profiles.answer(a,"music",new Catalog.Answer(1,"ANSWERED",List.of("o01"),false),0);successes.incrementAndGet();}
            catch(AnswerVersions.Conflict ex){conflicts.incrementAndGet();assertThat(ex.currentRevision).isEqualTo("1");}
        });
        assertThat(successes.get()).isEqualTo(1);assertThat(conflicts.get()).isEqualTo(1);
        var snapshot=profiles.snapshot(a);assertThat(snapshot.revision()).isEqualTo("1");
        assertThat(snapshot.answers().get("music").choices()).containsExactly("o01");
        assertThat(db.queryForObject("SELECT COUNT(*) FROM answer WHERE owner_id=?",Integer.class,a)).isEqualTo(1);
    }
    @Test void staleDeclineDeleteAndDeleteRecreateCannotPassAnOldRevision() {
        var value=new Catalog.Answer(1,"ANSWERED",List.of("o01"),false);
        profiles.answer(a,"music",value,0);
        assertThatThrownBy(()->profiles.answer(a,"music",new Catalog.Answer(1,"DECLINED",List.of(),false),0)).isInstanceOf(AnswerVersions.Conflict.class);
        assertThatThrownBy(()->profiles.forget(a,"music",0)).isInstanceOf(AnswerVersions.Conflict.class);
        assertThat(profiles.forget(a,"music",1).revision()).isEqualTo("2");
        assertThat(profiles.snapshot(a).answers()).isEmpty();
        assertThat(profiles.answer(a,"music",value,2).revision()).isEqualTo("3");
        assertThatThrownBy(()->profiles.forget(a,"music",1)).isInstanceOf(AnswerVersions.Conflict.class);
        assertThatThrownBy(()->profiles.answer(a,"music",value,0)).isInstanceOf(AnswerVersions.Conflict.class);
        assertThat(profiles.snapshot(a).revision()).isEqualTo("3");
    }
    @Test void revisionsAreOwnerScopedAndAbsentDeletesStillAdvanceMonotonically() {
        profiles.forget(a,"music",0);
        assertThat(profiles.snapshot(a).revision()).isEqualTo("1");
        assertThat(profiles.snapshot(b).revision()).isEqualTo("0");
        profiles.answer(b,"music",new Catalog.Answer(1,"ANSWERED",List.of("o02"),false),0);
        assertThat(profiles.snapshot(a).answers()).isEmpty();
        assertThat(profiles.snapshot(b).answers().get("music").choices()).containsExactly("o02");
        assertThatThrownBy(()->profiles.forget(a,"music",0)).isInstanceOf(AnswerVersions.Conflict.class);
    }
    @Test void answerAndRevisionRollBackTogetherOnDatabaseFailure() {
        db.execute("ALTER TABLE answer ADD CONSTRAINT test_reject_music CHECK (question_id <> 'music')");
        try {
            assertThatThrownBy(()->profiles.answer(a,"music",new Catalog.Answer(1,"ANSWERED",List.of("o01"),false),0)).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
            assertThat(profiles.snapshot(a).revision()).isEqualTo("0");assertThat(profiles.snapshot(a).answers()).isEmpty();
        } finally {db.execute("ALTER TABLE answer DROP CONSTRAINT test_reject_music");}
    }
    @Test void httpAnswerPreconditionsFailClosedAndReadsReturnFreshEtags() throws Exception {
        String body="{\"version\":1,\"status\":\"ANSWERED\",\"choices\":[\"o01\"],\"sensitiveConsent\":false}";
        mvc.perform(put("/api/v1/me/answers/music").with(auth("alice")).contentType("application/json").content(body))
            .andExpect(status().is(428)).andExpect(jsonPath("$.code").value("ANSWER_PRECONDITION_REQUIRED"));
        mvc.perform(delete("/api/v1/me/answers/music").with(auth("alice"))).andExpect(status().is(428));
        for(String invalid:List.of("*","W/\"answers-0\"","\"answers--1\"","0"))
            mvc.perform(delete("/api/v1/me/answers/music").with(auth("alice")).header("If-Match",invalid)).andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/me/answers").with(auth("alice"))).andExpect(header().string("ETag","\"answers-0\"")).andExpect(jsonPath("$.revision").value("0"));
        mvc.perform(put("/api/v1/me/answers/music").with(auth("alice")).header("If-Match","\"answers-0\"").contentType("application/json").content(body))
            .andExpect(status().isOk()).andExpect(header().string("ETag","\"answers-1\"")).andExpect(jsonPath("$.revision").value("1"));
        mvc.perform(delete("/api/v1/me/answers/music").with(auth("alice")).header("If-Match","\"answers-0\""))
            .andExpect(status().is(412)).andExpect(header().string("ETag","\"answers-1\"")).andExpect(jsonPath("$.currentRevision").value("1"))
            .andExpect(jsonPath("$.action").value("RELOAD_AND_REVIEW")).andExpect(header().string("Cache-Control","no-store"));
        mvc.perform(get("/api/v1/me/answers").with(auth("alice"))).andExpect(header().string("ETag","\"answers-1\"")).andExpect(jsonPath("$.answers.music.choices[0]").value("o01"));
    }
    @Test void snapshotWaitsForMutationCommitAndNeverMixesRevisionAndAnswers() throws Exception {
        var changed=new CountDownLatch(1);var commit=new CountDownLatch(1);var reading=new CountDownLatch(1);
        try(var pool=Executors.newFixedThreadPool(2)) {
            var writer=pool.submit(()->new org.springframework.transaction.support.TransactionTemplate(transactions).execute(status->{
                profiles.answer(a,"music",new Catalog.Answer(1,"ANSWERED",List.of("o02"),false),0);
                changed.countDown();
                try {if(!commit.await(5,TimeUnit.SECONDS))throw new AssertionError("Commit not released");}
                catch(InterruptedException ex){Thread.currentThread().interrupt();throw new RuntimeException(ex);}
                return null;
            }));
            try {
                assertThat(changed.await(5,TimeUnit.SECONDS)).isTrue();
                var reader=pool.submit(()->{reading.countDown();return profiles.snapshot(a);});
                assertThat(reading.await(5,TimeUnit.SECONDS)).isTrue();
                assertThatThrownBy(()->reader.get(100,TimeUnit.MILLISECONDS)).isInstanceOf(TimeoutException.class);
                commit.countDown();writer.get(5,TimeUnit.SECONDS);
                var snapshot=reader.get(5,TimeUnit.SECONDS);
                assertThat(snapshot.revision()).isEqualTo("1");assertThat(snapshot.answers().get("music").choices()).containsExactly("o02");
            } finally {commit.countDown();}
        }
    }
    @Test void mockIdentityCannotBecomeVerifiedOrPairable() throws Exception {
        mvc.perform(get("/api/v1/me/readiness").with(auth("alice"))).andExpect(jsonPath("$.canPair").value(false));
        assertThat(catalog.definition().questions()).hasSize(85);
    }
}
