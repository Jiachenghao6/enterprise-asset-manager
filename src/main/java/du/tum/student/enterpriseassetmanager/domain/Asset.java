package du.tum.student.enterpriseassetmanager.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Abstract base class representing an asset.
 * <p>
 * This entity uses JOINED inheritance strategy.
 * It also implements soft deletion via Hibernate annotations:
 * deleting an asset will instead update its status to 'DISPOSED'.
 * </p>
 */
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
// 1. Intercept delete operations and update status instead
@SQLDelete(sql = "UPDATE asset SET status = 'DISPOSED' WHERE id = ?")
// 2. (Optional) Global filter to hide disposed assets by default
// Note: Ensure the DB stores 'DISPOSED' as a string equivalent of the enum
@SQLRestriction("status <> 'DISPOSED'")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public abstract class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    /**
     * The user this asset is assigned to.
     * <p>
     * Many-to-One relationship: An asset belongs to one user.
     * FetchType.EAGER is used to automatically load User details when fetching an
     * Asset.
     * </p>
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id") // Foreign key column in DB
    private User assignedTo;

    // --- Auditing Fields ---

    @CreatedBy
    @Column(nullable = false, updatable = false)
    private String createdBy;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedBy
    @Column
    private String lastModifiedBy;

    @LastModifiedDate
    @Column
    private LocalDateTime lastModifiedAt;

    /**
     * Constructs a new Asset with validation.
     *
     * @param name            the name of the asset
     * @param purchasePrice   the purchase price
     * @param purchaseDate    the date of purchase
     * @param status          the initial status
     * @param residualValue   the estimated residual value
     * @param usefulLifeYears the useful life in years
     */
    public Asset(String name, BigDecimal purchasePrice, LocalDate purchaseDate, AssetStatus status,
            BigDecimal residualValue, Integer usefulLifeYears) {
        this.name = name;
        this.purchasePrice = purchasePrice;
        this.purchaseDate = purchaseDate;
        this.status = status;
        // Default to zero if null
        this.residualValue = (residualValue != null) ? residualValue : BigDecimal.ZERO;
        this.usefulLifeYears = usefulLifeYears;
    }
}
