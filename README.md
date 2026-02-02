# Enterprise Asset Manager (EAM)

> A robust, enterprise-grade RESTful API for managing corporate hardware and software assets, designed with SOLID principles and German engineering standards.

## 📋 Projektbeschreibung (Project Overview)
This project is a backend system developed to manage the lifecycle of enterprise assets. It handles asset registration, tracking, and complex financial calculations (Depreciation/Abschreibung). It is built to demonstrate:
- **Clean Architecture** & **SOLID Principles**.
- **Strategy Design Pattern** for flexible financial algorithms.
- **Type-safe** financial handling using `BigDecimal`.

## 🏗️ System Architecture (Architecture Overview)

The system follows a strict **Layered Architecture** (Controller-Service-Repository) and utilizes the **Strategy Pattern** to handle complex depreciation algorithms flexibly.

```mermaid
graph TD
    %% Styling
    classDef client fill:#f9f,stroke:#333,stroke-width:2px;
    classDef controller fill:#ffcc00,stroke:#333,stroke-width:2px;
    classDef service fill:#66ccff,stroke:#333,stroke-width:2px;
    classDef strategy fill:#99cc99,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5;
    classDef repo fill:#ff9999,stroke:#333,stroke-width:2px;
    classDef db fill:#cccccc,stroke:#333,stroke-width:2px;

    Client(User / API Client):::client
    
    subgraph Presentation Layer
        Controller[AssetController]:::controller
    end

    subgraph Business Layer
        Service[AssetService]:::service
        CalcInterface{{DepreciationCalculator}}:::strategy
        LinearStrat[LinearDepreciation]:::strategy
    end

    subgraph Data Access Layer
        Repo[AssetRepository]:::repo
    end

    subgraph Database
        DB[(H2 / PostgreSQL)]:::db
    end

    %% Flows
    Client -->|HTTP GET/POST| Controller
    Controller -->|DTO| Service
    
    Service -->|Calculate Value| CalcInterface
    CalcInterface <..|implements| LinearStrat
    
    Service -->|CRUD| Repo
    Repo -->|SQL| DB
   
## 🏗️ Architecture & Tech Stack
* **Framework**: Spring Boot 3.x (Java 17+)
* **Build Tool**: Gradle
* **Database**: H2 (In-Memory for Dev) / JPA (Hibernate)
* **Architecture**: Layered Architecture (Controller-Service-Repository)

## 🧩 Key Modules (Implemented)

### 1. Domain Model (Inheritance)
The system uses a polymorphic data model to distinguish between asset types while sharing common attributes.
* `Asset` (Abstract Base): `purchasePrice`, `purchaseDate`, `name`.
* `HardwareAsset`: Extends `Asset` (adds `serialNumber`, `location`).
* `SoftwareAsset`: Extends `Asset` (adds `licenseKey`, `version`).

### 2. Financial Logic (Strategy Pattern)
Calculates the current value of assets based on different accounting rules.
* **Interface**: `DepreciationCalculator`
* **Implementation**: `LinearDepreciation` (Calculates value reduction over time linearly).
    * *Why Strategy?* Allows switching between German GAAP (HGB) and IFRS accounting standards at runtime without modifying the core Asset class.

## 🚀 Getting Started

### Prerequisites
* JDK 17 or higher
* Gradle (Wrapper included)

### Installation
1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-repo/enterprise-asset-manager.git](https://github.com/your-repo/enterprise-asset-manager.git)
    ```
2.  **Build the project**
    ```bash
    ./gradlew clean build
    ```
3.  **Run the application**
    ```bash
    ./gradlew bootRun
    ```
4.  **Test the API** (Default port: 8080)
    * Get all assets: `GET http://localhost:8080/api/assets`
    * Create Hardware: `POST http://localhost:8080/api/assets/hardware`

## 🧪 Testing
Run unit tests to verify the depreciation logic:
```bash
./gradlew test


