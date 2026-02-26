# NOMOS
 
NOMOS est une solution de gestion municipale moderne permettant de fluidifier les échanges entre la mairie et ses administrés. Elle centralise le signalement d'incidents, la consultation et la création d'arrêtés municipaux et la gestion des lois locales au sein d'une interface
 
## Stack Technique
 
- **Frontend** : Next.js 15, React 19, HTML5/CSS3 (Tailwind CSS 4)
- **Backend / Auth** : Supabase (Service PostgreSQL, Authentification, Storage)
- **Cartographie** : Leaflet
- **Qualité de code** : TypeScript, ESLint, SonarQube
- **Tests** : Jest & React Testing Library
- **Observabilité** : Prometheus, Grafana, Loki
- **Infrastructure** : Docker
 
## Documentation technique
 
### 1- Prérequis
 
- Docker & Docker Compose
- Node.js & npm
- Git
 
### 2- Installation
 
```bash
# 1- Cloner ou télécharger le projet
git clone https://github.com/Chleau/nomos.git
cd nomos
```
 
### 3- Lancement du projet
 
#### En local (Développement)
 
Méthode garantissant un environnement identique au pipeline CI/CD :
 
```bash
docker compose up --build
```
L'application est accessible depuis `http://localhost:3000`
 
#### En production
 
Pour démarrer la stack complète (Application Monitoring) :
 
```bash
docker compose -f docker-compose.prod.yml up -d
```
 
### 4- Configuration
 
Un fichier `.env.example` est disponible à la racine du projet. Créez un fichier `.env.local` et renseignez les variables nécessaires pour la connexion à Supabase :
 
```bash
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
```
 
## Architecture
 
### 1- La stratégie
 
L'architecture CI/CD de Nomos a été conçue en milieu de cycle du projet, suivant une démarche de **rattrapage de sécurité**.
Il n'était pas question de recommencer à zéro, mais d'automatiser le contrôle du code (MVP) pour garantir une base saine et sécurisée pour les futures évolutions.
 
Le pipeline s'articule autour de six piliers : **Gitleaks → CodeQL → Tests Unitaires → SonarQube → Trivy → Déploiement**.
 
Pour plus de détails sur les schémas d'infrastructure et le pipeline, consultez le document [Architecture & Infrastructure](docs/Architecture.md).
 
### 2- Justification des choix
 
#### Github Actions
 
Choisi pour son intégration native avec GitHub. Il transforme chaque push en pipeline automatisé sans changer d'infrastructure, et génère des rapports directement visibles sur les Pull Requests, c'est pratique et intuitif
 
#### Gitleaks
 
Sur un projet déjà avancé, le risque que des secrets traînent dans l'historique est élevé. Gitleaks scanne **tout l'historique git**, et pas seulement le dernier commit. Il bloque le pipeline en cas de fuite détectée.
 
#### CodeQL (SAST)

Analyse statique avancée fournie par GitHub pour détecter les vulnérabilités complexes (injections SQL, XSS, failles logiques) directement dans le code source avant même le build

#### SonarQube
 
