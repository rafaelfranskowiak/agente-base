import { query } from '../config/db.js';

export const agentTools = [
  {
    type: 'function',
    function: {
      name: 'get_available_slots',
      description: 'Verifica os horários disponíveis para agendamento em uma data específica.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'A data desejada no formato YYYY-MM-DD' },
          professional_id: { type: 'string', description: 'ID do profissional (opcional)' }
        },
        required: ['date']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'encaminhar_atendimento_humano',
      description: 'Pausa o bot e encaminha o atendimento para um humano.',
      parameters: {
        type: 'object',
        properties: {
          motivo: { type: 'string', description: 'Motivo pelo qual o usuário quer falar com humano.' }
        },
        required: ['motivo']
      }
    }
  }
];

export async function executeTool(toolName, argsArgs, tenantId, contactId) {
  try {
    const args = JSON.parse(argsArgs);
    
    if (toolName === 'get_available_slots') {
      console.log(`Buscando slots para a data: ${args.date}`);
      return JSON.stringify({ available_slots: ["09:00", "10:30", "14:00", "16:00"] });
    }

    if (toolName === 'encaminhar_atendimento_humano') {
      await query(
        `INSERT INTO conversation_summaries (tenant_id, contact_id, is_bot_paused, bot_paused_at) 
         VALUES ($1, $2, true, NOW()) 
         ON CONFLICT (tenant_id, contact_id) DO UPDATE SET is_bot_paused = true, bot_paused_at = NOW()`,
        [tenantId, contactId]
      );
      return JSON.stringify({ status: "sucesso", mensagem: "Atendimento humano solicitado e bot pausado." });
    }

    return JSON.stringify({ error: "Ferramenta não encontrada." });
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    return JSON.stringify({ error: "Erro ao executar ferramenta." });
  }
}
