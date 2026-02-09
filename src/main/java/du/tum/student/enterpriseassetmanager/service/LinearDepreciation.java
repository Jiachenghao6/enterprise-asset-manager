package du.tum.student.enterpriseassetmanager.service;

import du.tum.student.enterpriseassetmanager.domain.Asset;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Implementation of {@link DepreciationCalculator} using the Straight-Line
 * Depreciation method.
 * <p>
 * This method spreads the cost of the asset evenly over its useful life.
 * Formula: (Cost - Residual Value) / Useful Life = Annual Depreciation
 * Current Value = Cost - (Annual Depreciation * Years Used)
 * </p>
 */
@Component
public class LinearDepreciation implements DepreciationCalculator {

    /**
     * Calculates the current value based on straight-line depreciation.
     * <p>
     * NOTE: If the asset has exceeded its useful life, the residual value is
     * returned.
     * </p>
     *
     * @param asset the asset to evaluate
     * @return the calculated current value
     */
    @Override
    public BigDecimal calculateCurrentValue(Asset asset) {
        if (asset == null || asset.getPurchasePrice() == null || asset.getUsefulLifeYears() == null)
            return BigDecimal.ZERO;
        BigDecimal originalPrice = asset.getPurchasePrice();
        BigDecimal residualValue = asset.getResidualValue();
        Integer usefulLifeYears = asset.getUsefulLifeYears();
        long yearsUsed = ChronoUnit.YEARS.between(asset.getPurchaseDate(), LocalDate.now());

        // Use residual value if useful life is exceeded
        if (yearsUsed >= usefulLifeYears) {
            return residualValue;
        }

        BigDecimal depreciableAmount = originalPrice.subtract(residualValue);

        BigDecimal depreciationPerYear = depreciableAmount.divide(BigDecimal.valueOf(usefulLifeYears), 2,
                RoundingMode.HALF_UP);

        BigDecimal totalDepreciation = depreciationPerYear.multiply(BigDecimal.valueOf(yearsUsed));

        BigDecimal currentValue = originalPrice.subtract(totalDepreciation);

        // Ensure value doesn't drop below residual value (though the years check above
        // handles most cases)
        return currentValue.max(residualValue);
    }
}
