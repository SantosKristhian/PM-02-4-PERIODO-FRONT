import { Routes } from '@angular/router';
import { VendasComponent } from './features/vendas/pages/vendas/vendas.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'produtos/list',
    loadComponent: () =>
      import('./features/produtos/pages/list/list.component').then(m => m.ListComponent)
  },
  {
    path: 'vendas',
    loadComponent: () =>
      import('./features/vendas/pages/vendas/vendas.component').then(m => m.VendasComponent)
  },
  {
    path: 'usuarios',
    loadChildren: () =>
      import('./features/usuarios/usuarios.module').then(m => m.UsuariosModule)
  },
  {
    path: 'relatorios',
    loadChildren: () =>
      import('./features/relatorios/relatorios.module').then(m => m.RelatoriosModule)
  },
  {
    path: 'categorias',
    loadComponent: () =>
      import('./features/categorias/CategoriasListComponent').then(m => m.CategoriasListComponent)
  },

  { path: '**', redirectTo: '' }
];
