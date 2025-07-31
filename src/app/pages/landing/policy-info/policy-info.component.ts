import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LandingService } from '../landing.service';
import { Data, PolicyInfo, PolicyInfoDisplay } from '../models/payment.model';
import { plainToClass } from 'class-transformer';
import { Subscription } from 'rxjs';
import { Regexs } from 'src/app/shared/utils/regexs';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonService } from 'src/app/shared/services/common.service';
import { Constant } from 'src/app/constant/constant';
import { MatSelect } from '@angular/material/select';
import { DateAdapter } from '@angular/material/core';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { roundCurrency, isRoundCurrency } from 'src/app/shared/utils/currencyUtils';
import { CustomErrorStateMatcher } from 'src/app/shared/error/custom.error-matcher';
import { CustomDateAdapter } from 'src/app/shared/adapter/custom.date.adapter';
import { DOBService } from 'src/app/shared/services/dob.service';
import { formatDate } from '@angular/common';
import { DATE_FORMAT, LOCALE_FORMAT } from 'src/app/shared/utils/localFormat';
import { ActivatedRoute } from '@angular/router';

declare const moment: any;
declare const $: any;

@Component({
  selector: 'app-policy-info',
  templateUrl: './policy-info.component.html',
  styleUrls: ['./policy-info.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: CustomDateAdapter},
  ]
})
export class PolicyInfoComponent implements OnInit, OnDestroy {
  @ViewChild('paymentReason', { static: false }) selector: MatSelect | undefined
  @Input() data!: Data;
  policyInfo!: any;
  policyInfoSelected!: any;
  searchForm!: FormGroup;
  premiumType!: any;

  numpadKeyCodes = [
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
    96, // 0
    97, // 1
    98, // 2
    99, // 3
    100, // 4
    101, // 5
    102, // 6
    103, // 7
    104, // 8
    105, // 9
  ];

  navigationKeyCodes = [
    8, // Backspace
    9, // Tab
    46, // Delete
    37, // Left arrow
    39, // Right arrow
    36, // Home button
    35 // End button
  ];
  allComplete: boolean = false;
  searchPolicies!: Subscription;
  policyTypeDisplay = '';
  policyTypeValue = '';
  totalAmount = 0;
  displaySummary: boolean = false;
  enableTotalAmount: boolean = false;
  isDisableTotalAmount: boolean = false;

  toolTipVisible: boolean = false;
  searchParam!: any;
  dataEmpty: string = '';
  originalBillAmount: number = 0;
  originalAmountParseText: string ='';
  totalAmountErr!: string;
  disabledbtnConfirm: boolean = true;
  isFormValid!: boolean;
  addmore: string = '';
  isLoading: boolean = false;
  min_pay_300k = '';
  min_pay_bill_amount = '';
  min_pay_11k = '';
  totalOver500mil= '';
  policy_exist = '';
  premium_err: string = '';
  isWarningRound:boolean=false;
  isApiRequestInProgress = false;
  matcher = new CustomErrorStateMatcher();
  policyInfoDisplayList!: PolicyInfoDisplay[];
  minDOB: Date = Constant.minDOB;
  maxDOB: Date = Constant.maxDOB;
  showWarningPolicyType = false;
  openedChange = CommonService.prototype.selectOpenedChange;

  cwspolicyDefault!: any;
  isCWS = false;
  cwsDataDetail!: any;
  cwspayor!: any;
  cwsPolicylst!: any;
  cwsTypeIndicator = '';
  cwsUrl!: {
    callbackUrl: null,
    redirectUrl: null
  }

  constructor(
    private formBuilder: FormBuilder, 
    private landingService: LandingService, 
    public commonService: CommonService,
    public loadingService: LoadingService, 
    private dobService: DOBService,
    private activeRoute: ActivatedRoute,
    ) {}

