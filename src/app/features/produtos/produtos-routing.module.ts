import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './pages/list/list.component';
import { FormComponent } from './pages/form/form.component';

const routes: Routes = [
  { path: '', component: ListComponent },          // /produtos
  { path: 'form', component: FormComponent },      // /produtos/form
  { path: 'edit/:id', component: FormComponent }   // /produtos/edit/1
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProdutosRoutingModule {}
