// import { getChannel } from '@/src/amqp/connection.js';

// export const consumeFromQueue = async (queueName: string, callback: (msg: unknown) => void) => {
//     const channel = getChannel();
//     await channel.assertQueue(queueName, { durable: true });
//     channel.consume(queueName, (msg) => {
//         if (msg !== null) {
//             const content = JSON.parse(msg.content.toString());
//             console.log(`Message received from queue ${queueName}:`, content);
//             callback(content);
//             channel.ack(msg);
//         }
//     });
// };
