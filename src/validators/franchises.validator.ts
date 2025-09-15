import { z } from 'zod';
// import { CheckExistingFieldForZod } from '../utils/checkFields';


export const createFranchiseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  country: z.string().min(1, "Country is required"),

  // Regex qui vérifie le format du siret
  siret: z.string()
    .length(14, "SIRET must be exactly 14 characters long")
    .regex(/^\d{14}$/, "SIRET must contain only numbers"),
  updatedAt: z.date().default(() => new Date()),
});