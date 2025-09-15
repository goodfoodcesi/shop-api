export type CreateFranchiseDTO = {
  name: string;
  address: string;
  country: string;
  siret: string;
};

export type UpdateFranchiseDTO = {
  name: string;
  address: string;
  country: string;
  siret: string;
};

export type PatchFranchiseDTO = {
  name?: string;
  address?: string;
  country?: string;
  siret?: string;
};

