import { Menus} from '@prisma/client';
import prisma from "@/src/utils/prisma.js"
import { CreateMenuDTO } from '@/src/dto/menus/create-menu.dto.js';

/**
 * Récup tous les menus
 * @returns
 */

export const getAll = async () : Promise<Menus[]> => {
    const menus = await prisma.menus.findMany();
    return menus;
}

/**
 * Créer un menu
 * @returns
 */
export async function createMenu(data: CreateMenuDTO): Promise<Menus> {
    return await prisma.menus.create({
        data: {
            ...data,
            updatedAt: new Date()
        }
    });
}



// //J'essaye de retourner tous les chat avec le 1er message a travers les messages
// export const GetAllMessagesGroupBy = async () => {

//   const messages = await prisma.message.groupBy({
//     by: ["chatId"],
//   });

//   if (!messages || messages.length <= 0) {
//     NoContent();
//   }
//   return messages;
// }


// export const GetOneMessageById = async (chatId: string) => {

//     const chat = await prisma.chat.findUnique({
//         where: {id: chatId},
//         include: {
//             messages: {
//                 take: 1,
//                 orderBy: {
//                     createdAt: 'desc'
//                 }
//             }
//         }
//     })

//     if (!chat) {
//         notFoundError("Chat not found");
//     }
//     return chat;
// }

// //Todo: fais le create Message et test
// export const CreateMessage = async (requestDto: MessageRegistrationDTO) => {
//     try {
//         const {chatId, content, senderId, receiverId} = requestDto;

//         const createdMsg = await prisma.message.create({
//             data: {
//                 chatId,
//                 senderId,
//                 receiverId,
//                 content,
//                 createdAt: new Date().toISOString()
//             },
//         });

//         //Si Ok alors push New notification Pusheer
//         io.to(`chat_${chatId}`).emit('newMessage', {
//             chatId: chatId,
//             senderId: senderId,
//             receiverId: receiverId,
//             content: content,
//             createdAt: createdMsg.createdAt,
//             id: createdMsg.id
//         });

//         return createdMsg;

//     } catch (e) {
//         throw e;
//     }
// }