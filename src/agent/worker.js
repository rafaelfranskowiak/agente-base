import { Worker } from 'bullmq';
import { redis } from '../config/redis.js';
import { query } from '../config/db.js';
import { generateEmbedding, chatCompletion, summarizeConversation } from './llm.js';
import { buildContext } from './prompts.js';
import { agentTools, executeTool } from './tools.js';
import { sendText, startTyping, stopTyping } from '../api/waha.js';
import dotenv from 'dotenv';

dotenv.config();

const chatWorker = new Worker('chat_queue', async job => {
  const { tenantId, contactId, phone, session } = job.data;
  
  try {
    const bufferKey = `chat_buffer:${tenantId}:${contactId}`;
    const messagesInBuffer = await redis.lrange(bufferKey, 0, -1);
    await redis.del(bufferKey);

    if (messagesInBuffer.length === 0) return;

    const combinedMessage = messagesInBuffer.join('\n');
    console.log(`[Worker] Processando mensagem para ${contactId}: ${combinedMessage}`);

    await startTyping(session, contactId);

    const userEmbedding = await generateEmbedding(combinedMessage);
    await query(
      `INSERT INTO conversation_messages (tenant_id, contact_id, role, content, embedding) VALUES ($1, $2, $3, $4, $5)`,
      [tenantId, contactId, 'user', combinedMessage, `[${userEmbedding.join(',')}]`]
    );

    const { messages, oldSummary, recentMessagesText } = await buildContext(tenantId, contactId, combinedMessage, userEmbedding);

    let aiResponse = await chatCompletion(messages, agentTools);
    let finalAssistantText = aiResponse.content;

    while (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
      messages.push(aiResponse);

      for (const toolCall of aiResponse.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = toolCall.function.arguments;
        
        console.log(`[Worker] IA invocando Tool: ${functionName}`);
        const toolResult = await executeTool(functionName, functionArgs, tenantId, contactId);

        await query(
          `INSERT INTO tool_calls (tenant_id, contact_id, tool_name, tool_args, tool_result) VALUES ($1, $2, $3, $4, $5)`,
          [tenantId, contactId, functionName, functionArgs, JSON.stringify(toolResult)]
        );
        
        messages.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: toolResult,
        });
      }

      aiResponse = await chatCompletion(messages, agentTools);
      finalAssistantText = aiResponse.content;
    }

    const pauseCheck = await query(`SELECT is_bot_paused FROM conversation_summaries WHERE tenant_id = $1 AND contact_id = $2`, [tenantId, contactId]);
    if (pauseCheck.rows.length > 0 && pauseCheck.rows[0].is_bot_paused && !finalAssistantText) {
      console.log(`[Worker] Bot pausado durante a execu��o de tool. Nenhuma resposta ser� enviada.`);
      await stopTyping(session, contactId);
      return;
    }

    if (!finalAssistantText) {
      finalAssistantText = "Desculpe, ocorreu um erro ao processar sua solicita��o.";
    }

    await redis.setex(`bot_sent:${contactId}`, 60, 'true');
    
    const typingDelay = Math.min(finalAssistantText.length * 20, 3000); 
    await new Promise(r => setTimeout(r, typingDelay));
    
    await stopTyping(session, contactId);
    await sendText(session, contactId, finalAssistantText);

    const assistantEmbedding = await generateEmbedding(finalAssistantText);
    await query(
      `INSERT INTO conversation_messages (tenant_id, contact_id, role, content, embedding) VALUES ($1, $2, $3, $4, $5)`,
      [tenantId, contactId, 'assistant', finalAssistantText, `[${assistantEmbedding.join(',')}]`]
    );

    summarizeConversation(`${recentMessagesText}\nUser: ${combinedMessage}\nAssistant: ${finalAssistantText}`, oldSummary)
      .then(async (newSummary) => {
        await query(
          `INSERT INTO conversation_summaries (tenant_id, contact_id, summary) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (tenant_id, contact_id) DO UPDATE SET summary = EXCLUDED.summary`,
          [tenantId, contactId, newSummary]
        );
      })
      .catch(console.error);

    console.log(`[Worker] Resposta enviada e processamento conclu�do para ${contactId}.`);
  } catch (error) {
    console.error(`[Worker] Erro ao processar chat para ${contactId}:`, error);
  }
}, { connection: redis });

chatWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} falhou:`, err.message);
});

console.log('[Worker] BullMQ Worker de chat iniciado.');
