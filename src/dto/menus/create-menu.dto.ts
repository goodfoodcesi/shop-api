export type CreateMenuDTO = {
  name: string;
  description: string;
  price: number;
  available: boolean;
  franchiseId: string;
};

export type UpdateMenuDTO = {
  name: string;
  description: string;
  price: number;
  available: boolean;
  franchiseId: string;
};

export type PatchMenuDTO = {
  name?: string;
  description?: string;
  price?: number;
  available?: boolean;
  franchiseId?: string;
};