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
import du.tum.student.enterpriseassetmanager.repository.AssetSpecification; // [新增]
import org.springframework.data.jpa.domain.Specification; // [新增]
import du.tum.student.enterpriseassetmanager.controller.dto.BatchSoftwareRequest;

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

    @Transactional // 开启事务：任何一个保存失败，整体回滚
    public List<Asset> createBatchHardware(BatchHardwareRequest request) {
        List<Asset> createdAssets = new ArrayList<>();

        for (int i = 1; i <= request.getQuantity(); i++) {
            HardwareAsset asset = new HardwareAsset();

            // 1. 复制通用属性
            asset.setName(request.getName());
            asset.setPurchasePrice(request.getPurchasePrice());
            asset.setPurchaseDate(request.getPurchaseDate());
            asset.setStatus(request.getStatus());
            asset.setResidualValue(request.getResidualValue());
            asset.setUsefulLifeYears(request.getUsefulLifeYears());

            // 2. 复制硬件属性
            asset.setLocation(request.getLocation());
            asset.setWarrantyDate(request.getWarrantyDate());

            // 3. [核心] 自动生成唯一序列号
            // 格式: PREFIX-001, PREFIX-002...
            String suffix = String.format("%03d", i); // 补零，变成 3 位数
            asset.setSerialNumber(request.getSerialNumberPrefix() + suffix);

            createdAssets.add(assetRepository.save(asset));
        }

        return createdAssets;
    }

    @Transactional
    public List<Asset> createBatchSoftware(BatchSoftwareRequest request) {
        List<Asset> createdAssets = new ArrayList<>();

        for (int i = 0; i < request.getQuantity(); i++) {
            SoftwareAsset asset = new SoftwareAsset();

            // 1. 复制通用属性
            asset.setName(request.getName());
            asset.setPurchasePrice(request.getPurchasePrice());
            asset.setPurchaseDate(request.getPurchaseDate());
            asset.setStatus(request.getStatus());
            asset.setResidualValue(request.getResidualValue());
            asset.setUsefulLifeYears(request.getUsefulLifeYears());

            // 2. 复制软件属性
            asset.setLicenseKey(request.getLicenseKey()); // 所有副本共用同一个 Key
            asset.setExpiryDate(request.getExpiryDate());

            createdAssets.add(assetRepository.save(asset));
        }

        return createdAssets;
    }
}
