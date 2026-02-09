<details open>
<summary><strong>English</strong></summary>

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
    %% 1. Frontend Container
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
    %% 2. Backend Container
    %% ==========================================
    subgraph Backend_Container ["Docker: eam-backend (Port 8080)"]
        direction TB
        
        %% --- A. Config & Setup ---
        subgraph Config_Layer ["Configuration & Setup"]
            direction LR
            SecConfig["SecurityConfig"]
            JwtFilter["JwtAuthenticationFilter"]
            DataInit["DataInitializer<br/>(Creates Admin User)"]
            AuditAware["ApplicationAuditAware<br/>(Auditing)"]
        end

        %% --- B. Controller Layer ---
        subgraph Controller_Layer ["Controller Layer (REST API)"]
            AuthCtrl["AuthenticationController"]
            AssetCtrl["AssetController"]
            UserCtrl["UserController"]
            AdminCtrl["AdminUserController"]
        end

        %% --- C. DTOs ---
        subgraph DTO_Layer ["DTO Data Carriers"]
            direction TB
            AuthDTOs["<b>Auth:</b><br/>RegisterRequest<br/>AuthRequest/Response"]
            AssetDTOs["<b>Asset:</b><br/>BatchHardwareRequest<br/>BatchSoftwareRequest<br/>DashboardStatsDto"]
            SearchDTOs["<b>Filter:</b><br/>AssetSearchCriteria"]
            UserDTOs["<b>User:</b><br/>UserSummaryDto"]
        end

        %% --- D. Service Layer ---
        subgraph Service_Layer ["Service Layer (Logic)"]
            AuthSvc["AuthenticationService"]
            AssetSvc["AssetService"]
            UserSvc["UserService"]
            JwtSvc["JwtService"]
            DeprCalc["DepreciationCalculator<br/>(Linear Strategy)"]
        end

        %% --- E. Repository Layer ---
        subgraph Repository_Layer ["Data Access Layer (JPA)"]
            AssetRepo["AssetRepository"]
            UserRepo["UserRepository"]
            AssetSpec["AssetSpecification<br/>(Complex Search)"]
        end

        %% ==================== Connections ====================
        
        %% 1. External Requests
        Axios ==> JwtFilter
        JwtFilter -.->|Verify Token| JwtSvc
        JwtFilter ==> Controller_Layer

        %% 2. Controller uses DTO
        Controller_Layer -.->|Validates| DTO_Layer
        DTO_Layer -.->|Transfers to| Service_Layer

        %% 3. Controller -> Service calls
        AuthCtrl --> AuthSvc
        AssetCtrl --> AssetSvc
        UserCtrl --> UserSvc
        AdminCtrl --> UserSvc

        %% 4. Service Logic Dependencies
        AuthSvc --> JwtSvc
        AssetSvc -.->|Calculates| DeprCalc
        
        %% 5. Service -> Repository
        AuthSvc --> UserRepo
        UserSvc --> UserRepo
        AssetSvc --> AssetRepo
        AssetSvc -.->|Builds Query| AssetSpec
        AssetSpec -.->|Filters| AssetRepo

        %% 6. Init & Auditing
        DataInit --> UserRepo
        AuditAware -.->|Injects User| AssetRepo
    end

    %% ==========================================
    %% 3. Database Container
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
    %% Cross-layer Connections
    %% ==========================================
    AssetRepo ==> Postgres
    UserRepo ==> Postgres

    %% ==========================================
    %% Styles
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

