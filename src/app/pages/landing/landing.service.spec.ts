import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { LandingService } from './landing.service';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { PolicyInfo, PayerInfo, TransactionRequest, RelationshipByPolicy } from './models/payment.model';
import { HttpErrorHandler } from 'src/app/shared/services/http-error-handler.service';
import { RsfConfigFactory } from '@rsf/rsf-angular-base';
import { FormBuilder, FormControl } from '@angular/forms';
let moment = require('moment');
describe('LandingService', () => {
  const httpClientSpy = jasmine.createSpyObj('HttpClient', ['post', 'get']);
  let service: LandingService;
  let url = {
    callbackUrl: '',
      redirectUrl: ''
  }

  beforeEach(() => {
    (<any>window).moment = moment;
    const configRecord: Record<string, any> = {
      environment: {
        envName: 'dev',
        production: true,
        apiUrl: ''
      }
    };
    RsfConfigFactory.init(configRecord);
  });
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, MatDialogModule, HttpClientModule, BrowserAnimationsModule],
      providers: [ CommonService, { provide: HttpClient, useValue: httpClientSpy }, HttpErrorHandler]
    });
    service = TestBed.inject(LandingService);
  });

  xit('should be created', () => {
    service.getEvent();
    expect(service).toBeTruthy();
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get list bill', () => {
    const expected = [
      {
        id: 'B01',
        amount: 100
      }
    ];
    let data = new PolicyInfo();
    data.rows = [
      {
        billId: 'B01',
        billAmount: 100
      }
    ];
    const actual = service.getListBill(data);
    expect(JSON.stringify(actual)).toEqual(JSON.stringify(expected));
  });

  it('should call init transaction', () => {
    let policyInfo = new PolicyInfo();
    let payerInfo = new PayerInfo();
    let paymentMethod = 'momo';
    let relation = new RelationshipByPolicy("01", "policy-owner", "O", "B01", false);
    let relationList = [relation];
    const request = new TransactionRequest(policyInfo, payerInfo, paymentMethod, relationList,{});
    httpClientSpy.post.and.returnValue(
      of({
        orderRef: '03e38319-1faa-4e54-ba00-f79858842515',
        referenceId: null,
        paymentGatewayLink: {
          url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=30000000000&vnp_Command=pay&vnp_CreateDate=20230622141535&vnp_CurrCode=VND&vnp_ExpireDate=20230622142535&vnp_IpAddr=115.78.7.203&vnp_Locale=vn&vnp_OrderInfo=Test+vnpay+payment&vnp_OrderType=other&vnp_ReturnUrl=https%3A%2F%2Fsea-emt-dev-api.ap.manulife.com%2Fext%2Fquanlysx%2Fcomplete&vnp_TmnCode=ZMG3KS8P&vnp_TxnRef=03e38319-1faa-4e54-ba00-f79858842515&vnp_Version=2.1.0&vnp_SecureHash=AC286428908D1025B9D4569CD16795F81A6373049B51E8496BDCAC451EBB6A53669578A05D29AC2D14A2EEBB7F8E0046E30F91976E4AEE8ED9FD5528B009CA2E',
          method: 'GET',
          metaData: null
        },
        error: null
      })
    );
    service.initTransaction(request,url).subscribe((response) => {
      expect(response).toBeTruthy();
    });
  });

  it('should not return data init transaction', () => {
    let policyInfo = new PolicyInfo();
    let payerInfo = new PayerInfo();
    let paymentMethod = 'momo';
    let relation = new RelationshipByPolicy("01", "policy-owner", "O", "B01", false);
    let relationList = [relation];
    const request = new TransactionRequest(policyInfo, payerInfo, paymentMethod, relationList,{});
    httpClientSpy.post.and.returnValue(of({ error: { errorCode: 500 } }));
    service.initTransaction(request,url).subscribe((response) => {
      expect(response).toBeTruthy();
    });
  });

  xit('should not return data init transaction (throw http error code)', () => {
    let policyInfo = new PolicyInfo();
    let payerInfo = new PayerInfo();
    let paymentMethod = 'momo';
    let relation = new RelationshipByPolicy("01", "policy-owner", "O", "B01", false);
    let relationList = [relation];
    const errorResponse = new HttpErrorResponse({
      error: { code: `some code`, message: `some message.` },
      status: 400,
      statusText: 'Bad Request',
   });
    const request = new TransactionRequest(policyInfo, payerInfo, paymentMethod, relationList,{});
    httpClientSpy.post.and.returnValue(throwError(() => errorResponse));
    service.initTransaction(request,url).subscribe((response) => {
      expect(response).toBeFalsy();
    });
  });

  it('should be init transaction by (success value)', () => {
    let policyInfo = new PolicyInfo();
    let payerInfo = new PayerInfo();
    let paymentMethod = 'momo';
    let relation = new RelationshipByPolicy("01", "policy-owner", "O", "B01", false);
    let relationList = [relation];
    const request = new TransactionRequest(policyInfo, payerInfo, paymentMethod, relationList,{});
    httpClientSpy.post.and.returnValue(
      of({
        orderRef: '03e38319-1faa-4e54-ba00-f79858842515',
        referenceId: null,
        paymentGatewayLink: {
          url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=30000000000&vnp_Command=pay&vnp_CreateDate=20230622141535&vnp_CurrCode=VND&vnp_ExpireDate=20230622142535&vnp_IpAddr=115.78.7.203&vnp_Locale=vn&vnp_OrderInfo=Test+vnpay+payment&vnp_OrderType=other&vnp_ReturnUrl=https%3A%2F%2Fsea-emt-dev-api.ap.manulife.com%2Fext%2Fquanlysx%2Fcomplete&vnp_TmnCode=ZMG3KS8P&vnp_TxnRef=03e38319-1faa-4e54-ba00-f79858842515&vnp_Version=2.1.0&vnp_SecureHash=AC286428908D1025B9D4569CD16795F81A6373049B51E8496BDCAC451EBB6A53669578A05D29AC2D14A2EEBB7F8E0046E30F91976E4AEE8ED9FD5528B009CA2E',
          method: 'GET',
          metaData: null
        },
        error: null
      })
    );
    service.initTransaction(request,url).subscribe((response) => {
      expect(response).toBeTruthy();
      //expect(response?.paymentData).toBeTruthy();
    });
  });

  it('should return null on error http request', () => {
    let policyInfo = new PolicyInfo();
    let payerInfo = new PayerInfo();
    let paymentMethod = 'momo';
    let relation = new RelationshipByPolicy("01", "policy-owner", "O", "B01", false);
    let relationList = [relation];
    const request = new TransactionRequest(policyInfo, payerInfo, paymentMethod, relationList,{});
    const errorResponse = new HttpErrorResponse({
      error: { code: `some code`, message: `some message.` },
      status: 400,
      statusText: 'Bad Request'
    });

    httpClientSpy.post.and.returnValue(
      of(
        throwError(() => {
          return errorResponse;
        })
      )
    );
    service.initTransaction(request,url).subscribe((data) => {
      expect(data).toBeTruthy();
    });
  });

  it('should getEvent', () => {
    let data = new PolicyInfo();
    data.rows = [
      {
        billId: '01',
        billAmount: 100
      }
    ];
    service.getEvent();
    expect(service).toBeTruthy();
  });
  it('should paymentList()', () => {
    let data = new PolicyInfo();
    data.rows = [
      {
        billId: '01',
        billAmount: 100
      }
    ];
    service.paymentList({});
    expect(service).toBeTruthy();
  });
  it('should searchPolicies()', () => {
    let data = new PolicyInfo();
    data.rows = [
      {
        billId: '01',
        billAmount: 100
      }
    ];
    service.searchPolicies();
    expect(service).toBeTruthy();
  });
  it('should checkAllValidation()', () => {
    let data = new PolicyInfo();
    data.rows = [
      {
        billId: '01',
        billAmount: 100
      }
    ];
    service.checkAllValidation({});
    expect(service).toBeTruthy();
  });
  it('should getTransactionStatus() ', () => {
    let data = new PolicyInfo();
    data.rows = [{billId: '01',billAmount: 100}];
    service.getTransactionStatus('hkjjk');
    expect(service).toBeTruthy();
  });
  it('should getTranInfo() ', () => {
    let data = new PolicyInfo();
    data.rows = [{billId: '01',billAmount: 100}];
    service.getTranInfo('hkjjk','dsda','');
    expect(service).toBeTruthy();
  });
  it('should cyberSourceIntegrate() ', () => {
    let data = new PolicyInfo();
    data.rows = [{billId: '01',billAmount: 100}];
    service.cyberSourceIntegrate('hkjjk');
    expect(service).toBeTruthy();
  });
  // it('should getIpAddress() ', () => {
  //   let data = new PolicyInfo();
  //   data.rows = [{billId: '01',billAmount: 100}];
  //   service.getIpAddress('https://api.emmsit.asia.manulife.com/quanlysx/landing');
  //   expect(service).toBeTruthy();
  // });
});
