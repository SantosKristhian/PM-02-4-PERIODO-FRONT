import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'produtos',
    loadComponent: () =>
      import('./pages/produtos/produto.component').then(m => m.ProdutoComponent)
  },
  {
    path: 'vendas',
    loadComponent: () =>
      import('./pages/vendas/vendas.component').then(m => m.VendasComponent)
  },
  {
    path: 'usuarios',
    loadChildren: () =>
      import('./pages/usuarios/usuarios.module').then(m => m.UsuariosModule)
  },
  {
    path: 'relatorios',
    loadChildren: () =>
      import('./pages/relatorio/relatorios.module').then(m => m.RelatoriosModule)
  },
  {
    path: 'categorias',
    loadComponent: () =>
      import('./pages/categorias/CategoriasListComponent').then(m => m.CategoriasListComponent)
  },

  { path: '**', redirectTo: '' },
];
