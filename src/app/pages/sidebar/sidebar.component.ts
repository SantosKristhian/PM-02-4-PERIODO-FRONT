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

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  confirmLogout() {
    const ok = confirm('Deseja realmente sair?');
    if (ok) this.logout();
  }
}
