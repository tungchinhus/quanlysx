import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SliderContentComponent } from './components/slider/slider-content/slider-content.component';
import { SliderComponent } from './components/slider/slider.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { TranslateModule } from '@ngx-translate/core';
import { FooterComponent } from './components/footer/footer.component';
import { FormatCurrencyPipe } from './pipes/format-currency.pipe';
import { InlineAlertComponent } from './components/inline-alert/inline-alert.component';
import { Constant } from '../constant/constant';
import { HeadingPageComponent } from './components/heading-page/heading-page.component';
import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';
import { FormatDatePipe } from './pipes/format-date.pipe';
import { FormatUpperCase } from './pipes/format-uppercase-name';
import { TrimDirective } from './directives/trim.directive';
import { DateInputDirective } from './directives/date-input.directive';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { CurrencyInputDirective } from './directives/currency-input.directive';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { TabindexDirective } from './directives/tabindex.directive';
import { TokenService } from './services/token-service';
import { DynamicInputDirective } from './directives/dynamic-input.directive';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MaxLengthDirective } from './directives/max-length.directive';
import { StripeService } from './services/stripe.service';
import { PaymentService } from './services/payment.service';
import { LoginComponent } from './components/login/login.component';
import { DialogComponent } from './dialogs/dialog/dialog.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    CarouselModule,
    BsDatepickerModule,
    HttpClientModule,
    MatToolbarModule,
    MatIconModule,
    TranslateModule.forChild(Constant.translateConfig)
  ],
  declarations: [
    SliderComponent,
    SliderContentComponent,
    FooterComponent,
    FormatCurrencyPipe,
    FormatDatePipe,
    DialogComponent,
    InlineAlertComponent,
    HeadingPageComponent,
    LoadingIndicatorComponent,
    TooltipComponent,
    FormatUpperCase,
    TrimDirective,
    DateInputDirective,
    CurrencyInputDirective,
    TabindexDirective,
    DynamicInputDirective,
    MaxLengthDirective,
    LoginComponent
  ],
  exports: [
    MaterialModule,
    SliderComponent,
    SliderContentComponent,
    FooterComponent,
    FormatCurrencyPipe,
    FormatDatePipe,
    DialogComponent,
    InlineAlertComponent,
    HeadingPageComponent,
    LoadingIndicatorComponent,
    TooltipComponent,
    FormatUpperCase,
    TrimDirective,
    DateInputDirective,
    CurrencyInputDirective,
    TabindexDirective,
    DynamicInputDirective,
    MaxLengthDirective,
    LoginComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenService,
      multi: true
    },
    { 
      provide: Window,
      useValue: window
    },
    StripeService,
    PaymentService
  ]
})
export class SharedModule {}
