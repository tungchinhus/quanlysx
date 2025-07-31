import { Component, Input } from '@angular/core';
import { LandingService } from '../landing.service';
import { Data } from '../models/payment.model';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Constant } from 'src/app/constant/constant';
import { DatePipe } from '@angular/common';
import { LoadingService } from 'src/app/shared/services/loading.service';
import {Location} from '@angular/common';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-result-failed',
  templateUrl: './result-failed.component.html',
  styleUrls: ['./result-failed.component.scss'],
  providers: [
    {provide: DatePipe},
  ]
})
export class ResultFailedComponent {
  @Input() data!: Data;
  policyInfo: any;
  payerInfo!: any;
  transtionId!: string;
  uniqueId!: any;

  constructor(private landingService: LandingService,
    private router:Router,
    private route: ActivatedRoute,
    private loadingSvr: LoadingService,
    private datePipe: DatePipe,
    private location: Location,
    private commonService: CommonService
  ) {
    let dataParam = location.getState() as any;
    this.transtionId = dataParam.orderRef;
  }
  ngOnInit(): void {
    this.uniqueId = localStorage.getItem('uniqueId')
    this.transtionId = this.route.snapshot?.queryParams['orderRef'];
  }
  rePayment() {
    this.loadingSvr.setLoadingState(true);
    let retry = 'retry-payment'
    CommonService.isStopCheckStatus = true;
    this.landingService.getTranInfo(this.transtionId,this.uniqueId,retry).subscribe((res: any) => {
      let dateParts = res.payor.birthDateStr.split('/');
      let dobpayer = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
      let payerr = {
        nationalIdType: res.payor.idType,
        nationalId:     res.payor.identifier,
        name: res.payor.name,
        email: res.payor.email,
        gender: res.payor.gender,
        dob: dobpayer
      } 
      const navigationExtras: NavigationExtras = {
        state: {
          policyInfo: {rows:this.parseAmount(res.policies)},
          payerInfo: payerr,
          relationshipByPolicy: res.policies,
          searchNum: res.searchNum,
        }
      };
      this.router.navigate(['landing'], navigationExtras);
    },(e: HttpErrorResponse) => this.checkHTTPerror(e));
  }

  checkHTTPerror(e: HttpErrorResponse) {
    this.loadingSvr.setLoadingState(false);
    if(e.error.message == 'E97' && e.error.httpCode =='500 INTERNAL_SERVER_ERROR') {
      this.showWarning()
    }
  }

  showWarning() {
    const dialogRef = this.commonService.showDialog({
      panelClass: 'small',
      disableClose: true,
      data: {
        content: 'policy-info.http-warning',
        buttons: [
          {
            title: 'sessionTimeout.ok',
            color: 'primary',
            class: 'small',
            focusInitial: true,
            data: true
          }
        ]
      }
    });
  }

  parseAmount(policies: any){
    const formatedRows = policies.map((item: any) => {
      const billAmount = this.parseTotalAmount(item.billAmount, true);
      item.billAmount = billAmount;
      item['premiumType'] = item.premType;
      return item;
    });
    return formatedRows;
  }

  parseTotalAmount(value: any,isNumber: boolean){
    let numparse;
    if(isNumber && value!=''){
      numparse = parseInt(value.toString().replace(/\./g,''),10);
    } else {
      numparse = parseInt(value.toString().replace(/\./g,''),10) || 0;
      numparse =  numparse.toString().replace(Constant.currencyRegex, "$1.");
    }
    return numparse;
  }
}
