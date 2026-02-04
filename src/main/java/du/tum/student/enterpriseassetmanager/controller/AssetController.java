package du.tum.student.enterpriseassetmanager.controller;

import du.tum.student.enterpriseassetmanager.controller.dto.DashboardStatsDto;
import du.tum.student.enterpriseassetmanager.domain.Asset;
import du.tum.student.enterpriseassetmanager.domain.HardwareAsset;
import du.tum.student.enterpriseassetmanager.domain.SoftwareAsset;
import du.tum.student.enterpriseassetmanager.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

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
}
