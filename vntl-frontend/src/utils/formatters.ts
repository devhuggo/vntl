/**
 * Funções utilitárias para formatação e validação de dados
 */

/**
 * Aplica máscara de CPF (000.000.000-00)
 * @param value - Valor a ser formatado
 * @returns Valor formatado com máscara de CPF
 */
export const applyCPFMask = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica a máscara progressivamente
  if (limitedNumbers.length <= 3) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 6) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3)}`;
  } else if (limitedNumbers.length <= 9) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6)}`;
  } else {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6, 9)}-${limitedNumbers.slice(9, 11)}`;
  }
};

/**
 * Valida CPF verificando se contém exatamente 11 dígitos
 * @param cpf - CPF a ser validado (pode conter formatação)
 * @returns true se o CPF contém 11 dígitos, false caso contrário
 */
export const validateCPF = (cpf: string): boolean => {
  // Remove formatação para validar
  const numbers = cpf.replace(/\D/g, '');
  return numbers.length === 11;
};

/**
 * Aplica máscara de telefone ((00) 00000-0000 ou (00) 0000-0000)
 * @param value - Valor a ser formatado
 * @returns Valor formatado com máscara de telefone
 */
export const applyPhoneMask = (value: string | undefined): string => {
  if (!value) return '';
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos (máximo para celular)
  const limitedNumbers = numbers.slice(0, 11);
  
  if (limitedNumbers.length === 0) return '';
  
  // Aplica a máscara progressivamente
  if (limitedNumbers.length <= 2) {
    return limitedNumbers.length === 2 ? `(${limitedNumbers})` : `(${limitedNumbers}`;
  } else if (limitedNumbers.length <= 6) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  } else if (limitedNumbers.length <= 10) {
    // Formato para telefone fixo (10 dígitos): (00) 0000-0000
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
  } else {
    // Formato para celular (11 dígitos): (00) 90000-0000
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7, 11)}`;
  }
};

/**
 * Valida telefone verificando se contém 10 ou 11 dígitos
 * @param phone - Telefone a ser validado (pode conter formatação)
 * @returns true se o telefone contém 10 ou 11 dígitos, false caso contrário. Retorna true se o telefone estiver vazio (opcional)
 */
export const validatePhone = (phone: string | undefined): boolean => {
  if (!phone) return true; // Telefone é opcional
  // Remove formatação para validar
  const numbers = phone.replace(/\D/g, '');
  // Aceita 10 ou 11 dígitos
  return numbers.length === 10 || numbers.length === 11;
};

/**
 * Remove formatação de um valor, mantendo apenas números
 * @param value - Valor a ser limpo
 * @returns Valor contendo apenas números
 */
export const removeFormatting = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Converte data do formato ISO (yyyy-mm-dd) para formato brasileiro (dd/mm/yyyy)
 * @param dateString - Data no formato ISO (yyyy-mm-dd) ou vazia
 * @returns Data formatada no formato brasileiro (dd/mm/yyyy) ou string vazia
 */
export const formatDateToBR = (dateString: string | undefined): string => {
  if (!dateString) return '';
  
  // Se já está no formato dd/mm/yyyy, retorna como está
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }
  
  // Converte de yyyy-mm-dd para dd/mm/yyyy sem usar Date() para evitar problemas de timezone
  // Extrai diretamente da string para evitar conversão de timezone
  const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }
  
  return '';
};

/**
 * Converte data do formato brasileiro (dd/mm/yyyy) para formato ISO (yyyy-mm-dd)
 * @param dateString - Data no formato brasileiro (dd/mm/yyyy)
 * @returns Data formatada no formato ISO (yyyy-mm-dd) ou string vazia
 */
export const formatDateToISO = (dateString: string): string => {
  if (!dateString) return '';
  
  // Se já está no formato yyyy-mm-dd, retorna como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Remove tudo que não é número
  const numbers = dateString.replace(/\D/g, '');
  
  if (numbers.length !== 8) return '';
  
  const day = numbers.slice(0, 2);
  const month = numbers.slice(2, 4);
  const year = numbers.slice(4, 8);
  
  // Valida a data
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900) {
    return '';
  }
  
  return `${year}-${month}-${day}`;
};

/**
 * Aplica máscara de data no formato dd/mm/yyyy
 * @param value - Valor a ser formatado
 * @returns Valor formatado com máscara de data
 */
export const applyDateMask = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 8 dígitos
  const limitedNumbers = numbers.slice(0, 8);
  
  if (limitedNumbers.length === 0) return '';
  
  // Aplica a máscara progressivamente
  if (limitedNumbers.length <= 2) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 4) {
    return `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(2)}`;
  } else {
    return `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(2, 4)}/${limitedNumbers.slice(4, 8)}`;
  }
};
