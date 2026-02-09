package du.tum.student.enterpriseassetmanager.domain;

/**
 * Enumeration of user roles within the system.
 */
public enum Role {
    /**
     * Standard user with read-only permissions for most resources.
     */
    USER,

    /**
     * Administrator with full CRUD permissions.
     */
    ADMIN
}
