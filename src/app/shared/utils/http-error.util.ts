// Extrai uma mensagem legível do corpo de erro HTTP retornado pelo backend.
// O backend responde em formatos diferentes dependendo do tipo de erro:
// - string simples (regra de negocio / erro generico)
// - { error: string } (AccessDeniedException / 403)
// - { message: string }
// - { campo: mensagem, ... } (erros de validação por campo)
export function extractErrorMessage(err: any, fallback: string): string {
  const body = err?.error;

  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (body && typeof body === 'object') {
    if (typeof body.error === 'string') return body.error;
    if (typeof body.message === 'string') return body.message;

    const valores = Object.values(body).filter((v): v is string => typeof v === 'string');
    if (valores.length) return valores.join(' | ');
  }

  return fallback;
}
