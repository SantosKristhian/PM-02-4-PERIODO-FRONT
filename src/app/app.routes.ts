import { Routes } from '@angular/router';
import { RoleGuardService } from './guards/role.guard';
import { FirstAccessGuard } from './guards/primeiro-acesso';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Rota de primeiro acesso - sempre acessível
  { 
    path: 'primeiro-acesso', 
    loadComponent: () =>
      import('./guards/primeiro-acesso.component').then(m => m.PrimeiroAcessoComponent)
  },

  // Rota de login - verifica se há usuários antes de permitir acesso
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [FirstAccessGuard]
  },

  // Rotas protegidas por autenticação e role
  {
    path: 'produtos',
    loadComponent: () =>
      import('./pages/produtos/produto.component').then(m => m.ProdutoComponent),
    canActivate: [RoleGuardService],
    data: { roles: ['ADM','VENDEDOR'] }
  },
  {
    path: 'dashboard',
    loadComponent: () => 
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [RoleGuardService],
    data: { roles: ['ADM'] }
  },
  {
    path: 'vendas',
    loadComponent: () =>
      import('./pages/vendas/vendas.component').then(m => m.VendasComponent),
    canActivate: [RoleGuardService],
    data: { roles: ['ADM','VENDEDOR'] }
  },
  {
    path: 'usuarios',
    loadChildren: () =>
      import('./pages/usuarios/usuarios.module').then(m => m.UsuariosModule),
    canActivate: [RoleGuardService],
    data: { roles: ['ADM'] }
  },
  {
    path: 'relatorios',
    loadChildren: () =>
      import('./pages/relatorio/relatorios.module').then(m => m.RelatoriosModule),
    canActivate: [RoleGuardService],
    data: { roles: ['ADM'] }
  },
  {
    path: 'categorias',
    loadComponent: () =>
      import('./pages/categorias/CategoriasListComponent').then(m => m.CategoriasListComponent),
    canActivate: [RoleGuardService],
    data: { roles: ['ADM'] }
  },

  { path: '**', redirectTo: 'login' },
];