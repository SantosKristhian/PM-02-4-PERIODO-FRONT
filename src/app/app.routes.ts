import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
  path: '', 
  pathMatch: 'full',
  loadComponent: () => import('./features/auth/pages/login/login.component')
  .then(m => m.LoginComponent)
  },

  {
    path: 'vendas',
    loadChildren: () =>
      import('./features/vendas/vendas.module').then(m => m.VendasModule)
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
  // rota para página não encontrada
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
