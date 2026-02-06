import amqp, { Channel, ChannelModel } from 'amqplib';
import { logger } from '../shared/utils/logger';

class RabbitMQProvider {
    private connection: ChannelModel | null = null;
    private channel: Channel | null = null;
    private isConnected = false;

    public async connect(): Promise<void> {
        if (this.isConnected) return;

        try {
            const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
            const conn = await amqp.connect(url);
            this.connection = conn;
            this.channel = await conn.createChannel();
            this.isConnected = true;
            logger.info('Connected to RabbitMQ');

            conn.on('error', (err) => {
                logger.error('RabbitMQ connection error', err);
                this.isConnected = false;
                this.connection = null;
                this.channel = null;
                setTimeout(() => this.connect(), 5000);
            });

            conn.on('close', () => {
                logger.warn('RabbitMQ connection closed');
                this.isConnected = false;
                this.connection = null;
                this.channel = null;
                setTimeout(() => this.connect(), 5000);
            });
        } catch (error) {
            logger.error('Failed to connect to RabbitMQ', error);
            setTimeout(() => this.connect(), 5000);
        }
    }

    public async publish(queue: string, message: any): Promise<boolean> {
        if (!this.channel) {
            logger.error('RabbitMQ channel is not available');
            return false;
        }

        try {
            await this.channel.assertQueue(queue, { durable: true });
            const sent = this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
            return sent;
        } catch (error) {
            logger.error(`Error publishing to queue ${queue}`, error);
            return false;
        }
    }

    public async getChannel(): Promise<Channel | null> {
        if (!this.connection || !this.channel) {
            await this.connect();
        }
        return this.channel;
    }
}

export const rabbitMQProvider = new RabbitMQProvider();
