# Architecture & Infrastructure
 
Ce document détaille l'organisation technique du projet NOMOS, son infrastructure et son pipeline de déploiement continu.
 
## 1. Pipeline CI/CD
 
Le pipeline est déclenché à chaque push sur la branche `main` via GitHub Actions. Il assure la sécurité et la qualité du code avant toute mise en production.
 
```mermaid
flowchart TB
    Start([Push/PR sur main])
    
    subgraph Parallel["🔄 Exécution parallèle"]
        direction TB
        SCA["🔐 Security Scan<br/><i>Gitleaks + SCA Audit</i>"]
        SAST["🔍 SAST Analysis<br/><i>CodeQL</i>"]
        Tests["✅ Unit Tests<br/><i>Jest</i>"]
    end
    
    Lint["📝 Lint & Type Check<br/><i>ESLint + TypeScript</i>"]
    
    Sonar{"📊 SonarQube<br/><i>Quality Gate</i>"}
    
    Build{"🐳 Build & Scan<br/><i>Docker + Trivy</i>"}
    
    Deploy["🚀 Deploy to VPS<br/><i>Infomaniak</i>"]
    
    Start --> Parallel
    
    SCA --> Lint
    SAST --> Build
    Tests --> Sonar
    Lint --> Sonar
    
    SCA --> Build
    Tests --> Build
    Sonar --> Build
    Lint --> Build
    
    Build --> Deploy
    
    style Start fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style Parallel fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style Sonar fill:#fff9c4,stroke:#f9a825,stroke-width:3px
    style Build fill:#e1f5fe,stroke:#01579b,stroke-width:3px
    style Deploy fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
```
 
### Étapes détaillées :

**Phase 1 - Exécution parallèle :**
1. **Security Scan (Gitleaks + SCA)** : Détecte les secrets dans l'historique Git + Audit des dépendances de production
2. **SAST Analysis (CodeQL)** : Analyse statique approfondie pour détecter les vulnérabilités logiques (injections, XSS, etc.)
3. **Unit Tests (Jest)** : Exécution de la suite de tests avec génération de la couverture de code

**Phase 2 - Quality checks :**
4. **Lint & Type Check** : Vérifie la qualité du code avec ESLint et TypeScript (dépend de Security Scan)
5. **SonarQube** : Analyse la qualité globale et la couverture de code (dépend de Lint et Tests)

**Phase 3 - Build & Security :**
6. **Build & Scan Docker** : Construction de l'image Docker et scan des vulnérabilités avec Trivy + génération du SBOM (dépend de toutes les étapes précédentes)

**Phase 4 - Déploiement :**
7. **Deploy to VPS** : Déploiement automatique sur le VPS Infomaniak si toutes les étapes précédentes réussissent et si on est sur la branche `main`
 
## 2. Infrastructure
 
L'infrastructure repose sur un modèle hybride : une partie auto-hébergée sur un VPS (pour l'application et le monitoring) et une partie SaaS via Supabase (pour les données et l'authentification)
 
### Schéma de l'infrastructure
 
```mermaid
flowchart LR
    User([Utilisateur])
    
    subgraph VPS["🖥️ VPS Infomaniak"]
        direction TB
        WebApp["Next.js App<br/>Docker Container"]
        
        subgraph Monitor["📊 Observabilité"]
            direction TB
            Promtail["Promtail<br/><i>Collecte logs</i>"]
            Loki[("Loki<br/><i>Stockage logs</i>")]
            Prom[("Prometheus<br/><i>Métriques</i>")]
        end
    end

    subgraph Cloud["☁️ Services Cloud - Supabase"]
        direction TB
        Auth["🔐 Authentification"]
        DB[("💾 Base de données<br/>PostgreSQL")]
        Storage["📸 Stockage Photos"]
    end

    User -->|HTTPS| WebApp
    
    WebApp -->|Auth| Auth
    WebApp -->|Queries| DB
    WebApp -->|Upload/Download| Storage
    
    WebApp -.->|Logs| Promtail
    Promtail -->|Push| Loki
    WebApp -.->|Metrics| Prom
    
    style VPS fill:#f5f5f5,stroke:#666,stroke-width:3px
    style Cloud fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style Monitor fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style WebApp fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
```
