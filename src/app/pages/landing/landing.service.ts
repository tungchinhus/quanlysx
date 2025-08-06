import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { ApiConstant } from 'src/app/constant/api.constant';
import jsPDF from 'jspdf';
import { TokenService } from 'src/app/shared/services/token-service';
import { TransactionRequest, PolicyInfo } from './models/payment.model';
import { CommonService } from 'src/app/shared/services/common.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { Constant } from 'src/app/constant/constant';

declare const moment: any;
declare const html2canvas: any;

let httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class LandingService {
  event = new Subject<any>();
  dataPDF = [];
  visibleTemplatePDF = false;
  static header: HttpHeaders;
  static currency = "VND";
  static maitenanceMode = Constant.maintenance_Mode.off;
  static maintenanceEndTime = "";
  
  static isStopCheckStatus = false;
  static isRefreshPage= true;
  static cwsViewMode: boolean = false;
  static cwsTypeIndicator: any;
  static sysCWS: boolean;
  static ssId: string;
  static showCardTypecyberSource: boolean = false;

  constructor(private http: HttpClient,private token:TokenService,public commonService: CommonService,private loadingSvr: LoadingService,) {}

  pushEvent(data: any) {
    this.event.next(data);
  }

  getEvent() {
    return this.event;
  }

  searchPolicies() {    
    const url = ApiConstant.getApiUrl('getPolicies');
    return this.http.get(url);
  }

  checkAllValidation(controls: { [key: string]: AbstractControl }) {
    return Object.values(controls).forEach((control) => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }

  paymentList(body: any) {
    var options =  {
        headers: LandingService.header
      };
    const url = ApiConstant.getApiUrl('payment');
    return this.http.post(url, body, options);
  }

  initTransaction(request: TransactionRequest,cwsUrls: any) {
    const { policyInfo, payerInfo, paymentMethod, relationList, additionalInfo } = request;
    const relationStrings = policyInfo?.rows?.map((item) => {
      const relation = relationList.find((relation) => relation.billId === item.billId);
      return relation?.relationshipCode ? relation.relationshipCode : null;
    });
    const requestBody = {
      bills: this.getListBill(policyInfo),
      payerName: payerInfo.name,
      gender: payerInfo.gender,
      birthDate: payerInfo.dob,
      email: payerInfo.email,
      idType: payerInfo.nationalIdType,
      idNum: payerInfo.nationalId,
      gateway: paymentMethod,
      callbackUrl: cwsUrls?.callbackUrl || null,
      redirectUrl: cwsUrls?.redirectUrl || null,
      relationToOwner: relationStrings,
      currency: LandingService.currency,
      additionalInfo: additionalInfo
    };
    const url = ApiConstant.getApiUrl('initPayment');
    return this.http.post(url, requestBody, { headers: LandingService.header });
  }

  checkHTTPerror(e: HttpErrorResponse) {
    this.loadingSvr.setLoadingState(false);
    if(e.status !=200) {
      this.commonService.showWarningDiaLog('policy-info.http-warning');
    }
  }

  getListBill(policyInfo: PolicyInfo): any {
    return policyInfo.rows?.map((item) => {
      return {
        id: item.billId,
        amount: item.billAmount,
      };
    });
  }

  getTransactionStatus(transactionID: string) {
    const url = ApiConstant.getApiUrl('transactionStatus') + '/'+ transactionID;
    return this.http.get(url, {headers: LandingService.header});
  }

  getTranInfo(transactionID: any,uniqueId: any, actionRetry: any) {
    let httpOptionsTranInfo = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json','clientId': uniqueId,'action': actionRetry})
    };
    const url = ApiConstant.getApiUrl('transactionStatus') + '/'+ transactionID;
    return this.http.get(url, httpOptionsTranInfo);
  }

  getSessionDetailCWS(sessionID: string) {
    const url = ApiConstant.getApiUrl('getSessionDetailCWS') + '/'+ sessionID;
    return this.http.get(url, {headers: LandingService.header});
  }

  updateTranStatus(body: any) {
    const url = ApiConstant.getApiUrl('transStatusUpdate');
    return this.http.put(url,body, httpOptions);
  }

  printReceiptPDF(transId: string,uniqueId: any,iOS: boolean) {
    let contenType = iOS ? 'application/octet-stream' : 'application/pdf';
    let httpOptionsReceiptPDF = {
      headers: new HttpHeaders({ 'Content-Type': contenType,'clientId': uniqueId}),
      responseType: 'blob' as any
    };
    const url = ApiConstant.getApiUrl('printReceipt') + '/'+ transId;
    return this.http.get(url, httpOptionsReceiptPDF);
  }

  cyberSourceIntegrate(body: any) {
    const url = ApiConstant.getApiUrl('cyber-source');
    return this.http.post(url, body, {headers: LandingService.header});
  }

  generatePDF(params: {
    element: HTMLElement;
    isSavePdf: boolean;
    callbackFn?: (doc: jsPDF) => void;
  }) {
    const { element, isSavePdf, callbackFn } = params;
    this.visibleTemplatePDF = true;
    setTimeout(() => {
      html2canvas(element).then((canvas: any) => {
        let PDF = new jsPDF('p', 'pt', 'letter');
        return PDF.html(element, {
          callback: (doc) => {
            const nameExport = `receipt-${moment().format('DD/MM/YYYY')}.pdf`;
            isSavePdf && doc.save(nameExport);
            return callbackFn && callbackFn(doc);
          }
        });
      });
    }, 500);
    this.visibleTemplatePDF = false;
  }

  register(userData: any): Observable<any> {
    const url = ApiConstant.getApiUrl('register');
    return this.http.post(url, userData);
  }
  login(loginData: any): Observable<any> {    
    return this.http.post('https://localhost:7190/api/Account/login', loginData);
  }
}
