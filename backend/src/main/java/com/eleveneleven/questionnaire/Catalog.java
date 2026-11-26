package com.eleveneleven.questionnaire;

import java.util.*;
import org.springframework.stereotype.Component;
import org.springframework.core.io.ClassPathResource;
import tools.jackson.databind.json.JsonMapper;
import com.eleveneleven.api.ApiException;

@Component
public class Catalog {
    public record Option(String id, String label, boolean declined, boolean exclusive) {}
    public record Question(String id, int version, String title, String kind, String target,
                           boolean sensitive, String scoring, int maximum, List<Option> options, Boolean optional) {}
    public record Definition(String version, String revision, List<Question> questions) {}
    public record Answer(int version, String status, List<String> choices, boolean sensitiveConsent) {}
    private final Definition definition;
    public Catalog() throws Exception {
        var base = read("questionnaire-v1.json");
        var additions = read("questionnaire-v1.1-additions.json");
        if (!base.version().equals(additions.version())) throw new IllegalStateException("Incompatible catalog extension");
        var questions = new ArrayList<>(base.questions());
        questions.addAll(additions.questions());
        var ids = new HashSet<String>();
        for (var question : questions) {
            if (!ids.add(question.id())) throw new IllegalStateException("Catalog extensions cannot replace existing questions");
            if (question.version() < 1 || question.maximum() < 1 || question.options().isEmpty()
                    || question.options().stream().map(Option::id).distinct().count() != question.options().size()
                    || question.options().stream().map(Option::label).distinct().count() != question.options().size())
                throw new IllegalStateException("Invalid question definition");
        }
        if (additions.questions().stream().anyMatch(q -> !q.scoring().equals("INACTIVE")))
            throw new IllegalStateException("New questionnaire items must remain unscored");
        definition = new Definition(base.version(), additions.revision(), List.copyOf(questions));
    }
    private static Definition read(String path) throws Exception {
        try (var stream = new ClassPathResource(path).getInputStream()) {
            return JsonMapper.builder().build().readValue(stream, Definition.class);
        }
    }
    public Definition definition() { return definition; }
    public Question question(String id) {
        return definition.questions().stream().filter(q -> q.id().equals(id)).findFirst()
                .orElseThrow(() -> new ApiException(400,"UNKNOWN_QUESTION"));
    }
    public void validate(String id, Answer answer) {
        var q = question(id);
        if (answer == null || answer.version() != q.version() || answer.choices() == null
                || !Set.of("ANSWERED","DECLINED").contains(answer.status() == null ? "" : answer.status()))
            throw new ApiException(400,"INVALID_ANSWER");
        var values = answer.choices();
        if (answer.status().equals("DECLINED")) {
            if (!values.isEmpty()) throw new ApiException(400,"DECLINED_HAS_CHOICES");
            return;
        }
        if (q.scoring().equals("EXCLUDED")) throw new ApiException(400,"COLLECTION_DISABLED");
        if (q.sensitive() && !answer.sensitiveConsent()) throw new ApiException(400,"CONSENT_REQUIRED");
        if (values.isEmpty() || values.size()>q.maximum() || new HashSet<>(values).size()!=values.size())
            throw new ApiException(400,"INVALID_SELECTION_COUNT");
        for (String value : values) {
            var option=q.options().stream().filter(o -> o.id().equals(value)).findFirst()
                    .orElseThrow(() -> new ApiException(400,"UNKNOWN_OPTION"));
            if (option.declined()) throw new ApiException(400,"USE_DECLINED_STATUS");
            if (option.exclusive() && values.size()!=1) throw new ApiException(400,"EXCLUSIVE_OPTION");
        }
    }
}
