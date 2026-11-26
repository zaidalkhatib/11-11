package com.eleveneleven.identity;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.web.filter.OncePerRequestFilter;

/** Bounded synchronous JSON input, including requests without Content-Length.
 * This is not a rate limiter, proxy limit, or protection against slow connections. */
public final class JsonBodyLimitFilter extends OncePerRequestFilter {
    public static final int MAX_BYTES = 32 * 1024;
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (!request.getRequestURI().startsWith(request.getContextPath() + "/api/v1/")
                || !Set.of("PUT", "POST", "PATCH").contains(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }
        String encoding = request.getHeader("Content-Encoding");
        if (encoding != null && !encoding.equalsIgnoreCase("identity")) {
            reject(response, 415, "CONTENT_ENCODING_UNSUPPORTED");
            return;
        }
        if (request.getContentLengthLong() > MAX_BYTES) {
            reject(response, 413, "REQUEST_TOO_LARGE");
            return;
        }
        byte[] body = request.getInputStream().readNBytes(MAX_BYTES + 1);
        if (body.length > MAX_BYTES) {
            reject(response, 413, "REQUEST_TOO_LARGE");
            return;
        }
        chain.doFilter(new HttpServletRequestWrapper(request) {
            @Override public int getContentLength() { return body.length; }
            @Override public long getContentLengthLong() { return body.length; }
            @Override public ServletInputStream getInputStream() {
                var input = new ByteArrayInputStream(body);
                return new ServletInputStream() {
                    @Override public int read() { return input.read(); }
                    @Override public int read(byte[] bytes, int offset, int length) { return input.read(bytes, offset, length); }
                    @Override public boolean isFinished() { return input.available() == 0; }
                    @Override public boolean isReady() { return true; }
                    @Override public void setReadListener(ReadListener listener) {
                        throw new UnsupportedOperationException("Synchronous JSON API only");
                    }
                };
            }
            @Override public BufferedReader getReader() {
                return new BufferedReader(new InputStreamReader(getInputStream(), StandardCharsets.UTF_8));
            }
        }, response);
    }
    private static void reject(HttpServletResponse response, int status, String code) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"code\":\"" + code + "\"}");
    }
}
