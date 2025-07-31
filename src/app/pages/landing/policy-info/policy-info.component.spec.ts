import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule
} from '@angular/platform-browser/animations';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore
} from '@ngx-translate/core';
import { RsfConfigFactory } from '@rsf/rsf-angular-base';
import { MockRender } from 'ng-mocks';
import { SharedModule } from 'src/app/shared/shared.module';
import { LandingService } from '../landing.service';
import { PolicyInfo } from '../models/payment.model';

import { PolicyInfoComponent } from './policy-info.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
let moment = require('moment');
describe('PolicyInfoComponent', () => {
  let component: PolicyInfoComponent;
  let fixture: ComponentFixture<PolicyInfoComponent>;
  const dueDate = new Date();
  const polInfo: PolicyInfo = {
    checked: false,
    dueDate,
    policyNumber: '2891237891',
    ownerName: 'Nguyễn Văn A',
    premiumType: 'Phí bảo hiểm hợp đồng mới',
    payAmount: 20000000
  };
  const reponseData={
    "collectionItems": [
        {
            "policyNumber": "2971286354",
            "bankAccountNumber": null,
            "ownerName": "Trương Phi",
            "ownerId": "0120000001",
            "productType": "U",
            "premiumType": "L",
            "dueDate": "2023-05-01",
            "autoDebitDate": null,
            "billId": "02023060800096",
            "flexibleIndicator": "Y",
            "billAmount": 2000000,
            "insuredDob": "2000-01-01"
        }
    ],
    "error": {
        "errorCode": "00",
        "timestamp": null,
        "message": null
    }
}
const sessionData={
  "sessionId": null,
  "expiredDate": "2023-09-13T07:37:57.198Z",
  "paymentTypeIndicator": "1",
  "payor": {
    "idType": "4",
    "identifier": "1234562345",
    "name": "NGUYEN HOANG SON LAM",
    "email": "cutedeptrai@gmail.com",
    "gender": "M",
    "birthDateStr": "30/12/1991",
    "cardNumber": null,
    "relationToOwner": null
  },
  "policies": [
    {
      "policyNumber": "2951159523",
      "clientName": "Client 2803122187",
      "birthDateStr": "30/12/1991",
      "paymentType": null,
      "isDefault": null,
      "policyChange": null
    }
  ]}
  const mockData: any = {
    checked: false,
    rows: [{
      "policyNumber": "2971286354",
      "bankAccountNumber": null,
      "ownerName": "Trương Phi",
      "ownerId": "0120000001",
      "productType": "U",
      "premiumType": "L",
      "dueDate": "2023-05-01",
      "autoDebitDate": null,
      "billId": "02023060800096",
      "flexibleIndicator": "Y",
      "billAmount": 2000000,
      "insuredDob": "2000-01-01"
    }]
  };
  const landingService = {
    pushEvent: (data: any) => {},
    checkAllValidation: (controls: any) => {},
    paymentList(data: any) {
      return new Observable((subscriber) => {
        return subscriber.next(reponseData);
      });
    },
    getSessionDetailCWS(data: any) {
      return new Observable((subscriber) => {
        return subscriber.next({});
      });
    }
  };
  const landingServiceError = {
    paymentList(data: any) {
      return new Observable((subscriber) => {
        return subscriber.next({"collectionItems": [],
                                "error": {
                                    "errorCode": "E00361",
                                    "timestamp": null,
                                    "message": "fdfdsd"
                                }});
      });
    }
  };
  const landingServiceHttpError = {
    paymentList(data: any) {
      return new Observable((subscriber) => {
        return subscriber.next(new HttpErrorResponse({ error: '9999' }));
      });
    }
  };

  beforeEach(async () => {
    (<any>window).moment = moment;
    const configRecord: Record<string, any> = {
      environment: {
        envName: 'dev',
        production: true,
        apiUrl: ''
      }
    };
    RsfConfigFactory.init(configRecord);
    await TestBed.configureTestingModule({
      declarations: [PolicyInfoComponent],
      providers: [
        TranslateService,
        TranslateStore,
        TranslateLoader,
        { provide: LandingService, useValue: landingService },{
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {
                ss:''
              }
            }
          }
        }
      ],
      imports: [
        HttpClientModule,
        SharedModule,
        BrowserAnimationsModule,
        NoopAnimationsModule,
        TranslateModule.forChild()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call selectOne()', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingService
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component['policyInfo'] = mockData;
    component.selectOne(0);
    expect(component.allComplete).toEqual(false);
  });

  it('should call setAll()', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData }
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component.selectAll(false);
    expect(component.allComplete).toEqual(false);
  });

  it('should call searchPolicy()', () => {
    const result: any = {
      topUp: null,
      renewalPremium: [],
      reinstatement: null,
      policyChange: null,
      loan: null,
      initPremium: null,
      flexiblePremium: null,
    };
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingService
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component.searchForm.get('polNum')?.setValue("423432");
    component.searchForm.get('insuredName')?.setValue("423432");
    component.searchForm.get('insuredDob')?.setValue("01/01/2000");
    component.searchForm.get('paymentReason')?.setValue("L");
    component.searchPolicy();
    component.FormControlDisable(false);
    expect(component).toBeTruthy();
  });
  it('should call searchPolicy() with return error', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingServiceError
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component.searchForm.get('polNum')?.setValue("423432");
    component.searchForm.get('insuredName')?.setValue("423432");
    component.searchForm.get('insuredDob')?.setValue("01/01/2000");
    component.searchForm.get('paymentReason')?.setValue("L");
    component.searchPolicy();
    expect(component).toBeTruthy();
  });
  it('should call searchPolicy() with incorrect', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingServiceError
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component.searchForm.get('polNum')?.setValue("423432");
    component.searchForm.get('polNum')?.setErrors({ incorrect: true });
    component.searchPolicy();
    expect(component).toBeTruthy();
  });
  it('should call searchPolicy() with return HTTP error', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingServiceHttpError
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component.searchForm.get('polNum')?.setValue("423432");
    component.searchForm.get('insuredName')?.setValue("423432");
    component.searchForm.get('insuredDob')?.setValue("01/01/2000");
    component.searchForm.get('paymentReason')?.setValue("L");
    component.searchPolicy();
    expect(component).toBeTruthy();
  });

  it('should call changeInsuredName()', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingService
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component.searchForm.get('insuredName')?.setValue("423432");
    component.changeInsuredName();
    expect(component).toBeTruthy();
  });
  it('should call checkFormValid()', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingService
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component.searchForm.get('polNum')?.setValue("423432");
    component.searchForm.get('insuredName')?.setValue("423432");
    component.searchForm.get('insuredDob')?.setValue("01/01/2000");
    component.searchForm.get('paymentReason')?.setValue("L");
    component.checkFormValid();
    expect(component).toBeTruthy();
  });
  xit('should call totalAmountChange()', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData,
          policyInfoSelected: mockData },
        landingService
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component.searchForm.get('polNum')?.setValue("423432");
    component.searchForm.get('insuredName')?.setValue("423432");
    component.searchForm.get('insuredDob')?.setValue("01/01/2000");
    component.searchForm.get('paymentReason')?.setValue("L");
    component.searchPolicy();
    component.totalAmountChange({target:{value:6576}});
    expect(component).toBeTruthy();
  });
  it('should call checkHTTPerror()', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingService
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component.searchForm.get('polNum')?.setValue("423432");
    component.searchForm.get('insuredName')?.setValue("423432");
    component.searchForm.get('insuredDob')?.setValue("01/01/2000");
    component.searchForm.get('paymentReason')?.setValue("L");
    component.searchPolicy();
    expect(component).toBeTruthy();
  });
  it('should call next()', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingService
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component.searchForm.get('polNum')?.setValue("423432");
    component.searchForm.get('insuredName')?.setValue("423432");
    component.searchForm.get('insuredDob')?.setValue("01/01/2000");
    component.searchForm.get('paymentReason')?.setValue("L");
    component.searchPolicy();
    component.next();
    expect(component).toBeTruthy();
  });
  xit('should call back()', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingService
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component.searchPolicy();
    component.back();
    expect(component).toBeTruthy();
  });

  it('should call restrictInputToTotalAmount() with /', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingService
      },
      { reset: true }
    );
    const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const keyboardEvent = new KeyboardEvent('keydown', { key: '333',keyCode:150 ,code:'dsa'});
    inputElement.dispatchEvent(keyboardEvent);
    const component = fixture.point.componentInstance;
    component.restrictInputToTotalAmount(keyboardEvent);
    expect(component).toBeTruthy();
  });
  it('should call checkAddPolicyExist()', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingService
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component.checkAddPolicyExist();
    expect(component).toBeTruthy();
  });
  it('should call backPaymentInfo()', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingService
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component.backPaymentInfo();
    expect(component).toBeTruthy();
  });
  it('should call checkAmountValue()', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingService
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component.checkAmountValue();
    expect(component).toBeTruthy();
  });
  it('should call back()', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingService
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component.back();
    expect(component).toBeTruthy();
  });
  it('should call getTotalAmount()', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingService
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component['policyInfo'] = mockData;
    component.getTotalAmount();
    expect(component).toBeTruthy();
  });
  it('should call isDuplicatePremium()', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingService
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component['policyInfo'] = mockData;
    component.getTotalAmount();
    expect(component).toBeTruthy();
  });
  it('should call mergeCurrentPremium()', () => {
    const fixture = MockRender(
      PolicyInfoComponent,
      {
        data: { policyInfo: mockData },
        landingService
      },
      { reset: true }
    );
    const component = fixture.point.componentInstance;
    component.mergeCurrentPremium({ policyInfo: mockData });
    expect(component).toBeTruthy();
  });
});