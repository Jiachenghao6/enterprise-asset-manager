package du.tum.student.enterpriseassetmanager.controller.auth;

import du.tum.student.enterpriseassetmanager.domain.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String firstname;
    private String lastname;
    private String username;
    private String email;
    private String password;
    private Role role; // 允许我们在注册时指定是 USER 还是 ADMIN
}