package du.tum.student.enterpriseassetmanager.controller.dto;

import du.tum.student.enterpriseassetmanager.domain.AssetStatus;
import lombok.Data;

/**
 * DTO for passing asset search criteria.
 * <p>
 * Supports both fuzzy search (query) and exact filtering (status, etc.).
 * </p>
 */
@Data
public class AssetSearchCriteria {
    /**
     * Search term for fuzzy matching against name, serial number, license key, etc.
     */
    private String query;

    /**
     * Filter by asset status (e.g., AVAILABLE, ASSIGNED).
     */
    private AssetStatus status;

    /**
     * Filter by exact hardware serial number.
     */
    private String serialNumber;

    /**
     * Filter by the ID of the assigned user.
     */
    private Long assignedToUserId;
}