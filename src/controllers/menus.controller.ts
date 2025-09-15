import type {Request, Response, NextFunction} from 'express';
import {createMenu, getAll} from '@/src/services/menus.services.js';
import { Menus } from '@prisma/client';


/**
 * Récupère tous les menus
 * @param req 
 * @param res 
 * @param next 
 */
export async function getMenus(req: Request, res: Response, next: NextFunction) {
    try {
        const menus : Menus[] | [] = await getAll();
        if(!menus || menus.length > 0 ) {
            res.status(204).json({ message: " hey" });
            return;
        } 
        res.status(200).json(menus);
        return;
    } catch (e) {
        console.error("[Error] getMenus: ", e)
        next(e)
    }
}


/**
 * Créer un menu
 * @param req 
 * @param res 
 * @param next 
 */
export async function createNewMenu(req: Request, res: Response, next: NextFunction) {
    try {
        const menuData = req.body;
        const menus : Menus = await createMenu(menuData);
        res.status(200).json(menus);
        return;
    } catch (e) {
        console.error("[Error] createNewMenu: ", e)
        next(e)
    }
}


// export const GetMenus = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const messages = await GetAllMessages();
//         return res.status(200).json(messages);
//     } catch (e) {
//         next(e)
//     }
// }

// export const GetMenusByFranchiseId = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const messages = await GetAllMessages();
//         res.status(200).json(messages);
//     } catch (e) {
//         next(e)
//     }
// }

//Get One :id
// export const GetOneById = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const {id} = req.params
//         const message = await GetOneSkilltById(id);
//         res.status(200).json(message);
//     } catch (e) {
//         next(e)
//     }
// }


// //Create
// export const PostMenu = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const {chatId, content, senderId, receiverId} = req.body;

//         const createdMesage = await CreateMessage({chatId, content, senderId, receiverId})

//         res.status(201).json(createdMesage);

//     } catch (e) {
//         next(e)
//     }
// }