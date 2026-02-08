package du.tum.student.enterpriseassetmanager.controller.dto;

import du.tum.student.enterpriseassetmanager.domain.AssetStatus;
import lombok.Data;

@Data
public class AssetSearchCriteria {
    // 原有的模糊查询
    private String query;
    // 原有的状态查询
    private AssetStatus status;

    // [Phase 2 新增] 精准查询
    private String serialNumber; // 硬件序列号
    private Long assignedToUserId; // 分配给谁 (User ID)
}