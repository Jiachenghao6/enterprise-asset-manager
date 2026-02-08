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

@Service
@RequiredArgsConstructor
public class AuthenticationService {

        private final UserRepository repository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        // 🟢 注册逻辑
        public AuthenticationResponse register(RegisterRequest request) {
                // 1. 构建 User 对象
                var user = User.builder()
                                .firstname(request.getFirstname())
                                .lastname(request.getLastname())
                                .username(request.getUsername())
                                .email(request.getEmail())
                                // ⚠️ 必须加密密码！
                                .password(passwordEncoder.encode(request.getPassword()))
                                // 如果请求没传角色，默认给 USER
                                .role(Role.USER)
                                .build();

                // 2. 保存到数据库
                repository.save(user);

                // 3. 既然注册成功了，直接发个 Token 给他，让他免登录直接用
                Map<String, Object> extraClaims = new HashMap<>();
                extraClaims.put("role", user.getRole().name());

                var jwtToken = jwtService.generateToken(extraClaims, user);

                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .build();
        }

        // 🔵 登录逻辑
        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                // 1. 调用 Spring Security 的 AuthenticationManager 进行验证
                // 这一步会自动校验用户名是否存在、密码是否匹配（利用了我们之前配的 DaoAuthenticationProvider）
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getUsername(),
                                                request.getPassword()));

                // 2. 如果代码走到这里，说明验证通过了（否则上面会抛异常）
                // 我们从数据库把用户取出来（为了拿 Role 信息放入 Token）
                var user = repository.findByUsername(request.getUsername())
                                .orElseThrow();

                Map<String, Object> extraClaims = new HashMap<>();
                extraClaims.put("role", user.getRole().name());

                // 3. 生成 Token
                var jwtToken = jwtService.generateToken(extraClaims, user);

                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .build();
        }
}