  ngOnInit(): void {
    this.premiumType = [{
      name: 'policy-type.I',
      value: 'I'
    },
    {
      name: 'policy-type.R',
      value: 'R'
    },
    {
      name: 'policy-type.C',
      value: 'C'
    },
    {
      name: 'policy-type.A',
      value: 'A'
    },
    {
      name: 'policy-type.L',
      value: 'L'
    },
    {
      name: 'policy-type.T',
      value: 'T'
    }];
    if(this.activeRoute.snapshot.queryParams['ss'] && !this.data?.searchQuery){   
      this.getDataCWS(this.activeRoute.snapshot.queryParams['ss']);      
    }
    if(LandingService.sysCWS){
      this.cwsTypeIndicator = this.data?.cwsTypeIndicator;
      this.isCWS = this.data?.cwsTypeIndicator=='2'? false : LandingService.sysCWS ;
      this.cwsPolicylst = this.data?.cwsPolicylst;
      this.cwspayor = this.data?.cwsPayor;
      this.cwsUrl = {
        callbackUrl: this.data?.cwsUrl?.callbackUrl,
        redirectUrl: this.data?.cwsUrl?.redirectUrl
      }
    }
    
    this.policyInfo = this.data?.policyInfo;
    this.searchParam = this.data?.searchQuery;
    this.addmore = this.data?.addmore;    
    this.policyInfoDisplayList = this.data?.policyInfoDisplayList || [];
    this.searchForm = this.formBuilder.group({
      polNum: new FormControl(this.searchParam?.policyNumber, [
        Validators.required,
        Validators.maxLength(32),
        Validators.pattern(Regexs.ANSWER_TEXT_AND_NUMBER)
      ]),
      insuredName: new FormControl(this.searchParam?.clientName, 
      [
        Validators.required,
        Validators.maxLength(80)
      ]),
      insuredDob: new FormControl(this.searchParam?.birthDateStr, 
      [
        Validators.required
      ]),
      paymentReason: new FormControl(this.searchParam?.paymentType, [Validators.required]),
      totalAmount: new FormControl('0', [Validators.required]),
      cwsPolNum: new FormControl(this.searchParam?.policyNumber, [Validators.required])
    },{updateOn: 'change'});
    if (this.searchParam) {
      this.isFormValid = true;
      this.back();
    } else {
      this.isFormValid = this.searchForm.valid;
    }
  }

  ngOnDestroy(): void {
    this.searchPolicies?.unsubscribe();
  }

  getDataCWS(sessionID: string){
    this.loadingService.setLoadingState(true);
    this.landingService.getSessionDetailCWS(sessionID).subscribe((res: any) => {
      this.loadingService.setLoadingState(false);
      // set expire time CWS
      const current = moment();
      const cwsExpired = moment(res.expiredDate);
      const timeSeconds = cwsExpired.diff(current,'milliseconds'); //ms
      localStorage.setItem('cwsTimeOut',timeSeconds.toString());

      this.cwsDataDetail = res;
      LandingService.sysCWS = true;
      LandingService.ssId = sessionID; //use for session timeout
      LandingService.cwsTypeIndicator = res.paymentTypeIndicator;
      this.isCWS = true;
      this.cwspayor = res.payor;
      this.cwsPolicylst = res.policies;
      this.cwsTypeIndicator = res.paymentTypeIndicator;
      this.cwspolicyDefault = res.policies.filter((t: { isDefault: boolean; })=>t.isDefault ===true);
      this.cwsUrl = {
        callbackUrl: res.callbackUrl,
        redirectUrl: res.redirectUrl
      }
      if(res.paymentTypeIndicator === "2"){
          this.isCWS = false;
          this.searchForm.controls['polNum'].setValue('');
          this.searchForm.controls['insuredName'].setValue('');      
          this.searchForm.controls['insuredDob'].setValue('');
          this.searchForm.controls['paymentReason'].setValue('');
          this.searchForm.controls['cwsPolNum'].setErrors(null);
        } else if(res.paymentTypeIndicator === "3") {
          this.cwspolicyDefault[0]['billId'] = res.billId;
          this.cwspolicyDefault[0]['billAmount'] = res.policies[0].amount.value || 0;
          this.cwspayor['dob'] = this.cwspayor.birthDateStr;
          this.cwspayor['nationalIdType'] = res.payor.idType == '4' || res.payor.idType == '6'?'7':res.payor.idType;
          this.cwspayor['nationalId'] = res.payor.identifier;
          this.cwspayor['email'] = res.payor.idType == '4'? '':res.payor.email;
          this.landingService.pushEvent({
            step: 'payer-info-integrate',
            data: {
              policyInfo: {rows:this.cwspolicyDefault},
              cwsPayor: this.cwspayor,
              payerInfo: this.cwspayor,
              paymentMethod: null,
              relationshipByPolicy: [],
              searchQuery: this.cwspolicyDefault[0],
              policySearchNum: [this.cwspolicyDefault[0].policyNumber],
              cwsUrl: this.cwsUrl
            }
          });
        } else{
          this.searchForm.controls['cwsPolNum'].setValue(this.cwspolicyDefault[0].policyNumber);
          this.searchForm.controls['insuredName'].setValue(this.cwspolicyDefault[0].clientName);      
          this.searchForm.controls['insuredDob'].setValue(this.cwspolicyDefault[0].birthDateStr);
          this.searchForm.controls['paymentReason'].setValue(this.cwspolicyDefault[0].premType);
          this.searchForm.controls['insuredName'].disable();
          this.searchForm.controls['insuredDob'].disable();
          this.searchForm.controls['polNum'].setErrors(null);//cws set Valid
          this.checkFormValid();
        }
     });
  }

