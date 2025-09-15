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
-  Créer votre fichier `.env` à la racine (voir Variables d’environnement ci‑dessous).

`ENV`: contrôle certains comportements applicatifs (consommateurs RabbitMQ, chemins de certificats, HTTP/HTTPS).
  - `production`: démarre en HTTPS (certificats requis)
  - `dev`: démarre en HTTP (utile en dev)


## Lancer en Docker (développement)

Une image dédiée « dev » existe dans le Dockerfile (target `dev`) qui lance `npm run dev` (hot reload). Utilisez le fichier `compose.dev.yaml`.

Commandes:
```bash
docker compose -f compose.dev.yaml up --build
```

Attendus (par défaut):
- Conteneur écoute sur `PORT=80` (mapping `3000:3000`)
- `ENV=dev` pour forcer le mode HTTP (Swagger accessible)

Accès:
- API: `http://localhost:80`
- Swagger UI: `http://localhost:80/api`

Si vous ne voyez pas Swagger en dev Docker, vérifiez:
- que `ENV` est défini à une valeur différente de `production` (ex: `dev`)
- que `PORT=80` est bien défini côté conteneur

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

Accès:
- API: `http://localhost:80`
- Swagger UI: `http://localhost:80/api`

