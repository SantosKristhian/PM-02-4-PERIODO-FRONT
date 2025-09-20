import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// MDB Angular UI Kit
import { MdbCheckboxModule } from 'mdb-angular-ui-kit/checkbox';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';

import { ProdutosRoutingModule } from './produtos-routing.module';
import { ListComponent } from './pages/list/list.component';
import { FormComponent } from './pages/form/form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ProdutosRoutingModule,
    MdbCheckboxModule,
    MdbRippleModule,
    MdbFormsModule,
    ListComponent,  // importando componentes standalone
    FormComponent
  ]
})
export class ProdutosModule {}
