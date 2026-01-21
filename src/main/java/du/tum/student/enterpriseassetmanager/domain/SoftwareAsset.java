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
    @Column(nullable = false, unique = true)
    private String licenseKey;


    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    public SoftwareAsset(String name, BigDecimal purchasePrice, LocalDate purchaseDate, AssetStatus status,
                         String licenseKey, LocalDate expiryDate) {
        super(name, purchasePrice, purchaseDate, status);
        this.licenseKey = licenseKey;
        this.expiryDate = expiryDate;
    }
}
