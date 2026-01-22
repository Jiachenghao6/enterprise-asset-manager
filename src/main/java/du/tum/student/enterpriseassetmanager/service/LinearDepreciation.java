package du.tum.student.enterpriseassetmanager.service;

import du.tum.student.enterpriseassetmanager.domain.Asset;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class LinearDepreciation implements DepreciationCalculator{
    private static final int USEFUL_LIFE_YEARS = 5;

    @Override
    public BigDecimal calculateCurrentValue(Asset asset) {
        if (asset == null || asset.getPurchasePrice() == null)
            return BigDecimal.ZERO;
        long yearsUsed = ChronoUnit.YEARS.between(asset.getPurchaseDate(), LocalDate.now());

        if (yearsUsed >= USEFUL_LIFE_YEARS) {
            return BigDecimal.ZERO; // KANN MAN NICHT MEHR BENUTZEN
        }

        BigDecimal depreciationPerYear = asset.getPurchasePrice().divide(BigDecimal.valueOf(USEFUL_LIFE_YEARS), 2,RoundingMode.HALF_UP);

        BigDecimal totalDepreciation = depreciationPerYear.multiply(BigDecimal.valueOf(yearsUsed));

        BigDecimal currentValue = asset.getPurchasePrice().subtract(totalDepreciation);

        return currentValue.max(BigDecimal.ZERO);
    }
}
