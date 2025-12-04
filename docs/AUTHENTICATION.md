# Système d'Authentification - Nomos

## ✅ Mise en place terminée

Le système d'authentification est maintenant entièrement fonctionnel avec Supabase.

## 📁 Structure des fichiers

### Hooks
- **`src/lib/supabase/useSupabaseAuth.ts`** : Hook React pour gérer l'état d'authentification (user, loading, signIn, signUp, signOut)

### Services
- **`src/lib/services/auth.service.ts`** : Service pour les opérations d'authentification (signIn, signUp, signOut)

### Composants
- **`src/components/auth/SignInForm.tsx`** : Formulaire de connexion
- **`src/components/auth/SignUpForm.tsx`** : Formulaire d'inscription avec création automatique du profil habitant
- **`src/components/auth/ProtectedRoute.tsx`** : Composant pour protéger les routes nécessitant une authentification

### Pages
- **`src/app/(auth)/signin/page.tsx`** : Page de connexion (`/signin`)
- **`src/app/(auth)/signup/page.tsx`** : Page d'inscription (`/signup`)

### Middleware
- **`src/middleware.ts`** : Middleware Next.js pour gérer l'authentification côté serveur (utilise `@supabase/ssr`)

### Navigation
- **`src/components/SidebarMenu.tsx`** : Menu latéral avec affichage de l'utilisateur connecté et boutons de connexion/déconnexion

## 🔧 Configuration requise

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

Vous pouvez copier le fichier `.env.example` et le renommer en `.env.local`, puis remplir les valeurs.

### Récupérer les clés Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Ouvrez votre projet
3. Allez dans Settings > API
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🚀 Fonctionnalités

### Inscription
- Formulaire avec email, mot de passe, nom, prénom et sélection de commune
- Création automatique d'un profil dans la table `habitants`
- Validation côté client et serveur
- Gestion des erreurs avec messages en français

### Connexion
- Authentification par email/mot de passe
- Validation du format email
- Messages d'erreur en français
- Redirection automatique vers la page d'accueil après connexion

### Déconnexion
- Bouton de déconnexion dans le menu latéral
- Redirection vers la page de connexion

### Protection des routes
- Composant `ProtectedRoute` pour sécuriser les pages
- Vérification des permissions basée sur les rôles

### Affichage utilisateur
- Profil utilisateur dans le menu latéral
- Affichage du nom, rôle et email
- Boutons contextuels (connecté vs non-connecté)

## 📝 Utilisation

### Dans un composant client

```tsx
'use client'

import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'

export function MonComposant() {
  const { user, loading, signOut } = useSupabaseAuth()

  if (loading) return <div>Chargement...</div>

  if (!user) return <div>Non connecté</div>

  return (
    <div>
      <p>Bienvenue {user.email}</p>
      <button onClick={signOut}>Déconnexion</button>
    </div>
  )
}
```

### Protéger une route

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Permission } from '@/types/auth'

export default function PageProtegee() {
  return (
    <ProtectedRoute requiredPermission={Permission.VIEW_SIGNALEMENTS}>
      <div>Contenu protégé</div>
    </ProtectedRoute>
  )
}
```

## 🔐 Sécurité

- Les mots de passe sont hashés par Supabase
- Les tokens sont stockés dans des cookies HTTP-only
- Le middleware vérifie l'authentification sur chaque requête
- Les routes API peuvent utiliser `getSession()` pour vérifier l'utilisateur

## 📦 Dépendances installées

- `@supabase/ssr` : Gestion de l'authentification côté serveur pour Next.js App Router
- `@supabase/supabase-js` : Client JavaScript Supabase

## 🎨 Interface

- Formulaires stylés avec Tailwind CSS
- Gestion des états de chargement
- Messages d'erreur clairs et en français
- Design responsive (mobile et desktop)

## 🔄 Flux d'authentification

1. **Inscription** :
   - Utilisateur remplit le formulaire → Création compte Supabase Auth → Création profil habitant → Connexion automatique

2. **Connexion** :
   - Utilisateur entre email/password → Vérification Supabase → Session créée → Redirection

3. **Navigation** :
   - Middleware vérifie la session sur chaque page → User disponible via hook → UI s'adapte

## ⚠️ Notes importantes

- Le package `@supabase/auth-helpers-nextjs` a été remplacé par `@supabase/ssr` (recommandé par Supabase)
- Les métadonnées utilisateur (nom, prénom, rôle) sont stockées dans `user.user_metadata`
- La table `habitants` contient le profil complet de l'utilisateur

## 🐛 Dépannage

### L'utilisateur n'est pas connecté après l'inscription
- Vérifiez que Supabase Email Confirmation est désactivé dans Settings > Authentication > Email Auth
- Ou configurez un service email pour l'envoi des confirmations

### Erreur "Invalid login credentials"
- Vérifiez que l'email et le mot de passe sont corrects
- Assurez-vous que le compte existe dans Supabase Auth

### Les métadonnées utilisateur ne s'affichent pas
- Vérifiez que les données ont bien été enregistrées lors de l'inscription
- Consultez la console Supabase > Authentication > Users
