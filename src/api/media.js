export async function processMedia(message) {
  if (message.hasMedia) {
    return '[MÍDIA NÃO PROCESSADA NESTA VERSÃO BÁSICA]';
  }
  return null;
}
