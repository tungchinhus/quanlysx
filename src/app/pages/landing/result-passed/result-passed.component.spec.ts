import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore
} from '@ngx-translate/core';
import { SharedModule } from '../../../shared/shared.module';
import { ResultPassedComponent } from './result-passed.component';
import { HttpErrorHandler } from 'src/app/shared/services/http-error-handler.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { PAYMENT_STATUS } from 'src/app/shared/enums/common.enum';
import { LandingService } from '../landing.service';
import { Observable } from 'rxjs';

describe('ResultPassedComponent', () => {
  const landingService = {
    pushEvent: (data: any) => {},
    checkAllValidation: (controls: any) => {},
    getTransactionStatus(data: any) {
      return new Observable((subscriber) => {
        return subscriber.next({status:PAYMENT_STATUS.SUCCESS});
      });
    }
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResultPassedComponent],
      providers: [HttpClient,HttpHandler,HttpErrorHandler,
        TranslateStore,
        CommonService,{
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            queryParamMap: {
              get(): number {
                return 6;
              }
            },
            queryParams:[{orderRef:'4324423342'},{status:PAYMENT_STATUS.SUCCESS}]
          }
        }
      },{ provide: LandingService, useValue: landingService }],
      imports: [HttpClientModule, SharedModule, TranslateModule.forChild()]
    }).compileComponents();
  });

  xit('should create', () => {
    const fixture = TestBed.createComponent(ResultPassedComponent);
    const component = fixture.componentInstance;
    window.onbeforeunload = jasmine.createSpy();
    expect(component).toBeTruthy();
  });

  xit('should call printReceipt()', () => {
    const fixture = TestBed.createComponent(ResultPassedComponent);
    const component = fixture.componentInstance;
    component.printReceipt();
    window.onbeforeunload = jasmine.createSpy();
    expect(component).toBeTruthy();
  });
  xit('should call cancelTransaction()', () => {
    const fixture = TestBed.createComponent(ResultPassedComponent);
    const component = fixture.componentInstance;
    component.back();
    window.onbeforeunload = jasmine.createSpy();
    expect(component).toBeTruthy();
  });
  xit('should combineBills', () => {
    const fixture = TestBed.createComponent(ResultPassedComponent);
    const component = fixture.componentInstance;
    component.combineBills({policies:[]});
    expect(component).toBeTruthy();
  });
});