#### Frontend Architecture
```mermaid
graph TD
    %% ==========================================
    %% 1. Entry & Routing
    %% ==========================================
    subgraph Core_Layer ["Application Core"]
        direction TB
        Main["main.tsx<br/>(Entry Point)"]
        App["App.tsx<br/>(Router & Providers)"]
        
        Main --> App
    end

    %% ==========================================
    %% 2. UI Structure
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

        %% UI 
        App -->|"Route: /login"| Login
        App -->|"Route: /register"| Register
        App -->|"Route: /"| DashLayout
        
        DashLayout -->|"Outlet: /dashboard"| Dashboard
        DashLayout -->|"Outlet: /users"| Users
        
        Dashboard -.->|"Opens"| AddModal
        Dashboard -.->|"Opens"| AssignModal
    end

    %% ==========================================
    %% 3.Logic & Hooks
    %% ==========================================
    subgraph Logic_Layer ["Logic Layer (Hooks & State)"]
        direction TB
        
        useStats["Hook: useDashboardStats.ts<br/>(Fetch Stats Logic)"]
        useAuth["(Implicit)<br/>Auth Context/State"]
        
        Dashboard --> useStats
    end

    %% ==========================================
    %% 4.Service Layer - API Proxies
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
    %% 5. Network Infrastructure
    %% ==========================================
    subgraph Infra_Layer ["Infrastructure"]
        direction TB
        
        AxiosInstance["lib/api.ts<br/>(Axios Instance)"]
        Interceptors["Interceptors<br/>(Request: Add Bearer Token)<br/>(Response: Handle 403/401)"]
        
        AxiosInstance --> Interceptors
    end

    %% ==========================================
    %% Cross-layer Connections
    %% ==========================================
    AuthSvc --> AxiosInstance
    AssetSvc --> AxiosInstance
    UserSvc --> AxiosInstance
    AdminSvc --> AxiosInstance
    
    Interceptors == "HTTP Request (JSON)" ==> Backend((Backend API))

    %% ==========================================
    %% Styles
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
    git clone https://github.com/your-username/enterprise-asset-manager.git
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

</details>

<details>
<summary><strong>Deutsch</strong></summary>

# Enterprise Asset Manager

> Eine robuste Full-Stack-Lösung zur Orchestrierung des gesamten Lebenszyklus von Organisationsanlagen – von der Anschaffung bis zur Entsorgung – mit Echtzeit-Finanzprüfung und sicherer Zugriffskontrolle.

![Status](https://img.shields.io/badge/Status-Aktiv-success?style=flat-square)
![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-green?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Bereit-2496ED?style=flat-square&logo=docker)

## 💡 Einführung

**Enterprise Asset Manager (EAM)** überbrückt die Lücke zwischen IT-Betrieb und finanzieller Rechenschaftspflicht. Es wurde entwickelt, um das Chaos der Tabellenverfolgung zu lösen, indem es eine zentralisierte, containerisierte Plattform für die Verwaltung von Hardware- und Software-Assets bietet.

Im Gegensatz zu einfachen Bestandslisten bietet EAM ein **intelligentes Lebenszyklusmanagement** – automatische Berechnung der Abschreibung, Verfolgung der Zuweisungshistorie und Sicherstellung der Datenintegrität durch streng typisierte APIs und Audit-Trails. Egal, ob Sie Laptop-Seriennummern oder Software-Lizenzabläufe verfolgen, EAM bietet die nötige Transparenz zur Optimierung der Ressourcenverteilung.

## ✨ Hauptmerkmale

* **Einheitliches Asset-Register**: Getrennte Behandlung für **Hardware** (Seriennummern) und **Software** (Lizenzen) mit polymorphen Datenstrukturen.
* **Echtzeit-Analyse-Dashboard**: Sofortige Visualisierung des Gesamtvermögenswerts, aktiver Lizenzen und Verfügbarkeitsstatus.
* **Erweiterte Suche & Filterung**: Serverseitige Paginierung, Sortierung und dynamische Filterung zur effizienten Handhabung großer Datensätze.
* **Audit & Compliance**: Der integrierte `AuditingEntityListener` zeichnet automatisch Ersteller- und Änderungszeitstempel für jeden Datensatz auf.
* **Lebenszyklus-Automatisierung**: "Soft Delete"-Funktionalität bewahrt historische Daten, indem Assets als `DISPOSED` markiert werden, anstatt sie dauerhaft zu entfernen.
* **Sicher & Zustandslos**: Vollständiger JWT-basierter Authentifizierungsflow, integriert mit Spring Security.

## 🛠 Tech Stack

### **Backend (Der Kern)**
* **Framework**: Spring Boot (Web, Data JPA, Validation)
* **Sicherheit**: Spring Security + JWT (Zustandslose Authentifizierung)
* **Datenbank**: PostgreSQL 16
* **Build-Tool**: Gradle (Java 21 Toolchain)
* **Dienstprogramme**: Lombok, Jackson

### **Frontend (Die Oberfläche)**
* **Framework**: React 18 + TypeScript
* **Build-System**: Vite
* **Styling**: Tailwind CSS + Lucide React (Icons)
* **Zustand/Netzwerk**: Axios + Custom Hooks

### **Infrastruktur**
* **Containerisierung**: Docker & Docker Compose
* **Netzwerk**: Internes Bridge-Netzwerk (`eam-network`)

### 🏗️ Architekturdiagramme

#### Systemarchitektur

```mermaid
graph TD
    %% ==========================================
    %% 1. Frontend Container
    %% ==========================================
    subgraph Frontend_Container ["Docker: eam-frontend (Port 3000)"]
        direction TB
        ReactApp[["React SPA<br/>(Vite + TypeScript)"]]
        Axios[("Axios HTTP-Client")]
        
        ReactApp --> Axios
        
        noteFront["<b>UI-Seiten:</b><br/>- Admin-Panel (Benutzerverwaltung)<br/>- Batch-Import (HW/SW)<br/>- Dashboard (Diagramme)"]
        ReactApp -.- noteFront
    end

    %% ==========================================
    %% 2. Backend Container
    %% ==========================================
    subgraph Backend_Container ["Docker: eam-backend (Port 8080)"]
        direction TB
        
        %% --- A. Konfiguration & Setup ---
        subgraph Config_Layer ["Konfiguration & Setup"]
            direction LR
            SecConfig["SecurityConfig"]
            JwtFilter["JwtAuthenticationFilter"]
            DataInit["DataInitializer<br/>(Erstellt Admin-User)"]
            AuditAware["ApplicationAuditAware<br/>(Auditierung)"]
        end

        %% --- B. Controller-Layer ---
        subgraph Controller_Layer ["Controller-Schicht (REST API)"]
            AuthCtrl["AuthenticationController"]
            AssetCtrl["AssetController"]
            UserCtrl["UserController"]
            AdminCtrl["AdminUserController"]
        end

        %% --- C. DTOs ---
        subgraph DTO_Layer ["DTO Datenträger"]
            direction TB
            AuthDTOs["<b>Auth:</b><br/>RegisterRequest<br/>AuthRequest/Response"]
            AssetDTOs["<b>Asset:</b><br/>BatchHardwareRequest<br/>BatchSoftwareRequest<br/>DashboardStatsDto"]
            SearchDTOs["<b>Filter:</b><br/>AssetSearchCriteria"]
            UserDTOs["<b>User:</b><br/>UserSummaryDto"]
        end

        %% --- D. Service-Layer ---
        subgraph Service_Layer ["Service-Schicht (Logik)"]
            AuthSvc["AuthenticationService"]
            AssetSvc["AssetService"]
            UserSvc["UserService"]
            JwtSvc["JwtService"]
            DeprCalc["DepreciationCalculator<br/>(Lineare Strategie)"]
        end

        %% --- E. Repository-Layer ---
        subgraph Repository_Layer ["Datenzugriffsschicht (JPA)"]
            AssetRepo["AssetRepository"]
            UserRepo["UserRepository"]
            AssetSpec["AssetSpecification<br/>(Komplexe Suche)"]
        end

        %% ==================== Verbindungen ====================
        
        %% 1. Externe Anfragen
        Axios ==> JwtFilter
        JwtFilter -.->|Token prüfen| JwtSvc
        JwtFilter ==> Controller_Layer

        %% 2. Controller nutzt DTO
        Controller_Layer -.->|Validiert| DTO_Layer
        DTO_Layer -.->|Transferiert an| Service_Layer

        %% 3. Controller -> Service Aufrufe
        AuthCtrl --> AuthSvc
        AssetCtrl --> AssetSvc
        UserCtrl --> UserSvc
        AdminCtrl --> UserSvc

        %% 4. Service-Logik Abhängigkeiten
        AuthSvc --> JwtSvc
        AssetSvc -.->|Berechnet| DeprCalc
        
        %% 5. Service -> Repository
        AuthSvc --> UserRepo
        UserSvc --> UserRepo
        AssetSvc --> AssetRepo
        AssetSvc -.->|Erstellt Query| AssetSpec
        AssetSpec -.->|Filtert| AssetRepo

        %% 6. Init & Auditierung
        DataInit --> UserRepo
        AuditAware -.->|Injiziert User| AssetRepo
    end

    %% ==========================================
    %% 3. Datenbank Container
    %% ==========================================
    subgraph DB_Container ["Docker: eam-postgres (Port 5432)"]
        direction TB
        Postgres[("PostgreSQL")]
        
        subgraph Schema ["Datenbankschema"]
            UserTable["Tabelle: _user<br/>(enabled, role...)"]
            AssetTable["Tabelle: asset<br/>(Vererbungstyp: JOINED)"]
            HW_Table["Tabelle: hardware_asset"]
            SW_Table["Tabelle: software_asset"]
        end

        UserTable --> AssetTable
        AssetTable --- HW_Table
        AssetTable --- SW_Table
    end

    %% ==========================================
    %% Schichtübergreifende Verbindungen
    %% ==========================================
    AssetRepo ==> Postgres
    UserRepo ==> Postgres

    %% ==========================================
    %% Stile
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

