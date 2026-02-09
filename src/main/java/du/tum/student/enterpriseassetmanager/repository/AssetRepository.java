package du.tum.student.enterpriseassetmanager.repository;

import du.tum.student.enterpriseassetmanager.domain.Asset;
import du.tum.student.enterpriseassetmanager.domain.AssetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for {@link Asset} entities.
 * <p>
 * Provides CRUD operations and custom query methods for assets.
 * Extends {@link JpaSpecificationExecutor} to specific dynamic filtering
 * capabilities.
 * </p>
 */
@Repository
public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {

    /**
     * Finds all assets with a specific status.
     *
     * @param status the {@link AssetStatus} to filter by
     * @return a list of matching assets
     */
    List<Asset> findByStatus(AssetStatus status);

    /**
     * Finds assets purchased within a specific date range.
     *
     * @param startDate the start date of the range (inclusive)
     * @param endDate   the end date of the range (inclusive)
     * @return a list of matching assets
     */
    List<Asset> findByPurchaseDateBetween(LocalDate startDate, LocalDate endDate);

    /**
     * Finds assets purchased before a specific date.
     *
     * @param startDate the cut-off date
     * @return a list of matching assets
     */
    List<Asset> findByPurchaseDateBefore(LocalDate startDate);

    /**
     * Finds assets purchased after a specific date.
     *
     * @param endDate the cut-off date
     * @return a list of matching assets
     */
    List<Asset> findByPurchaseDateAfter(LocalDate endDate);

    /**
     * Finds assets purchased within a date range and having a specific status.
     *
     * @param startDate the start date of the range
     * @param endDate   the end date of the range
     * @param status    the status to filter by
     * @return a list of matching assets
     */
    List<Asset> findByPurchaseDateBetweenAndStatus(LocalDate startDate, LocalDate endDate, AssetStatus status);

    /**
     * Finds assets with a purchase price within a specific range.
     *
     * @param startPrice the minimum price
     * @param endPrice   the maximum price
     * @return a list of matching assets
     */
    List<Asset> findByPurchasePriceBetween(BigDecimal startPrice, BigDecimal endPrice);

    /**
     * Finds assets with a purchase price greater than a specific value.
     *
     * @param startPrice the minimum price
     * @return a list of matching assets
     */
    List<Asset> findByPurchasePriceGreaterThan(BigDecimal startPrice);

    /**
     * Counts the number of assets with a specific status.
     * <p>
     * Useful for dashboard statistics (e.g., counting available or assigned
     * assets).
     * </p>
     *
     * @param status the status to count
     * @return the count of assets
     */
    long countByStatus(AssetStatus status);

    /**
     * Finds the top 5 most recently created assets.
     * <p>
     * Ordered by creation date in descending order.
     * </p>
     *
     * @return a list of the 5 recent assets
     */
    List<Asset> findTop5ByOrderByCreatedAtDesc();
}
