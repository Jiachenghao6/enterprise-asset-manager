package du.tum.student.enterpriseassetmanager.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Data Transfer Object for dashboard statistics.
 * <p>
 * Provides a high-level overview of the system's assets and value.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    /**
     * Total number of assets recorded in the system.
     */
    private long totalAssets;

    /**
     * Total monetary value of all assets (based on purchase price).
     */
    private BigDecimal totalValue;

    /**
     * Number of active software licenses (not expired and not disposed).
     */
    private long activeLicenses;

    /**
     * Number of assets currently available for assignment.
     */
    private long availableAssets;
}
