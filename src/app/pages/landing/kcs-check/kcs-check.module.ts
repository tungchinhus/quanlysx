import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';

// Material Design Modules
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Shared Module
import { SharedModule } from 'src/app/shared/shared.module';

// Constants
import { Constant } from 'src/app/constant/constant';

// Components
import { KcsCheckComponent } from './kcs-check.component';
import { ApproveDialogComponent } from './approve-dialog/approve-dialog.component';
import { RejectDialogComponent } from './reject-dialog/reject-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: KcsCheckComponent
  }
];

@NgModule({
  declarations: [
    KcsCheckComponent,
    ApproveDialogComponent,
    RejectDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    
    // Material Design Modules
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    
    // Shared Module
    SharedModule,
    
    // Routing
    RouterModule.forChild(routes),
    
    // Translation
    TranslateModule.forChild(Constant.translateConfig)
  ],
  exports: [
    KcsCheckComponent
  ]
})
export class KcsCheckModule {}
