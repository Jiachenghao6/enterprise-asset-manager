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
    assignedTo?: UserSummary | null;
}

export interface UserSummary {
    id: number;
    username: string;
    email?: string;
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


export interface UserSummary {
    id: number;
    username: string;
    firstname?: string;
    lastname?: string;
    email?: string;
}
// [Phase 3 新增] 通用分页响应接口 (对应后端的 Page<T>)
export interface Page<T> {
    /** List of items on the current page. */
    content: T[];
    /** Total number of pages. */
    totalPages: number;
    /** Total number of items across all pages. */
    totalElements: number;
    /** Number of items per page. */
    size: number;
    /** Current page number (0-indexed). */
    number: number;
    /** Whether this is the first page. */
    first: boolean;
    /** Whether this is the last page. */
    last: boolean;
    /** Whether the page is empty. */
    empty: boolean;
}

/**
 * Parameters for searching and filtering assets.
 */
export interface AssetSearchParams {
    /** Fuzzy search query (name, serial, etc.). */
    query?: string;
    /** Filter by status. */
    status?: AssetStatus | '';

    /** Exact match for serial number. */
    serialNumber?: string;
    /** Filter by assigned user ID. */
    assignedToUserId?: number;

    /** Page number (0-indexed). */
    page?: number;
    /** Page size. */
    size?: number;
    /** Field to sort by. */
    sortBy?: string;
    /** Sort direction ('asc' or 'desc'). */
    sortDir?: 'asc' | 'desc';
}
