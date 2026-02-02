package du.tum.student.enterpriseassetmanager.domain;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
public abstract class Asset {
    //@id   es ist ein Primary key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //Asset Name
    @Column(nullable = false)
    @NotNull(message = "Asset name cannot be null")
    private String name;

    @Column(nullable = false)
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal purchasePrice;

    @Column(nullable = false)
    @NotNull
    private LocalDate purchaseDate;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @NotNull
    private AssetStatus status;

    @Column
    private BigDecimal residualValue = BigDecimal.ZERO;

    @Column(nullable = false)
    @NotNull
    @Min(value = 1, message = "Use life must be at least 1 year")
    private Integer usefulLifeYears;

    public Asset(String name, BigDecimal purchasePrice, LocalDate purchaseDate, AssetStatus status, BigDecimal residualValue, Integer usefulLifeYears) {
        this.name = name;
        this.purchasePrice = purchasePrice;
        this.purchaseDate = purchaseDate;
        this.status = status;
        // 如果传入 null，则回退到 0
        this.residualValue = (residualValue != null) ? residualValue : BigDecimal.ZERO;
        this.usefulLifeYears = usefulLifeYears;
    }
}
