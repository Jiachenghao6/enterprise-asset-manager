package du.tum.student.enterpriseassetmanager.repository;

import du.tum.student.enterpriseassetmanager.controller.dto.AssetSearchCriteria;
import du.tum.student.enterpriseassetmanager.domain.Asset;
import du.tum.student.enterpriseassetmanager.domain.HardwareAsset;
import du.tum.student.enterpriseassetmanager.domain.SoftwareAsset;
import du.tum.student.enterpriseassetmanager.domain.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Utility class for building dynamic JPA specifications for {@link Asset}
 * queries.
 * <p>
 * Allows filtering by complex criteria including partial text matches across
 * multiple fields
 * (name, serial number, license key, assigned user) and direct status matching.
 * </p>
 */
public class AssetSpecification {

        /**
         * Creates a {@link Specification} based on the provided search criteria.
         *
         * @param criteria the criteria containing search terms and filters
         * @return a JPA {@link Specification} for querying assets
         */
        public static Specification<Asset> filterBy(AssetSearchCriteria criteria) {
                return (root, query, criteriaBuilder) -> {
                        List<Predicate> predicates = new ArrayList<>();

                        // ==============================================================
                        // 1. Universal Fuzzy Search
                        // Logic: Name OR Serial OR License OR Assigned User Name
                        // ==============================================================
                        if (criteria.getQuery() != null && !criteria.getQuery().isEmpty()) {
                                String searchPattern = "%" + criteria.getQuery().toLowerCase() + "%";

                                // A. Match Asset Name
                                Predicate nameMatch = criteriaBuilder.like(
                                                criteriaBuilder.lower(root.get("name")),
                                                searchPattern);

                                // B. Match Hardware Serial Number (using strict subclass casting)
                                Predicate serialMatch = criteriaBuilder.like(
                                                criteriaBuilder.lower(
                                                                criteriaBuilder.treat(root, HardwareAsset.class)
                                                                                .get("serialNumber")),
                                                searchPattern);

                                // C. Match Software License Key (using strict subclass casting)
                                Predicate licenseMatch = criteriaBuilder.like(
                                                criteriaBuilder.lower(
                                                                criteriaBuilder.treat(root, SoftwareAsset.class)
                                                                                .get("licenseKey")),
                                                searchPattern);

                                // D. Match Assigned User Name (via Join)
                                // Use LEFT JOIN to include assets that are not assigned to any user
                                Join<Asset, User> userJoin = root.join("assignedTo", JoinType.LEFT);
                                Predicate userMatch = criteriaBuilder.like(
                                                criteriaBuilder.lower(userJoin.get("username")),
                                                searchPattern);

                                // Join all conditions with OR: return asset if ANY condition matches
                                predicates.add(criteriaBuilder.or(nameMatch, serialMatch, licenseMatch, userMatch));
                        }

                        // ==============================================================
                        // 2. Exact Status Match (AND logic)
                        // ==============================================================
                        if (criteria.getStatus() != null) {
                                predicates.add(criteriaBuilder.equal(root.get("status"), criteria.getStatus()));
                        }

                        return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
                };
        }
}