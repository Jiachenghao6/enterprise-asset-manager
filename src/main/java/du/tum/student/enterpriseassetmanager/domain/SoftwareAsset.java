package du.tum.student.enterpriseassetmanager.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.math.BigDecimal;

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

    public SoftwareAsset(String name, BigDecimal purchasePrice, LocalDate purchaseDate, AssetStatus status,
            BigDecimal residualValue, Integer usefulLifeYears, // 新增参数
            String licenseKey, LocalDate expiryDate) {

        // 调用更新后的父类构造函数
        super(name, purchasePrice, purchaseDate, status, residualValue, usefulLifeYears);

        this.licenseKey = licenseKey;
        this.expiryDate = expiryDate;
    }
}
