package du.tum.student.enterpriseassetmanager.config;

import du.tum.student.enterpriseassetmanager.domain.Role;
import du.tum.student.enterpriseassetmanager.domain.User;
import du.tum.student.enterpriseassetmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initializes the database with default data on application startup.
 * <p>
 * This class ensures that critical initial data (such as the default Admin
 * user)
 * exists before the application starts serving requests.
 * </p>
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Executed after the application context is loaded.
     * Checks for the existence of an Admin user and creates one if missing.
     *
     * @param args command line arguments
     * @throws Exception if an error occurs during data initialization
     */
    @Override
    public void run(String... args) throws Exception {
        // Check if the Admin user already exists; if not, create a default one.
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setFirstname("Admin");
            admin.setLastname("User");
            admin.setUsername("admin");
            admin.setEmail("admin@example.com"); // Email is required by constraints
            admin.setPassword(passwordEncoder.encode("admin123")); // Default password
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);
            System.out.println("✅ Default Admin created: username=admin, password=admin123");
        }
    }
}