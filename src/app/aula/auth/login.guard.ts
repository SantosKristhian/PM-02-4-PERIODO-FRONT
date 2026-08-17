import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';

const ROTAS_SOMENTE_ADM = ['/dashboard', '/relatorios', '/categorias', '/usuarios', '/auditoria'];

export const loginGuard: CanActivateFn = (route, state) => {

  let loginService = inject(AuthService);
  let notification = inject(NotificationService);

  if (loginService.hasCargo("VENDEDOR") && ROTAS_SOMENTE_ADM.includes(state.url)) {
    notification.warning('Você não tem permissão para acessar esta página.');
    return false;
  }

  return true;
};