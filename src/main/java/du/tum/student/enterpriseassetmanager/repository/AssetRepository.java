package du.tum.student.enterpriseassetmanager.repository;

import du.tum.student.enterpriseassetmanager.domain.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findByStatus(String status);

    List<Asset> findByPurchaseDateBetween(LocalDate startDate, LocalDate endDate);

    List<Asset> findByPurchaseDateBefore(LocalDate startDate);

    List<Asset> findByPurchaseDateAfter(LocalDate endDate);

    List<Asset> findByPurchaseDateBetweenAndStatus(LocalDate startDate, LocalDate endDate, String status);

    List<Asset> findByPurchasePriceBetween(Double startPrice, Double endPrice);

    List<Asset> findByPurchasePriceGreaterThan(Double startPrice);
}
