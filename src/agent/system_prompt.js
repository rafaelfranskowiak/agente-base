export async function getSystemPrompt(tenantId, contactId) {
  // Aqui você pode buscar dados dinâmicos do banco baseados no tenantId
  // Exemplo: horários de funcionamento, nome do médico, serviços oferecidos
  
  const basePersona = `Você é um assistente virtual prestativo de uma clínica médica/serviço.`;
  
  const rules = `
Regras:
- Seja sempre educado e conciso.
- Para agendamentos, verifique a disponibilidade de horários.
- Horário de funcionamento: Seg a Sex, 08:00 às 18:00.
`;

  // Montagem de blocos dinâmicos (exemplo)
  let dynamicBlocks = '';
  
  // if (tenantSettings.hasPromotions) {
  //   dynamicBlocks += `\n- Atualmente temos uma promoção de Check-up Geral.`;
  // }

  return `${basePersona}\n${rules}\n${dynamicBlocks}`;
}