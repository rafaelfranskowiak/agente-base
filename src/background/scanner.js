import cron from 'node-cron';
import { query } from '../config/db.js';
import { notificationsQueue } from '../config/queues.js';

console.log('[Scanner] Cron jobs iniciados.');

cron.schedule('0 8 * * *', async () => {
  console.log('[Scanner] Buscando aniversariantes do dia...');
});

cron.schedule('*/5 * * * *', async () => {
  console.log('[Scanner] Verificando lembretes de 24h...');
});
