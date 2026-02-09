package du.tum.student.enterpriseassetmanager.domain;

/**
 * Enumeration representing the possible states of an asset.
 */
public enum AssetStatus {
    /**
     * Asset is available for assignment.
     */
    AVAILABLE,

    /**
     * Asset is currently assigned to a user.
     */
    ASSIGNED,

    /**
     * Asset is broken and needs attention.
     */
    BROKEN,

    /**
     * Asset is currently under repair.
     */
    REPAIRING,

    /**
     * Asset has been disposed of or written off.
     */
    DISPOSED,
}
