package com.eleveneleven.api;

import java.util.List;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** Seeds upcoming San Diego dinners when the experience table is empty (prod + local). */
@Component
public class DinnerSeed implements ApplicationRunner {
    private static final List<LocalDevSeed.Slot> DINNERS = LocalDevSeed.DINNERS;

    private final JdbcTemplate db;

    public DinnerSeed(JdbcTemplate db) {
        this.db = db;
    }

    @Override
    public void run(ApplicationArguments args) {
        Integer count = db.queryForObject("SELECT COUNT(*) FROM experience", Integer.class);
        if (count != null && count > 0) return;
        for (LocalDevSeed.Slot slot : DINNERS) {
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
}
