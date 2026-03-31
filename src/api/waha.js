import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const wahaApi = axios.create({
  baseURL: process.env.WAHA_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    ...(process.env.WAHA_SECRET_KEY && { 'X-Api-Key': process.env.WAHA_SECRET_KEY })
  }
});

export async function sendText(session, chatId, text) {
  try {
    await wahaApi.post('/api/sendText', {
      session: session,
      chatId: chatId,
      text: text
    });
  } catch (error) {
    console.error('Error sending message via WAHA:', error?.response?.data || error.message);
  }
}

export async function startTyping(session, chatId) {
  try {
    await wahaApi.post('/api/startTyping', {
      session: session,
      chatId: chatId
    });
  } catch (error) {
    console.error('Error starting typing via WAHA:', error?.response?.data || error.message);
  }
}

export async function stopTyping(session, chatId) {
  try {
    await wahaApi.post('/api/stopTyping', {
      session: session,
      chatId: chatId
    });
  } catch (error) {
    console.error('Error stopping typing via WAHA:', error?.response?.data || error.message);
  }
}

