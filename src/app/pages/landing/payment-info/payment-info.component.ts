import { Component, Input, OnInit } from '@angular/core';
import { LandingService } from '../landing.service';
import { Data, PolicyInfoDisplay } from '../models/payment.model';
import { CommonService } from 'src/app/shared/services/common.service';
import { MatDialog } from '@angular/material/dialog';
import { Constant } from 'src/app/constant/constant';

@Component({
  selector: 'app-payment-info',
  templateUrl: './payment-info.component.html',
  styleUrls: ['./payment-info.component.scss']
})
export class PaymentInfoComponent implements OnInit {
  @Input() data!: Data;
  policyInfo!: any;
  searchQuery!: any;
  totalAmount!: number;
  i: number | undefined;
  policyInfoDisplayList!: PolicyInfoDisplay[];
  reasonOptions = [
    {
      name: 'payment-info.initial-premium',
      value: 'I'
    },
    {
      name: 'payment-info.renewal-premium',
      value: 'R'
    },
    {
      name: 'payment-info.policy-change-premium',
      value: 'C'
    },
    {
      name: 'payment-info.reinstatement-premium',
      value: 'A'
    },
    {
      name: 'payment-info.loan',
      value: 'L'
    },
    {
      name: 'payment-info.top-up',
      value: 'T'
    }
  ];
  isDisable: boolean | undefined;
  isOverlimit: boolean;
  isCWS = false;

  constructor(
    private landingService: LandingService,
    public commonService: CommonService,
    public dialog: MatDialog,
    private window: Window
  ) {
    this.isOverlimit = false;
  }

  ngOnInit(): void {
    this.searchQuery = this.data?.searchQuery;
    this.isCWS = LandingService.sysCWS;
    this.policyInfo = this.data.policyInfo;
    this.isDisable =  this.policyInfo.rows.length > 0;
    this.policyInfoDisplayList = this.data.policyInfoDisplayList;


    this.getTotalAmount();
  }

  goToStep(step: string, data: any) {
    this.landingService.pushEvent({
      step,
      data: data
    });
  }

  getEnsureName(ensureName:string){
    return ensureName.toUpperCase();
  }

  addMore(step: string) {
    this.searchQuery['paymentType'] = '';
    const data = {
      policyInfo: this.policyInfo,
      searchQuery: this.searchQuery,
      policyInfoDisplayList: this.policyInfoDisplayList,
      cwsPayor: this.data.cwsPayor,
      addmore: 'add-more-policy',
      cwsTypeIndicator: this.data.cwsTypeIndicator,
      cwsUrl: this.data.cwsUrl
    };
    this.goToStep(step, data);
  }

  back(step: string) {
    if (this.policyInfoDisplayList && this.policyInfoDisplayList.length > 0) {
      this.handleRemovePolicy(this.policyInfoDisplayList[this.policyInfoDisplayList.length - 1]);
    }

    const data = {
      policyInfo: this.policyInfo || null,
      searchQuery: this.searchQuery || null,
      policyInfoDisplayList: this.policyInfoDisplayList || null,
      addmore: 'back-policy-search',
      isCWS: this.isCWS,
      cwsTypeIndicator: this.data.cwsTypeIndicator,
      cwsUrl: this.data.cwsUrl
    };

    this.goToStep(step, data);
  }

  policyRemove(index: number, itemSelect: any) {
    const dialogRef = this.commonService.showDialog({
      panelClass: 'small',
      data: {
        title: 'payment-info.confirm-remove-title',
        content: 'payment-info.confirm-remove-content',
        buttons: [
          {
            title: 'button.yes',
            color: 'secondary',
            class: 'small button-mr',
            focusInitial: false,
            data: true
          },
          {
            title: 'button.no',
            color: 'primary',
            class: 'small',
            focusInitial: true,
            data: false
          }
        ]
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.handleRemovePolicy(itemSelect);
        this.isOverlimit = this.totalAmount > this.commonService.dataConfig.HAFT_BILLION
      }
    });
}

  getPaymentType(valueItem: any) {
    return this.reasonOptions.filter((entry) => entry.value === valueItem)[0].name;
  }

  next() {
    if (Number(this.totalAmount) <= this.commonService.dataConfig.HAFT_BILLION ) {
      const data = {};
      this.goToStep('payer-info', data);
    } else {
      this.isOverlimit = true;
    }
  }

  getTotalAmount() {
    this.totalAmount = window._.sumBy(this.policyInfo?.rows, function(row: any) {
      return Number(parseInt(row.billAmount.toString().replace(/\./g,''),10));
    })
  }

  handleRemovePolicy(itemSelect: any) {
    this.policyInfo.rows = this.policyInfo.rows.filter(
      (item: any) => !itemSelect.billIds.includes(item.billId)
    );

    this.policyInfoDisplayList = this.policyInfoDisplayList.filter(
      (item: any) => itemSelect.billIds != item.billIds
    );
    let seaarchNumList: any[] = [];
    for (let indx = 0; indx < this.policyInfoDisplayList.length; indx++) {
      seaarchNumList.push(this.policyInfoDisplayList[indx].policyNumber);
    }
    this.data.policySearchNum = seaarchNumList;
    this.isDisable = this.policyInfo.rows.length > 0;
    this.data.policyInfo = this.policyInfo;
    this.data.policyInfoDisplayList = this.policyInfoDisplayList;
    this.getTotalAmount();
  }
}
