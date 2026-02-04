package du.tum.student.enterpriseassetmanager.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
// 开启方法级别的权限控制 (比如 @PreAuthorize)
@EnableMethodSecurity
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. 关闭 CSRF (因为我们要用 JWT 做无状态认证，不需要防范 CSRF 攻击)
                .csrf(AbstractHttpConfigurer::disable)

                // 2. 配置请求拦截规则
                .authorizeHttpRequests(auth -> auth
                        // 允许 "白名单" 访问 (例如登录、注册接口，虽然我们还没写，但先预留好)
                        .requestMatchers("/api/v1/auth/**",
                                "/v3/api-docs",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html").permitAll()
                        // 其他任何请求，都必须通过认证 (Authenticate)
                        .anyRequest().authenticated()
                )

                // 3. 配置 Session 管理策略 -> 无状态 (Stateless)
                // 这意味着服务器不会在内存里存 Session，每次请求都得带 Token。
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. 指定认证提供者
                .authenticationProvider(authenticationProvider)

                // 5. 【关键】把我们的 JWT 过滤器插到 Spring 默认的 UsernamePassword 过滤器之前
                // 这样请求一来，先检查有没有 JWT，有就直接放行，没有再走后面的逻辑。
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}