
# Enterprise Asset Manager (EAM)

> 🎓 **Werkstudent Portfolio Project**
> A robust, enterprise-grade RESTful API for managing corporate hardware and software assets, designed with SOLID principles and German engineering standards.

---

## 📋 Projektbeschreibung (Project Overview)

This project is a backend system developed to manage the lifecycle of enterprise assets. It handles asset registration, tracking, and complex financial calculations (Depreciation/Abschreibung).

It is designed to demonstrate:
- **Clean Architecture** & **SOLID Principles**.
- **Secure Access Control** using JWT (JSON Web Tokens) and Role-Based Access Control (RBAC).
- **Strategy Design Pattern** for flexible financial algorithms.
- **Auditing** for tracking data creation and modification.

---

## 🏗️ System Architecture & Tech Stack

The system follows a strict **Layered Architecture** secured by a stateless authentication filter chain.

### 🛠️ Technology Stack
* **Framework**: Spring Boot 4.0.1 (Java 21)
* **Security**: Spring Security 6, JWT (jjwt)
* **Documentation**: OpenAPI 3 (Swagger UI)
* **Database**: PostgreSQL
* **Build Tool**: Gradle
* **Testing**: JUnit 5

### 📊 Architecture Diagram
The following diagram illustrates the secure data flow:

```mermaid
graph TD
    %% Styling
    classDef client fill:#f9f,stroke:#333,stroke-width:2px;
    classDef security fill:#ff6666,stroke:#333,stroke-width:2px;
    classDef controller fill:#ffcc00,stroke:#333,stroke-width:2px;
    classDef service fill:#66ccff,stroke:#333,stroke-width:2px;
    classDef strategy fill:#99cc99,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5;
    classDef repo fill:#ff9999,stroke:#333,stroke-width:2px;
    classDef db fill:#cccccc,stroke:#333,stroke-width:2px;

    Client(User / API Client):::client
    
    subgraph Security Layer
        AuthFilter[JwtAuthenticationFilter]:::security
    end

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
        DB[(PostgreSQL)]:::db
    end

    %% Flows
    Client -->|HTTP Request + Bearer Token| AuthFilter
    AuthFilter -->|Authenticated| Controller
    AuthFilter --x|Invalid Token| Client
    
    Controller -->|DTO| Service
    Service -->|Calculate Value| CalcInterface
    LinearStrat -.->|implements| CalcInterface
    Service -->|CRUD| Repo
    Repo -->|SQL| DB

```

---

## 🧩 Key Modules

### 1. Security & Authentication (New)

The system implements **stateless authentication** using JWT.

* **Registration/Login**: Public endpoints to obtain a token.
* **Authorization Filter**: Intercepts requests to validate the `Bearer Token`.
* **RBAC**: Supports `USER` and `ADMIN` roles.

### 2. Domain Model (Inheritance)

Polymorphic data model to distinguish between asset types:

* **`Asset`** (Abstract Base): `purchasePrice`, `residualValue`, `usefulLifeYears`.
* *Audit Fields*: Automatically tracks `createdBy`, `createdAt`, `lastModifiedBy`.


* **`HardwareAsset`**: Adds `serialNumber`, `warrantyDate`.
* **`SoftwareAsset`**: Adds `licenseKey`, `expiryDate`.

### 3. Financial Logic (Strategy Pattern)

Calculates the *Current Value* (Buchwert) of assets dynamically.

* **Interface**: `DepreciationCalculator`
* **Logic**: Currently implements `LinearDepreciation`.
* **Standard**: Compliant with generic accounting principles, switchable at runtime.

---

## 🚀 Getting Started

### Prerequisites

* JDK 21
* Gradle (Wrapper included)
* PostgreSQL Database

### Installation

1. **Clone the repository**
```bash
git clone [https://github.com/your-username/enterprise-asset-manager.git](https://github.com/your-username/enterprise-asset-manager.git)

```


2. **Configure Database**
   Update `src/main/resources/application.properties` with your PostgreSQL credentials:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/your_db
spring.datasource.username=postgres
spring.datasource.password=password

```


3. **Build & Run**
```bash
./gradlew clean build
./gradlew bootRun

```


4. **Access API Documentation**
   Once running, visit Swagger UI to see all endpoints:
* URL: `http://localhost:8080/swagger-ui/index.html`



### 🔐 API Usage (Authentication Flow)

Since endpoints are secured, you must first authenticate:

**Step 1: Register a user**

```bash
POST http://localhost:8080/api/v1/auth/register
{
  "username": "admin",
  "password": "password123",
  "role": "ADMIN"
}

```

**Step 2: Login to get Token**

```bash
POST http://localhost:8080/api/v1/auth/authenticate
{
  "username": "admin",
  "password": "password123"
}
// Response: { "token": "eyJhbGciOiJIUzI1Ni..." }

```

**Step 3: Access Assets (with Token)**
Use the token in the `Authorization` header:

```bash
GET http://localhost:8080/api/v1/assets
Header: "Authorization: Bearer eyJhbGciOiJIUzI1Ni..."

```

---

## 🧪 Testing

Run unit tests to verify depreciation logic and security rules:

```bash
./gradlew test

```

---

## 📝 Roadmap (Next Sprint)

* [ ] **Unit Tests**: Increase coverage for Controller and Security layers.
* [ ] **Dockerization**: Add `Dockerfile` and `docker-compose.yml` for easy deployment.
* [ ] **Exception Handling**: Enhance global error messages for auth failures.

```

```