package du.tum.student.enterpriseassetmanager.service;

import du.tum.student.enterpriseassetmanager.controller.dto.DashboardStatsDto;
import du.tum.student.enterpriseassetmanager.domain.Asset;
import du.tum.student.enterpriseassetmanager.domain.AssetStatus;
import du.tum.student.enterpriseassetmanager.domain.SoftwareAsset;
import du.tum.student.enterpriseassetmanager.exception.AssetNotFoundException;
import du.tum.student.enterpriseassetmanager.repository.AssetRepository;
import du.tum.student.enterpriseassetmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import du.tum.student.enterpriseassetmanager.domain.User;
import du.tum.student.enterpriseassetmanager.repository.AssetSpecification; // [新增]
import org.springframework.data.jpa.domain.Specification; // [新增]

@Service
@RequiredArgsConstructor
public class AssetService {
    private final AssetRepository assetRepository;
    private final UserRepository userRepository; // [新增] 注入 UserRepository
    private final DepreciationCalculator depreciationCalculator;

    public List<Asset> findAllAssets() {
        return assetRepository.findAll();
    }

    public Asset createAsset(Asset asset) {
        return assetRepository.save(asset);
    }

    public Asset updateAsset(Long id, Asset assetDetails) {
        Asset existingAsset = assetRepository.findById(id)
                .orElseThrow(() -> new AssetNotFoundException("Asset not found with id: " + id));

        // 更新基本字段
        existingAsset.setName(assetDetails.getName());
        existingAsset.setPurchasePrice(assetDetails.getPurchasePrice());
        existingAsset.setPurchaseDate(assetDetails.getPurchaseDate());
        existingAsset.setUsefulLifeYears(assetDetails.getUsefulLifeYears());
        existingAsset.setResidualValue(assetDetails.getResidualValue());

        // 如果前端传了状态，也允许更新（但在分配逻辑里会自动处理状态）
        if (assetDetails.getStatus() != null) {
            existingAsset.setStatus(assetDetails.getStatus());
        }

        return assetRepository.save(existingAsset);
    }

    public void deleteAsset(Long id) {
        if (!assetRepository.existsById(id)) {
            throw new AssetNotFoundException("Asset not found with id: " + id);
        }
        assetRepository.deleteById(id);
    }

    public Asset assignAsset(Long assetId, Long userId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new AssetNotFoundException("Asset not found with id: " + assetId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // 核心业务逻辑：关联用户 + 修改状态
        asset.setAssignedTo(user);
        asset.setStatus(AssetStatus.ASSIGNED);

        return assetRepository.save(asset);
    }

    public List<Asset> searchAssets(String query, AssetStatus status) {
        Specification<Asset> spec = AssetSpecification.filterBy(query, status);
        return assetRepository.findAll(spec);
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
