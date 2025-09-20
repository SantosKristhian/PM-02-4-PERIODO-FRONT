import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './pages/list/list.component';
import { FormComponent } from './pages/form/form.component';

export const routes: Routes = [
  { path: '', component: ListComponent },  // ListComponent já é standalone
  { path: 'form', component: FormComponent } // FormComponent também
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProdutosRoutingModule {}