#### Frontend-Architektur
```mermaid
graph TD
    %% ==========================================
    %% 1. Einstieg & Routing
    %% ==========================================
    subgraph Core_Layer ["Anwendungskern"]
        direction TB
        Main["main.tsx<br/>(Einstiegspunkt)"]
        App["App.tsx<br/>(Router & Provider)"]
        
        Main --> App
    end

    %% ==========================================
    %% 2. UI-Struktur
    %% ==========================================
    subgraph UI_Layer ["UI-Schicht (Komponenten & Seiten)"]
        direction TB
        
        %% Layout
        DashLayout["DashboardLayout.tsx<br/>(Sidebar, Navbar, Outlet)"]
        
        %% Öffentliche Seiten
        subgraph Public_Pages ["Öffentliche Routen"]
            Login["Login.tsx"]
            Register["Register.tsx"]
        end
        
        %% Geschützte Seiten
        subgraph Protected_Pages ["Geschützte Routen"]
            Dashboard["Dashboard.tsx<br/>(Asset-Diagramme & Tabellen)"]
            Users["Users.tsx<br/>(Benutzerverwaltung)"]
        end
        
        %% Modals / Komponenten
        subgraph Components ["Gemeinsame Komponenten"]
            AddModal["AddAssetModal.tsx"]
            AssignModal["AssignAssetModal.tsx"]
        end

        %% UI 
        App -->|"Route: /login"| Login
        App -->|"Route: /register"| Register
        App -->|"Route: /"| DashLayout
        
        DashLayout -->|"Outlet: /dashboard"| Dashboard
        DashLayout -->|"Outlet: /users"| Users
        
        Dashboard -.->|"Öffnet"| AddModal
        Dashboard -.->|"Öffnet"| AssignModal
    end

    %% ==========================================
    %% 3. Logik & Hooks
    %% ==========================================
    subgraph Logic_Layer ["Logik-Schicht (Hooks & Status)"]
        direction TB
        
        useStats["Hook: useDashboardStats.ts<br/>(Statistik laden)"]
        useAuth["(Implizit)<br/>Auth Kontext/Status"]
        
        Dashboard --> useStats
    end

    %% ==========================================
    %% 4. Service-Layer - API Proxies
    %% ==========================================
    subgraph Service_Layer ["Service-Schicht (API-Definitionen)"]
        direction TB
        noteService["Spiegelt Backend-Controller"]
        
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
    %% 5. Netzwerkinfrastruktur
    %% ==========================================
    subgraph Infra_Layer ["Infrastruktur"]
        direction TB
        
        AxiosInstance["lib/api.ts<br/>(Axios Instanz)"]
        Interceptors["Interceptors<br/>(Anfrage: Bearer Token hinzufügen)<br/>(Antwort: 403/401 behandeln)"]
        
        AxiosInstance --> Interceptors
    end

    %% ==========================================
    %% Schichtübergreifende Verbindungen
    %% ==========================================
    AuthSvc --> AxiosInstance
    AssetSvc --> AxiosInstance
    UserSvc --> AxiosInstance
    AdminSvc --> AxiosInstance
    
    Interceptors == "HTTP-Anfrage (JSON)" ==> Backend((Backend API))

    %% ==========================================
    %% Stile
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

## 🚀 Schnellstart

### Voraussetzungen
* **Docker** & **Docker Compose** (Empfohlen)
* *Oder für lokale Entwicklung*: Java 21, Node.js 18+, PostgreSQL

### Installation

Das Projekt ist mit `docker-compose` für eine einstufige Bereitstellung vorkonfiguriert.

1.  **Repository klonen**
    ```bash
    git clone https://github.com/your-username/enterprise-asset-manager.git
    cd enterprise-asset-manager
    ```

2.  **Anwendung starten**
    ```bash
    # Erstellt sowohl Backend- als auch Frontend-Images und startet die Datenbank
    docker-compose up --build
    ```

3.  **Zugriff auf das System**
    * **Frontend**: [http://localhost:3000](http://localhost:3000)
    * **Backend API**: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
    * **API Docs (Swagger)**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)


## 💻 Nutzung

### API-Logik Beispiel
EAM verwendet ein polymorphes API-Design. Unten ist ein Beispiel dafür, wie das Backend die Erstellung von Assets handhabt und je nach Endpunkt zwischen Hardware und Software unterscheidet.

```java
// AssetController.java
@RestController
@RequestMapping("api/v1/assets")
public class AssetController {

