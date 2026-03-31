import { Queue } from 'bullmq';
import { redis } from './redis.js';

export const connection = redis;

export const chatQueue = new Queue('chat_queue', { connection });
export const notificationsQueue = new Queue('notifications_queue', { connection });

console.log('Filas do BullMQ configuradas.');