  restrictInputToTotalAmount(event: KeyboardEvent): void {
    if (!this.numpadKeyCodes.includes(event.keyCode) && !this.navigationKeyCodes.includes(event.keyCode)) {
      event.preventDefault();
      return;
    }
  }

  searchPolicy() {
    const controls = this.searchForm.controls;
    this.policyInfo = null;
    this.totalAmount = 0;
    this.dataEmpty = '';
    this.addmore = this.data?.addmore || '';
    this.disabledbtnConfirm = true;
    let row: any;
    let checkAddExist = false;
    this.isWarningRound = false;
    this.policyTypeValue = controls['paymentReason'].value;

    if(this.showWarningPolicyType){
      controls['paymentReason'].setValidators(null);
      controls['paymentReason'].setErrors(null);
    }
    if (this.searchForm.invalid) {
      return;
    }

    let body = {
      policyNumber: LandingService.sysCWS && this.cwsTypeIndicator !='2' ? controls['cwsPolNum'].value: controls['polNum'].value,
      clientName: controls['insuredName'].value,
      birthDateStr: formatDate(controls['insuredDob'].value, DATE_FORMAT.dd_MM_yyyy, LOCALE_FORMAT.LOCALE_EN_GB),
      paymentType: controls['paymentReason'].value
    };

    this.searchParam = body;
    this.isFormValid = false;
    this.resetWarningErr();
    if (!this.isApiRequestInProgress) {
      this.isApiRequestInProgress = false; //anti call api loop
      this.loadingService.setLoadingState(true);
      let premiumType = ['E99023','E99021','E05','E06','E07','E08'];
      this.searchPolicies = this.landingService.paymentList(body).subscribe((res: any) => {        
        if (res.error && res.error.message) {
          this.isFormValid = true;
          this.isApiRequestInProgress = false;
          let errMapping = this.commonService.getDisplayErr(res.error.errorCode);          
          if(premiumType.includes(res.error.errorCode)){
            this.searchForm.get('paymentReason')?.markAllAsTouched();
            controls['paymentReason'].setErrors({ incorrect: true });
            this.showWarningPolicyType = true;
            this.premium_err = errMapping;
          } else {
            this.dataEmpty = errMapping;
            this.scrollToApiErrorMessage();
          }
          return;
        }
        if (this.addmore == 'add-more-policy' || this.addmore == 'back-policy-search') {
          row = window._.cloneDeep(this.data?.policyInfo.rows);
          for (const itemExist of row) {
            const matchingItem = res.collectionItems.find((item: any) => item.billId === itemExist.billId);
            if (matchingItem) {
              checkAddExist = true;
              break;
            }
          }
          if(checkAddExist){
            this.searchForm.get('paymentReason')?.markAllAsTouched();
            controls['paymentReason'].setValidators(Validators.required);
            controls['paymentReason'].setErrors({ incorrect: true });
            this.policy_exist = 'policy-info.policy-exist';
            return;
          }
        }
        
        const result: any = {
          topUp: null,
          renewalPremium: [],
          reinstatement: null,
          policyChange: null,
          loan: null,
          initPremium: null,
          flexiblePremium: null,
        };
        res.collectionItems.forEach((item: any) => {
          switch (item.premiumType) {
            case 'I':
              result.initPremium = item;
              break;
            case 'R':
              if (!this.isDuplicatePremium(item, row)) {
                result.renewalPremium.push(item);
              }
              break;
            case 'A':
              result.reinstatement = item;
              break;
            case 'C':
              result.policyChange = item;
              break;
            case 'L':
              result.loan = item;
              break;
            case 'T':
              result.topUp = item;
              break;
            default:
              break;
          }
        });
        
        if (controls['paymentReason'].value == 'R'
          && (!result.renewalPremium
            || result.renewalPremium.length == 0)) {
          controls['paymentReason'].setValidators(Validators.required);
          controls['paymentReason'].setErrors({ incorrect: true });
          this.policy_exist = 'policy-info.policy-exist';
          return;
        }

        this.policyInfo = plainToClass(PolicyInfo, {
          checked: false,
          rows:
            controls['paymentReason'].value == 'R'
            ? result?.renewalPremium
            : [this.mapDataFee(result)]
        });
        if (this.policyInfo?.rows) {
          //refill insuredName
          this.searchForm.controls['insuredName'].setValue(this.policyInfo?.rows[0].ownerName);
          const insuredName = this.searchForm.get('insuredName')?.value;

          if (insuredName) {
            const formatedName = insuredName?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace (/Đ/g, "D");
            this.searchForm.get('insuredName')?.setValue(formatedName.toUpperCase());
          }

          this.getTotalAmount();
          this.originalBillAmount = this.totalAmount;
          this.paymentType(controls['paymentReason'].value);
          this.FormControlDisable(true);
          this.policyInfoSelected = window._.cloneDeep(this.policyInfo);
          this.getEditable(this.policyInfo, controls['paymentReason'].value);
          if (this.totalAmount == 0) {
            this.disabledbtnConfirm = true;
          }
        }
      },(e: HttpErrorResponse) => this.checkHTTPerror(e));
    }
  }

