import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
  path: '', 
  pathMatch: 'full',
  loadComponent: () => import('./features/produtos/pages/list/list.component').then(m => m.ListComponent)
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
