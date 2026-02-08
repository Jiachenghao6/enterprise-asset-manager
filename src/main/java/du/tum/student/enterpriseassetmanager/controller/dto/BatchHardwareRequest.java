package du.tum.student.enterpriseassetmanager.controller.dto;

import du.tum.student.enterpriseassetmanager.domain.AssetStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BatchHardwareRequest {
    // 基础信息 (模板)
    private String name;
    private BigDecimal purchasePrice;
    private LocalDate purchaseDate;
    private AssetStatus status;
    private BigDecimal residualValue;
    private Integer usefulLifeYears;

    // 硬件特有
    private String location;
    private LocalDate warrantyDate;

    // 批量参数
    private String serialNumberPrefix; // 序列号前缀，例如 "DELL-MON-"
    private Integer quantity; // 数量，例如 50
}