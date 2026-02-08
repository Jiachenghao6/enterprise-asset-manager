# Enterprise Asset Manager

> A robust, full-stack solution for orchestrating the complete lifecycle of organizational assets—from acquisition to disposal—with real-time financial auditing and secure access control.

![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-green?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)

## 💡 Introduction

**Enterprise Asset Manager (EAM)** bridges the gap between IT operations and financial accountability. It is designed to solve the chaos of spreadsheet-based tracking by providing a centralized, containerized platform for managing Hardware and Software assets.

Unlike simple inventory lists, EAM offers **intelligent lifecycle management**—automatically calculating depreciation, tracking assignment history, and ensuring data integrity through strictly typed APIs and audit trails. Whether you are tracking laptop serial numbers or software license expirations, EAM provides the visibility needed to optimize resource allocation.

## ✨ Key Features

* **Unified Asset Registry**: distinct handling for **Hardware** (Serial Numbers) and **Software** (Licenses) with polymorphic data structures.
* **Real-Time Analytics Dashboard**: Instant visualization of Total Asset Value, Active Licenses, and Availability status.
* **Advanced Search & Filtering**: Server-side pagination, sorting, and dynamic filtering to handle large datasets efficiently.
* **Audit & Compliance**: Built-in `AuditingEntityListener` automatically records creator and modifier timestamps for every record.
* **Lifecycle Automation**: "Soft Delete" functionality preserves historical data by marking assets as `DISPOSED` rather than permanently removing them.
* **Secure & Stateless**: Full JWT-based authentication flow integrated with Spring Security.

## 🛠 Tech Stack

### **Backend (The Core)**
* **Framework**: Spring Boot (Web, Data JPA, Validation)
* **Security**: Spring Security + JWT (Stateless Authentication)
* **Database**: PostgreSQL 16
* **Build Tool**: Gradle (Java 21 Toolchain)
* **Utilities**: Lombok, Jackson

### **Frontend (The Interface)**
* **Framework**: React 18 + TypeScript
* **Build System**: Vite
* **Styling**: Tailwind CSS + Lucide React (Icons)
* **State/Network**: Axios + Custom Hooks

### **Infrastructure**
* **Containerization**: Docker & Docker Compose
* **Networking**: Internal Bridge Network (`eam-network`)

### 🏗️ Architecture Diagrams

#### System Architecture

