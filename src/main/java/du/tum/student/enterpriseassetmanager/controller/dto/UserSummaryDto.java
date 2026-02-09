package du.tum.student.enterpriseassetmanager.controller.dto;

import du.tum.student.enterpriseassetmanager.domain.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for user summary information.
 * <p>
 * Used when listing users (e.g., in dropdowns) to expose only necessary fields
 * and avoid leaking sensitive data like password hashes.
 * </p>
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserSummaryDto {
    /**
     * Unique identifier of the user.
     */
    private long id;

    /**
     * Unique username.
     */
    private String username;

    /**
     * First name.
     */
    private String firstname;

    /**
     * Last name.
     */
    private String lastname;

    /**
     * Email address.
     */
    private String email;

    /**
     * User role (ADMIN or USER).
     */
    private Role role;

    /**
     * Whether the account is enabled.
     */
    private boolean enabled;
}