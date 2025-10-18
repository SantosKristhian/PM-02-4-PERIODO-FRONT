// first-access.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UsuariosService } from '../services/usuarios.service';

@Injectable({
  providedIn: 'root'
})
export class FirstAccessGuard implements CanActivate {

  constructor(
    private usuariosService: UsuariosService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.usuariosService.existemUsuarios().pipe(
      map(existem => {
        if (!existem) {
          // Não há usuários, redireciona para criação de admin
          this.router.navigate(['/primeiro-acesso']);
          return false;
        }
        // Há usuários, permite acesso
        return true;
      }),
      catchError(() => {
        // Em caso de erro, permite acesso
        return of(true);
      })
    );
  }
}