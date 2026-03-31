import { query } from '../config/db.js';
import { getSystemPrompt } from './system_prompt.js';

export async function buildContext(tenantId, contactId, currentMessage, messageEmbedding) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('pt-BR');
  const temporalData = `Hoje é ${dateStr}, a hora atual é ${timeStr}.`;

  const businessData = await getSystemPrompt(tenantId, contactId);

  let summary = '';
  const summaryRes = await query(`SELECT summary FROM conversation_summaries WHERE tenant_id = $1 AND contact_id = $2`, [tenantId, contactId]);
  if (summaryRes.rows.length > 0) {
    summary = summaryRes.rows[0].summary;
  }

  let semanticMemory = '';
  if (messageEmbedding) {
    const semanticRes = await query(
      `SELECT content, role FROM conversation_messages 
       WHERE tenant_id = $1 AND contact_id = $2
       ORDER BY embedding <=> $3::vector LIMIT 5`,
      [tenantId, contactId, `[${messageEmbedding.join(',')}]`]
    );
    if (semanticRes.rows.length > 0) {
      semanticMemory = semanticRes.rows.map(r => `${r.role === 'user' ? 'Cliente' : 'Assistente'}: ${r.content}`).join('\n');
    }
  }

  let systemPrompt = `${businessData}\n\n${temporalData}\n\n`;
  if (summary) {
    systemPrompt += `=== RESUMO DA CONVERSA ATÉ AGORA ===\n${summary}\n\n`;
  }
  if (semanticMemory) {
    systemPrompt += `=== MEMÓRIA RELEVANTE (RAG) ===\n${semanticMemory}\n\n`;
  }

  const historyRes = await query(
    `SELECT role, content FROM conversation_messages 
     WHERE tenant_id = $1 AND contact_id = $2 
     ORDER BY created_at DESC LIMIT 10`,
    [tenantId, contactId]
  );
  
  const recentMessages = historyRes.rows.reverse().map(row => ({
    role: row.role,
    content: row.content
  }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentMessages,
    { role: 'user', content: currentMessage }
  ];

  return { messages, oldSummary: summary, recentMessagesText: recentMessages.map(m => `${m.role}: ${m.content}`).join('\n') };
}
