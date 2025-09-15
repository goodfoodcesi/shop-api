import { Router } from 'express';
import { createNewFranchise, getFranchises } from '@/src/controllers/franchises.controller.js';
import {validateData} from "@/src/middlewares/validatorMiddlewares.js";
import {createFranchiseSchema} from "@/src/validators/franchises.validator.js"

const franchiseRouter = Router();

/**
 * @swagger
 * /franchises:
 *   get:
 *     summary: Retrieve a list of franchises
 *     description: Fetch all franchises from the database with their details.
 *     tags:
 *       - Franchises
 *     responses:
 *       200:
 *         description: A list of franchises.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique identifier of the franchise.
 *                     example: "e7b8e57b-8b4e-4567-bd7b-ef3e2156e4c2"
 *                   name:
 *                     type: string
 *                     description: The name of the franchise.
 *                     example: "Best Franchise Ever"
 *                   address:
 *                     type: string
 *                     description: The physical address of the franchise.
 *                     example: "123 Main Street, Anytown, USA"
 *                   country:
 *                     type: string
 *                     description: The country where the franchise is located.
 *                     example: "USA"
 *                   siret:
 *                     type: string
 *                     description: The SIRET number of the franchise.
 *                     example: "12345678901234"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp when the franchise was last updated.
 *                     example: "2025-01-13T10:00:00Z"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp when the franchise was created.
 *                     example: "2025-01-01T09:00:00Z"
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing what went wrong.
 *                   example: "Internal server error."
 */
franchiseRouter.get("/", getFranchises);
/**
 * @swagger
 * /franchises:
 *   post:
 *     summary: Create a new franchise
 *     description: Create a new franchise with the provided details.
 *     tags:
 *       - Franchises
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the franchise.
 *                 example: "Best Franchise Ever"
 *               address:
 *                 type: string
 *                 description: The physical address of the franchise.
 *                 example: "123 Main Street, Anytown, USA"
 *               country:
 *                 type: string
 *                 description: The country where the franchise is located.
 *                 example: "USA"
 *               siret:
 *                 type: string
 *                 description: The SIRET number for the franchise (used for French companies).
 *                 example: "12345678901234"
 *             required:
 *               - name
 *               - address
 *               - country
 *               - siret
 *     responses:
 *       201:
 *         description: Franchise successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier of the created franchise.
 *                   example: "e7b8e57b-8b4e-4567-bd7b-ef3e2156e4c2"
 *                 name:
 *                   type: string
 *                   description: The name of the franchise.
 *                   example: "Best Franchise Ever"
 *                 address:
 *                   type: string
 *                   description: The physical address of the franchise.
 *                   example: "123 Main Street, Anytown, USA"
 *                 country:
 *                   type: string
 *                   description: The country where the franchise is located.
 *                   example: "USA"
 *                 siret:
 *                   type: string
 *                   description: The SIRET number of the franchise.
 *                   example: "12345678901234"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: The timestamp when the franchise was last updated.
 *                   example: "2025-01-13T10:00:00Z"
 *       400:
 *         description: Bad request. Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing what went wrong.
 *                   example: "Invalid SIRET number."
 */
franchiseRouter.post("/", validateData(createFranchiseSchema), createNewFranchise);

export default franchiseRouter;