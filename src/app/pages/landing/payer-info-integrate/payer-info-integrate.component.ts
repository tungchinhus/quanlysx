import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { LandingService } from '../landing.service';
import { Data, PayerInfo, RelationshipByPolicy, TransactionRequest } from '../models/payment.model';
import { CommonService } from 'src/app/shared/services/common.service';
import { Constant, Lang } from 'src/app/constant/constant';
import { formatDate } from '@angular/common';
import { DATE_FORMAT, LOCALE_FORMAT } from 'src/app/shared/utils/localFormat';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { RelationshipInfoService } from '../relationship-info/relationship-info.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-payer-info-integrate',
  templateUrl: './payer-info-integrate.component.html',
  styleUrls: ['./payer-info-integrate.component.scss']
})
export class PayerInfoIntegrateComponent implements OnInit, DoCheck {
  @Input() data!: Data;
  policyInfo: any;
  payerInfo!: PayerInfo;
  payerInfoTemp!: PayerInfo;
  policySearchNumbers!: any
  totalAmount: number = 0;
  dataRedirect!: any;
  documentInputMaxlenght: string | undefined;
  isDisableForm = true;
  isFormValid = false;
  callbackUrl = null;
  relationshipByPolicy: RelationshipByPolicy[] = [];
  editMode: boolean = false;
  checkBoxConfirm: boolean = false;
  isDispayNextButton: boolean = false;
  showMore: boolean = false;
  redirectUrls = {
    fail: null,
    success: null,
    cancelled: null
  };
  paymentMethod = '';
  cyberSourceCardType = '';
  paymentUrl: string = '';
  cyberSourcemetaData: any;
  isShowCyberCource!: boolean;
  policyInfoDisplayList!: any;
  isDisplayRelationship: boolean = false;
  isDisabledInit: boolean=false;
  isCWS = false;
  cwsIdType = ''
  RelationTo=true;
  showCardType = LandingService.showCardTypecyberSource;

  isShowIcon=true;
  items = [
    { value: 'momo', imageurl: 'assets/images/momo.png', label: 'payment-method.momo' },
    { value: 'vnpay', imageurl: 'assets/images/atm.png', label: 'payment-method.atm' },
    { value: '001', imageurl: 'assets/images/Visa.png', label: 'payment-method.visa' },
    { value: '002', imageurl: 'assets/images/master.png', label: 'payment-method.master' },
    { value: '007', imageurl: 'assets/images/JCB.png', label: 'payment-method.jcb' }
  ];
  openedChange = CommonService.prototype.selectOpenedChange;

  constructor(
    private landingService: LandingService,
    public commonService: CommonService,
    private loadingSvr: LoadingService,
    private relationshipInfoService: RelationshipInfoService,
    private window: Window
  ) {}
  
  ngDoCheck(): void {
    //Detect changes in view 
    this.displayNextButton(this.editMode, this.checkBoxConfirm, this.paymentMethod);
  }


  ngOnInit(): void {
    this.policyInfo = this.data?.policyInfo;
    this.payerInfo = this.data?.payerInfo;
    this.payerInfoTemp = this.payerInfo;
    this.relationshipByPolicy = this.data?.relationshipByPolicy;
    this.policySearchNumbers = this.data?.policySearchNum;
    this.cwsIdType = this.data?.cwsPayor?.idType;
    this.getTotalAmount();
    for (let index = 0; index < this.policyInfo?.rows.length; index++) {
      if(this.policyInfo?.rows[index].premiumType == 'T' || this.policyInfo?.rows[index].premiumType == 'L'){
          this.isShowCyberCource = true;
          break;
      }
    }
    this.policyInfoDisplayList = this.data?.policyInfoDisplayList;
    // move check display alert 
    const policyMappingList = this.relationshipInfoService.getMappingList(this.policyInfo, this.relationshipByPolicy);
    this.isDisplayRelationship = this.relationshipInfoService.checkDisplayRelationship(policyMappingList);
    if(LandingService.sysCWS){
      this.RelationTo =true;
      if(LandingService.cwsTypeIndicator == '3') {
        this.editPayer();
        this.isShowIcon=false;
      }else{
        if(['4','6'].indexOf(this.data.cwsPayor.idType)<0 && this.isDisableForm){
          this.editMode = true;
          this.isShowIcon = true;
        }
        if(this.data.cwsPayor.email ==''){
          this.editMode = false;
        }
      }
    }
  }

  next() {
    this.landingService.pushEvent({
      step: 'payment-result',
      data: {
        policyInfo: null,
        payerInfo: null,
        paymentMethod: null,
        policyInfoDisplayList: null
      }
    });
  }

  savePayerInfo() {
    this.payerInfo = this.payerInfoTemp;
    this.isDisableForm = true;
    if(['4','6'].indexOf(this.cwsIdType)>=0 || !LandingService.sysCWS){
      this.editMode = false;
    } else{
      this.editMode = true;
    }
    this.isShowIcon=false;
  }

  getEditButton(isEditButton: boolean) {
    this.isCWS = isEditButton;
  }