    // Dedizierter Endpunkt für Hardware (benötigt Seriennummer)
    @PostMapping("/hardware")
    public Asset createHardware(@RequestBody HardwareAsset asset) {
        return assetService.createAsset(asset);
    }

    // Dedizierter Endpunkt für Software (benötigt Lizenzschlüssel)
    @PostMapping("/software")
    public Asset createSoftware(@RequestBody SoftwareAsset asset) {
        return assetService.createAsset(asset);
    }
    
    // Universelle Suche mit Paginierung
    @GetMapping("/search")
    public Page<Asset> searchAssets(@ModelAttribute AssetSearchCriteria criteria, Pageable pageable) {
        return assetService.searchAssets(criteria, pageable);
    }
}
```

### Dashboard-Ansicht

Das Frontend nutzt einen benutzerdefinierten Hook `useDashboardStats`, um Finanzdaten zu aggregieren:

```typescript
// Dashboard.tsx
const { stats } = useDashboardStats();

// Formatiert Währung automatisch basierend auf dem Gebietsschema
<StatCard 
    title="Gesamtwert" 
    value={formatCurrency(stats?.totalValue ?? 0)} 
    icon={<DollarSign />} 
/>
```

## ⚙️ Konfiguration

Die Anwendung wird über Umgebungsvariablen konfiguriert. Sie können diese in der `docker-compose.yml` anpassen.

| Variable | Beschreibung | Standard |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` | PostgreSQL-Verbindungs-URL | `jdbc:postgresql://db:5432/...` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Verwaltung des Datenbankschemas | `update` |
| `APPLICATION_SECURITY_JWT_SECRET_KEY` | 256-Bit-Schlüssel zum Signieren von Token | *(Siehe docker-compose)* |
| `APPLICATION_SECURITY_JWT_EXPIRATION` | Token-Gültigkeit in Millisekunden | `86400000` (24h) |
| `POSTGRES_DB` | Datenbankname | `asset_management_db` |

