import app from "./app"
import type { Express } from "express";

const PORT: number = parseInt(process.env.PORT ?? "80");

(async () => {
  try {
    startHttpServer(app, PORT)

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();


function startHttpServer(app: Express, port: number) {
  app.listen(port, () => {
    console.log(`[HTTP] Express is listening at 
      http://localhost:${port}
      http://localhost:${port}/docs
      `);
    return;
  });
}