```mermaid
graph TD
    %% ==========================================
    %% 1. 前端容器
    %% ==========================================
    subgraph Frontend_Container ["Docker: eam-frontend (Port 3000)"]
        direction TB
        ReactApp[["React SPA<br/>(Vite + TypeScript)"]]
        Axios[("Axios HTTP Client")]
        
        ReactApp --> Axios
        
        noteFront["<b>UI Pages:</b><br/>- Admin Panel (User Mgmt)<br/>- Batch Import (HW/SW)<br/>- Dashboard (Charts)"]
        ReactApp -.- noteFront
    end

    %% ==========================================
    %% 2. 后端容器
    %% ==========================================
    subgraph Backend_Container ["Docker: eam-backend (Port 8080)"]
        direction TB
        
        %% --- A. 配置与初始化 ---
        subgraph Config_Layer ["Configuration & Setup"]
            direction LR
            SecConfig["SecurityConfig"]
            JwtFilter["JwtAuthenticationFilter"]
            DataInit["DataInitializer<br/>(Creates Admin User)"]
            AuditAware["ApplicationAuditAware<br/>(Auditing)"]
        end

        %% --- B. 控制层 ---
        subgraph Controller_Layer ["Controller Layer (REST API)"]
            AuthCtrl["AuthenticationController"]
            AssetCtrl["AssetController"]
            UserCtrl["UserController"]
            AdminCtrl["AdminUserController"]
        end

        %% --- C. 数据传输对象 (DTOs) ---
        subgraph DTO_Layer ["DTO Data Carriers"]
            direction TB
            AuthDTOs["<b>Auth:</b><br/>RegisterRequest<br/>AuthRequest/Response"]
            AssetDTOs["<b>Asset:</b><br/>BatchHardwareRequest<br/>BatchSoftwareRequest<br/>DashboardStatsDto"]
            SearchDTOs["<b>Filter:</b><br/>AssetSearchCriteria"]
            UserDTOs["<b>User:</b><br/>UserSummaryDto"]
        end

        %% --- D. 服务层 ---
        subgraph Service_Layer ["Service Layer (Logic)"]
            AuthSvc["AuthenticationService"]
            AssetSvc["AssetService"]
            UserSvc["UserService"]
            JwtSvc["JwtService"]
            DeprCalc["DepreciationCalculator<br/>(Linear Strategy)"]
        end

        %% --- E. 数据访问层 ---
        subgraph Repository_Layer ["Data Access Layer (JPA)"]
            AssetRepo["AssetRepository"]
            UserRepo["UserRepository"]
            AssetSpec["AssetSpecification<br/>(Complex Search)"]
        end

        %% ==================== 连线关系 ====================
        
        %% 1. 外部请求进入
        Axios ==> JwtFilter
        JwtFilter -.->|Verify Token| JwtSvc
        JwtFilter ==> Controller_Layer

        %% 2. Controller 使用 DTO
        Controller_Layer -.->|Validates| DTO_Layer
        DTO_Layer -.->|Transfers to| Service_Layer

        %% 3. 具体 Controller -> Service 调用
        AuthCtrl --> AuthSvc
        AssetCtrl --> AssetSvc
        UserCtrl --> UserSvc
        AdminCtrl --> UserSvc

        %% 4. Service 逻辑依赖
        AuthSvc --> JwtSvc
        AssetSvc -.->|Calculates| DeprCalc
        
        %% 5. Service -> Repository
        AuthSvc --> UserRepo
        UserSvc --> UserRepo
        AssetSvc --> AssetRepo
        AssetSvc -.->|Builds Query| AssetSpec
        AssetSpec -.->|Filters| AssetRepo

        %% 6. 初始化与审计
        DataInit --> UserRepo
        AuditAware -.->|Injects User| AssetRepo
    end

    %% ==========================================
    %% 3. 数据库容器
    %% ==========================================
    subgraph DB_Container ["Docker: eam-postgres (Port 5432)"]
        direction TB
        Postgres[("PostgreSQL")]
        
        subgraph Schema ["Database Schema"]
            UserTable["Table: _user<br/>(enabled, role...)"]
            AssetTable["Table: asset<br/>(Inheritance Type: JOINED)"]
            HW_Table["Table: hardware_asset"]
            SW_Table["Table: software_asset"]
        end

        UserTable --> AssetTable
        AssetTable --- HW_Table
        AssetTable --- SW_Table
    end

    %% ==========================================
    %% 跨层连接
    %% ==========================================
    AssetRepo ==> Postgres
    UserRepo ==> Postgres

    %% ==========================================
    %% 样式定义
    %% ==========================================
    classDef docker fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef config fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef dto fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,stroke-dasharray: 5 5;
    classDef spring fill:#6db33f,stroke:#3d6e24,stroke-width:2px,color:#ffffff;
    classDef db fill:#336791,stroke:#ffffff,stroke-width:2px,color:#ffffff;
    
    class Frontend_Container,Backend_Container,DB_Container docker;
    class SecConfig,JwtFilter,DataInit,AuditAware config;
    class AuthDTOs,AssetDTOs,SearchDTOs,UserDTOs dto;
    class AuthCtrl,AssetCtrl,UserCtrl,AdminCtrl,AuthSvc,AssetSvc,UserSvc,JwtSvc,DeprCalc,AssetSpec spring;
    class Postgres,UserTable,AssetTable,HW_Table,SW_Table db;
```

