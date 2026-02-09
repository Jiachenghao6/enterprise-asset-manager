package du.tum.student.enterpriseassetmanager.service;

import du.tum.student.enterpriseassetmanager.controller.auth.AuthenticationRequest;
import java.util.HashMap;
import java.util.Map;
import du.tum.student.enterpriseassetmanager.controller.auth.AuthenticationResponse;
import du.tum.student.enterpriseassetmanager.controller.auth.RegisterRequest;
import du.tum.student.enterpriseassetmanager.domain.Role;
import du.tum.student.enterpriseassetmanager.domain.User;
import du.tum.student.enterpriseassetmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service class for handling user authentication and registration.
 * <p>
 * This service interacts with {@link AuthenticationManager} and
 * {@link JwtService}
 * to authenticate users and generate JWT tokens.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class AuthenticationService {

        private final UserRepository repository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        /**
         * Registers a new user.
         * <p>
         * Creates a new user entity, encodes the password, saves to the database,
         * and generates an immediate JWT token for the user.
         * </p>
         *
         * @param request the registration request containing user details
         * @return an {@link AuthenticationResponse} containing the JWT token
         */
        public AuthenticationResponse register(RegisterRequest request) {
                // 1. Build User Object
                var user = User.builder()
                                .firstname(request.getFirstname())
                                .lastname(request.getLastname())
                                .username(request.getUsername())
                                .email(request.getEmail())
                                // Encrypt the password!
                                .password(passwordEncoder.encode(request.getPassword()))
                                // Default role to USER if not specified
                                .role(Role.USER)
                                .enabled(true)
                                .build();

                // 2. Save to database
                repository.save(user);

                // 3. Generate Token for immediate access
                Map<String, Object> extraClaims = new HashMap<>();
                extraClaims.put("role", user.getRole().name());

                var jwtToken = jwtService.generateToken(extraClaims, user);

                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .build();
        }

        /**
         * Authenticates a user.
         * <p>
         * Validates credentials using {@link AuthenticationManager}. If successful,
         * retrieves the user from the database and generates a JWT token.
         * </p>
         *
         * @param request the authentication request containing username and password
         * @return an {@link AuthenticationResponse} containing the JWT token
         */
        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                // 1. Validate credentials with Spring Security's AuthenticationManager
                // This throws an exception if authentication fails
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getUsername(),
                                                request.getPassword()));

                // 2. Fetch user details (Authentication passed at this point)
                var user = repository.findByUsername(request.getUsername())
                                .orElseThrow();

                Map<String, Object> extraClaims = new HashMap<>();
                extraClaims.put("role", user.getRole().name());

                // 3. Generate Token
                var jwtToken = jwtService.generateToken(extraClaims, user);

                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .build();
        }
}