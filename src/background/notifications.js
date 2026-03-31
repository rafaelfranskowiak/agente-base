import { Worker } from 'bullmq';
import { redis } from '../config/redis.js';
import { sendText } from '../api/waha.js';
import { query } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const notificationsWorker = new Worker('notifications_queue', async job => {
  const { contactId, message, tenantId = '00000000-0000-0000-0000-000000000000' } = job.data;
  
  try {
    console.log(`[Notifications] Enviando notifica��o para ${contactId}: ${message}`);
    
    await redis.setex(`bot_sent:${contactId}`, 60, 'true');
    
    const session = process.env.WAHA_SESSION || 'default';
    await sendText(session, contactId, message);

    await query(
      `INSERT INTO conversation_messages (tenant_id, contact_id, role, content) VALUES ($1, $2, $3, $4)`,
      [tenantId, contactId, 'assistant', `[NOTIFICA��O DO SISTEMA]: ${message}`]
    );

    console.log(`[Notifications] Notifica��o processada para ${contactId}`);
  } catch (error) {
    console.error(`[Notifications] Erro ao enviar notifica��o para ${contactId}:`, error);
  }
}, { connection: redis });

notificationsWorker.on('failed', (job, err) => {
  console.error(`Job de notifica��o ${job.id} falhou:`, err.message);
});

console.log('[Notifications] BullMQ Worker de notifica��es iniciado.');
