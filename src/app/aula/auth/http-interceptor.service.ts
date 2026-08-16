import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStateService } from '../../services/auth-state.service';
import { NotificationService } from '../../shared/services/notification.service';
import { extractErrorMessage } from '../../shared/utils/http-error.util';

export const meuhttpInterceptor: HttpInterceptorFn = (request, next) => {

  let router = inject(Router);
  let authState = inject(AuthStateService);
  let notification = inject(NotificationService);

  let token = localStorage.getItem('token');

  if (token && !router.url.includes('/login')) {
    request = request.clone({
      setHeaders: { Authorization: 'Bearer ' + token },
    });
  }

  return next(request).pipe(
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          // Sessão inválida/expirada: desloga de verdade e manda pro login.
          notification.error('Sua sessão expirou. Faça login novamente.');
          authState.logout();
          router.navigate(['/login']);
        } else {
          // Usuário autenticado (403 - sem permissão) ou outro erro do backend:
          // mostra a mensagem em um toast, sem deslogar nem navegar.
          notification.error(extractErrorMessage(err, 'Ocorreu um erro inesperado. Tente novamente.'));
        }
      } else {
        console.error('An error occurred:', err);
      }

      return throwError(() => err);
    })
  );
};
