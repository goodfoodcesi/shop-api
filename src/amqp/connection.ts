// import amqp from 'amqplib';

// let connection: amqp.Connection;
// let channel: amqp.Channel;

// export const connectRabbitMQ = async () => {
//     try {
//     connection = await amqp.connect(process.env.RABBITMQ_URL);
//     channel = await connection.createChannel();
//     console.log('RabbitMQ connected');
//     return { connection, channel };
//     } catch(e) {
//         throw Error("Cannot connect to RabbitMQ: ", e)
//     }
// };

// export const getChannel = () => {
//     if (!channel) {
//         throw new Error('RabbitMQ channel not initialized');
//     }
//     return channel;
// };
