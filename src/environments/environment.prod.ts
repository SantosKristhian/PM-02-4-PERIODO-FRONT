export const environment = {
  production: true,
  // Caminho relativo: o nginx do container faz proxy para o backend
  // via nome do servico Docker, entao o browser sempre fala com o
  // mesmo host de onde a pagina foi carregada, independente da rede.
  SERVIDOR: '/api/emanager'
};