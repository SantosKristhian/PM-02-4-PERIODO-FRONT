import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';

@Injectable({ providedIn: 'root' })
export class RoleGuardService implements CanActivate {
  constructor(private auth: AuthStateService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.auth.currentUser;
  const roles: string[] = (route.data && (route.data as any)['roles']) || [];

    if (!user) {
      // nao logado -> redireciona para o login
      this.router.navigate(['/login']);
      return false;
    }

    if (roles.length === 0) return true;

    if (roles.includes(user.cargo)) return true;

    // logado mas nao autorizado -> redireciona para vendas
    this.router.navigate(['/vendas']);
    return false;
  }
}
