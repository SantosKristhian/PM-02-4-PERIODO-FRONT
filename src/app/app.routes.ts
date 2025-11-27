import { Routes } from '@angular/router';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

 
  // Rota de login - verifica se há usuários antes de permitir acesso
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
    
  },

  // Rotas protegidas por autenticação e role
  {
    path: 'produtos',
    loadComponent: () =>
      import('./pages/produtos/produto.component').then(m => m.ProdutoComponent),
      data: { roles: ['ADM','VENDEDOR'] }
  },
  {
    path: 'dashboard',
    loadComponent: () => 
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
       data: { roles: ['ADM'] }
  },
  {
    path: 'vendas',
    loadComponent: () =>
      import('./pages/vendas/vendas.component').then(m => m.VendasComponent),
        data: { roles: ['ADM','VENDEDOR'] }
  },
  {
    path: 'usuarios',
    loadChildren: () =>
      import('./pages/usuarios/usuarios.module').then(m => m.UsuariosModule),
        data: { roles: ['ADM'] }
  },
  {
    path: 'relatorios',
    loadChildren: () =>
      import('./pages/relatorio/relatorios.module').then(m => m.RelatoriosModule),
      data: { roles: ['ADM'] }
  },
  {
    path: 'categorias',
    loadComponent: () =>
      import('./pages/categorias/CategoriasListComponent').then(m => m.CategoriasListComponent),
        data: { roles: ['ADM'] }
  },

  { path: '**', redirectTo: 'login' },
];