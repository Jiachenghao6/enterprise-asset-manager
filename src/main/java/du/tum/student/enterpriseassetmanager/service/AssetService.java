package du.tum.student.enterpriseassetmanager.service;

import du.tum.student.enterpriseassetmanager.domain.Asset;
import du.tum.student.enterpriseassetmanager.exception.AssetNotFoundException;
import du.tum.student.enterpriseassetmanager.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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

    public BigDecimal calculateValue(long assetId) {
       Optional<Asset> asset = assetRepository.findById(assetId);
       if (asset.isEmpty()) {throw new AssetNotFoundException("Asset with ID " + assetId + " not found");}
       BigDecimal currentValue = depreciationCalculator.calculateCurrentValue(asset.get());
       return currentValue;
    }

}