  scrollToApiErrorMessage() {
    const scrollTop = $('html, body').scrollTop() || 0;
    const offsetTop = document.getElementById('apiErrorMess')?.offsetTop || 0;
    const matErrorMarginTop = 20;
    if (offsetTop + matErrorMarginTop < scrollTop) {
      $('html, body').animate({
        scrollTop: offsetTop
      }, 100);
    }
  }

  checkHTTPerror(e: HttpErrorResponse) {
    this.loadingService.setLoadingState(false);
    if(e.status !=200) {
      this.isFormValid = true;
      // this.commonService.showWarningDiaLog('policy-info.http-warning');
    }
  }

  getEditable(policyInfo: any, premiumType: any) {
    policyInfo.rows[0].flexibleIndicator == 'N'
        ? this.searchForm.controls['totalAmount'].disable()
        : this.searchForm.controls['totalAmount'].enable();
  }

  totalAmountChange(value: any) {
    this.checkShowRoundNumber(this.parseTotalAmount(value.target.value,true));
    value.target.value = this.totalAmount;
    this.policyInfoSelected.rows[0].billAmount = this.parseTotalAmount(this.totalAmount,false);
    this.policyInfo.rows[0].billAmount = this.parseTotalAmount(this.totalAmount,false);
    this.searchForm.controls['totalAmount'].setValue(this.parseTotalAmount(this.totalAmount,false));
    this.setDisablebtnConfirm();
  }

  totalAmountOnBlur() {
    if (isRoundCurrency(this.totalAmount)) {
      this.totalAmount = roundCurrency(this.totalAmount);
      this.policyInfoSelected.rows[0].billAmount = this.totalAmount;
      this.policyInfo.rows[0].billAmount = this.totalAmount;
      this.searchForm.controls['totalAmount'].setValue(this.totalAmount);
      this.isWarningRound = true;
    }

    this.setDisablebtnConfirm();
  }

  mapDataFee(data: any) {
    let paymentDataType;
    if (data['topUp']) {
      paymentDataType = data['topUp'];
    }
    if (data['reinstatement']) {
      paymentDataType = data['reinstatement'];
    }
    if (data['policyChange']) {
      paymentDataType = data['policyChange'];
    }
    if (data['loan']) {
      paymentDataType = data['loan'];
    }
    if (data['initPremium']) {
      paymentDataType = data['initPremium'];
    }
    if (data['flexiblePremium']) {
      paymentDataType = data['flexiblePremium'];
    }
    return paymentDataType;
  }

