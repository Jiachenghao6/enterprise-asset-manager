package du.tum.student.enterpriseassetmanager.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

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

    public HardwareAsset(String name, BigDecimal purchasePrice, LocalDate purchaseDate, AssetStatus status,
                         String serialNumber, LocalDate warrantyDate) {
        super(name, purchasePrice, purchaseDate, status);
        this.serialNumber = serialNumber;
        this.warrantyDate = warrantyDate;
    }
}
