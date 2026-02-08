package du.tum.student.enterpriseassetmanager.service;

import du.tum.student.enterpriseassetmanager.controller.dto.UserSummaryDto;
import du.tum.student.enterpriseassetmanager.domain.User;
import du.tum.student.enterpriseassetmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    /**
     * 获取所有用户列表，并转换为安全的 DTO
     */
    public List<UserSummaryDto> findAllUsers() {
        List<User> users = userRepository.findAll();

        return users.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private UserSummaryDto mapToDto(User user) {
        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .build();
    }

    /**
     * [新增] 更新用户启用状态
     * 
     * @param userId  目标用户ID
     * @param enabled 是否启用
     * @return 更新后的用户DTO
     */
    public UserSummaryDto updateUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setEnabled(enabled);
        User savedUser = userRepository.save(user);

        // 返回更新后的 DTO
        return UserSummaryDto.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .firstname(savedUser.getFirstname())
                .lastname(savedUser.getLastname())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .enabled(savedUser.isEnabled())
                .build();
    }
}