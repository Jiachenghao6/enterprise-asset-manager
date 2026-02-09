package du.tum.student.enterpriseassetmanager.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.math.BigDecimal;

/**
 * Entity representing a software license asset.
 * <p>
 * Extends {@link Asset} to include software-specific fields like
 * license key and expiration date.
 * </p>
 */
@Entity
@Table(name = "software_asset")
@Getter
@Setter
@NoArgsConstructor
public class SoftwareAsset extends Asset {

    @Column(nullable = false)
    private String licenseKey;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    /**
     * Constructs a new SoftwareAsset.
     *
     * @param name            Name of the software
     * @param purchasePrice   Purchase price
     * @param purchaseDate    Date of purchase
     * @param status          Current status
     * @param residualValue   Residual value
     * @param usefulLifeYears Useful life in years
     * @param licenseKey      Software license key
     * @param expiryDate      License expiration date
     */
    public SoftwareAsset(String name, BigDecimal purchasePrice, LocalDate purchaseDate, AssetStatus status,
            BigDecimal residualValue, Integer usefulLifeYears,
            String licenseKey, LocalDate expiryDate) {

        // Call parent constructor
        super(name, purchasePrice, purchaseDate, status, residualValue, usefulLifeYears);

        this.licenseKey = licenseKey;
        this.expiryDate = expiryDate;
    }
}