Choisi pour mesurer la dette technique accumulée pendant la phase de MVP. Il impose une **Quality Gate** qui bloque le déploiement si la qualité ou la couverture de code descend sous le seuil défini. (nous n'avons pas définit de seuil car trop de retard sur les test, cela nous aurez pris trop de temps, mais nous avons couvert une partie du code pour exemple, voir [mairie/archives](src/app/mairie/archives) )
 
#### Trivy
 
Comme le projet utilise des images Docker de base, Trivy vérifie que l'environnement d'exécution sur le VPS Infomaniak ne contient pas de vulnérabilités critiques connues (CVE).
 
### 3- Qualité & Tests
 
#### TypeScript & ESLint
Le projet est entièrement typé avec **TypeScript**, ce qui réduit les erreurs à l'exécution et améliore la maintenabilité. **ESLint** assure la cohérence des pratiques de code sur l'ensemble du projet.
 
#### Jest & Coverage
Les tests unitaires et d'intégration sont gérés par **Jest** et **React Testing Library**. 
- Commande de test : `npm test`
- Couverture de code : `npm run test:coverage`
  
 
### 4- Monitoring & Observabilité
 
Le projet intègre une stack complète pour surveiller la santé de l'application et de l'infrastructure en temps réel.
 
#### Métriques et Performance
- **Prometheus** : Base de données qui collecte les métriques de l'application et du système
- **cAdvisor** : Analyse l'utilisation des ressources (CPU, Mémoire, Réseau) de chaque conteneur Docker en temps réel
- **Grafana** : Dashboards permettant de croiser toutes les données de monitoring.
 
#### Centralisation des Logs
- **Loki** : Système de logs optimisé
- **Promtail** : Agent qui collecte les logs des conteneurs Docker et les envoie à Loki
 
#### Accès aux services (en production) :
- **Grafana** : accessible via le sous-domaine configuré.
- **Prometheus** : interface brute accessible sur le port `9090`.
 
## Procédure "Rollback"
 
Si la mise en production échoue suite à un merge défectueux sur la main, il est nécessaire d'effectuer un revert git pour annuler les changements de manière non-destructive.
 
Actions à effectuer :
 
```bash
# 1- Sur un poste en local, identifier le dernier commit stable
git log --oneline -10
# 2- Annuler le commit fautif en créant un commit inverse
git revert --no-edit [ID_COMMIT]
# 3- Envoyer la modification
git push origin main
```
 
En envoyant la modification, cela va déclencher automatiquement la pipeline Github Actions. Le job `deploy` va se connecter au VPS via SSH, exécuter la commande `git pull` pour récupérer le code stable et reconstruire l'image Docker via `docker compose -f docker-compose.prod.yml up -d --build`. Le service sera ainsi rétabli dans son état stable de manière automatisée.

## Problèmes rencontrés et solutions

Au cours du projet, nous avons fait face à plusieurs défis techniques que nous avons dû résoudre pour stabiliser la solution :

### 1- Mise en place de Trivy
L'implémentation de **Trivy** pour le scan de vulnérabilités a été laborieuse. Nous avons rencontré pas mal de soucis liés aux **versions** et aux **droits d'accès** dans le pipeline CI/CD. Il a fallu ajuster les permissions et bien configurer le scan pour qu'il soit efficace tout en sécurisant l'ensemble de la chaîne de déploiement.

### 2- Qualité de code avec SonarQube
Sur **SonarQube**, nous avons eu pas mal d'alertes concernant les **Security Hotspots** et la **Reliability** (voir sonarQube). Comme le projet était déjà bien avancé, il y avait pas mal de "dette" à rattraper. Nous avons dû repasser sur plusieurs composants pour corriger les failles potentielles et améliorer la solidité du code pour passer la Quality Gate. Néanmoins nous sommes arrivé à une note de A et de C. 

### 3- Mystère avec Docker Loki
Un problème assez étrange est survenu avec **Loki** : le conteneur refuse de se lancer sur mon VPS de production, alors qu'il tourne parfaitement sur le VPS de THéo avec la même configuration. C'est un point que nous n'avons pas encore totalement élucidé, pour se concentré sur d'autres phase de notre développement.

### 4- Tests et Duplication
L'un des plus gros challenges a été la reprise des **tests unitaires** et la gestion de la **duplication** de code en cours de route. Introduire une stratégie de test rigoureuse sur un projet déjà bien entamé demande une refonte structurelle importante. Nous avons donc fait le choix de ne pas viser une couverture totale par manque de temps, mais de mettre en place des exemples solides (notamment sur la partie Archives) pour établir les bonnes pratiques. Au niveau de la duplication nous n'avons pas travailler dessus non plus, pour le moment
 
---------------------------------------------------------------------------------------------------------

Pour voir le projet en détails : https://nomos.chloe.michel.mds-nantes.fr