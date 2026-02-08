package du.tum.student.enterpriseassetmanager.controller.dto;

import du.tum.student.enterpriseassetmanager.domain.AssetStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BatchSoftwareRequest {
    // 基础信息 (模板)
    private String name;
    private BigDecimal purchasePrice;
    private LocalDate purchaseDate;
    private AssetStatus status;
    private BigDecimal residualValue;
    private Integer usefulLifeYears;

    // 软件特有
    private String licenseKey; // 批量生成的软件通常共用一个 Key (批量授权)
    private LocalDate expiryDate;

    // 批量参数
    private Integer quantity; // 数量，例如 100
}