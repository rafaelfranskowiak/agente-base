import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return new Array(1536).fill(0);
  }
}

export async function chatCompletion(messages, tools = []) {
  try {
    const options = {
      model: 'gpt-4.1-mini',
      messages,
      temperature: 0.1,
    };

    if (tools && tools.length > 0) {
      options.tools = tools;
      options.tool_choice = 'auto';
    }

    const response = await openai.chat.completions.create(options);
    return response.choices[0].message;
  } catch (error) {
    console.error('Error in chat completion:', error);
    throw error;
  }
}

export async function summarizeConversation(recentHistory, oldSummary) {
  try {
    const prompt = `Você é um assistente de IA. Atualize o resumo desta conversa em até 2000 caracteres, mantendo fatos importantes, intenções do usuário e estado do atendimento.\n\nResumo Antigo:\n${oldSummary}\n\nHistórico Recente:\n${recentHistory}`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.1,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error in summarizeConversation:', error);
    return oldSummary;
  }
}

