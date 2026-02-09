package du.tum.student.enterpriseassetmanager.controller.dto;

import du.tum.student.enterpriseassetmanager.domain.AssetStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for batch creation of hardware assets.
 * <p>
 * Contains common properties for all assets in the batch,
 * plus batch-specific parameters like quantity and serial number prefix.
 * </p>
 */
@Data
public class BatchHardwareRequest {
    // --- Common Properties ---

    /**
     * Name of the hardware model (e.g., "Dell Latitude 5520").
     */
    private String name;

    /**
     * Purchase price per unit.
     */
    private BigDecimal purchasePrice;

    /**
     * Date of purchase.
     */
    private LocalDate purchaseDate;

    /**
     * Initial status of the assets (usually AVAILABLE).
     */
    private AssetStatus status;

    /**
     * Estimated residual value at the end of useful life.
     */
    private BigDecimal residualValue;

    /**
     * Expected useful life in years.
     */
    private Integer usefulLifeYears;

    // --- Hardware Specific ---

    /**
     * Physical location (e.g., "Office A").
     */
    private String location;

    /**
     * Warranty expiration date.
     */
    private LocalDate warrantyDate;

    // --- Batch Parameters ---

    /**
     * Prefix for generating unique serial numbers (e.g., "DELL-MON-").
     * <p>
     * The system will append a sequence number to this prefix.
     * </p>
     */
    private String serialNumberPrefix;

    /**
     * Number of assets to create.
     */
    private Integer quantity;
}