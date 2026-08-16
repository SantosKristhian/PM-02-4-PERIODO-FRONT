import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStateService } from '../../services/auth-state.service';

export const meuhttpInterceptor: HttpInterceptorFn = (request, next) => {

  let router = inject(Router);
  let authState = inject(AuthStateService);

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
          authState.logout();
          router.navigate(['/login']);
        } else if (err.status === 403) {
          // Usuário autenticado, só sem permissão para essa ação - nao desloga.
          const mensagem = err.error?.error || 'Você não tem permissão para executar esta ação.';
          alert(mensagem);
        } else {
          console.error('HTTP error:', err);
        }
      } else {
        console.error('An error occurred:', err);
      }

      return throwError(() => err);
    })
  );
};
