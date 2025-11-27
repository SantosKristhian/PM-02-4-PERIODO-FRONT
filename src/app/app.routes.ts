import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ProdutoComponent } from './pages/produtos/produto.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VendasComponent } from './pages/vendas/vendas.component';
import { UsuariosModule } from './pages/usuarios/usuarios.module';
import { RelatoriosModule } from './pages/relatorio/relatorios.module';
import { CategoriasListComponent } from './pages/categorias/CategoriasListComponent';
import { loginGuard } from './aula/auth/login.guard';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [loginGuard] },
  { path: 'produtos', component: ProdutoComponent, canActivate: [loginGuard] },
  { path: 'vendas', component: VendasComponent, canActivate: [loginGuard] },
  { path: 'categorias', component: CategoriasListComponent, canActivate: [loginGuard] },
  { path: 'usuarios', loadChildren: () => import('./pages/usuarios/usuarios.module').then(m => m.UsuariosModule), canActivate: [loginGuard] },
  { path: 'relatorios', loadChildren: () => import('./pages/relatorio/relatorios.module').then(m => m.RelatoriosModule), canActivate: [loginGuard] },
  { path: '**', redirectTo: 'login' }
];