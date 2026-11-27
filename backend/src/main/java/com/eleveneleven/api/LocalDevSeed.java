package com.eleveneleven.api;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** Seeds San Diego dinner experiences for local simulator wiring only. */
@Component
@Profile("local-dev")
public class LocalDevSeed implements ApplicationRunner {
    public record Slot(UUID id, String title, String neighborhood, OffsetDateTime starts, OffsetDateTime ends) {}

    /** Stable IDs the mobile mapper can document against. */
    public static final List<Slot> DINNERS = List.of(
            slot("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1", "Dinner in Gaslamp", "Gaslamp, San Diego", "2099-11-28T19:00:00-08:00", "2099-11-28T21:00:00-08:00"),
            slot("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2", "Dinner in Little Italy", "Little Italy, San Diego", "2099-11-29T18:30:00-08:00", "2099-11-29T20:30:00-08:00"),
            slot("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3", "Dinner in North Park", "North Park, San Diego", "2099-11-29T20:00:00-08:00", "2099-11-29T22:00:00-08:00"),
            slot("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4", "Dinner in La Jolla", "La Jolla, San Diego", "2099-11-30T17:30:00-08:00", "2099-11-30T19:30:00-08:00"),
            slot("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5", "Dinner in Hillcrest", "Hillcrest, San Diego", "2099-11-30T19:30:00-08:00", "2099-11-30T21:30:00-08:00"));

    private final JdbcTemplate db;

    public LocalDevSeed(JdbcTemplate db) {
        this.db = db;
    }

    @Override
    public void run(ApplicationArguments args) {
        for (Slot slot : DINNERS) {
            Integer exists = db.queryForObject("SELECT COUNT(*) FROM experience WHERE id=?", Integer.class, slot.id());
            if (exists != null && exists > 0) continue;
            db.update(
                    "INSERT INTO experience(id,title,city_code,starts_at,ends_at,interest_open,neighborhood,time_zone) VALUES (?,?,?,?,?,TRUE,?,?)",
                    slot.id(),
                    slot.title(),
                    "san-diego",
                    slot.starts(),
                    slot.ends(),
                    slot.neighborhood(),
                    "America/Los_Angeles");
        }
    }

    private static Slot slot(String id, String title, String neighborhood, String starts, String ends) {
        return new Slot(UUID.fromString(id), title, neighborhood, OffsetDateTime.parse(starts), OffsetDateTime.parse(ends));
    }
}
