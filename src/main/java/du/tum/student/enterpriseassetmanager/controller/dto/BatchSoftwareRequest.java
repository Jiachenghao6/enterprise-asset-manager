package du.tum.student.enterpriseassetmanager.controller.dto;

import du.tum.student.enterpriseassetmanager.domain.AssetStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for batch creation of software assets.
 * <p>
 * Used for volume licensing where multiple asset records share the same license
 * key.
 * </p>
 */
@Data
public class BatchSoftwareRequest {
    // --- Common Properties ---

    /**
     * Name of the software (e.g., "JetBrains IntelliJ IDEA").
     */
    private String name;

    /**
     * Purchase price per license.
     */
    private BigDecimal purchasePrice;

    /**
     * Date of purchase.
     */
    private LocalDate purchaseDate;

    /**
     * Initial status of the licenses (usually AVAILABLE).
     */
    private AssetStatus status;

    /**
     * Estimated residual value (often 0 for software).
     */
    private BigDecimal residualValue;

    /**
     * Useful life in years (for amortization).
     */
    private Integer usefulLifeYears;

    // --- Software Specific ---

    /**
     * The shared license key for this batch.
     */
    private String licenseKey;

    /**
     * License expiration date.
     */
    private LocalDate expiryDate;

    // --- Batch Parameters ---

    /**
     * Number of licenses to create.
     */
    private Integer quantity;
}