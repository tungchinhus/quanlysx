import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },

  {
    path: 'landing',
    loadChildren: () => import('./pages/landing/landing.module').then((m) => m.LandingModule)
  },
  {
    path: 'components',
    loadChildren: () =>
      import('./shared/components/components.module').then((m) => m.ComponentsModule),
    canActivate: [() => import('./shared/guards/auth.guard').then(m => m.AuthGuard)]
  },
  {
    path: 'result-passed',
    loadChildren: () => import('./pages/landing/result-passed/result-passed.module').then((m) => m.ResultPassedModule),
    canActivate: [() => import('./shared/guards/auth.guard').then(m => m.AuthGuard)]
  },
  {
    path: 'result-failed',
    loadChildren: () => import('./pages/landing/result-failed/result-failed.module').then(m => m.ResultFailedModule),
    canActivate: [() => import('./shared/guards/auth.guard').then(m => m.AuthGuard)]
  },
  {
    path: 'payment-result',
    loadChildren: () => import('./pages/landing/payment-result/payment-result.module').then((m) => m.PaymentResultModule),
    canActivate: [() => import('./shared/guards/auth.guard').then(m => m.AuthGuard)]
  },
  {
    path: 'maintenance',
    loadChildren: () => import('./pages/landing/maintenance/maintenance.module').then((m) => m.MaintenanceModule),
    canActivate: [() => import('./shared/guards/auth.guard').then(m => m.AuthGuard)]
  },
  {
    path: 'ds-bang-ve',
    loadChildren: () => import('./pages/landing/ds-bangve/ds-bangve.module').then(m => m.DSBangVeModule),
    canActivate: [() => import('./shared/guards/auth.guard').then(m => m.AuthGuard)]
  },
  {
    path: 'quan-day',
    loadChildren: () => import('./pages/landing/quan-day/quan-day.module').then(m => m.QuanDayModule),
    canActivate: [() => import('./shared/guards/auth.guard').then(m => m.AuthGuard)]
  },
  {
    path: 'ds-quan-day',
    loadChildren: () => {
      console.log('🔍 App Routing: Loading ds-quan-day module');
      return import('./pages/landing/ds-quan-day/ds-quan-day.module').then(m => {
        console.log('🔍 App Routing: ds-quan-day module loaded successfully');
        return m.DSQuanDayModule;
      }).catch(error => {
        console.error('🔍 App Routing: Error loading ds-quan-day module:', error);
        throw error;
      });
    },
    canActivate: [() => import('./shared/guards/auth.guard').then(m => m.AuthGuard)]
  },
  {
    path: 'kcs-check',
    loadChildren: () => import('./pages/landing/kcs-check/kcs-check.module').then(m => m.KcsCheckModule),
    canActivate: [() => import('./shared/guards/auth.guard').then(m => m.AuthGuard)]
  },
  {
    path: 'boi-day-ha',
    loadChildren: () => import('./pages/landing/boi-day-ha/boi-day-ha.module').then(m => m.BoiDayHaModule),
    canActivate: [() => import('./shared/guards/auth.guard').then(m => m.AuthGuard)]
  },
  {
    path: 'boi-day-cao',
    loadChildren: () => import('./pages/landing/boi-day-cao/boi-day-cao.module').then(m => m.BoiDayCaoModule),
    canActivate: [() => import('./shared/guards/auth.guard').then(m => m.AuthGuard)]
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