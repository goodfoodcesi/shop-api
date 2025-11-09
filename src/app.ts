import express from 'express';
import cors from "cors";
import { shopRouter } from './features/shop'
import rateLimit from 'express-rate-limit';
import { requestIdMiddleware } from '@/middlewares/request-id.middleware';
import { httpLogger, responseLogger } from "@/middlewares/logger.middleware"
import { errorLogger } from './middlewares/errorMiddlewares';
import { openapiRouter } from './middlewares/openapi.middleware';


const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  "https://jordanboutrois.fr",
  "https://preprod.jordanboutrois.fr",
  "*"
];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

const app = express();

// Rate limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, //  1 min
  max: 60,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer après une minute.',
  headers: true, 
});

if (process.env.NODE_ENV === "production") {
  app.use(limiter);
}

// Middlewares
app.use(express.json())
app.use(cors(options));

//Logger
app.use(requestIdMiddleware);
app.use(httpLogger);
app.use(responseLogger);

//Routers
app.use('/shops', shopRouter)

// Docs Scalar
if (process.env.ENV === "dev") {
  app.use(openapiRouter);
}

// Error Handler
app.use(errorLogger);

export default app;
