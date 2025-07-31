import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { LandingService } from '../landing.service';
import { Data } from '../models/payment.model';
import { ActivatedRoute, Router } from '@angular/router';
import {Location} from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonService } from 'src/app/shared/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { Constant } from 'src/app/constant/constant';
import * as saveAs from 'file-saver';

@Component({
  selector: 'app-result-passed',
  templateUrl: './result-passed.component.html',
  styleUrls: ['./result-passed.component.scss']
})
export class ResultPassedComponent {
  @Input() data!: Data;
  public paymentInfo: any;
  public payerInfo!: any;
  isLoading: boolean = false;
  tranSactionId: string = '';
  totalAmount!: string;
  isApiRequestInProgress!: boolean;
  paymentMethod = Constant.paymentMethod;
  status!:string
  uniqueId!: any;

  constructor(
    private landingService: LandingService,
    private route: ActivatedRoute,
    private location: Location,
    private translateService: TranslateService,
    private loadingSvr: LoadingService,
    private router: Router,
    public commonService: CommonService
  ) {
    let dataParam = location.getState() as any;
    this.tranSactionId = dataParam.orderRef;
    this.status = dataParam.status;
  }

  ngOnInit(): void {
    this.uniqueId = localStorage.getItem('uniqueId')
    this.tranSactionId = this.route.snapshot?.queryParams['orderRef'];
    this.status = this.route.snapshot?.queryParams['status'];
    this.getTranSactionInfo();
  }

  getTranSactionInfo(){
    this.loadingSvr.setLoadingState(true);
    this.landingService.getTranInfo(this.tranSactionId,this.uniqueId,'').subscribe((res: any) => {
      //return landing page 
      if(this.status != res.status || !this.status) {
        this.router.navigate(['landing'], {});
      } else {
        this.loadingSvr.setLoadingState(false);      
        this.payerInfo = this.combineBills(res);
        this.totalAmount = res.amount.value;
      }
    },(e: HttpErrorResponse) => this.checkHTTPerror(e));    
  }

  combineBills(res: any): any {
    const combinedBills: { [key: string]: any } = [];
    let listPolicy: any =[];
    for (const bill of res.policies) {
      const key = `${bill.policyNumber}_${bill.premType}`;
      if (!combinedBills[key]) {
        combinedBills[key] = { ...bill };
      } else {
        combinedBills[key].billAmount += bill.billAmount;
      }
    }
    for (const bill of Object.values(combinedBills)) {
      listPolicy.push(bill);
    }
    res.policies = listPolicy;
    return res;
  }

  checkHTTPerror(e: HttpErrorResponse) {    
    this.loadingSvr.setLoadingState(false); 
    if(e.error.message == 'E220897' && e.error.httpCode =='400 BAD_REQUEST') {
      this.router.navigate(['landing'], {});
    } 
    // else if(e.status !=200) {
    //   if(e.message == 'MAINTENANCE MODE ON') {
    //     this.commonService.getMaintenancePage();
    //   } else {
    //     this.commonService.showWarningDiaLog('policy-info.http-warning');
    //   }
    // }
  }
  @ViewChild('downloadLink', { static: false }) downloadLink!: ElementRef;
  printReceipt() {
    this.loadingSvr.setLoadingState(true);
    this.landingService.printReceiptPDF(this.tranSactionId,this.uniqueId,this.isIOSDevice()).subscribe(
      (res: any) => {
        this.loadingSvr.setLoadingState(false);
        if (res) {
          const fileName = 'Xac_nhan_thanh_toan_'+this.tranSactionId+'.pdf';
          if(this.isIOSDevice()){
            const filedata = new Blob([res], {type: "application/octet-stream"});
            saveAs(filedata,fileName)
          } else {
            const fileURL = (window.URL || window.webkitURL).createObjectURL(res);        
            const link = document.createElement('a');
            link.href = fileURL;
            link.target = '_blank';
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(fileURL);
          }
        }
      },(e: HttpErrorResponse) => this.checkHTTPerror(e));    
  }

  isIOSDevice():any {
    const userAgent = window.navigator.userAgent;
    return userAgent.toLowerCase().match(/(ipad|iphone|safari)/) && userAgent.search("Chrome") < 0;
  }
  
  back() {
    CommonService.isStopCheckStatus = true;
    if(LandingService.sysCWS){
      let urlLanding = window.location.href.replace('result-passed','landing') + '?ss='+LandingService.ssId;
      window.open(urlLanding, '_self');
    } else {
      this.router.navigate(['/landing'], { replaceUrl: true });
    }
  }
  getPolicyType(type: string): string {
    let langReturn = "";
    const language = this.translateService.getDefaultLang();
    this.commonService.dataConfig.reason_type.map((item: any) => {
      if(type =='S' || type =='I'){
        langReturn = this.commonService.dataConfig.reason_type[0].name;
      } else if(type == item.value){
        langReturn = item.name;
      }        
    });
    return langReturn;
  }
}
