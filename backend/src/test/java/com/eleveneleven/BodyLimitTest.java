package com.eleveneleven;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.*;
import static org.assertj.core.api.Assertions.*;
import com.eleveneleven.identity.JsonBodyLimitFilter;
class BodyLimitTest {
    @Test void exactLimitPassesAndUnknownLengthCannotBypassLimit() throws Exception {
        for(int size:new int[]{JsonBodyLimitFilter.MAX_BYTES,JsonBodyLimitFilter.MAX_BYTES+1}) {
            var request=new MockHttpServletRequest("PUT","/api/v1/me/profile") {
                @Override public int getContentLength(){return -1;}
                @Override public long getContentLengthLong(){return -1;}
            };
            request.setContent(new byte[size]);var response=new MockHttpServletResponse();
            boolean[] called={false};
            new JsonBodyLimitFilter().doFilter(request,response,(req,res)->{
                called[0]=true;
                assertThat(((HttpServletRequest)req).getInputStream().readAllBytes()).hasSize(size);
            });
            assertThat(called[0]).isEqualTo(size==JsonBodyLimitFilter.MAX_BYTES);
            if(size>JsonBodyLimitFilter.MAX_BYTES) assertThat(response.getStatus()).isEqualTo(413);
        }
    }
    @Test void declaredOversizeAndCompressedInputsAreRejectedBeforeController() throws Exception {
        var request=new MockHttpServletRequest("POST","/api/v1/me/profile");
        request.setContent(new byte[JsonBodyLimitFilter.MAX_BYTES+1]);
        var response=new MockHttpServletResponse();
        new JsonBodyLimitFilter().doFilter(request,response,(req,res)->{throw new AssertionError("Controller called");});
        assertThat(response.getStatus()).isEqualTo(413);
        request.setContent(new byte[1]);request.addHeader("Content-Encoding","gzip");response=new MockHttpServletResponse();
        new JsonBodyLimitFilter().doFilter(request,response,(req,res)->{throw new AssertionError("Controller called");});
        assertThat(response.getStatus()).isEqualTo(415);
    }
}
