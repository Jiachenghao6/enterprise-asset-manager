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

/**
 * REST Controller for managing Users.
 * <p>
 * Provides endpoints for retrieving user information.
 * </p>
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow Cross-Origin Resource Sharing
public class UserController {

    private final UserService userService;

    /**
     * Retrieves a summary list of all users.
     * <p>
     * Typically used for populating dropdowns or selection lists in the frontend.
     * </p>
     *
     * @return a {@link ResponseEntity} containing a list of {@link UserSummaryDto}
     */
    @GetMapping
    public ResponseEntity<List<UserSummaryDto>> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }
}