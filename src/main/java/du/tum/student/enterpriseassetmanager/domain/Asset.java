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

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
// 1. 拦截删除操作，改为更新状态
@SQLDelete(sql = "UPDATE asset SET status = 'DISPOSED' WHERE id = ?")
// 2. (可选) 全局过滤，默认查询时不显示已报废资产
// 注意：PostgreSQL 中枚举通常存储为字符串，确保数据库里存的是 'DISPOSED'
@SQLRestriction("status <> 'DISPOSED'")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public abstract class Asset {
    // @id es ist ein Primary key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Asset Name
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
     * 资产归属人
     * 多对一关系：多个资产可以归属于一个用户
     * FetchType.EAGER: 查询资产时，自动把 User 信息也查出来（方便前端显示）
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id") // 数据库表里的外键列名
    private User assignedTo;

    // --- 新增审计字段 ---

    @CreatedBy
    @Column(nullable = false, updatable = false) // 创建人一旦写入，后续更新不可修改
    private String createdBy;

    @CreatedDate
    @Column(nullable = false, updatable = false) // 创建时间不可修改
    private LocalDateTime createdAt;

    @LastModifiedBy
    @Column
    private String lastModifiedBy;

    @LastModifiedDate
    @Column
    private LocalDateTime lastModifiedAt;

    public Asset(String name, BigDecimal purchasePrice, LocalDate purchaseDate, AssetStatus status,
            BigDecimal residualValue, Integer usefulLifeYears) {
        this.name = name;
        this.purchasePrice = purchasePrice;
        this.purchaseDate = purchaseDate;
        this.status = status;
        // 如果传入 null，则回退到 0
        this.residualValue = (residualValue != null) ? residualValue : BigDecimal.ZERO;
        this.usefulLifeYears = usefulLifeYears;
    }
}
