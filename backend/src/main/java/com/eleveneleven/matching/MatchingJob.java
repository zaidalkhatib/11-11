package com.eleveneleven.matching;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** D-026: batch matcher (~hourly in production; local-dev uses a shorter interval). */
@Component
@EnableScheduling
@ConditionalOnProperty(name = "app.matching.enabled", havingValue = "true")
public class MatchingJob {
    private static final Logger log = LoggerFactory.getLogger(MatchingJob.class);
    private final MatchingAllocatorService allocator;

    public MatchingJob(MatchingAllocatorService allocator) {
        this.allocator = allocator;
    }

    @Scheduled(fixedDelayString = "${app.matching.interval-ms:3600000}", initialDelayString = "${app.matching.interval-ms:3600000}")
    public void tick() {
        var summary = allocator.runOnce();
        log.info(
                "matching run events={} pairs={} candidates={}",
                summary.eventsScanned(),
                summary.pairsCreated(),
                summary.candidatesConsidered());
    }
}
