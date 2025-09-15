// import pkg, { PrismaClient } from '@prisma/client';
// const { PrismaClient } = pkg;
import { PrismaClient } from '@prisma/client';
/**
 * Instance Prisma de l'application
 */
export const prisma = new PrismaClient();

export async function DisconnectPrismaClient(prismaInstance: PrismaClient) {
  await prismaInstance.$disconnect();
  // await prisma.$disconnect();
  console.log("[PrismaClient]: Disconnected")
}

export default prisma;