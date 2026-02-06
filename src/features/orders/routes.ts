
import { Router } from 'express';
import { OrderController } from './controller';

const router = Router();

router.post('/', OrderController.createOrder);

export default router;
