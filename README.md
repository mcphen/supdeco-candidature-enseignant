# SUPDECO – Candidature Enseignant (README technique)

Ce dépôt contient l’interface web de candidature des enseignants de SUPDECO. L’application est une SPA construite avec Vue 3, TypeScript et Vite, consommant une API Laravel (Bundu_project).

## Sommaire
- Prérequis
- Démarrage rapide
- Configuration et variables d’environnement
- Scripts NPM
- Architecture du code
- Routage et garde d’authentification
- Authentification (stockage local)
- Appels API front (endpoints consommés)
- Suivi d’activité (tracking)
- Build et déploiement
- Dépannage (FAQ)

---

## Prérequis
- Node.js 18+ (recommandé: LTS 20+)
- NPM 8+ (ou PNPM/Yarn si adapté à votre environnement)
- Un backend Laravel opérationnel (Bundu_project) exposant l’API REST utilisée par ce front.
  - En développement: http://localhost:8000/api (par défaut)
  - En production: https://admissions.supdeco.sn/api (par défaut)

## Démarrage rapide
1. Installer les dépendances
   - `npm install`
2. Lancer le serveur de dev (Vite)
   - `npm run dev`
   - L’option `--host` est activée pour l’accès réseau local.
3. Ouvrir le navigateur
   - Vite vous indiquera l’URL (ex: http://localhost:5173)

## Configuration et variables d’environnement
Le client HTTP (src/api/http.ts) détermine l’URL de base selon l’environnement Vite.
- Dev (MODE !== 'production')
  - `VITE_API_BASE_URL` (fallback: `http://localhost:8000/api`)
- Prod (MODE === 'production')
  - `VITE_API_BASE_URL_PROD` (fallback: `https://admissions.supdeco.sn/api`)

Exemples de fichiers:
- .env (développement)
  - `VITE_API_BASE_URL=http://localhost:8000/api`
- .env.production
  - `VITE_API_BASE_URL_PROD=https://admissions.supdeco.sn/api`

Ces fichiers ne sont pas commités par défaut. Adaptez les valeurs à votre environnement.

## Scripts NPM
Définis dans package.json:
- `npm run dev` → Démarre Vite en mode dev (`vite --host`).
- `npm run build` → Build de production (`vite build`).
- `npm run preview` → Prévisualisation locale d’un build (`vite preview`).
- `npm start` → Alias de preview sur le port 3000 (`vite preview --port 3000`).

## Architecture du code
- `src/main.ts` → Entrée de l’app, montage Vue + Router.
- `src/App.vue` → Shell de l’application (topbar, layout principal).
- `src/router/index.ts` → Définition des routes, garde beforeEach, tracking afterEach.
- `src/components/` → Composants réutilisables (ex: CandidatureForm.vue).
- `src/views/` → Pages (PortalView.vue, PortalDashboard.vue, PortalSoumettre.vue, etc.).
- `src/services/` → Services métier (auth.ts, candidate.service.ts, trackingService.ts).
- `src/api/` → Clients HTTP (http.ts, candidate.ts…)
- `src/interfaces/` → Types et interfaces TypeScript (Candidate.ts).
- `src/utils/` → Utilitaires (ex: countries.ts).

## Routage et garde d’authentification
Fichier: `src/router/index.ts`
- Routes publiques:
  - `/` (accueil/inscription – CandidatureForm)
  - `/login`
  - `/forgot-password` (lazy)
  - `/reset-password` (lazy)
- Espace protégé `/portal` (meta: requiresAuth):
  - `/portal/dashboard`
  - `/portal/profil` (lazy)
  - `/portal/parametres` (lazy)
  - `/portal/soumettre`

Garde beforeEach:
- Si l’utilisateur est authentifié et tente d’accéder à `/` ou `/login`, il est redirigé vers `/portal`.
- Si une route nécessite l’authentification et que l’utilisateur n’est pas connecté, redirection vers `/login` avec `redirect` dans la query.

## Authentification (stockage local)
Fichier: `src/services/auth.ts`
- Token (clé): `enseignant_token`
- Données utilisateur (clé): `enseignant_user`
- Fonctions exposées:
  - `setSession(token, user)` → enregistre token + user; stocke aussi `enseignant_candidat_id` si présent.
  - `clearSession()` → supprime les informations d’auth.
  - `getToken()`, `getUser()`, `isAuthenticated()`

Note: Le backend doit fournir le token et les informations utilisateur lors de la connexion. Le front s’appuie ensuite sur ces éléments pour l’accès aux routes protégées.

## Appels API front (endpoints consommés)
- Client HTTP: `src/api/http.ts` (axios)
  - BaseURL dépendante de l’environnement (voir section Configuration).
- Candidature (fichier `src/api/candidate.ts`):
  - `GET /enseignants/candidatures/{id}` → détails d’une candidature.
  - `GET /enseignants/candidatures/{id}/status` → statut d’une candidature.
  - `PUT /enseignants/candidatures/{id}` → mise à jour des informations.
  - `PUT /enseignants/candidatures/{id}/preferences` → préférences (newsletter, politiques, …).
  - `POST /enseignants/candidatures/{id}/change-password` → changement de mot de passe.

Assurez-vous que l’API Laravel expose ces endpoints et gère la CORS (origin: Vite dev server et domaine de prod).

## Suivi d’activité (tracking)
- Fichier: `src/services/trackingService.ts`
- Intégration: `router.afterEach(() => trackUserActivity())`
- Données envoyées (POST `/tracking/user-activity`):
  - `page_url`, `device_type` (mobile|desktop), `user_agent`, `plateforme` ("enseignant"), `user_id` (si connecté)
- Configuration côté backend requise: endpoint `/tracking/user-activity` dans l’API Laravel.

## Build et déploiement
1. Build de production
   - `npm run build`
   - Les artefacts sont générés dans `dist/`.
2. Prévisualisation locale
   - `npm run preview` ou `npm start` (port 3000)
3. Serveur web (exemples)
   - Nginx/Apache: servir `dist/` en statique avec fallback HTML5 (history mode) vers `index.html`.
   - Commande de service statique (dev/validation): `npx serve dist` (ou `npm i -g serve`).
4. Variables d’environnement
   - En prod, fournissez `VITE_API_BASE_URL_PROD` au moment du build (ou utilisez la valeur par défaut).

Exemple de config Nginx (extrait):
```
location / {
  try_files $uri $uri/ /index.html;
}
```

## Dépannage (FAQ)
- 401/403 sur routes protégées
  - Vérifier la présence du token (`enseignant_token`) en localStorage et sa validité côté API.
  - Vérifier les en-têtes d’authentification si ajoutés ultérieurement (Authorization Bearer, etc.).
- CORS en développement
  - Autoriser l’origine du serveur Vite (ex: http://localhost:5173) dans Laravel.
- 404 en navigation SPA
  - Configurer le fallback HTML5 sur le serveur (voir Nginx ci-dessus) pour le mode history de vue-router.
- API non joignable
  - Vérifier `VITE_API_BASE_URL`/`VITE_API_BASE_URL_PROD` et l’accessibilité réseau.
- Port déjà utilisé
  - `npm run preview -- --port 3001` ou ajuster la config Vite si nécessaire.

## Notes de développement
- Les vues `ForgotPasswordView.vue`, `ResetPasswordView.vue`, `PortalProfil.vue`, `PortalParametres.vue` sont chargées en lazy-loading.
- Le topbar s’affiche uniquement pour les routes publiques lorsque l’utilisateur n’est pas authentifié (voir `App.vue`).
- TypeScript est activé (vue-tsc). Pour une vérification de types stricte: `npx vue-tsc --noEmit`.

## Licence
Projet interne SUPDECO. Tous droits réservés.


---

## Guide utilisateur (candidats)
Pour le guide pas-à-pas destiné aux candidats (inscription, connexion, remplissage du dossier, soumission, suivi du statut, dépannage), veuillez consulter le document suivant:

- GUIDE_UTILISATEUR.md