## 🤝 Mitwirken

1. Projekt forken
2. Feature-Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. In den Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request öffnen

</details>

<details>
<summary><strong>中文 (Chinese)</strong></summary>

# 企业资产管理器 (Enterprise Asset Manager)

> 一个强大的全栈解决方案，用于编排企业资产的完整生命周期——从采购到处置——具有实时财务审计和安全访问控制。

![状态](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-green?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)

## 💡 简介

**企业资产管理器 (EAM)** 弥合了 IT 运营与财务责任之间的差距。它旨在通过提供一个集中的、容器化的平台来管理硬件和软件资产，从而解决电子表格追踪的混乱问题。

与简单的库存清单不同，EAM 提供**智能生命周期管理**——自动计算折旧，追踪分配历史，并通过严格类型的 API 和审计跟踪确保数据完整性。无论您是追踪笔记本电脑序列号还是软件许可证过期时间，EAM 都能提供优化资源分配所需的可见性。

## ✨ 核心功能

* **统一资产注册**: 针对 **硬件** (序列号) 和 **软件** (许可证) 的不同处理，采用多态数据结构。
* **实时分析仪表板**: 即时可视化总资产价值、活动许可证和可用状态。
* **高级搜索与过滤**: 服务器端分页、排序和动态过滤，以高效处理大数据集。
* **审计与合规**: 内置 `AuditingEntityListener` 自动记录每条记录的创建者和修改者时间戳。
* **生命周期自动化**: “软删除”功能通过将资产标记为 `DISPOSED` 而不是永久删除，来保留历史数据。
* **安全且无状态**: 集成 Spring Security 的完整基于 JWT 的认证流程。

