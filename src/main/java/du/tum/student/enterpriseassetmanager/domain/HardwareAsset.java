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

    public HardwareAsset(String name, BigDecimal purchasePrice, LocalDate purchaseDate,
                         AssetStatus status, BigDecimal residualValue, Integer usefulLifeYears,
                         String serialNumber, String location,
                         LocalDate lastMaintenanceDate, Integer maintenanceIntervalMonths) {

        // 1. 调用父类构造函数 (super)
        super(name, purchasePrice, purchaseDate, status, residualValue, usefulLifeYears);

        // 2. 赋值子类字段
        this.serialNumber = serialNumber;
        this.location = location;
        this.lastMaintenanceDate = lastMaintenanceDate;
        this.maintenanceIntervalMonths = maintenanceIntervalMonths;
    }
}
