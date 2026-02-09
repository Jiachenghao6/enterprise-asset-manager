package du.tum.student.enterpriseassetmanager.config;

import du.tum.student.enterpriseassetmanager.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter that intercepts every request to validate the JWT token.
 * <p>
 * This filter extracts the JWT from the "Authorization" header, validates it,
 * and sets the authentication in the {@link SecurityContextHolder} if the token
 * is valid.
 * </p>
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Performs the filtering logic.
     *
     * @param request     the incoming HTTP request
     * @param response    the outgoing HTTP response
     * @param filterChain the filter chain execution
     * @throws ServletException if a servlet error occurs
     * @throws IOException      if an I/O error occurs
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // 1. Extract the Authorization header
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 2. If no token is provided or it doesn't start with "Bearer ", proceed
        // without setting authentication.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract the actual token
        jwt = authHeader.substring(7);
        userEmail = jwtService.extractUsername(jwt);

        // 4. If the token contains a username and the user is not yet authenticated in
        // the context
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Load user details from the database (this includes the current 'enabled'
            // status)
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 5. Validate the token against the user details
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // ============================================================
                // [Security Check] Phase 3.1: Real-time Account Status Verification
                // ============================================================
                if (!userDetails.isEnabled()) {
                    // If the user account is disabled, return a 403 Forbidden response immediately.
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"User account is disabled\"}");
                    return; // CRITICAL: Stop the filter chain execution here.
                }
                // ============================================================

                // 6. Create an Authentication token
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                // 7. Set the authentication in the context
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 8. Proceed with the filter chain
        filterChain.doFilter(request, response);
    }
}