  FormControlDisable(isDisable: boolean) {
    isDisable ? this.searchForm.controls['polNum'].disable() : this.searchForm.controls['polNum'].enable();
    isDisable ? this.searchForm.controls['paymentReason'].disable() : this.searchForm.controls['paymentReason'].enable();
    if(LandingService.sysCWS && this.cwsTypeIndicator =='1'){
      this.searchForm.controls['insuredName'].disable();
      this.searchForm.controls['insuredDob'].disable();
      isDisable ? this.searchForm.controls['cwsPolNum'].disable(): this.searchForm.controls['cwsPolNum'].enable();
    } else {
      isDisable ? this.searchForm.controls['insuredName'].disable() : this.searchForm.controls['insuredName'].enable();
      isDisable? this.searchForm.controls['insuredDob'].disable() : this.searchForm.controls['insuredDob'].enable();
    }
  }

  paymentType(valueSelect: any) {
    this.policyTypeValue = valueSelect;
    this.selector?.close();
    this.disabledbtnConfirm = false;
    this.checkFormValid();
    this.policyTypeDisplay = this.premiumType.filter((entry: { value: any; }) => entry.value === valueSelect)[0].name;
    
    if( valueSelect == this.premiumType[5].value){
      this.policyTypeDisplay = "policy-info.top-up-payment";
    } else if( valueSelect == this.premiumType[1].value && this.policyInfo?.rows[0]?.planCode == 'UL007'){
      this.policyTypeDisplay = "policy-info.renewal-title";
    }
  }

  cwspolNumType(valueSelect: any) {
    this.policyTypeValue = valueSelect;
    this.selector?.close();
    this.disabledbtnConfirm = false;
    this.checkFormValid();
    const policySelect = this.cwsPolicylst.filter((entry: { policyNumber: any; }) => entry.policyNumber === valueSelect);
    this.searchForm.controls['paymentReason'].setValue(policySelect[0].premType);
    this.searchForm.controls['insuredName'].setValue(policySelect[0].clientName);
    this.searchForm.controls['insuredDob'].setValue(policySelect[0].birthDateStr);
  }

  selectOne(index:number){
    this.totalAmount = 0;
    let rows = [];
    this.resetWarningErr();
    this.policyInfoSelected = window._.cloneDeep(this.policyInfo);
    this.policyInfo?.rows.forEach((item: { checked: boolean; }) =>(item.checked=false));
    for (let i = 0; i <=index; i++) {
      this.policyInfo.rows[i].checked=true;
      rows.push(this.policyInfo.rows[i]);
      this.totalAmount += this.policyInfo.rows[i].billAmount;
    }
    this.policyInfoSelected['rows'] = rows;
    this.searchForm.controls['totalAmount'].setValue(this.totalAmount);
    this.disabledbtnConfirm = this.totalAmount <= 0;
  }
  selectRow(index: number, row: any){
    row.checked=!row.checked;
    this.selectOne(index);
  }

  resetWarningErr(){
    this.min_pay_300k = '';
    this.min_pay_bill_amount = '';
    this.min_pay_11k = '';
    this.totalOver500mil= '';
    this.policy_exist = '';
    this.premium_err = '';
  }

