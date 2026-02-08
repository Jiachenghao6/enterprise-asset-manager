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

// 在 UserSummary 中补充字段，与后端 UserSummaryDto 对应
export interface UserSummary {
    id: number;
    username: string;
    firstname?: string; // 新增
    lastname?: string;  // 新增
    email?: string;
}
// [Phase 3 新增] 通用分页响应接口 (对应后端的 Page<T>)
export interface Page<T> {
    content: T[];          // 数据列表
    totalPages: number;    // 总页数
    totalElements: number; // 总条数
    size: number;          // 每页大小
    number: number;        // 当前页码 (从0开始)
    first: boolean;
    last: boolean;
    empty: boolean;
}

// [Phase 3 修改] 升级搜索参数接口
export interface AssetSearchParams {
    // 原有的
    query?: string;
    status?: AssetStatus | '';

    // [Phase 2 新增] 精准搜索
    serialNumber?: string;
    assignedToUserId?: number;

    // [Phase 1 新增] 分页与排序
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}
