package com.eleveneleven;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Railway injects {@code DATABASE_URL} as {@code postgres://user:pass@host:port/db}.
 * Spring JDBC needs {@code jdbc:postgresql://...}. Convert early so Flyway/DataSource boot.
 */
public class RailwayDatasourceEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

  @Override
  public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
    String raw = firstNonBlank(
        environment.getProperty("DATABASE_URL"),
        environment.getProperty("spring.datasource.url"));
    if (raw == null || raw.contains("HOST:PORT")) return;
    if (!(raw.startsWith("postgres://") || raw.startsWith("postgresql://"))) return;

    try {
      URI uri = URI.create(raw.replaceFirst("^postgres://", "postgresql://"));
      String userInfo = uri.getUserInfo();
      String user = null;
      String password = null;
      if (userInfo != null) {
        int split = userInfo.indexOf(':');
        if (split >= 0) {
          user = userInfo.substring(0, split);
          password = userInfo.substring(split + 1);
        } else {
          user = userInfo;
        }
      }
      String path = uri.getPath() == null || uri.getPath().isBlank() ? "/railway" : uri.getPath();
      String jdbc = "jdbc:postgresql://" + uri.getHost()
          + (uri.getPort() > 0 ? ":" + uri.getPort() : "")
          + path
          + (uri.getQuery() != null ? "?" + uri.getQuery() : "");

      Map<String, Object> props = new HashMap<>();
      props.put("spring.datasource.url", jdbc);
      if (user != null && !user.isBlank()) props.put("spring.datasource.username", user);
      if (password != null) props.put("spring.datasource.password", password);
      environment.getPropertySources().addFirst(new MapPropertySource("railwayDatasource", props));
    } catch (IllegalArgumentException ignored) {
      // Leave defaults; startup failure will surface the bad URL.
    }
  }

  private static String firstNonBlank(String... values) {
    if (values == null) return null;
    for (String value : values) {
      if (value != null && !value.isBlank()) return value.trim();
    }
    return null;
  }

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE + 10;
  }
}
