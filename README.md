# Collector API

API backend pour Collector.shop

## 🚀 Démarrage rapide

### 1. Installe les dépendances
```bash
npm install
```

### 2. Configure l'environnement
```bash
cp .env.example .env
```

Génère des secrets :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Édite `.env` et remplace `BETTER_AUTH_SECRET` et `JWT_SECRET` avec les secrets générés.

### 3. Lance Docker
```bash
docker-compose up -d
```

### 4. Démarre le serveur
```bash
npm run dev
```

### 5. Teste
```bash
curl http://localhost:3000/health
```

## 📁 Structure

```
collector-api/
├── src/
│   ├── db/              # Database (Drizzle)
│   ├── shared/          # Config, utils
│   ├── features/        # Feature slices (à venir)
│   ├── app.ts           # Express config
│   └── server.ts        # Entry point
├── drizzle/             # Migrations
├── docs/                # Documentation
└── tests/               # Tests
```

## 🛠️ Commandes

```bash
npm run dev          # Démarre en mode dev
npm run build        # Build production
npm run start        # Lance production
npm run db:generate  # Génère migrations
npm run db:migrate   # Applique migrations
npm run db:studio    # Ouvre Drizzle Studio
npm test             # Lance tests
```

## 📚 Documentation

Voir le dossier `/docs` pour la documentation complète d'évaluation.