## 🛠 技术栈

### **后端 (核心)**
* **框架**: Spring Boot (Web, Data JPA, Validation)
* **安全**: Spring Security + JWT (无状态认证)
* **数据库**: PostgreSQL 16
* **构建工具**: Gradle (Java 21 Toolchain)
* **工具库**: Lombok, Jackson

### **前端 (界面)**
* **框架**: React 18 + TypeScript
* **构建系统**: Vite
* **样式**: Tailwind CSS + Lucide React (图标)
* **状态/网络**: Axios + 自定义 Hooks

### **基础设施**
* **容器化**: Docker & Docker Compose
* **网络**: 内部桥接网络 (`eam-network`)

### 🏗️ 架构图

#### 系统架构

```mermaid
graph TD
    %% ==========================================
    %% 1. 前端容器
    %% ==========================================
    subgraph Frontend_Container ["Docker: eam-frontend (端口 3000)"]
        direction TB
        ReactApp[["React SPA<br/>(Vite + TypeScript)"]]
        Axios[("Axios HTTP 客户端")]
        
        ReactApp --> Axios
        
        noteFront["<b>UI 页面:</b><br/>- 管理面板 (用户管理)<br/>- 批量导入 (HW/SW)<br/>- 仪表板 (图表)"]
        ReactApp -.- noteFront
    end

    %% ==========================================
    %% 2. 后端容器
    %% ==========================================
    subgraph Backend_Container ["Docker: eam-backend (端口 8080)"]
        direction TB
        
        %% --- A. 配置与初始化 ---
        subgraph Config_Layer ["配置与设置"]
            direction LR
            SecConfig["SecurityConfig"]
            JwtFilter["JwtAuthenticationFilter"]
            DataInit["DataInitializer<br/>(创建管理员用户)"]
            AuditAware["ApplicationAuditAware<br/>(审计)"]
        end

        %% --- B. 控制层 ---
        subgraph Controller_Layer ["控制层 (REST API)"]
            AuthCtrl["AuthenticationController"]
            AssetCtrl["AssetController"]
            UserCtrl["UserController"]
            AdminCtrl["AdminUserController"]
        end

        %% --- C. DTO 数据载体 ---
        subgraph DTO_Layer ["DTO 数据载体"]
            direction TB
            AuthDTOs["<b>认证:</b><br/>RegisterRequest<br/>AuthRequest/Response"]
            AssetDTOs["<b>资产:</b><br/>BatchHardwareRequest<br/>BatchSoftwareRequest<br/>DashboardStatsDto"]
            SearchDTOs["<b>过滤:</b><br/>AssetSearchCriteria"]
            UserDTOs["<b>用户:</b><br/>UserSummaryDto"]
        end

        %% --- D. 服务层 ---
        subgraph Service_Layer ["服务层 (逻辑)"]
            AuthSvc["AuthenticationService"]
            AssetSvc["AssetService"]
            UserSvc["UserService"]
            JwtSvc["JwtService"]
            DeprCalc["DepreciationCalculator<br/>(线性策略)"]
        end

        %% --- E. 数据访问层 ---
        subgraph Repository_Layer ["数据访问层 (JPA)"]
            AssetRepo["AssetRepository"]
            UserRepo["UserRepository"]
            AssetSpec["AssetSpecification<br/>(复杂搜索)"]
        end

        %% ==================== 连接关系 ====================
        
        %% 1. 外部请求进入
        Axios ==> JwtFilter
        JwtFilter -.->|验证 Token| JwtSvc
        JwtFilter ==> Controller_Layer

        %% 2. Controller 使用 DTO
        Controller_Layer -.->|验证| DTO_Layer
        DTO_Layer -.->|传输至| Service_Layer

        %% 3. 具体 Controller -> Service 调用
        AuthCtrl --> AuthSvc
        AssetCtrl --> AssetSvc
        UserCtrl --> UserSvc
        AdminCtrl --> UserSvc

        %% 4. Service 逻辑依赖
        AuthSvc --> JwtSvc
        AssetSvc -.->|计算| DeprCalc
        
        %% 5. Service -> Repository
        AuthSvc --> UserRepo
        UserSvc --> UserRepo
        AssetSvc --> AssetRepo
        AssetSvc -.->|构建查询| AssetSpec
        AssetSpec -.->|过滤| AssetRepo

        %% 6. 初始化与审计
        DataInit --> UserRepo
        AuditAware -.->|注入用户| AssetRepo
    end

    %% ==========================================
    %% 3. 数据库容器
    %% ==========================================
    subgraph DB_Container ["Docker: eam-postgres (端口 5432)"]
        direction TB
        Postgres[("PostgreSQL")]
        
        subgraph Schema ["数据库架构"]
            UserTable["表: _user<br/>(enabled, role...)"]
            AssetTable["表: asset<br/>(继承类型: JOINED)"]
            HW_Table["表: hardware_asset"]
            SW_Table["表: software_asset"]
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

#### 前端架构
```mermaid
graph TD
    %% ==========================================
    %% 1. 入口与路由
    %% ==========================================
    subgraph Core_Layer ["应用核心"]
        direction TB
        Main["main.tsx<br/>(入口点)"]
        App["App.tsx<br/>(路由与提供者)"]
        
        Main --> App
    end

    %% ==========================================
    %% 2. UI 结构
    %% ==========================================
    subgraph UI_Layer ["UI 层 (组件与页面)"]
        direction TB
        
        %% 布局
        DashLayout["DashboardLayout.tsx<br/>(侧边栏, 导航栏, Outlet)"]
        
        %% 公共页面
        subgraph Public_Pages ["公共路由"]
            Login["Login.tsx"]
            Register["Register.tsx"]
        end
        
        %% 受保护页面
        subgraph Protected_Pages ["受保护路由"]
            Dashboard["Dashboard.tsx<br/>(资产图表与表格)"]
            Users["Users.tsx<br/>(用户管理)"]
        end
        
        %% 模态框 / 组件
        subgraph Components ["共享组件"]
            AddModal["AddAssetModal.tsx"]
            AssignModal["AssignAssetModal.tsx"]
        end

        %% UI 
        App -->|"路由: /login"| Login
        App -->|"路由: /register"| Register
        App -->|"路由: /"| DashLayout
        
        DashLayout -->|"Outlet: /dashboard"| Dashboard
        DashLayout -->|"Outlet: /users"| Users
        
        Dashboard -.->|"打开"| AddModal
        Dashboard -.->|"打开"| AssignModal
    end

    %% ==========================================
    %% 3. 逻辑与 Hooks
    %% ==========================================
    subgraph Logic_Layer ["逻辑层 (Hooks & 状态)"]
        direction TB
        
        useStats["Hook: useDashboardStats.ts<br/>(获取统计逻辑)"]
        useAuth["(隐式)<br/>认证上下文/状态"]
        
        Dashboard --> useStats
    end

    %% ==========================================
    %% 4. 服务层 - API 代理
    %% ==========================================
    subgraph Service_Layer ["服务层 (API 定义)"]
        direction TB
        noteService["镜像后端控制器"]
        
        AuthSvc["authService.ts<br/>(登录, 注册)"]
        AssetSvc["assetService.ts<br/>(获取资产, 创建, 分配)"]
        UserSvc["userService.ts<br/>(获取所有用户)"]
        AdminSvc["adminService.ts<br/>(删除用户)"]
        
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
    %% 5. 网络基础设施
    %% ==========================================
    subgraph Infra_Layer ["基础设施"]
        direction TB
        
        AxiosInstance["lib/api.ts<br/>(Axios 实例)"]
        Interceptors["拦截器<br/>(请求: 添加 Bearer Token)<br/>(响应: 处理 403/401)"]
        
        AxiosInstance --> Interceptors
    end

    %% ==========================================
    %% 跨层连接
    %% ==========================================
    AuthSvc --> AxiosInstance
    AssetSvc --> AxiosInstance
    UserSvc --> AxiosInstance
    AdminSvc --> AxiosInstance
    
    Interceptors == "HTTP 请求 (JSON)" ==> Backend((后端 API))

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

