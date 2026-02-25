# Architecture & Infrastructure
 
Ce document détaille l'organisation technique du projet NOMOS, son infrastructure et son pipeline de déploiement continu.
 
## 1. Pipeline CI/CD
 
Le pipeline est déclenché à chaque push sur la branche `main` via GitHub Actions. Il assure la sécurité et la qualité du code avant toute mise en production.
 
```mermaid
flowchart TD
    subgraph CI ["Pipeline GitHub Actions"]
        direction LR
        SCA[Secrets Scan<br/>Gitleaks]
        SAST[SAST Analysis<br/>CodeQL]
        Tests[Unit Tests<br/>Jest]
        Lint[Lint & Type Check<br/>ESLint]
        
        Sonar{Quality Gate<br/>SonarQube}
        Build{Container Scan<br/>Trivy}
        
        Lint --> Sonar
        Tests --> Sonar
        
        SCA --> Build
        SAST --> Build
        Sonar --> Build
    end

    Build --> Deploy[Déploiement VPS<br/>Infomaniak]

    style Deploy fill:#e1f5fe,stroke:#01579b,stroke-width:2px
```
 
### Étapes détaillées :
1.  **Gitleaks** : Scan de tout l'historique pour détecter d'éventuels secrets (clés API, mots de passe) commités par erreur.
2.  **CodeQL** : Analyse statique approfondie pour détecter les vulnérabilités logiques (injections, XSS, etc.).
3.  **Tests Unitaires (Jest)** : Exécution de la suite de tests pour garantir le bon fonctionnement des services et composants. La couverture est ensuite envoyée à SonarQube.
4.  **SonarQube** : Analyse de la qualité du code, détection de la dette technique et vérification que la Quality Gate est respectée.
5.  **Trivy** : Scan de l'image Docker finale pour identifier des vulnérabilités (CVE) dans les packages système ou les dépendances.
6.  **Déploiement** : Si toutes les étapes précédentes sont au vert, on se connecte au vps pour mettre à jour et deployer les modifications
 
## 2. Infrastructure
 
L'infrastructure repose sur un modèle hybride : une partie auto-hébergée sur un VPS (pour l'application et le monitoring) et une partie SaaS via Supabase (pour les données et l'authentification)
 
### Schéma de l'infrastructure
 
```mermaid
flowchart TD
    User([Utilisateur]) -- "HTTPS" --> WebApp[Next.js App / Docker]

    subgraph VPS [VPS Infomaniak]
        WebApp
        subgraph Monitor [Observabilité]
            Prom[(Prometheus)]
            Loki[(Loki)]
            Promtail[Promtail]
        end
    end

    subgraph Cloud [Services Cloud - Supabase]
        Auth[Authentification]
        DB[(Base de données)]
        Storage[Stockage Photos]
    end

    WebApp --> Auth
    WebApp --> DB
    WebApp --> Storage
    
    Promtail -- "Logs" --> WebApp
    Promtail --> Loki
    WebApp -- "Metrics" --> Prom
```
