package du.tum.student.enterpriseassetmanager.service;

import du.tum.student.enterpriseassetmanager.controller.dto.DashboardStatsDto;
import du.tum.student.enterpriseassetmanager.domain.Asset;
import du.tum.student.enterpriseassetmanager.domain.AssetStatus;
import du.tum.student.enterpriseassetmanager.domain.SoftwareAsset;
import du.tum.student.enterpriseassetmanager.exception.AssetNotFoundException;
import du.tum.student.enterpriseassetmanager.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AssetService {
    private final AssetRepository assetRepository;
    private final DepreciationCalculator depreciationCalculator;

    public List<Asset> findAllAssets() {
        return assetRepository.findAll();
    }

    public Asset createAsset(Asset asset) {
        return assetRepository.save(asset);
    }

    public BigDecimal calculateValue(long assetId) {
        Optional<Asset> asset = assetRepository.findById(assetId);
        if (asset.isEmpty()) {
            throw new AssetNotFoundException("Asset with ID " + assetId + " not found");
        }
        BigDecimal currentValue = depreciationCalculator.calculateCurrentValue(asset.get());
        return currentValue;
    }

    /**
     * Get dashboard statistics
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
     * Get recent assets (top 5 ordered by creation date)
     */
    public List<Asset> findRecentAssets() {
        return assetRepository.findTop5ByOrderByCreatedAtDesc();
    }
}
