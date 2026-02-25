# Architecture & Infrastructure
 
Ce document détaille l'organisation technique du projet NOMOS, son infrastructure et son pipeline de déploiement continu.
 
## 1. Pipeline CI/CD
 
Le pipeline est déclenché à chaque push sur la branche `main` via GitHub Actions. Il assure la sécurité et la qualité du code avant toute mise en production.
 
```mermaid
flowchart TD
    Start([Push/PR sur main]) --> Parallel

    subgraph Parallel ["1. ANALYSE & TESTS (Parallèle)"]
        direction LR
        SCA["Security Scan<br/><i>Gitleaks + SCA Audit</i>"]
        SAST["SAST Analysis<br/><i>CodeQL</i>"]
        Tests["Unit Tests<br/><i>Jest</i>"]
    end

    subgraph Quality ["2. QUALITÉ & LINT"]
        direction LR
        Lint["Lint & Type Check<br/><i>ESLint + TypeScript</i>"]
        Sonar{"SonarQube<br/>Quality Gate"}
    end

    subgraph Delivery ["3. BUILD & DEPLOY"]
        Build{"Build & Scan<br/><i>Docker + Trivy</i>"}
        Deploy["Deploy to VPS<br/><i>Infomaniak</i>"]
    end

    %% Connexions logiques simplifiées
    Parallel --> Quality
    Quality --> Build
    Build --> Deploy

    %% Stylisation
    classDef default font-family:Arial, font-size:13px;
    classDef highlight fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef success fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef warning fill:#fff3e0,stroke:#f57c00,stroke-width:2px;

    class Start,Deploy success;
    class Parallel,Quality warning;
    class Build highlight;
 
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
    User((Utilisateur)) -- HTTPS --> WebApp

    subgraph VPS ["VPS INFOMANIAK"]
        direction TB
        WebApp["Next.js App<br/>(Docker Container)"]
        
        subgraph Monitor ["BSERVABILITÉ (Interne)"]
            direction LR
            Promtail["Promtail"] --> Loki[("Loki<br/>Logs")]
            Prom[("Prometheus<br/>Metrics")]
        end
    end

    subgraph SaaS ["SUPABASE (Backend as a Service)"]
        direction TB
        Auth["Authentification"]
        DB[("PostgreSQL")]
        Storage["Storage"]
    end

    %% Connexions sortantes
    WebApp ==> Auth
    WebApp ==> DB
    WebApp ==> Storage

    %% Connexions Monitoring
    WebApp -.-> Promtail
    WebApp -.-> Prom

    %% Styles
    style VPS fill:#fafafa,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
    style SaaS fill:#f0f7ff,stroke:#007bff,stroke-width:2px
    style Monitor fill:#fff9f0,stroke:#ffa000,stroke-width:1px
    style WebApp fill:#f6ffed,stroke:#52c41a,stroke-width:2px
```
