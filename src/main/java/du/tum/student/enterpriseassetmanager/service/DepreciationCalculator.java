package du.tum.student.enterpriseassetmanager.service;

import du.tum.student.enterpriseassetmanager.domain.Asset;

import java.math.BigDecimal;

/**
 * Interface for calculating asset depreciation.
 * <p>
 * Implementations should define specific depreciation strategies (e.g.,
 * straight-line, declining balance).
 * </p>
 */
public interface DepreciationCalculator {
    /**
     * Calculates the current value of the asset.
     *
     * @param asset The asset for which the value is calculated.
     * @return The calculated current value as {@link BigDecimal}.
     */
    BigDecimal calculateCurrentValue(Asset asset);
}
