import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsComponent } from './components.component';
import { SharedModule } from '../shared.module';
import { Constant } from '../../constant/constant';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: ComponentsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(Constant.translateConfig)
  ],
  declarations: [
    ComponentsComponent
  ]
})
export class ComponentsModule { }
