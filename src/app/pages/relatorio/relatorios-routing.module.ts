
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RelatorioComponent } from './relatorio.component';
import { VendaDetalheComponent } from './venda-detalhe.component';

const routes: Routes = [
  { path: '', component: RelatorioComponent }
  ,{ path: 'venda/:id', component: VendaDetalheComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RelatoriosRoutingModule { }
