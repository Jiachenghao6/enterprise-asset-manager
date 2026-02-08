package du.tum.student.enterpriseassetmanager.repository;

import du.tum.student.enterpriseassetmanager.controller.dto.AssetSearchCriteria;
import du.tum.student.enterpriseassetmanager.domain.Asset;
import du.tum.student.enterpriseassetmanager.domain.HardwareAsset;
import du.tum.student.enterpriseassetmanager.domain.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class AssetSpecification {

    /**
     * 构建动态查询条件
     * [Phase 2] 升级：接收 DTO 而不是散乱的参数
     */
    public static Specification<Asset> filterBy(AssetSearchCriteria criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. 通用模糊搜索 (Name)
            if (criteria.getQuery() != null && !criteria.getQuery().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        "%" + criteria.getQuery().toLowerCase() + "%"));
            }

            // 2. 状态精确匹配 (Status)
            if (criteria.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), criteria.getStatus()));
            }

            // 3. [新增] 序列号查询 (Serial Number)
            // 注意：serialNumber 是 HardwareAsset 特有的，需要用 treat 转换
            if (criteria.getSerialNumber() != null && !criteria.getSerialNumber().isEmpty()) {
                // 逻辑：如果是查询序列号，那它不仅序列号要匹配，而且必须是 HardwareAsset
                // SQL 类似: ... AND (TYPE(asset) = HardwareAsset AND asset.serial_number LIKE
                // %...%)
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(
                                criteriaBuilder.treat(root, HardwareAsset.class).get("serialNumber")),
                        "%" + criteria.getSerialNumber().toLowerCase() + "%"));
            }

            // 4. [新增] 分配用户查询 (Assigned User ID)
            // SQL 类似: ... AND asset.assigned_to_id = ?
            if (criteria.getAssignedToUserId() != null) {
                Join<Asset, User> userJoin = root.join("assignedTo", JoinType.LEFT);
                predicates.add(criteriaBuilder.equal(userJoin.get("id"), criteria.getAssignedToUserId()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}