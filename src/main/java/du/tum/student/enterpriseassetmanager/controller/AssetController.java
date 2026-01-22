package du.tum.student.enterpriseassetmanager.controller;

import du.tum.student.enterpriseassetmanager.domain.Asset;
import du.tum.student.enterpriseassetmanager.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("api/v1/asset")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssetController {
    private final AssetService assetService;

    @GetMapping
    public List<Asset> getAllAssets() {
        return assetService.findAllAssets();
    }

    @GetMapping("/{id}/value")
    public BigDecimal getAssetValue(Long id) {
        return assetService.calculateValue(id);
    }

}
