import type {Request, Response, NextFunction} from 'express';
import { createFranchise, getAll, updateFranchise } from '#/services/franchises.services.js';
import { Franchises } from '@prisma/client';

/**
 * Récupère toutes les franchises
 * @param req 
 * @param res 
 * @param next 
 */
export async function getFranchises(req: Request, res: Response, next: NextFunction) {
    try {
        const franchises : Franchises[] | [] = await getAll();
        if(!franchises || franchises.length <= 0 ) {
            // res.status(204).json({ message: "" });
            res.status(200);
            return;
        } 
        res.status(200).json(franchises);
        return;
    } catch (e) {
        console.error("[Error] getFranchises: ", e)
        next(e)
    }
}

/**
 * Crée une nouvelle franchise
 * @param req 
 * @param res 
 * @param next 
 */
export async function createNewFranchise(req: Request, res: Response, next: NextFunction) {
  try {
      const franchiseData = req.body;
      const newFranchise = await createFranchise(franchiseData);
      
      res.status(201).json(newFranchise);
  } catch (e) {
      console.error("[Error] createNewFranchise: ", e)
      next(e);
  }
}

/**
 * Met à jour une franchise existante
 * @param req 
 * @param res 
 * @param next 
 */
export async function updateExistingFranchise(req: Request, res: Response, next: NextFunction) {
  try {
      const franchiseId = req.params.id;
      const updateData = req.body;
      
      const updatedFranchise = await updateFranchise(franchiseId, updateData);
      
      if (!updatedFranchise) {
          res.status(404).json({ message: "Franchise non trouvée" });
          return;
      }
      
      res.status(200).json(updatedFranchise);
  } catch (e) {
      console.error("[Error] updateExistingFranchise: ", e)
      next(e);
  }
}