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
import du.tum.student.enterpriseassetmanager.controller.dto.AssetSearchCriteria;
import du.tum.student.enterpriseassetmanager.controller.dto.BatchHardwareRequest;
import du.tum.student.enterpriseassetmanager.controller.dto.BatchSoftwareRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

/**
 * REST Controller for managing Assets.
 * <p>
 * Provides endpoints for creating, retrieving, updating, and deleting assets
 * (Hardware and Software).
 * Also supports search, statistics, and batch operations.
 * </p>
 */
@RestController
@RequestMapping("api/v1/assets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssetController {
    private final AssetService assetService;

    /**
     * Creates a new Hardware Asset.
     *
     * @param asset the hardware asset to create
     * @return the created {@link Asset}
     */
    @PostMapping("/hardware")
    public Asset createHardware(@RequestBody HardwareAsset asset) {
        return assetService.createAsset(asset);
    }

    /**
     * Creates a new Software Asset.
     *
     * @param asset the software asset to create
     * @return the created {@link Asset}
     */
    @PostMapping("/software")
    public Asset createSoftware(@RequestBody SoftwareAsset asset) {
        return assetService.createAsset(asset);
    }

    /**
     * Retrieves a paginated list of all assets.
     *
     * @param page    the page number (default: 0)
     * @param size    the page size (default: 10)
     * @param sortBy  the property to sort by (default: "id")
     * @param sortDir the sort direction, "asc" or "desc" (default: "asc")
     * @return a {@link Page} of assets
     */
    @GetMapping
    public Page<Asset> getAllAssets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        // 1. Handle Sort Direction
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;

        // 2. Build Pageable object
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        // 3. Call Service
        return assetService.findAllAssets(pageable);
    }

    /**
     * Retrieves dashboard statistics.
     *
     * @return a {@link DashboardStatsDto} containing aggregated stats
     */
    @GetMapping("/stats")
    public DashboardStatsDto getStats() {
        return assetService.getDashboardStats();
    }

    /**
     * Retrieves a list of recently added assets.
     *
     * @return a list of the 5 most recently created assets
     */
    @GetMapping("/recent")
    public List<Asset> getRecentAssets() {
        return assetService.findRecentAssets();
    }

    /**
     * Calculates the current value of an asset based on depreciation.
     *
     * @param id the ID of the asset
     * @return the current value as {@link BigDecimal}
     */
    @GetMapping("/{id}/value")
    public BigDecimal getAssetValue(@PathVariable Long id) {
        return assetService.calculateValue(id);
    }

    /**
     * Searches for assets based on dynamic criteria.
     *
     * @param criteria the search criteria encapsulated in
     *                 {@link AssetSearchCriteria}
     * @param page     the page number (default: 0)
     * @param size     the page size (default: 10)
     * @param sortBy   the property to sort by (default: "id")
     * @param sortDir  the sort direction, "asc" or "desc" (default: "asc")
     * @return a {@link ResponseEntity} containing a {@link Page} of matching assets
     */
    @GetMapping("/search")
    public ResponseEntity<Page<Asset>> searchAssets(
            // Use @ModelAttribute to automatically bind request parameters to the DTO
            @ModelAttribute AssetSearchCriteria criteria,

            // Pagination parameters
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return ResponseEntity.ok(assetService.searchAssets(criteria, pageable));
    }

    /**
     * Updates an existing asset.
     * <p>
     * NOTE: Uses a {@code Map<String, Object>} to receive updates to bypass the
     * limitation
     * of instantiating the abstract {@link Asset} class directly.
     * </p>
     *
     * @param id      the ID of the asset to update
     * @param updates a map containing the fields to update
     * @return the updated {@link Asset} wrapped in {@link ResponseEntity}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Asset> updateAsset(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        // Create a temporary object to hold data
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

        // 3. Purchase Date
        if (updates.containsKey("purchaseDate")) {
            Object dateStr = updates.get("purchaseDate");
            if (dateStr != null && !dateStr.toString().isEmpty()) {
                // Frontend usually sends "yyyy-MM-dd" (ISO-8601), which can be parsed directly
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
     * Deletes an asset (Soft Delete).
     *
     * @param id the ID of the asset to delete
     * @return {@link ResponseEntity} with no content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Assigns an asset to a user.
     *
     * @param id      the ID of the asset to assign
     * @param payload a map containing the "userId" key
     * @return the updated {@link Asset}
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
     * Creates multiple Hardware assets in a batch.
     *
     * @param request the batch creation request for hardware
     * @return a list of created {@link Asset}s
     */
    @PostMapping("/batch/hardware")
    public ResponseEntity<List<Asset>> createBatchHardware(@RequestBody BatchHardwareRequest request) {
        return ResponseEntity.ok(assetService.createBatchHardware(request));
    }

    /**
     * Creates multiple Software assets in a batch.
     *
     * @param request the batch creation request for software
     * @return a list of created {@link Asset}s
     */
    @PostMapping("/batch/software")
    public ResponseEntity<List<Asset>> createBatchSoftware(@RequestBody BatchSoftwareRequest request) {
        return ResponseEntity.ok(assetService.createBatchSoftware(request));
    }
}