#### Frontend Architecture (前端架构)
```mermaid
graph TD
    %% ==========================================
    %% 1. 入口与路由层 (Entry & Routing)
    %% ==========================================
    subgraph Core_Layer ["Application Core"]
        direction TB
        Main["main.tsx<br/>(Entry Point)"]
        App["App.tsx<br/>(Router & Providers)"]
        
        Main --> App
    end

    %% ==========================================
    %% 2. 布局与页面层 (UI Structure)
    %% ==========================================
    subgraph UI_Layer ["UI Layer (Components & Pages)"]
        direction TB
        
        %% Layout
        DashLayout["DashboardLayout.tsx<br/>(Sidebar, Navbar, Outlet)"]
        
        %% Public Pages
        subgraph Public_Pages ["Public Routes"]
            Login["Login.tsx"]
            Register["Register.tsx"]
        end
        
        %% Protected Pages
        subgraph Protected_Pages ["Protected Routes"]
            Dashboard["Dashboard.tsx<br/>(Asset Charts & Tables)"]
            Users["Users.tsx<br/>(User Management)"]
        end
        
        %% Modals / Components
        subgraph Components ["Shared Components"]
            AddModal["AddAssetModal.tsx"]
            AssignModal["AssignAssetModal.tsx"]
        end

        %% UI 关系
        App -->|"Route: /login"| Login
        App -->|"Route: /register"| Register
        App -->|"Route: /"| DashLayout
        
        DashLayout -->|"Outlet: /dashboard"| Dashboard
        DashLayout -->|"Outlet: /users"| Users
        
        Dashboard -.->|"Opens"| AddModal
        Dashboard -.->|"Opens"| AssignModal
    end

    %% ==========================================
    %% 3. 逻辑与状态层 (Logic & Hooks)
    %% ==========================================
    subgraph Logic_Layer ["Logic Layer (Hooks & State)"]
        direction TB
        
        useStats["Hook: useDashboardStats.ts<br/>(Fetch Stats Logic)"]
        useAuth["(Implicit)<br/>Auth Context/State"]
        
        Dashboard --> useStats
    end

    %% ==========================================
    %% 4. 服务层 (Service Layer - API Proxies)
    %% ==========================================
    subgraph Service_Layer ["Service Layer (API Definitions)"]
        direction TB
        noteService["Mirrors Backend Controllers"]
        
        AuthSvc["authService.ts<br/>(login, register)"]
        AssetSvc["assetService.ts<br/>(getAssets, create, assign)"]
        UserSvc["userService.ts<br/>(getAllUsers)"]
        AdminSvc["adminService.ts<br/>(deleteUser)"]
        
        Login --> AuthSvc
        Register --> AuthSvc
        
        useStats --> AssetSvc
        Dashboard --> AssetSvc
        AddModal --> AssetSvc
        AssignModal --> AssetSvc
        
        Users --> UserSvc
        Users --> AdminSvc
    end

    %% ==========================================
    %% 5. 网络基础设施 (Network Infrastructure)
    %% ==========================================
    subgraph Infra_Layer ["Infrastructure"]
        direction TB
        
        AxiosInstance["lib/api.ts<br/>(Axios Instance)"]
        Interceptors["Interceptors<br/>(Request: Add Bearer Token)<br/>(Response: Handle 403/401)"]
        
        AxiosInstance --> Interceptors
    end

    %% ==========================================
    %% 跨层连接
    %% ==========================================
    AuthSvc --> AxiosInstance
    AssetSvc --> AxiosInstance
    UserSvc --> AxiosInstance
    AdminSvc --> AxiosInstance
    
    Interceptors == "HTTP Request (JSON)" ==> Backend((Backend API))

    %% ==========================================
    %% 样式定义
    %% ==========================================
    classDef core fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    classDef ui fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef logic fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef service fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef infra fill:#eceff1,stroke:#455a64,stroke-width:2px;
    
    class Main,App core;
    class Login,Register,Dashboard,Users,DashLayout,AddModal,AssignModal ui;
    class useStats,useAuth logic;
    class AuthSvc,AssetSvc,UserSvc,AdminSvc service;
    class AxiosInstance,Interceptors infra;
```

## 🚀 Quick Start

### Prerequisites
* **Docker** & **Docker Compose** (Recommended)
* *Or for local dev*: Java 21, Node.js 18+, PostgreSQL

### Installation

The project is pre-configured with `docker-compose` for a one-step deployment.

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/enterprise-asset-manager.git](https://github.com/your-username/enterprise-asset-manager.git)
    cd enterprise-asset-manager
    ```

2.  **Start the Application**
    ```bash
    # Builds both backend and frontend images and starts the database
    docker-compose up --build
    ```

3.  **Access the System**
    * **Frontend**: [http://localhost:3000](http://localhost:3000)
    * **Backend API**: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
    * **API Docs (Swagger)**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)



## 💻 Usage

### API Logic Example
EAM uses a polymorphic API design. Below is an example of how the backend handles asset creation, differentiating between Hardware and Software based on the endpoint.

```java
// AssetController.java
@RestController
@RequestMapping("api/v1/assets")
public class AssetController {

    // Dedicated endpoint for Hardware (requires Serial Number)
    @PostMapping("/hardware")
    public Asset createHardware(@RequestBody HardwareAsset asset) {
        return assetService.createAsset(asset);
    }

    // Dedicated endpoint for Software (requires License Key)
    @PostMapping("/software")
    public Asset createSoftware(@RequestBody SoftwareAsset asset) {
        return assetService.createAsset(asset);
    }
    
    // Universal Search with Pagination
    @GetMapping("/search")
    public Page<Asset> searchAssets(@ModelAttribute AssetSearchCriteria criteria, Pageable pageable) {
        return assetService.searchAssets(criteria, pageable);
    }
}

```

### Dashboard View

The frontend utilizes a custom hook `useDashboardStats` to aggregate financial data:

```typescript
// Dashboard.tsx
const { stats } = useDashboardStats();

// Automatically formats currency based on locale
<StatCard 
    title="Total Value" 
    value={formatCurrency(stats?.totalValue ?? 0)} 
    icon={<DollarSign />} 
/>

```

## ⚙️ Configuration

The application is configured via environment variables. You can adjust these in `docker-compose.yml`.

| Variable | Description | Default |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` | PostgreSQL connection URL | `jdbc:postgresql://db:5432/...` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Database schema management | `update` |
| `APPLICATION_SECURITY_JWT_SECRET_KEY` | 256-bit key for signing tokens | *(See docker-compose)* |
| `APPLICATION_SECURITY_JWT_EXPIRATION` | Token validity in milliseconds | `86400000` (24h) |
| `POSTGRES_DB` | Database Name | `asset_management_db` |

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

```

```