package com.eleveneleven.api;
public final class AnswerVersions {
    private AnswerVersions() {}
    public static String etag(String revision) { return "\"answers-" + revision + "\""; }
    public static long require(String header) {
        if (header == null) throw new ApiException(428,"ANSWER_PRECONDITION_REQUIRED");
        if (!header.matches("\"answers-(0|[1-9][0-9]{0,18})\"")) throw new ApiException(400,"INVALID_ANSWER_PRECONDITION");
        try { return Long.parseLong(header.substring(9,header.length()-1)); }
        catch (NumberFormatException ex) { throw new ApiException(400,"INVALID_ANSWER_PRECONDITION"); }
    }
    public static class Conflict extends ApiException {
        public final String currentRevision;
        public Conflict(long revision) { super(412,"ANSWERS_CHANGED_RELOAD_AND_REVIEW"); currentRevision=Long.toString(revision); }
    }
}
