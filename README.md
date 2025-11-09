# 🛒 Shop API

API **Node.js / Express / TypeScript** utilisant **Drizzle ORM** (PostgreSQL), **WPino logs** et **Scalar (OpenAPI)**.

---

## ⚙️ Prérequis

- Node.js 22.13.x  
- npm  
- Docker & Docker Compose  
- Base PostgreSQL accessible  

Créer un fichier `.env` à la racine avec au minimum :

```
DATABASE_URL=postgresql://user:password@host:5432/dbname  
PORT=80  
ENV=dev
``

---

## 🚀 Démarrage rapide

### 👉 En local  
```BASH
npm install  
npm run dev  
```
### 👉 Avec Docker  
```BASH
docker compose up --build  
```
---

## 🌐 Accès

- API → http://localhost:80  
- Scalar (doc) → http://localhost:80/openapi  

---

## 🧱 Build manuel (optionnel)  
```
npm run build  
npm start  
```
Le build est généré dans `dist/`.

---

## 🧩 En résumé

| Environnement | Commande | Mode réseau | URL |
|----------------|-----------|--------------|------|
| **Local (dev)** | npm run dev | HTTP | http://localhost:80 |
| **Docker** | docker compose up --build | HTTP | http://localhost:80 |
