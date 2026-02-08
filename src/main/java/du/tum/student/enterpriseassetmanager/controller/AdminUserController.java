package du.tum.student.enterpriseassetmanager.controller;

import du.tum.student.enterpriseassetmanager.controller.dto.UserSummaryDto;
import du.tum.student.enterpriseassetmanager.domain.Role;
import du.tum.student.enterpriseassetmanager.domain.User;
import du.tum.student.enterpriseassetmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import du.tum.student.enterpriseassetmanager.service.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')") // [核心]：整个类的所有接口都需要 ADMIN 权限
public class AdminUserController {

    private final UserRepository userRepository;
    private final UserService userService;

    /**
     * 获取所有用户完整信息 (包含 Role, Email 等)
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsersFull() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    /**
     * 修改用户角色 (提拔/降级)
     * Body: { "role": "ADMIN" }
     */
    @PutMapping("/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newRoleStr = payload.get("role");
        if (newRoleStr != null) {
            user.setRole(Role.valueOf(newRoleStr)); // 假设前端传的是 "ADMIN" 或 "USER"
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    // 可以在这里扩展：禁用用户、重置密码等
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled,
            @AuthenticationPrincipal User currentUser // 获取当前登录的操作员
    ) {
        // [核心保护] 禁止管理员禁用自己
        // 如果目标ID等于当前用户ID，且试图设为 false，则拒绝
        if (currentUser.getId() == id && !enabled) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT) // 使用 409 Conflict 状态码
                    .body("You cannot disable your own account.");
        }

        UserSummaryDto updatedUser = userService.updateUserStatus(id, enabled);
        return ResponseEntity.ok(updatedUser);
    }
}