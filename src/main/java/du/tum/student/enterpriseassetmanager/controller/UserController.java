package du.tum.student.enterpriseassetmanager.controller;

import du.tum.student.enterpriseassetmanager.controller.dto.UserSummaryDto;
import du.tum.student.enterpriseassetmanager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 允许前端跨域访问
public class UserController {

    private final UserService userService;

    /**
     * GET /api/v1/users
     * 获取用户简要列表，用于下拉框选择
     */
    @GetMapping
    public ResponseEntity<List<UserSummaryDto>> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }
}