## 🚀 快速开始

### 前提条件
* **Docker** & **Docker Compose** (推荐)
* *或者进行本地开发*: Java 21, Node.js 18+, PostgreSQL

### 安装

本项目预配置了 `docker-compose` 以便一步部署。

1.  **克隆仓库**
    ```bash
    git clone https://github.com/your-username/enterprise-asset-manager.git
    cd enterprise-asset-manager
    ```

2.  **启动应用程序**
    ```bash
    # 构建前后端镜像并启动数据库
    docker-compose up --build
    ```

3.  **访问系统**
    * **前端**: [http://localhost:3000](http://localhost:3000)
    * **后端 API**: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
    * **API 文档 (Swagger)**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)


## 💻 使用

### API 逻辑示例
EAM 使用多态 API 设计。以下是后端如何处理资产创建的示例，根据端点区分硬件和软件。

```java
// AssetController.java
@RestController
@RequestMapping("api/v1/assets")
public class AssetController {

    // 硬件专用端点 (需要序列号)
    @PostMapping("/hardware")
    public Asset createHardware(@RequestBody HardwareAsset asset) {
        return assetService.createAsset(asset);
    }

    // 软件专用端点 (需要许可证密钥)
    @PostMapping("/software")
    public Asset createSoftware(@RequestBody SoftwareAsset asset) {
        return assetService.createAsset(asset);
    }
    
    // 带有分页的通用搜索
    @GetMapping("/search")
    public Page<Asset> searchAssets(@ModelAttribute AssetSearchCriteria criteria, Pageable pageable) {
        return assetService.searchAssets(criteria, pageable);
    }
}
```

### 仪表板视图

前端使用自定义 Hook `useDashboardStats` 来聚合财务数据：

```typescript
// Dashboard.tsx
const { stats } = useDashboardStats();

// 根据区域设置自动格式化货币
<StatCard 
    title="总价值" 
    value={formatCurrency(stats?.totalValue ?? 0)} 
    icon={<DollarSign />} 
/>
```

## ⚙️ 配置

应用程序通过环境变量进行配置。您可以在 `docker-compose.yml` 中调整这些变量。

| 变量 | 描述 | 默认值 |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` | PostgreSQL 连接 URL | `jdbc:postgresql://db:5432/...` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | 数据库架构管理 | `update` |
| `APPLICATION_SECURITY_JWT_SECRET_KEY` | 用于签名令牌的 256 位密钥 | *(见 docker-compose)* |
| `APPLICATION_SECURITY_JWT_EXPIRATION` | 令牌有效期 (毫秒) | `86400000` (24h) |
| `POSTGRES_DB` | 数据库名称 | `asset_management_db` |

## 🤝 贡献代码

1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

</details>