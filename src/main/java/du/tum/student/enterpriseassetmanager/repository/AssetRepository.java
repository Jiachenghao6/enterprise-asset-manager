package du.tum.student.enterpriseassetmanager.repository;

import du.tum.student.enterpriseassetmanager.domain.Asset;
import du.tum.student.enterpriseassetmanager.domain.AssetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findByStatus(AssetStatus status);

    List<Asset> findByPurchaseDateBetween(LocalDate startDate, LocalDate endDate);

    List<Asset> findByPurchaseDateBefore(LocalDate startDate);

    List<Asset> findByPurchaseDateAfter(LocalDate endDate);

    List<Asset> findByPurchaseDateBetweenAndStatus(LocalDate startDate, LocalDate endDate, AssetStatus status);

    List<Asset> findByPurchasePriceBetween(BigDecimal startPrice, BigDecimal endPrice);

    List<Asset> findByPurchasePriceGreaterThan(BigDecimal startPrice);

    // Dashboard statistics queries
    long countByStatus(AssetStatus status);

    // Recent assets query (ordered by creation date, newest first)
    List<Asset> findTop5ByOrderByCreatedAtDesc();
}
