import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { APP_BASE_HREF, LOCATION_INITIALIZED } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Constant } from './constant/constant';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HttpErrorHandler } from './shared/services/http-error-handler.service';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { CommonService } from './shared/services/common.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { enGbLocale, viLocale } from 'ngx-bootstrap/locale';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { QuanDayComponent } from './pages/landing/quan-day/quan-day.component';
import { BoiDayHaComponent } from './pages/landing/quan-day/boi-day-ha/boi-day-ha.component';
import { BoiDayCaoComponent } from './pages/landing/quan-day/boi-day-cao/boi-day-cao.component';
import { EpBoiDayComponent } from './pages/landing/quan-day/ep-boi-day/ep-boi-day.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LandingService } from './pages/landing/landing.service';
import { TokenService } from './shared/services/token-service';
defineLocale('vi', viLocale);
defineLocale('en', enGbLocale);

declare global {
  interface Window {
    _: any;
  }
}

const AppInitializerFactory = (translate: TranslateService, injector: Injector, localeService: BsLocaleService) => {
  return async () => {
    Promise.all([await initializeApp(), await locationInitialized(translate, injector, localeService)]);
  };
};

const initializeApp = (): Promise<any> => {
  return Promise.resolve().then(() => {
    const env = new Environment(environment);
    console.log(`--- Starting environment ---`, env);
  });
};

const appBaseHref = () => {
  const env = new Environment(environment);
  return env.appBaseHref;
};

const locationInitialized = async (translate: TranslateService, injector: Injector, localeService: BsLocaleService) => {
  await injector.get(LOCATION_INITIALIZED, Promise.resolve(null));

  let deaultLang = 'vi';
  translate.addLangs(['en', 'vi']);
  if(localStorage.getItem('selectedLang')){
    deaultLang = localStorage.getItem('selectedLang') as string;
  } 
  translate.setDefaultLang(deaultLang);  
  localeService.use(deaultLang);
  try {
    await translate.use(deaultLang).toPromise();
  } catch (err) {
    console.log(err);
  }
  console.log(`Successfully initialized ${deaultLang} language.`);
};
@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    SharedModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatDatepickerModule,
    MatSidenavModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatIconModule,
    MatCardModule,
    FormsModule,
    MatTabsModule,
    MatSelectModule,
    MatButtonModule,  
    MatNativeDateModule, // Required for MatDatepicker
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule, 
    TranslateModule.forRoot(Constant.translateConfig),
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-CSRF-TOKEN'
    })
  ],
  declarations: [
    AppComponent, 
    QuanDayComponent,
    BoiDayHaComponent,
    BoiDayCaoComponent,
    EpBoiDayComponent
  ],
  providers: [
    CommonService,
    {
      provide: APP_INITIALIZER,
      useFactory: AppInitializerFactory,
      deps: [TranslateService, Injector, BsLocaleService],
      multi: true
    },
    {
      provide: APP_BASE_HREF,
      useFactory: appBaseHref
    },
    HttpErrorHandler,
    LandingService,
    TokenService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
