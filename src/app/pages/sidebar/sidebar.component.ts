import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../services/auth-state.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  auth = inject(AuthService);
  authState = inject(AuthStateService);
  router = inject(Router);

  constructor() {}

   get currentUser() { return this.authState.currentUser; }

  
  get userNome(): string {
    const u = this.currentUser;
    if (!u) return '';
    return (u.nome || u.name || u.username || u.sub || '').toString();
  }

   
  get userCargo(): string {
    const u = this.currentUser;
    if (!u) return '';
    const cargo = u.cargo || u.role || (u.roles && u.roles[0]) || u['authority'] || '';
    return cargo ? cargo.toString() : '';
  }

 

  confirmLogout() {
    const ok = confirm('Deseja realmente sair?');
    if (!ok) return;
    this.authState.logout();
    this.router.navigate(['/login']);
  }

  // Helper to safely check if user has a specific cargo/role
  // Checks token first, falls back to AuthStateService, safe for template binding
  hasCargo(role: string): boolean {
    try {
      // Try via AuthService (decodes token)
      const user = this.auth.getUsuarioLogado();
      if (user && typeof user === 'object' && user.cargo === role) {
        return true;
      }

      // Fallback: check via AuthStateService
      const currentUser = this.authState.currentUser;
      if (currentUser && (currentUser.cargo === role || currentUser.role === role)) {
        return true;
      }

      return false;
    } catch (e) {
      console.warn('Error checking cargo:', e);
      return false;
    }
  }
}
