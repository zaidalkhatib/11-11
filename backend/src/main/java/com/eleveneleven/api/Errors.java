package com.eleveneleven.api;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
@RestControllerAdvice
public class Errors {
    @ExceptionHandler(AnswerVersions.Conflict.class)
    ResponseEntity<?> answerConflict(AnswerVersions.Conflict ex) {
        return ResponseEntity.status(412).eTag(AnswerVersions.etag(ex.currentRevision))
            .body(Map.of("code",ex.code,"currentRevision",ex.currentRevision,"action","RELOAD_AND_REVIEW"));
    }
    @ExceptionHandler(ApiException.class)
    ResponseEntity<?> domain(ApiException ex) { return ResponseEntity.status(ex.status).body(Map.of("code",ex.code)); }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<?> conflict() { return ResponseEntity.status(409).body(Map.of("code","CONFLICT_RELOAD_AND_RETRY")); }
    @ExceptionHandler({MethodArgumentNotValidException.class,HttpMessageNotReadableException.class,IllegalArgumentException.class})
    ResponseEntity<?> invalid() { return ResponseEntity.badRequest().body(Map.of("code","INVALID_REQUEST")); }
}