  setDisablebtnConfirm() {
    const controls = this.searchForm.controls;
    this.resetWarningErr();
    this.originalAmountParseText = this.parseTotalAmount(this.originalBillAmount,false) as string;
    const originalAmountParse = this.parseTotalAmount(this.originalBillAmount,true) as number;
    const updateAmountParse = this.parseTotalAmount(this.totalAmount,true) as number;
    const paymentType = controls['paymentReason'].value;
    if((paymentType == this.premiumType[4].value && (originalAmountParse >=300000 && updateAmountParse < 300000))
       || (paymentType == this.premiumType[1].value && this.policyInfo.rows[0].planCode == 'UL007' && updateAmountParse < 300000 && originalAmountParse >=300000)
       || (paymentType == this.premiumType[5].value && updateAmountParse < 300000 && 300000 <= originalAmountParse)){
        controls['totalAmount'].setValidators(Validators.required);
        controls['totalAmount'].setErrors({ incorrect: true });
        this.disabledbtnConfirm = true;
        this.min_pay_300k = 'policy-info.min_pay_300k';
      } else if((paymentType == this.premiumType[3].value && updateAmountParse < 11000 && 11000 <= originalAmountParse) 
              || ((paymentType == this.premiumType[2].value && updateAmountParse < 11000))) {
        controls['totalAmount'].setValidators(Validators.required);
        controls['totalAmount'].setErrors({ incorrect: true });
        this.disabledbtnConfirm = true;
        this.min_pay_11k = 'policy-info.min_pay_11k';
      } else if((paymentType == this.premiumType[1].value && this.policyInfo.rows[0].planCode == 'UL007' && updateAmountParse < originalAmountParse && originalAmountParse < 300000)
              || (paymentType == this.premiumType[4].value && originalAmountParse >= 300000 && originalAmountParse < updateAmountParse)
              || (paymentType == this.premiumType[4].value && updateAmountParse < originalAmountParse && originalAmountParse <300000)
              || (paymentType == this.premiumType[4].value && originalAmountParse < updateAmountParse)
              || (paymentType == this.premiumType[5].value && updateAmountParse < originalAmountParse && originalAmountParse <300000)
              || (paymentType == this.premiumType[3].value && updateAmountParse < originalAmountParse && originalAmountParse <11000)) {
        controls['totalAmount'].setValidators(Validators.required);
        controls['totalAmount'].setErrors({ incorrect: true });
        this.disabledbtnConfirm = true;
        this.min_pay_bill_amount = 'policy-info.min_pay_bill_amount';
      } else {
        this.disabledbtnConfirm = updateAmountParse == 0;
      }
  }

  selectAll(checked: boolean) {
    this.allComplete = checked;
    this.totalAmount = 0;
    this.totalOver500mil = '';
    this.policyInfoSelected = window._.cloneDeep(this.policyInfo);
    let rows = [];
    if (this.policyInfo === null || this.policyInfo?.rows == null) {
      return;
    }
    this.policyInfo.rows.forEach((item: any) => (item.checked = checked));
    for (let index = 0; index < this.policyInfo?.rows.length; index++) {
      rows.push(this.policyInfo.rows[index]);
      this.totalAmount += this.policyInfo.rows[index].billAmount;
    }
    this.policyInfoSelected['rows'] = rows;
    this.setDisablebtnConfirm();
  }

  checkAmountValue() {
    const controls = this.searchForm.controls;
    controls['totalAmount'].setErrors(null);
    controls['totalAmount'].setValidators(null);
    this.resetWarningErr();
    this.totalAmount = this.parseTotalAmount(this.totalAmount, true) as number;
    this.checkShowRoundNumber(this.totalAmount);
    if ((controls['paymentReason'].value == this.premiumType[2].value || controls['paymentReason'].value == this.premiumType[3].value) && this.totalAmount < this.originalBillAmount && this.originalBillAmount < 11000) {
      controls['totalAmount'].setValidators(Validators.required);
      controls['totalAmount'].setErrors({ incorrect: true });
      this.disabledbtnConfirm = true;
      this.min_pay_11k = 'policy-info.min_pay_11k';
    }
    if ((controls['paymentReason'].value == this.premiumType[4].value) && this.totalAmount < 300000) {
      controls['totalAmount'].setValidators(Validators.required);
      controls['totalAmount'].setErrors({ incorrect: true });
      this.disabledbtnConfirm = true;
      this.min_pay_300k = 'policy-info.min_pay_300k';
    }
    if ((controls['paymentReason'].value == this.premiumType[5].value) && this.totalAmount < this.originalBillAmount && this.originalBillAmount < 300000) {
      controls['totalAmount'].setValidators(Validators.required);
      controls['totalAmount'].setErrors({ incorrect: true });
      this.disabledbtnConfirm = true;
      this.min_pay_bill_amount = 'policy-info.min_pay_bill_amount';
    } else if ((controls['paymentReason'].value == this.premiumType[5].value) && this.totalAmount < 300000 && 300000 <= this.originalBillAmount) {
      controls['totalAmount'].setValidators(Validators.required);
      controls['totalAmount'].setErrors({ incorrect: true });
      this.disabledbtnConfirm = true;
      this.min_pay_300k = 'policy-info.min_pay_300k';
    }
    if (this.totalAmount > 500000000) {
      controls['totalAmount'].setValidators(Validators.required);
      controls['totalAmount'].setErrors({ incorrect: true });        
      this.totalOver500mil = 'policy-info.total-over-500mil';
      this.disabledbtnConfirm = true;
    }
  }

