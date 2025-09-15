import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { Express, Request, Response } from "express";
import json from "package.json" with { type: "json" };
// import { version } from "package.json"

const options = {
  swaggerDefinition: {
   openapi: '3.0.0',
    info: {
      title: 'Hello World',
      version: json.version,
    },
  },
  apis: ['./src/routes/*.ts','./src/routes*.js'],
};

const swaggerSpecification = swaggerJsdoc(options);

export default function swaggerDocs(app: Express, port: number) {
  app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerSpecification))

  app.get("/docs.json", ( _: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json")
    res.send(swaggerSpecification)
    })

console.log(`Docs available at http://localhost:${port}/api`)
}