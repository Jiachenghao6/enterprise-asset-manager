package du.tum.student.enterpriseassetmanager.repository;

import du.tum.student.enterpriseassetmanager.domain.Asset;
import du.tum.student.enterpriseassetmanager.domain.AssetStatus;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;

public class AssetSpecification {

    /**
     * 构建动态查询条件
     * 
     * @param nameQuery 名字关键词 (模糊搜索)
     * @param status    资产状态 (精确匹配)
     * @return Specification<Asset>
     */
    public static Specification<Asset> filterBy(String nameQuery, AssetStatus status) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. 如果传了 nameQuery，就进行模糊搜索 (忽略大小写)
            // SQL: WHERE lower(name) LIKE %lower(nameQuery)%
            if (nameQuery != null && !nameQuery.isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        "%" + nameQuery.toLowerCase() + "%"));
            }

            // 2. 如果传了 status，就进行精确匹配
            // SQL: AND status = ?
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            // 3. 别忘了我们之前定义的 @SQLRestriction("status <> 'DISPOSED'") 会自动生效
            // 这里不需要手动过滤 DISPOSED，除非你想覆盖它

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}