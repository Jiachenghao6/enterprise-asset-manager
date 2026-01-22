package du.tum.student.enterpriseassetmanager.service;
import du.tum.student.enterpriseassetmanager.domain.Asset;
import java.math.BigDecimal;

public interface DepreciationCalculator {
    /**
     * Berechnet den aktuellen Wert des Vermögensgegenstandes.
     * * @param asset Das Asset, für das der Wert berechnet werden soll.
     * @return Der berechnete Wert.
     */
    BigDecimal calculateCurrentValue(Asset asset);
}
