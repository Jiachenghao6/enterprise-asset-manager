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

/**
 * Security Configuration for the application.
 * <p>
 * This class configures the security filter chain, enabling JWT-based stateless
 * authentication
 * and defining access rules for various endpoints.
 * </p>
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity // Enables method-level security (e.g., @PreAuthorize)
public class SecurityConfiguration {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final AuthenticationProvider authenticationProvider;

        /**
         * Configures the security filter chain.
         *
         * @param http the {@link HttpSecurity} to modify
         * @return the configured {@link SecurityFilterChain}
         * @throws Exception if an error occurs while configuring security
         */
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                // 1. Disable CSRF (Cross-Site Request Forgery) protection as we are using
                                // stateless JWT authentication.
                                .csrf(AbstractHttpConfigurer::disable)

                                // 2. Configure request authorization rules.
                                .authorizeHttpRequests(auth -> auth
                                                // Permit access to "whitelist" endpoints (e.g., authentication, API
                                                // docs) without credentials.
                                                .requestMatchers("/api/v1/auth/**",
                                                                "/v3/api-docs",
                                                                "/v3/api-docs/**",
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html")
                                                .permitAll()
                                                // Require authentication for all other requests.
                                                .anyRequest().authenticated())

                                // 3. Configure Session Management to be Stateless.
                                // The server will not store any session state; every request must contain a
                                // valid JWT.
                                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // 4. Set the Authentication Provider.
                                .authenticationProvider(authenticationProvider)

                                // 5. Add the JWT Authentication Filter before the standard
                                // UsernamePasswordAuthenticationFilter.
                                // This ensures that the token is checked before attempting username/password
                                // authentication.
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}