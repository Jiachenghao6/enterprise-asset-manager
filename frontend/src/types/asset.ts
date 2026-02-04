/**
 * Asset Status enum matching backend AssetStatus.java
 */
export enum AssetStatus {
    AVAILABLE = 'AVAILABLE',   // In warehouse, can be used
    ASSIGNED = 'ASSIGNED',     // Already assigned to someone
    BROKEN = 'BROKEN',         // Broken, waiting for repair
    REPAIRING = 'REPAIRING',   // Sent for repair
    DISPOSED = 'DISPOSED',     // Scrapped
}

/**
 * Base Asset interface mirroring backend Asset.java
 */
export interface Asset {
    id: number;
    name: string;
    purchasePrice: number;
    purchaseDate: string; // ISO date string (LocalDate)
    status: AssetStatus;
    residualValue: number;
    usefulLifeYears: number;
    createdBy: string;
    createdAt: string; // ISO datetime string (LocalDateTime)
    lastModifiedBy?: string;
    lastModifiedAt?: string;
}

/**
 * Hardware Asset interface mirroring backend HardwareAsset.java
 */
export interface HardwareAsset extends Asset {
    type: 'HARDWARE';
    serialNumber: string;
    warrantyDate?: string;
    location: string;
    lastMaintenanceDate?: string;
    maintenanceIntervalMonths?: number;
}

/**
 * Software Asset interface mirroring backend SoftwareAsset.java
 */
export interface SoftwareAsset extends Asset {
    type: 'SOFTWARE';
    licenseKey: string;
    expiryDate?: string;
}

/**
 * Union type for any asset (hardware or software)
 */
export type AnyAsset = HardwareAsset | SoftwareAsset;

/**
 * Dashboard statistics interface for aggregated metrics
 */
export interface DashboardStats {
    totalAssets: number;
    totalValue: number;
    activeLicenses: number;
    availableAssets: number;
}

/**
 * Recent asset display type (simplified for table view)
 */
export interface RecentAsset {
    id: number;
    name: string;
    type: 'HARDWARE' | 'SOFTWARE';
    status: AssetStatus;
    currentValue: number;
    createdAt: string;
}