  next() {
    const controls = this.searchForm.controls;
    if(this.totalAmount != this.originalBillAmount){
      this.checkAmountValue();
    }
    
    //Total payment amount >= 500 mil, display inline error message E00312 for field
    if (this.totalAmount > 500000000) {
      controls['totalAmount'].setValidators(Validators.required);
      controls['totalAmount'].setErrors({ incorrect: true });        
      this.totalOver500mil = 'policy-info.total-over-500mil';
      this.disabledbtnConfirm = true;
      return;
    }

    if (this.searchForm.invalid) {
      return this.landingService.checkAllValidation(controls);
    }

    let row: any;
    let currentSelectedpolicy: any = this.policyInfoSelected.rows;

    if (this.data?.addmore == 'add-more-policy' || this.data?.addmore == 'back-policy-search') {
      row = window._.cloneDeep(this.data?.policyInfo.rows);
      const isPolicyPresent = row.some((r: { policyNumber: any; }) => r.policyNumber === currentSelectedpolicy.policyNumber);
      const isPremiumTypePresent = row.some((r: { premiumType: any; }) => r.premiumType === currentSelectedpolicy.premiumType);

      if ( isPolicyPresent && !isPremiumTypePresent || !isPolicyPresent ) {
        row = row.concat(currentSelectedpolicy);
      }
    } else {
      row = currentSelectedpolicy;
    }

    // Format before passing data
    const formatedRows = row.map((item: any) => {
      const billAmount = this.parseTotalAmount(item.billAmount, true);
      item.billAmount = billAmount;
      return item;
    });

    this.policyInfoSelected['rows'] = formatedRows;
    let currentPolicyInfoDisplay: any = this.mergeCurrentPremium(currentSelectedpolicy);

    if (currentPolicyInfoDisplay) {
      this.policyInfoDisplayList.push(currentPolicyInfoDisplay);
    }
    let lisPolicySearch: any = [];
    window._.forEach(this.policyInfoSelected.rows, (item: any) => {
      const findItem = lisPolicySearch.find((i: any) => { i.policyNumber == item.policyNumber })
      if(!findItem){
        lisPolicySearch.push(item.policyNumber);
      }
    });

    const data = {
      step: 'payment-info',
      data: {
        policyInfo: this.policyInfoSelected,
        searchQuery: this.searchParam,
        policyInfoDisplayList: this.policyInfoDisplayList,
        policySearchNum: lisPolicySearch,
        cwsPayor: this.cwspayor,
        cwsPolicylst: this.cwsPolicylst,
        cwsUrl: this.cwsUrl,
        cwsTypeIndicator: this.cwsTypeIndicator
      }
    };
    this.landingService.pushEvent(data);
  }

  back() {
    this.policyInfo = null;
    this.displaySummary = false;
    this.disabledbtnConfirm=false;
    this.searchForm.controls['totalAmount'].setErrors(null);
    this.totalOver500mil = '';
    this.FormControlDisable(false);
    this.checkFormValid();
  }

  checkAddPolicyExist() {
    this.toolTipVisible = true;
  }

  getTotalAmount() {    
    if (this.searchForm.controls['paymentReason'].value != this.premiumType[1].value || this.policyInfo.rows[0].planCode =='UL007') {
      this.totalAmount = this.policyInfo.rows[0].billAmount;      
      this.searchForm.controls['totalAmount'].setValue(this.totalAmount.toString().replace(Constant.currencyRegex, "$1."));
    }
  }

  changeInsuredName() {
    const insuredName = this.searchForm.get('insuredName')?.value;

    if (insuredName) {
      const formatedName = insuredName?.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace (/Đ/g, "D").replace (/đ/g, "d").replace(/\s+/g, ' ').trim();
      this.searchForm.get('insuredName')?.setValue(formatedName.toUpperCase());
    }

    this.checkFormValid();
  }

