package com.eleveneleven.identity;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import org.springframework.security.oauth2.jwt.Jwt;
public final class Owners {
    private Owners() {}
    public static String id(Jwt jwt) {
        if (jwt == null || jwt.getIssuer()==null || jwt.getSubject()==null || jwt.getSubject().isBlank())
            throw new com.eleveneleven.api.ApiException(401,"INVALID_IDENTITY");
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(
                (jwt.getIssuer()+"\n"+jwt.getSubject()).getBytes(StandardCharsets.UTF_8))); }
        catch (java.security.NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
    }
}
