package du.tum.student.enterpriseassetmanager.controller;

import du.tum.student.enterpriseassetmanager.controller.dto.DashboardStatsDto;
import du.tum.student.enterpriseassetmanager.domain.Asset;
import du.tum.student.enterpriseassetmanager.domain.HardwareAsset;
import du.tum.student.enterpriseassetmanager.domain.SoftwareAsset;
import du.tum.student.enterpriseassetmanager.service.AssetService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import du.tum.student.enterpriseassetmanager.domain.AssetStatus;
import du.tum.student.enterpriseassetmanager.controller.dto.BatchHardwareRequest;
import du.tum.student.enterpriseassetmanager.controller.dto.BatchSoftwareRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map; // [新增] 引入 Map

@RestController
@RequestMapping("api/v1/assets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssetController {
    private final AssetService assetService;

    @PostMapping("/hardware")
    public Asset createHardware(@RequestBody HardwareAsset asset) {
        return assetService.createAsset(asset);
    }

    @PostMapping("/software")
    public Asset createSoftware(@RequestBody SoftwareAsset asset) {
        return assetService.createAsset(asset);
    }

    @GetMapping
    public List<Asset> getAllAssets() {
        return assetService.findAllAssets();
    }

    @GetMapping("/stats")
    public DashboardStatsDto getStats() {
        return assetService.getDashboardStats();
    }

    @GetMapping("/recent")
    public List<Asset> getRecentAssets() {
        return assetService.findRecentAssets();
    }

    @GetMapping("/{id}/value")
    public BigDecimal getAssetValue(@PathVariable Long id) {
        return assetService.calculateValue(id);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Asset>> searchAssets(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) AssetStatus status) {
        return ResponseEntity.ok(assetService.searchAssets(query, status));
    }
    // ==========================================
    // Phase 2 新增接口 (解决 404 问题)
    // ==========================================

    /**
     * [修改] 更新资产
     * 使用 Map<String, Object> 接收参数，绕过 abstract class Asset 无法实例化的问题
     */
    @PutMapping("/{id}")
    public ResponseEntity<Asset> updateAsset(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        // 创建临时对象承载数据
        Asset tempAsset = new Asset() {
        };

        // 1. Name
        if (updates.containsKey("name")) {
            tempAsset.setName((String) updates.get("name"));
        }

        // 2. Purchase Price
        if (updates.containsKey("purchasePrice")) {
            Object price = updates.get("purchasePrice");
            if (price != null)
                tempAsset.setPurchasePrice(new BigDecimal(price.toString()));
        }

        // 3. Purchase Date [本次修复重点]
        if (updates.containsKey("purchaseDate")) {
            Object dateStr = updates.get("purchaseDate");
            if (dateStr != null && !dateStr.toString().isEmpty()) {
                // 前端通常传 "yyyy-MM-dd" (ISO-8601)，可以直接 parse
                tempAsset.setPurchaseDate(LocalDate.parse(dateStr.toString()));
            }
        }

        // 4. Status
        if (updates.containsKey("status")) {
            tempAsset.setStatus(AssetStatus.valueOf((String) updates.get("status")));
        }

        // 5. Useful Life Years
        if (updates.containsKey("usefulLifeYears")) {
            Object life = updates.get("usefulLifeYears");
            if (life != null)
                tempAsset.setUsefulLifeYears(Integer.parseInt(life.toString()));
        }

        // 6. Residual Value
        if (updates.containsKey("residualValue")) {
            Object val = updates.get("residualValue");
            if (val != null)
                tempAsset.setResidualValue(new BigDecimal(val.toString()));
        }

        return ResponseEntity.ok(assetService.updateAsset(id, tempAsset));
    }

    /**
     * [新增] 删除资产 (软删除)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * [新增] 分配资产
     */
    @PostMapping("/{id}/assign")
    public ResponseEntity<Asset> assignAsset(@PathVariable Long id, @RequestBody Map<String, Long> payload) {
        Long userId = payload.get("userId");
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(assetService.assignAsset(id, userId));
    }

    /**
     * 批量创建硬件资产
     * POST /api/v1/assets/batch/hardware
     */
    @PostMapping("/batch/hardware")
    public ResponseEntity<List<Asset>> createBatchHardware(@RequestBody BatchHardwareRequest request) {
        return ResponseEntity.ok(assetService.createBatchHardware(request));
    }

    /**
     * 批量创建软件资产
     * POST /api/v1/assets/batch/software
     */
    @PostMapping("/batch/software")
    public ResponseEntity<List<Asset>> createBatchSoftware(@RequestBody BatchSoftwareRequest request) {
        return ResponseEntity.ok(assetService.createBatchSoftware(request));
    }
}