  checkFormValid() {
    let insuredDob: any = this.searchForm.get('insuredDob')?.value;
    let dobValid = false;
    let dobConvert = this.dobService.covertDate(insuredDob);

    if (dobConvert !== Constant.INVALID_DATE) {
      this.searchForm.get('insuredDob')?.setValue(dobConvert);
      dobValid = true;
    }

    if(this.searchForm.get('paymentReason')?.value){
      this.searchForm.controls['paymentReason'].setErrors(null);
      this.searchForm.controls['paymentReason'].setValidators(null);
    }
    if(this.cwsDataDetail && this.cwsTypeIndicator !='2'){
      this.searchForm.controls['polNum'].setErrors(null);
    } else {
      let polNum = this.searchForm.controls['polNum']?.value;
      this.searchForm.controls['cwsPolNum'].setErrors(null);
      this.searchForm.controls['polNum'].setValue(polNum ? polNum.replace(/[\s]/g, '') : '');
    }    
    this.isFormValid = this.searchForm.valid && dobValid;
  }

  backPaymentInfo() {
    const data = {
      step: 'payment-info',
      data: {
        policyInfo: this.data?.policyInfo,
        searchQuery: this.searchParam,
        policyInfoDisplayList: this.data?.policyInfoDisplayList
      }
    };
    this.landingService.pushEvent(data);
  }

  isNumber(n: any): boolean { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

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

  checkShowRoundNumber(number: any) {
    const rounded = Math.floor(number / 1000) * 1000;
    const remainder = number % 1000;
    if (remainder >= 500) {
      this.isWarningRound = true;
      this.totalAmount = rounded + 1000;
    } else {
      this.isWarningRound = this.isWarningRound || (number != rounded);
      this.totalAmount = rounded;
    }  
  }

  isDuplicatePremium(newPremium : any, premiumList: any): boolean {
    if (!premiumList || !newPremium) return false;

    for (let idx = 0; idx < premiumList.length; idx++) {
      const item = premiumList[idx];
      if(newPremium.policyNumber == item.policyNumber
        && newPremium.premiumType == item.premiumType
        && newPremium.billId == item.billId) {
        return true;
      }
    }

    return false;
  }

  mergeCurrentPremium(data: any): any {
    let policyInfoDisplay: any;

    if (!data && data.length == 0) return policyInfoDisplay;
    let totalAmount: number = 0;
    let billIds: any = [];
    let policyNumber: string = '';
    let ownerName: string = '';
    let premiumType: string = '';

    window._.forEach(data, (row: any) => {
      policyNumber = row.policyNumber;
      ownerName = row.ownerName;
      premiumType = row.premiumType;
      billIds.push(row.billId);
      totalAmount += row.billAmount;
    });

    return new PolicyInfoDisplay(policyNumber, ownerName, premiumType, totalAmount, billIds);
  }

  handleFocusOutDOB(event: any) {
    const value = (event.target as HTMLInputElement).value;

    if (value && !value.match(Regexs.DATE_FORMAT_DD_MM_YYYY)) {
      this.searchForm.controls['insuredDob'].setErrors({ pattern: true });
      this.isFormValid = false;
    } else if (value.match(Regexs.DATE_FORMAT_DD_MM_YYYY)) {
      this.isFormValid = this.premium_err != ''? true : this.searchForm.valid;
    }
  }

  focus(event: any){
    const input = event.target as HTMLInputElement;
    setTimeout(() => {
      input.focus();
      if(input.value =='') {
        this.searchForm.controls['insuredDob'].setErrors(null);
      }
    }, 10);
  }

  bsValueChange(event: any, insuredDobDt: any) {
    setTimeout(() => {
      const date = insuredDobDt.dataset['date'];
      if (!date) {
        this.isFormValid = this.premium_err != ''? true : this.searchForm.valid;
        return;
      }
      if (!moment(event).isValid()) {
        // this.searchForm.get('insuredDob')?.reset();
        // this.searchForm.get('insuredDob')?.setValue(null);
        insuredDobDt.value = date;
      } else {
        if (event != this.searchForm.get('insuredDob')?.value) {
          // this.searchForm.get('insuredDob')?.setValue(event);
          insuredDobDt.value = date;
        }
      }
      this.isFormValid = this.premium_err != ''? true : this.searchForm.valid;
    });
  }

  onDpShown() {
    setTimeout(() => {
      const dp: any = document.getElementsByTagName('bs-datepicker-container')[0];
      dp?.scrollIntoViewIfNeeded(false);
    });
  }
}
