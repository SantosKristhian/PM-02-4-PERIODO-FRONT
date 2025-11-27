import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  constructor(private auth: AuthStateService, private router: Router) {}

  get isAdmin() { return this.auth.isAdmin(); }
  get isVendedor() { return this.auth.isVendedor(); }
  get currentUser() { return this.auth.currentUser; }

  
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

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  confirmLogout() {
    const ok = confirm('Deseja realmente sair?');
    if (ok) this.logout();
  }
}
