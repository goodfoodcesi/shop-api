import { Franchises } from '@prisma/client';
import prisma from "@/src/utils/prisma.js"
import { CreateFranchiseDTO, UpdateFranchiseDTO } from '@/src/dto/franchises/create-franchise.dto.js';

/**
 * Récup toute les franchises
 * @returns
 */
export const getAll = async () : Promise<Franchises[]> => {
    const franchises = await prisma.franchises.findMany();
    return franchises;
}

/**
 * Créer une franchise
 * @returns
 */
export async function createFranchise(data: CreateFranchiseDTO): Promise<Franchises> {
    return await prisma.franchises.create({
        data: {
            ...data,
            updatedAt: new Date()
        }
    });
}

export async function updateFranchise(id: string, data: UpdateFranchiseDTO): Promise<Franchises | null> {
    return await prisma.franchises.update({
        where: { id: id },
        data: {
            ...data,
            updatedAt: new Date()
        }
    });
}