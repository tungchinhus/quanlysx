import { Injectable } from '@angular/core';
import { PayerInfo, PolicyInfo, RelationshipByPolicy } from '../models/payment.model';
import { CommonService } from 'src/app/shared/services/common.service';
import { LandingService } from '../landing.service';
import { Data } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PayerInfoService {

  constructor(private commonService: CommonService, private landingService: LandingService) {
  }

  /**
   * Calculate total amount form poilcyInfo
   * @param policyInfo 
   * @returns number
   */
  getTotalAmount(policyInfo: PolicyInfo): number {
    return window._.sumBy(policyInfo.rows, 'billAmount');
  }

  confirmPayerInfo(policyInfo: PolicyInfo, payerInfo: PayerInfo, relationshipByPolicy: RelationshipByPolicy[]) {
    const dialogRef = this.commonService.showDialog({
      panelClass: 'small',
      data: {
        title: 'payment-info.confirm-dialog-title',
        content: 'payment-info.confirm-dialog-content',
        showClose: true,
        buttons: [
          {
            title: 'button.goback',
            color: 'secondary',
            class: 'small back button-mr',
            focusInitial: false,
            data: false
          },
          {
            title: 'button.next',
            color: 'primary',
            class: 'small next',
            focusInitial: true,
            data: true
          }
        ]
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.landingService.pushEvent({
          step: 'payer-info-integrate',
          data: {
            policyInfo: policyInfo,
            payerInfo: payerInfo,
            paymentMethod: null,
            relationshipByPolicy: relationshipByPolicy,
          }
        });
      }
    });
  }
  
  cancelTransaction() {
    this.landingService.pushEvent({
      step: 'policy-info',
      data: {
        policyInfo: null,
        payerInfo: null,
        paymentMethod: null,
        policyInfoDisplayList: null
      }
    });
  }
  
  getPolicyInfo(data: Data): PolicyInfo | null {
    if(data?.['policyInfo']) {
      return data['policyInfo'];
    }
    return null;
  }
}
