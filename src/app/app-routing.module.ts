import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'components',
    loadChildren: () =>
      import('./shared/components/components.module').then((m) => m.ComponentsModule)
  },
  {
    path: 'landing',
    loadChildren: () => import('./pages/landing/landing.module').then((m) => m.LandingModule)
  },
  {
    path: 'result-passed',
    loadChildren: () => import('./pages/landing/result-passed/result-passed.module').then((m) => m.ResultPassedModule)
  },
  {
    path: 'result-failed',
    loadChildren: () => import('./pages/landing/result-failed/result-failed.module').then(m => m.ResultFailedModule)    
  },
  {
    path: 'payment-result',
    loadChildren: () => import('./pages/landing/payment-result/payment-result.module').then((m) => m.PaymentResultModule)
  },
  {
    path: 'maintenance',
    loadChildren: () => import('./pages/landing/maintenance/maintenance.module').then((m) => m.MaintenanceModule)
  },
  {
    path: 'ds-bang-ve',
    loadChildren: () => import('./pages/landing/ds-bangve/ds-bangve.module').then(m => m.DSBangVeModule),
    canActivate: [() => import('./shared/guards/auth.guard').then(m => m.AuthGuard)]
  },
  {
    path: 'quan-day',
    loadChildren: () => import('./pages/landing/quan-day/quan-day.module').then(m => m.QuanDayModule)
  },
  {
    path: 'ds-quan-day',
    loadChildren: () => import('./pages/landing/ds-quan-day/ds-quan-day.module').then(m => m.DSQuanDayModule)
    // Temporarily comment out guard for testing
    // canActivate: [() => import('./pages/landing/ds-quan-day/ds-quan-day.guard').then(m => m.WindingAccessGuard)]
  },
  {
    path: 'boi-day-ha',
    loadChildren: () => import('./pages/landing/boi-day-ha/boi-day-ha.module').then(m => m.BoiDayHaModule)
  },
  {
    path: 'boi-day-cao',
    loadChildren: () => import('./pages/landing/boi-day-cao/boi-day-cao.module').then(m => m.BoiDayCaoModule)
  },
  {
    path: '**',
    redirectTo: 'landing',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}