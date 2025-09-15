import app from "./app.js"
// import app from "@/src/app"
import fs from "fs"
import https from 'https';
import swaggerDocs from "@/src/utils/swagger.js"
import { DisconnectPrismaClient } from "@/src/utils/prisma.js";
import path from "path";
import { Express } from "express";
//import { startConsumers } from "@/src/amqp/consumerManager.js";
// import { connectRabbitMQ } from "@/src/amqp/connection.js";
import '@/src/utils/datadog.js';
import prisma from "@/src/utils/prisma.js";
import { Seeding } from "@/src/utils/seed.js";

// Récupérer le chemin projet root (__dirname en ES module ça marche pas)
const __filename = import.meta.dirname
const __dirname = path.dirname(__filename);

const PORT: number = parseInt(process.env.PORT) ?? 80;
const ENV: string = process.env.ENV ?? "production";
console.log("ENV", ENV);
// const ENV: string = process.env.ENV ?? "production";
// Chemin des certificats 
// const certPath = './certs/server.crt';

const certsDir = ENV === "production"
  ? path.resolve(__dirname, '../certs') // production, accès à la racine du projet
  : path.resolve(__dirname, './certs');

const certPath = path.join(certsDir, 'server.crt');
const keyPath = path.join(certsDir, 'private.key');

(async () => {
  try {

    //Lance Connection et consummer RabbitMQ
    // if (ENV === "production") {
    //   // await connectRabbitMQ();
    //   // await startConsumers();
    // }
    // await Seeding(() => DisconnectPrismaClient(prisma));


    if (ENV !== "production") {
      startHttpServer(app, PORT)
    } else {
      startHttpsServer(ENV, certPath, keyPath, PORT, app)
    }

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();

//Fermer Prisma quand l'application s'arrète
process.on('exit', function (code) {
  DisconnectPrismaClient(prisma)
  return console.log(`Process to exit with code ${code}`);
})


/**
 * Démarre le serveur https
 */
function startHttpsServer(env: string, certPath: string, keyPath: string, port: number, app: Express) {
  try {
    //check si cert ou key est ok
    if (!fs.existsSync(certPath)) {
      throw new Error(`Certificate file not found at: ${certPath}`);
    }
    if (!fs.existsSync(keyPath)) {
      throw new Error(`Private key file not found at: ${keyPath}`);
    }

    const httpsOptions = {
      key: fs.readFileSync(keyPath, "utf-8"),
      cert: fs.readFileSync(certPath, "utf-8"),
    };

    https.createServer(httpsOptions, app).listen(port, () => {
      console.log(`[HTTPS] Express is running at https://localhost:${port}`);
    });

    
  } catch (e) {
    console.error("Error starting HTTPS server:", e.message);
    process.exit(1);
  }
}

/**
 * Démarre le serveur http
 */
function startHttpServer(app: Express, port: number) {
  app.listen(port, () => {
    console.log(`[HTTP] Express is listening at http://localhost:${port}`);
    swaggerDocs(app, port)
    return;
  });
}