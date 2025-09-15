# shop-api

## Description
API Node.js/Express (TypeScript) avec Prisma (PostgreSQL), RabbitMQ, Winston logs et Swagger.

### Version de Node
- Utilisée par le projet: `22.13.x` (cf. `package.json` engines)

## Prérequis
- Node.js `22.13.x` et npm
- Docker et Docker Compose
- PostgreSQL accessible (local ou managé)
- Optionnel (prod HTTPS): `openssl` pour générer les certificats

## Installation rapide (local)
1. Installer les dépendances:
   ```bash
   npm ci
   ```
2. Générer Prisma Client:
   ```bash
   npx prisma generate
   ```
3. Créer votre fichier `.env` à la racine (voir Variables d’environnement ci‑dessous).

## Variables d’environnement
Créer un fichier `.env` à la racine du dépôt avec au minimum:

- `DATABASE_URL`: URL de connexion PostgreSQL Prisma. Exemple:
  ```
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shop?schema=public"
  ```
- `RABBITMQ_URL`: URL AMQP pour RabbitMQ. Exemple en local (guest/guest):
  ```
  RABBITMQ_URL=amqp://guest:guest@localhost:5672
  ```
- `PORT`: Port HTTP/HTTPS exposé par l’app dans le conteneur/process. Exemples:
  ```
  # en dev Docker (recommandé)
  PORT=3000
  # en prod Docker
  # PORT=80
  ```
-- `ENV`: contrôle certains comportements applicatifs (consommateurs RabbitMQ, chemins de certificats, HTTP/HTTPS).
  - `production`: démarre en HTTPS (certificats requis)
  - `dev` (ou toute valeur ≠ `production`): démarre en HTTP (utile en dev)

> Note: l’application se base actuellement sur la variable `ENV` (et non `NODE_ENV`) pour choisir HTTP vs HTTPS.

## Lancer en Docker (développement)

Une image dédiée « dev » existe dans le Dockerfile (target `dev`) qui lance `npm run dev` (hot reload). Utilisez le fichier `compose.dev.yaml`.

Commandes:
```bash
docker compose -f compose.dev.yaml up --build
```

Attendus (par défaut):
- Conteneur écoute sur `PORT=3000` (mapping `3000:3000`)
- `ENV=dev` pour forcer le mode HTTP (Swagger accessible)
- Hot reload grâce au montage du code (si configuré dans le compose)

Accès:
- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api`

Si vous ne voyez pas Swagger en dev Docker, vérifiez:
- que `ENV` est défini à une valeur différente de `production` (ex: `dev`)
- que `PORT=3000` est bien défini côté conteneur

## Lancer en Docker (production)

Une image dédiée « prod » existe (target `prod`) qui sert le build `dist` via Node.
Utilisez le fichier `compose.yaml`.

Commandes:
```bash
docker compose up --build -d
```

Attendus (par défaut):
- Conteneur écoute sur `PORT=80` (mapping `80:80`)
- `ENV=production` démarre en HTTPS et nécessite les certificats montés dans `./certs`

Accès:
- API: `https://localhost` (ou le host de votre déploiement)
- Swagger UI: `https://localhost/api`

## Certificats (prod HTTPS)

Placez vos certificats dans `./certs` à la racine du projet et montez-les dans le conteneur (déjà prévu dans les compose). Chemins attendus par l’app:
- `certs/server.crt`
- `certs/private.key`

Génération locale (auto-signé) pour test:
```bash
openssl req -x509 -newkey rsa:2048 -nodes -keyout certs/private.key -out certs/server.crt -days 365 -subj "/CN=localhost"
```

## Démarrage en local sans Docker

```bash
npm ci
npx prisma generate
npm run dev
```

Par défaut, l’app démarre en HTTP si `ENV` ≠ `production`. Définissez `PORT=3000` pour être cohérent avec le setup Docker de dev.

Accès:
- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api`

