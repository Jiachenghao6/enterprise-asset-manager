package du.tum.student.enterpriseassetmanager.service;

import du.tum.student.enterpriseassetmanager.controller.dto.BatchHardwareRequest;
import du.tum.student.enterpriseassetmanager.controller.dto.DashboardStatsDto;
import du.tum.student.enterpriseassetmanager.domain.Asset;
import du.tum.student.enterpriseassetmanager.domain.AssetStatus;
import du.tum.student.enterpriseassetmanager.domain.HardwareAsset;
import du.tum.student.enterpriseassetmanager.domain.SoftwareAsset;
import du.tum.student.enterpriseassetmanager.exception.AssetNotFoundException;
import du.tum.student.enterpriseassetmanager.repository.AssetRepository;
import du.tum.student.enterpriseassetmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import du.tum.student.enterpriseassetmanager.domain.User;
import du.tum.student.enterpriseassetmanager.repository.AssetSpecification;
import org.springframework.data.jpa.domain.Specification;
import du.tum.student.enterpriseassetmanager.controller.dto.BatchSoftwareRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import du.tum.student.enterpriseassetmanager.controller.dto.AssetSearchCriteria;

/**
 * Service class for managing Assets.
 * <p>
 * Handles business logic for asset creation, retrieval, updates, deletion,
 * assignment, and statistics.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class AssetService {
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final DepreciationCalculator depreciationCalculator;

    /**
     * Retrieves all assets with pagination.
     *
     * @param pageable pagination information
     * @return a {@link Page} of assets
     */
    public Page<Asset> findAllAssets(Pageable pageable) {
        return assetRepository.findAll(pageable);
    }

    /**
     * Persists a new asset to the database.
     *
     * @param asset the asset entity to save
     * @return the saved {@link Asset}
     */
    public Asset createAsset(Asset asset) {
        return assetRepository.save(asset);
    }

    /**
     * Updates an existing asset's details.
     *
     * @param id           the ID of the asset to update
     * @param assetDetails the object containing updated fields
     * @return the updated {@link Asset}
     * @throws AssetNotFoundException if the asset with the given ID does not exist
     */
    public Asset updateAsset(Long id, Asset assetDetails) {
        Asset existingAsset = assetRepository.findById(id)
                .orElseThrow(() -> new AssetNotFoundException("Asset not found with id: " + id));

        // Update basic fields
        existingAsset.setName(assetDetails.getName());
        existingAsset.setPurchasePrice(assetDetails.getPurchasePrice());
        existingAsset.setPurchaseDate(assetDetails.getPurchaseDate());
        existingAsset.setUsefulLifeYears(assetDetails.getUsefulLifeYears());
        existingAsset.setResidualValue(assetDetails.getResidualValue());

        // If status is provided, allow update (though status is typically managed via
        // assignment logic)
        if (assetDetails.getStatus() != null) {
            existingAsset.setStatus(assetDetails.getStatus());
        }

        return assetRepository.save(existingAsset);
    }

    /**
     * Deletes an asset by its ID.
     *
     * @param id the ID of the asset to delete
     * @throws AssetNotFoundException if the asset with the given ID does not exist
     */
    public void deleteAsset(Long id) {
        if (!assetRepository.existsById(id)) {
            throw new AssetNotFoundException("Asset not found with id: " + id);
        }
        assetRepository.deleteById(id);
    }

    /**
     * Assigns an asset to a specific user.
     * <p>
     * This operation updates the asset's 'assignedTo' field and changes its status
     * to {@link AssetStatus#ASSIGNED}.
     * </p>
     *
     * @param assetId the ID of the asset
     * @param userId  the ID of the user
     * @return the updated {@link Asset}
     * @throws AssetNotFoundException if the asset is not found
     * @throws RuntimeException       if the user is not found
     */
    public Asset assignAsset(Long assetId, Long userId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new AssetNotFoundException("Asset not found with id: " + assetId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Core Business Logic: Link user and update status
        asset.setAssignedTo(user);
        asset.setStatus(AssetStatus.ASSIGNED);

        return assetRepository.save(asset);
    }

    /**
     * Searches for assets using dynamic criteria.
     *
     * @param criteria the search criteria
     * @param pageable pagination information
     * @return a {@link Page} of matching assets
     */
    public Page<Asset> searchAssets(AssetSearchCriteria criteria, Pageable pageable) {
        Specification<Asset> spec = AssetSpecification.filterBy(criteria);
        return assetRepository.findAll(spec, pageable);
    }

    /**
     * Calculates the current depreciated value of an asset.
     *
     * @param assetId the ID of the asset
     * @return the calculated current value
     * @throws AssetNotFoundException if the asset is not found
     */
    public BigDecimal calculateValue(long assetId) {
        Optional<Asset> asset = assetRepository.findById(assetId);
        if (asset.isEmpty()) {
            throw new AssetNotFoundException("Asset with ID " + assetId + " not found");
        }
        BigDecimal currentValue = depreciationCalculator.calculateCurrentValue(asset.get());
        return currentValue;
    }

    /**
     * Aggregates key statistics for the dashboard.
     * <p>
     * Calculates total assets, total value, active licenses, and available assets.
     * </p>
     *
     * @return a {@link DashboardStatsDto} containing the statistics
     */
    public DashboardStatsDto getDashboardStats() {
        List<Asset> allAssets = assetRepository.findAll();

        long totalAssets = allAssets.size();

        // Calculate total value (sum of all purchase prices)
        BigDecimal totalValue = allAssets.stream()
                .map(Asset::getPurchasePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Count active licenses (software assets that are not disposed and not expired)
        long activeLicenses = allAssets.stream()
                .filter(asset -> asset instanceof SoftwareAsset)
                .filter(asset -> asset.getStatus() != AssetStatus.DISPOSED)
                .map(asset -> (SoftwareAsset) asset)
                .filter(software -> software.getExpiryDate() == null ||
                        software.getExpiryDate().isAfter(LocalDate.now()))
                .count();

        // Count available assets
        long availableAssets = assetRepository.countByStatus(AssetStatus.AVAILABLE);

        return DashboardStatsDto.builder()
                .totalAssets(totalAssets)
                .totalValue(totalValue)
                .activeLicenses(activeLicenses)
                .availableAssets(availableAssets)
                .build();
    }

    /**
     * Retrieves the 5 most recently created assets.
     *
     * @return a list of recent assets
     */
    public List<Asset> findRecentAssets() {
        return assetRepository.findTop5ByOrderByCreatedAtDesc();
    }

    /**
     * Creates multiple Hardware assets in a batch.
     * <p>
     * Automatically generates serial numbers using the prefix provided in the
     * request
     * (e.g., PREFIX-001, PREFIX-002).
     * </p>
     *
     * @param request the batch request containing common properties and quantity
     * @return a list of created {@link Asset}s
     */
    @Transactional // Ensures atomicity: if one save fails, all roll back
    public List<Asset> createBatchHardware(BatchHardwareRequest request) {
        List<Asset> createdAssets = new ArrayList<>();

        for (int i = 1; i <= request.getQuantity(); i++) {
            HardwareAsset asset = new HardwareAsset();

            // 1. Copy common properties
            asset.setName(request.getName());
            asset.setPurchasePrice(request.getPurchasePrice());
            asset.setPurchaseDate(request.getPurchaseDate());
            asset.setStatus(request.getStatus());
            asset.setResidualValue(request.getResidualValue());
            asset.setUsefulLifeYears(request.getUsefulLifeYears());

            // 2. Copy hardware attributes
            asset.setLocation(request.getLocation());
            asset.setWarrantyDate(request.getWarrantyDate());

            // 3. [Core] Generate unique Serial Number
            // Format: PREFIX-001, PREFIX-002...
            String suffix = String.format("%03d", i); // Zero-pad to 3 digits
            asset.setSerialNumber(request.getSerialNumberPrefix() + suffix);

            createdAssets.add(assetRepository.save(asset));
        }

        return createdAssets;
    }

    /**
     * Creates multiple Software assets in a batch.
     * <p>
     * All created instances share the same License Key and Expiry Date.
     * </p>
     *
     * @param request the batch request containing common properties and quantity
     * @return a list of created {@link Asset}s
     */
    @Transactional
    public List<Asset> createBatchSoftware(BatchSoftwareRequest request) {
        List<Asset> createdAssets = new ArrayList<>();

        for (int i = 0; i < request.getQuantity(); i++) {
            SoftwareAsset asset = new SoftwareAsset();

            // 1. Copy common properties
            asset.setName(request.getName());
            asset.setPurchasePrice(request.getPurchasePrice());
            asset.setPurchaseDate(request.getPurchaseDate());
            asset.setStatus(request.getStatus());
            asset.setResidualValue(request.getResidualValue());
            asset.setUsefulLifeYears(request.getUsefulLifeYears());

            // 2. Copy software attributes
            asset.setLicenseKey(request.getLicenseKey()); // Shared key
            asset.setExpiryDate(request.getExpiryDate());

            createdAssets.add(assetRepository.save(asset));
        }

        return createdAssets;
    }
}
