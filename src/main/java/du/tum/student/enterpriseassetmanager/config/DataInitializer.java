package du.tum.student.enterpriseassetmanager.config;

import du.tum.student.enterpriseassetmanager.domain.Role;
import du.tum.student.enterpriseassetmanager.domain.User;
import du.tum.student.enterpriseassetmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 检查是否已经有 Admin 用户，如果没有，创建一个默认的
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setFirstname("Admin"); // ✅ 添加这行
            admin.setLastname("User");
            admin.setUsername("admin");
            admin.setEmail("admin@example.com"); // 必须设置邮箱，否则违反非空约束
            admin.setPassword(passwordEncoder.encode("admin123")); // 默认密码
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);
            System.out.println("✅ Default Admin created: username=admin, password=admin123");
        }
    }
}