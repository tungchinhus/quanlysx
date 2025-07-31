import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Constant } from 'src/app/constant/constant';
import { SharedModule } from 'src/app/shared/shared.module';
import { ResultFailedComponent } from './result-failed.component';

const routes: Routes = [
  {
    path: '',
    component: ResultFailedComponent
  }
];

@NgModule({
  declarations: [ResultFailedComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(Constant.translateConfig)
  ]
})
export class ResultFailedModule {}
