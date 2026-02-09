package du.tum.student.enterpriseassetmanager.service;

import du.tum.student.enterpriseassetmanager.controller.dto.UserSummaryDto;
import du.tum.student.enterpriseassetmanager.domain.User;
import du.tum.student.enterpriseassetmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for managing Users.
 * <p>
 * Handles business logic related to user retrieval and status updates.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    /**
     * Retrieves all users from the database and maps them to summary DTOs.
     * <p>
     * This ensures sensitive information (like passwords) is not exposed.
     * </p>
     *
     * @return a list of {@link UserSummaryDto}
     */
    public List<UserSummaryDto> findAllUsers() {
        List<User> users = userRepository.findAll();

        return users.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Maps a User entity to a UserSummaryDto.
     *
     * @param user the user entity
     * @return the summary DTO
     */
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
     * Updates the enabled status of a user.
     *
     * @param userId  the ID of the target user
     * @param enabled the new enabled status (true = active, false = disabled)
     * @return the updated {@link UserSummaryDto}
     * @throws RuntimeException if the user with the given ID is not found
     */
    public UserSummaryDto updateUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setEnabled(enabled);
        User savedUser = userRepository.save(user);

        // Return updated DTO
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