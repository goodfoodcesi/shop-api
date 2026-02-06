
import { Request, Response, NextFunction } from 'express';
import { rabbitMQProvider } from '../../providers/rabbitmq.provider';
import { logger } from '../../shared/utils/logger';
// import { menuRepository } from '../menus/repository'; 
import { findShopById } from '../shop/repository';

export class OrderController {

    // POST /orders
    static async createOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const orderData = req.body; // Assuming req.body contains CreateOrderInput structure
            logger.info('[createOrder] Received order data:', orderData);

            // Validate required fields
            if (!orderData.menuId || !orderData.shopId || !orderData.customerId || !orderData.items) {
                res.status(400).json({ message: 'Missing required fields: menuId, shopId, customerId, or items' });
                return;
            }

            // Fetch shop details to include address in the event
            const shop = await findShopById(orderData.shopId);
            if (!shop) {
                res.status(404).json({ message: 'Shop not found' });
                return;
            }

            const shopAddress = {
                street: shop.address || 'Unknown',
                city: shop.city || 'Unknown',
                zipCode: shop.zipCode || '00000',
            };

            // Publish order to RabbitMQ for async processing
            const orderEvent = {
                event: 'order.created',
                data: {
                    ...orderData,
                    shopAddress, // Include shop address in the event
                    createdAt: new Date().toISOString(),
                    status: 'pending' // Assuming initial status
                }
            };

            const published = await rabbitMQProvider.publish('orders', orderEvent);

            if (published) {
                logger.info('[createOrder] Order published to RabbitMQ', { menuId: orderData.menuId, shopId: orderData.shopId });
                // Return success immediately
                res.status(202).json({
                    message: 'Order received and being processed',
                    orderId: `temp-${Date.now()}` // Temporary ID until saved in order-api
                });
            } else {
                logger.error('[createOrder] Failed to publish order event');
                res.status(500).json({ message: 'Failed to process order' });
            }

        } catch (error) {
            logger.error('[createOrder] Error:', error);
            next(error); // Pass error to Express error handling middleware
        }
    }
}
