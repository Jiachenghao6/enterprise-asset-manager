package du.tum.student.enterpriseassetmanager.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entity representing a physical hardware asset.
 * <p>
 * Extends {@link Asset} to include hardware-specific fields like
 * serial number, warranty date, and maintenance info.
 * </p>
 */
@Entity
@Table(name = "hardware_asset")
@Getter
@Setter
@NoArgsConstructor
public class HardwareAsset extends Asset {

    @Column(nullable = false, unique = true)
    private String serialNumber;

    @Column(name = "warranty_end_date")
    private LocalDate warrantyDate;

    @Column(nullable = false)
    private String location;

    @Column
    private LocalDate lastMaintenanceDate;

    @Column
    @Min(value = 1, message = "Maintenance interval must be at least 1 month")
    private Integer maintenanceIntervalMonths;

    /**
     * Constructs a new HardwareAsset.
     *
     * @param name                      Name of the asset
     * @param purchasePrice             Purchase price
     * @param purchaseDate              Date of purchase
     * @param status                    Current status
     * @param residualValue             Residual value
     * @param usefulLifeYears           Useful life in years
     * @param serialNumber              Unique serial number
     * @param location                  Physical location
     * @param lastMaintenanceDate       Date of last maintenance
     * @param maintenanceIntervalMonths Interval for maintenance in months
     */
    public HardwareAsset(String name, BigDecimal purchasePrice, LocalDate purchaseDate,
            AssetStatus status, BigDecimal residualValue, Integer usefulLifeYears,
            String serialNumber, String location,
            LocalDate lastMaintenanceDate, Integer maintenanceIntervalMonths) {

        // 1. Call parent constructor
        super(name, purchasePrice, purchaseDate, status, residualValue, usefulLifeYears);

        // 2. Set subclass fields
        this.serialNumber = serialNumber;
        this.location = location;
        this.lastMaintenanceDate = lastMaintenanceDate;
        this.maintenanceIntervalMonths = maintenanceIntervalMonths;
    }
}
