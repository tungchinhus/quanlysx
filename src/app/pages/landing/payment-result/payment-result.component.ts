import { Component } from '@angular/core';
import { LandingService } from '../landing.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import {Location} from '@angular/common';
import { PAYMENT_STATUS } from 'src/app/shared/enums/common.enum';
import { CommonService } from 'src/app/shared/services/common.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { Constant } from 'src/app/constant/constant';

@Component({
  selector: 'app-payment-result',
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.scss']
})
export class PaymentResultComponent {
  isLoading: boolean = true;
  transactionID!: string;
  status: string | undefined;
  statusUpdate: boolean = false;
  hideHttpError: boolean = true;
  uniqueId!: any;

  constructor(private landingService: LandingService, 
            private route: ActivatedRoute,
            private location: Location,
            public commonService: CommonService,
            public loadingService: LoadingService,
            private router:Router)
    {}
  ngOnInit(): void {
    this.uniqueId = localStorage.getItem('uniqueId');
    this.loadingService.setLoadingState(false);
    this.transactionID = this.route.snapshot.queryParams['orderRef'];
    this.status = this.route.snapshot.queryParams['status'];
    if(!this.status) {
      this.router.navigate(['landing'], {});
    } else {        
      if(this.status == PAYMENT_STATUS.SUCCESS){
        this.goSuccess(PAYMENT_STATUS.SUCCESS);
      } else if(this.status == PAYMENT_STATUS.FAILED){
        if(CommonService.maitenanceMode != Constant.maintenance_Mode.on){
          this.goFailed(PAYMENT_STATUS.FAILED);
        }
      } else {
        // proccess waiting status
        this.getStatus(this.commonService.dataConfig.waitList);
      }
    }      
  }

  getStatus(times: any) {
    if (times.length > 0) {
      let wait = times.shift();
      setTimeout(() => {
        if(!CommonService.isStopCheckStatus){
          this.landingService.getTranInfo(this.transactionID,this.uniqueId,'').subscribe((res: any) => {
            if(res?.status == PAYMENT_STATUS.SUCCESS) {
              CommonService.isStopCheckStatus = true;
              this.goSuccess(PAYMENT_STATUS.SUCCESS);
            } else if(res?.status == PAYMENT_STATUS.FAILED) {
              CommonService.isStopCheckStatus = true;
              this.goFailed(PAYMENT_STATUS.FAILED);
            }
          });
        }
        this.getStatus(times);
      }, wait);
    } else {
      //update status failed when try 60'
      if(!CommonService.isStopCheckStatus){
        this.goFailed('');
      }      
    }
 }

 goSuccess(status: string){
    const navigationExtras: NavigationExtras = {
      state: {
        orderRef: this.transactionID,
        status: status
      },
      queryParams:{
        orderRef: this.transactionID,
        status: status
      }
    };
    this.router.navigate(['/result-passed'], navigationExtras);
 }

 goFailed(status: string) {
  const navigationExtras: NavigationExtras = {
    state: {
      orderRef: this.transactionID,
      status: status
    },
    queryParams:{
      orderRef: this.transactionID
    }
  };
  this.router.navigate(['/result-failed'], navigationExtras);
 }

//  getStatus(): string{
//   let statusReturn = '';
//   this.landingService.getTranInfo(this.transactionID,this.uniqueId,'').subscribe((res: any) => {
//     if(res.status == PAYMENT_STATUS.SUCCESS) {
//       statusReturn = PAYMENT_STATUS.SUCCESS;
//     } else if(res.status == PAYMENT_STATUS.FAILED || res.status == PAYMENT_STATUS.CANCELED) {
//       statusReturn = PAYMENT_STATUS.FAILED;
//     } else {
//       statusReturn = PAYMENT_STATUS.PENDING;
//     }
//   },(e: HttpErrorResponse) => this.landingService.checkHTTPerror(e));
//   return statusReturn;
//  }
}