  isMobileDevice() {
    return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

  initialPayment() {
    CommonService.isRefreshPage=false;
    let payerInfoPrepare = window._.cloneDeep(this.payerInfo);
    const uniID = Math.random().toString(36).substring(2,9);
    localStorage.setItem('uniqueId',uniID);
    this.loadingSvr.setLoadingState(true);
    this.isDisabledInit = true;
    let cwsRedirectUrls = {
      callbackUrl: null,
      redirectUrl: null
    };
    let additionalInfo = {
                            searchNum: this.policySearchNumbers,
                            clientId: localStorage.getItem('uniqueId'),
                            device: this.isMobileDevice() ? Constant.device.mobile : Constant.device.desktop,
                            ssId: LandingService.sysCWS ? LandingService.ssId:null,
                            cardType: this.cyberSourceCardType
                          }
    if(!this.data.cwsPayor){
      payerInfoPrepare.dob = formatDate(payerInfoPrepare.dob, DATE_FORMAT.dd_MM_yyyy, LOCALE_FORMAT.LOCALE_EN_GB);      
    }
    if(LandingService.sysCWS){
      cwsRedirectUrls = this.data.cwsUrl;
    }
    const request = new TransactionRequest(this.policyInfo, payerInfoPrepare, this.paymentMethod, this.relationshipByPolicy,additionalInfo);
    this.landingService.initTransaction(request,cwsRedirectUrls).subscribe((response:any,) => {
      if(response?.error && response?.error?.errorCode) {
        const contentDisplay = this.commonService.getDisplayErr(response?.error?.errorCode);
        if(response?.error?.errorCode == Constant.errCodeList[3].value){
          this.commonService.showWarningDiaLog(Constant.errCodeList[3].name);
        } else {
          this.onShowConfirm(contentDisplay);
        }
        this.isDisabledInit = false;
      } else {
        //const { paymentData, paymentMethod } = response;
        if (this.paymentMethod == 'cybersource') {
          this.openGateWay(response.paymentGatewayLink);
        }
        if (this.paymentMethod == 'momo' || this.paymentMethod == 'vnpay') {
          window.open(response.paymentGatewayLink?.url, '_self');
        }
      }
      //this.loadingSvr.setLoadingState(false);
    },(e: HttpErrorResponse) => this.checkHTTPerror(e)); 
  }

  checkHTTPerror(e: HttpErrorResponse) {
    this.isDisabledInit = false;
    this.loadingSvr.setLoadingState(false);
  }

  // Enable when edit mode is false, checkbox is checked and payment method is selected
  displayNextButton(editMode: boolean, checkBoxConfirm: boolean, paymentMethod: string) {
    if(LandingService.cwsTypeIndicator ==='3' ){
      editMode = false;
    }else{
      editMode = this.isDisableForm?false:true;
    }
    if(!editMode && checkBoxConfirm && paymentMethod !='' && !this.isDisabledInit) {
      this.isDispayNextButton = this.isDisableForm;
    } else {
      this.isDispayNextButton = false;
    }
  }

  onSubmit(evt: any) {
    evt.target.submit();
  }

  openGateWay(cyberSourcemetaData: any) {
    const form = document.createElement('form');
    form.action = cyberSourcemetaData.url;
    form.id = 'payment';
    form.setAttribute('method', cyberSourcemetaData.method);
    const url = cyberSourcemetaData.url;
    const keys = Object.keys(cyberSourcemetaData.metaData);
    console.log('Keys: ', keys);

    keys.forEach((key) => {
      let input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', key);
      input.setAttribute('value', cyberSourcemetaData.metaData[key]);
      form.appendChild(input);
    });

    let body = document.getElementsByTagName('body')[0];
    body.appendChild(form);
    form.submit();
  }

  cancelTransaction() {
    if(LandingService.sysCWS){
      CommonService.isRefreshPage=false;
      window.open(window.location.href.split('?ss')[0], '_self');
    } else{

      this.landingService.pushEvent({
        step: 'policy-info',
        data: {
          policyInfo: null,
          payerInfo: null,
          paymentMethod: null,
          policyInfoDisplayList: null,
          searchQuery: null,
          addmore: null
        }
      });
    }
  }

  getTotalAmount() {
    this.totalAmount = window._.sumBy(this.policyInfo?.rows, 'billAmount');
  }

  editPayer() {
    this.isDisableForm = false;
    this.editMode = true;
    this.isShowIcon = true;
  }

  onPayerInfoChange(data: PayerInfo) {
    this.payerInfoTemp = data;
  }

  onFormValid(valid: boolean) {
    this.isFormValid = valid;
  }

  onShowConfirm(content: string) {
    const dialogRef = this.commonService.showDialog({
      panelClass: 'medium',
      data: {
        title: 'payment-confirm.title',
        content: content,
        contentfooter: 'payment-confirm.alert-message.footer',
        showClose: true,
        buttons: [
          {
            title: 'button.accept',
            color: 'primary',
            class: 'small',
            focusInitial: true,
            data: true
          }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(() => {
        // After accepted by the user then the selection will be reset
        this.paymentMethod = '';
    });
  }

  onPaymentMethodChange(event: any) {
    if(Constant.cyberSourceCardType.visa === event.value || Constant.cyberSourceCardType.mastercard === event.value 
      || Constant.cyberSourceCardType.jcb === event.value){
        this.cyberSourceCardType = event.value;
        this.paymentMethod = 'cybersource';
    } else {
      this.paymentMethod = event.value;
      this.cyberSourceCardType = '';
    }
  }

  onCheckBoxConfirm(event: any) {
    this.checkBoxConfirm = event?.checked;
  }

  onSelectRelationship(value: RelationshipByPolicy[]) {
    this.relationshipByPolicy = value;
    // move alert here
    const policyMappingList = this.relationshipInfoService.getMappingList(this.policyInfo, this.relationshipByPolicy);
    this.isDisplayRelationship = this.relationshipInfoService.checkDisplayRelationship(policyMappingList);
  }

  getRelationListString(relationList: RelationshipByPolicy[]): string[] {
    return relationList
      .map((item) => (item.relationshipCode ? (item.relationshipCode as string) : ''))
      .filter((x) => {
        return x !== '';
      });
  }
}
