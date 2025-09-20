import { Routes } from '@angular/router';
import { ListComponent } from './features/produtos/pages/list/list.component'; // importe o ListComponent

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'produtos',
    component: ListComponent // rota para redirecionar após login
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
