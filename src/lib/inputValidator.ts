/**
 * Input Validator & Sanitizer for Atlas City
 * Proteção contra SQL Injection, XSS e Prompt Injection
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized: string;
}

const FORBIDDEN_PATTERNS = [
  // Prompt Injection
  /ignore\s+previous\s+instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+now/i,
  /bypass\s+security/i,
  /reveal\s+your\s+instructions/i,
  // SQL Injection
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /drop\s+table/i,
  /union\s+select/i,
  // System Commands
  /rm\s+-rf/i,
  /chmod\s+/i,
  /process\.env/i
];

export function validateUserInput(text: string): ValidationResult {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: "Input inválido", sanitized: "" };
  }

  // 1. Tamanho
  const trimmed = text.trim();
  if (trimmed.length < 5) {
    return { valid: false, error: "Mensagem muito curta (mínimo 5 caracteres)", sanitized: trimmed };
  }
  if (trimmed.length > 2000) {
    return { valid: false, error: "Mensagem muito longa (máximo 2000 caracteres)", sanitized: trimmed.substring(0, 2000) };
  }

  // 2. Sanitização básica XSS
  let sanitized = trimmed
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/<[^>]+>/gm, "") // Remove HTML tags
    .replace(/[<>]/g, "");    // Remove left-over brackets

  // 3. Detectar Padrões Proibidos
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(sanitized)) {
      return { 
        valid: false, 
        error: "Detectado padrão de segurança proibido no input", 
        sanitized 
      };
    }
  }

  return { valid: true, sanitized };
}
