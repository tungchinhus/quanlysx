import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore
} from '@ngx-translate/core';
import { RsfConfigFactory } from '@rsf/rsf-angular-base';
import { BehaviorSubject, Subject } from 'rxjs';
import { SliderComponent } from 'src/app/shared/components/slider/slider.component';
import { SharedModule } from 'src/app/shared/shared.module';

import { LandingComponent } from './landing.component';
import { LandingService } from './landing.service';
import { PayerInfoComponent } from './payer-info/payer-info.component';
import { PaymentInfoComponent } from './payment-info/payment-info.component';
import { PaymentResultComponent } from './payment-result/payment-result.component';
import { PolicyInfoComponent } from './policy-info/policy-info.component';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let landingService = {
    getEvent: () =>
      new BehaviorSubject<any>({
        step: 1,
        data: {}
      }).asObservable(),
      pushEvent: (data: any) => {},
      checkAllValidation: (controls: any) => {}
  };

  beforeEach(() => {
    const configRecord: Record<string, any> = {
      environment: {
        envName: 'dev',
        production: true,
        apiUrl: ''
      }
    };
    RsfConfigFactory.init(configRecord);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LandingComponent,
        SliderComponent,
        PolicyInfoComponent,
        PaymentInfoComponent,
        PayerInfoComponent,
        PaymentResultComponent
      ],
      providers: [
        TranslateService,
        TranslateStore,
        TranslateLoader,
        CommonService,
        { provide: LandingService, useValue: landingService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get(): number {
                  return 6;
                }
              }
            }
          }
        }
      ],
      imports: [HttpClientModule, SharedModule, BrowserAnimationsModule, TranslateModule.forChild()]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeUndefined();
  });
});
