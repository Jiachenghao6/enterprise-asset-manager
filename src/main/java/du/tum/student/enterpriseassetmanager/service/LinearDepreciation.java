package du.tum.student.enterpriseassetmanager.service;

import du.tum.student.enterpriseassetmanager.domain.Asset;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class LinearDepreciation implements DepreciationCalculator{

    @Override
    public BigDecimal calculateCurrentValue(Asset asset) {
        if (asset == null || asset.getPurchasePrice() == null || asset.getUsefulLifeYears() == null)
            return BigDecimal.ZERO;
        BigDecimal originalPrice = asset.getPurchasePrice();
        BigDecimal residualValue = asset.getResidualValue();
        Integer usefulLifeYears = asset.getUsefulLifeYears();
        long yearsUsed = ChronoUnit.YEARS.between(asset.getPurchaseDate(), LocalDate.now());

        if (yearsUsed >= usefulLifeYears) {
            return residualValue; // KANN MAN NICHT MEHR BENUTZEN
        }
        BigDecimal depreciableAmount = originalPrice.subtract(residualValue);

        BigDecimal depreciationPerYear = depreciableAmount.divide(BigDecimal.valueOf(usefulLifeYears), 2,RoundingMode.HALF_UP);

        BigDecimal totalDepreciation = depreciationPerYear.multiply(BigDecimal.valueOf(yearsUsed));

        BigDecimal currentValue = originalPrice.subtract(totalDepreciation);

        return currentValue.max(residualValue);
    }
}
