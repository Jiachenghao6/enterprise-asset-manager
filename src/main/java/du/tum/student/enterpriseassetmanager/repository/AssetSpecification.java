package du.tum.student.enterpriseassetmanager.repository;

import du.tum.student.enterpriseassetmanager.controller.dto.AssetSearchCriteria;
import du.tum.student.enterpriseassetmanager.domain.Asset;
import du.tum.student.enterpriseassetmanager.domain.HardwareAsset;
import du.tum.student.enterpriseassetmanager.domain.SoftwareAsset; // [新增 Import]
import du.tum.student.enterpriseassetmanager.domain.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class AssetSpecification {

    public static Specification<Asset> filterBy(AssetSearchCriteria criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // ==============================================================
            // 1. [核心修复] 全能模糊搜索 (Universal Search)
            // 逻辑：Name OR Serial OR License OR Assigned User Name
            // ==============================================================
            if (criteria.getQuery() != null && !criteria.getQuery().isEmpty()) {
                String searchPattern = "%" + criteria.getQuery().toLowerCase() + "%";

                // A. 匹配资产名字
                Predicate nameMatch = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        searchPattern);

                // B. 匹配硬件序列号 (使用 treat 向下转型)
                Predicate serialMatch = criteriaBuilder.like(
                        criteriaBuilder.lower(
                                criteriaBuilder.treat(root, HardwareAsset.class).get("serialNumber")),
                        searchPattern);

                // C. 匹配软件 License Key (使用 treat 向下转型)
                Predicate licenseMatch = criteriaBuilder.like(
                        criteriaBuilder.lower(
                                criteriaBuilder.treat(root, SoftwareAsset.class).get("licenseKey")),
                        searchPattern);

                // D. 匹配分配用户的名字 (关联查询)
                // 先连接 User 表 (LEFT JOIN 以防资产未分配时报错)
                Join<Asset, User> userJoin = root.join("assignedTo", JoinType.LEFT);
                Predicate userMatch = criteriaBuilder.like(
                        criteriaBuilder.lower(userJoin.get("username")),
                        searchPattern);

                // 将以上 4 个条件用 OR 连接：只要有一个匹配就返回
                predicates.add(criteriaBuilder.or(nameMatch, serialMatch, licenseMatch, userMatch));
            }

            // ==============================================================
            // 2. 状态精确匹配 (Status) - 保持不变，这是并集 (AND) 逻辑
            // ==============================================================
            if (criteria.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), criteria.getStatus()));
            }

            // (可选) 如果你以后想保留“精确查询序列号”的接口逻辑，可以保留在下面，
            // 但目前的 Dashboard 通用搜索框只用上面的逻辑就够了。

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}