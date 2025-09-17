import {Request, Response, NextFunction} from 'express';
import {z, ZodError} from 'zod';

/**
 * Middleware de validation synchrone, lorsque l'on vérifie uniquement que le format des données sont bons et que les données essentiel sont renseigner
 * @param schema
 * @returns
 */
export function validateData(schema: z.ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((issue: z.ZodIssue) => ({
                    message: `${issue.path.join('.')} is ${issue.message}`,
                }))
                res.status(400).json({error: 'Invalid data', details: errorMessages});
                return;
            }
        }
    };
}