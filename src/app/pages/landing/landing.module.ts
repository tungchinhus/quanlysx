import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LandingComponent } from './landing.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Constant } from 'src/app/constant/constant';
import { SharedModule } from 'src/app/shared/shared.module';
import { LandingService } from './landing.service';
import { PaymentInfoComponent } from './payment-info/payment-info.component';
import { PolicyInfoComponent } from './policy-info/policy-info.component';
import { PayerInfoComponent } from './payer-info/payer-info.component';
import { PaymentResultComponent } from './payment-result/payment-result.component';
import { PayerInfoIntegrateComponent } from './payer-info-integrate/payer-info-integrate.component';
import { RelationshipInfoComponent } from './relationship-info/relationship-info.component';
import { PayerFormComponent } from './payer-form/payer-form.component';
import { RelationshipInfoService } from './relationship-info/relationship-info.service';
import { PayerInfoService } from './payer-info/payer-info.service';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { BangVeComponent } from './bang-ve/bang-ve.component';

const routes: Routes = [
  {
    path: 'landing',
    component: LandingComponent
  }
];

@NgModule({
  declarations: [
    LandingComponent,
    PaymentInfoComponent,
    PolicyInfoComponent,
    PayerInfoComponent,
    PayerInfoIntegrateComponent,
    RelationshipInfoComponent,
    PayerFormComponent,
    BangVeComponent,

  ],
  imports: [
    CommonModule,
    SharedModule,
    MatDatepickerModule,
    MatTableModule,
    MatChipsModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatCardModule,
    MatRadioModule,
    MatNativeDateModule,
    MatSelectModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(Constant.translateConfig),
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule
  ],
  providers: [
    LandingService,
    RelationshipInfoService,
    PayerInfoService,
    Location,
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class LandingModule {}
