/**
 * Utilitários para formatação de datas
 * Corrige problemas de timezone que causavam D-1 nas datas
 */

/**
 * Formata uma data para exibição em pt-BR sem problemas de timezone
 * @param dateString - String da data (formato ISO ou YYYY-MM-DD)
 * @returns Data formatada em dd/MM/yyyy
 */
export const formatDateBR = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  // Se for uma data no formato YYYY-MM-DD (sem timezone), adiciona meio-dia UTC
  if (dateString.includes('-') && !dateString.includes('T')) {
    const fixedDate = new Date(dateString + 'T12:00:00Z');
    return fixedDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  }
  
  // Para datas com timestamp completo
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

/**
 * Formata uma data e hora para exibição em pt-BR
 * @param dateString - String da data/hora
 * @returns Data e hora formatadas
 */
export const formatDateTimeBR = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const dateFormatted = date.toLocaleDateString('pt-BR');
  const timeFormatted = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `${dateFormatted} às ${timeFormatted}`;
};

/**
 * Calcula a data aproximada da próxima consulta para exibição
 * @param baseDate - Data base (coleta)
 * @param returnType - Tipo de retorno
 * @returns String com a data aproximada formatada
 */
export const calculateNextConsultationDate = (baseDate: string, returnType: string): string => {
  if (!baseDate || !returnType) return '';
  
  if (returnType === 'Imediato') {
    return 'RETORNO IMEDIATO NECESSÁRIO';
  }
  
  let monthsToAdd = 0;
  switch (returnType) {
    case '6m':
      monthsToAdd = 6;
      break;
    case '1a':
      monthsToAdd = 12;
      break;
    case '2a':
      monthsToAdd = 24;
      break;
    default:
      return 'Conforme orientação médica';
  }
  
  // Usar a data correta sem problemas de timezone
  const baseDateTime = baseDate.includes('T') ? new Date(baseDate) : new Date(baseDate + 'T12:00:00Z');
  const nextDate = new Date(baseDateTime);
  nextDate.setMonth(nextDate.getMonth() + monthsToAdd);
  
  return `Aproximadamente: ${nextDate.toLocaleDateString('pt-BR')}`;
};

/**
 * Calcula a data da próxima consulta para salvar no banco de dados
 * @param baseDate - Data base (coleta)
 * @param returnType - Tipo de retorno
 * @returns Data no formato YYYY-MM-DD para o banco ou null
 */
export const calculateNextConsultationDateForDB = (baseDate: string, returnType: string): string | null => {
  if (!baseDate || !returnType || returnType === 'Imediato') return null;
  
  let monthsToAdd = 0;
  switch (returnType) {
    case '6m':
      monthsToAdd = 6;
      break;
    case '1a':
      monthsToAdd = 12;
      break;
    case '2a':
      monthsToAdd = 24;
      break;
    default:
      return null;
  }
  
  // Usar a data correta sem problemas de timezone
  const baseDateTime = baseDate.includes('T') ? new Date(baseDate) : new Date(baseDate + 'T12:00:00Z');
  const nextDate = new Date(baseDateTime);
  nextDate.setMonth(nextDate.getMonth() + monthsToAdd);
  
  // Retornar no formato YYYY-MM-DD
  return nextDate.toISOString().split('T')[0];
};