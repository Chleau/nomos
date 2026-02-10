# Nomos - Plateforme de gestion citoyenne

![Build Status](https://github.com/VOTRE-USERNAME/nomos/workflows/Build%20and%20Deploy/badge.svg)
![Tests](https://img.shields.io/badge/tests-25%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-2.68%25-red)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Testing

Ce projet utilise Jest et React Testing Library pour les tests unitaires.

### Commandes de test

```bash
# Lancer tous les tests
npm test

# Mode watch (relance automatique lors des modifications)
npm run test:watch

# Générer un rapport de couverture
npm run test:coverage
```

### Documentation

- [Guide complet des tests](./docs/TESTING.md)
- [Exemples de tests avancés](./docs/TESTING_EXAMPLES.md)
- [Configuration Jest](./docs/JEST_SETUP.md)

### Structure des tests

```
src/
├── lib/
│   ├── services/__tests__/    # Tests des services
│   └── hooks/__tests__/        # Tests des hooks
└── components/
    └── ui/__tests__/           # Tests des composants
```

### Résultats actuels

- ✅ 25 tests passants
- ⚡ Temps d'exécution : ~1.2s
- 📊 3 suites de tests configurées

### Créer un nouveau test

Utilisez le script helper pour créer rapidement un nouveau fichier de test :

```bash
# Créer un test de service
./scripts/create-test.sh service nomDuService

# Créer un test de hook
./scripts/create-test.sh hook nomDuHook

# Créer un test de composant
./scripts/create-test.sh component NomDuComposant
```

## CI/CD

Le projet utilise GitHub Actions pour l'intégration continue.

### Workflows automatiques

À chaque push ou pull request, les workflows suivants s'exécutent automatiquement:

- **Lint & Type Check** - Vérification du code (ESLint + TypeScript)
- **Unit Tests** - Exécution de tous les tests avec couverture
- **Build** - Compilation de l'application Next.js

### Configuration rapide

1. **Configurer les secrets** dans GitHub Settings → Secrets:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Activer GitHub Actions** (si nécessaire)

3. **Créer une Pull Request** pour voir les checks en action

### Commandes CI

```bash
# Tester localement comme le CI
npm run test:ci

# Tous les checks
npm run lint && npx tsc --noEmit && npm run test:ci && npm run build
```

### Documentation CI/CD

- [Guide de démarrage rapide CI](./docs/CI_QUICK_START.md)
- [Configuration complète CI/CD](./docs/CI_CONFIGURATION.md)
- [Protection de branche](./docs/BRANCH_PROTECTION.md)
- [Résumé CI/CD](./docs/CI_SUMMARY.md)

### Résultats

- ✅ Tests automatiques sur chaque push
- ✅ Commentaires automatiques sur les PR avec résultats
- ✅ Protection de branche (optionnelle)
- ✅ Rapports de couverture générés

