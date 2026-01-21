package du.tum.student.enterpriseassetmanager.domain;
import jakarta.persistence.*;
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
    private String name;

    @Column(nullable = false)
    private BigDecimal purchasePrice;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AssetStatus status;


    public Asset(String name, BigDecimal purchasePrice, LocalDate purchaseDate, AssetStatus status) {
        this.name = name;
        this.purchasePrice = purchasePrice;
        this.purchaseDate = purchaseDate;
        this.status = status;
    }
}
