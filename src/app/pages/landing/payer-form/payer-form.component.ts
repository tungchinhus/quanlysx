import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Constant } from 'src/app/constant/constant';
import { ageCheckValidator } from 'src/app/shared/directives/age-check.directive';
import { Regexs } from 'src/app/shared/utils/regexs';
import { PayerInfo } from '../models/payment.model';
import { emailValidator } from 'src/app/shared/directives/email-validator.directive';
import { CustomDateAdapter } from 'src/app/shared/adapter/custom.date.adapter';
import { DateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/shared/services/common.service';
import { CustomErrorStateMatcher } from 'src/app/shared/error/custom.error-matcher';
import { LandingService } from '../landing.service';

declare const moment: any;

@Component({
  selector: 'app-payer-form',
  templateUrl: './payer-form.component.html',
  styleUrls: ['./payer-form.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: CustomDateAdapter},{provide: DatePipe}
  ]
})
export class PayerFormComponent implements OnInit, OnChanges {
  @Input() disabledForm: boolean = false;
  @Input() cwsCheck: boolean = false;
  @Input() cwsIdType: string = '';
  @Input() isShowIcon: boolean = true;
  @Output() isEditButton = new EventEmitter<boolean>(false);
  @Output() isFormValid = new EventEmitter<boolean>(false);
  @Input() payerInfo!: PayerInfo;
  @Output() payerInfoChange = new EventEmitter<PayerInfo>();

  payerForm!: FormGroup;
  gender = Constant.gender;
  identityType = Constant.identityType;
  identityNumberMaxLength: number = 12;
  minDOB: Date = Constant.minDOB;
  maxDOB: Date = moment(new Date()).subtract(15, 'years').toDate();
  openedChange = CommonService.prototype.selectOpenedChange;
  isPayerFormValid: boolean | undefined;
  matcher = new CustomErrorStateMatcher();
  cwsTypeIndicator = '';
  

  constructor(private formBuilder: FormBuilder, private datePipe: DatePipe,private landingService: LandingService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Disable when disabledForm is true
    if (changes['disabledForm'] && this.payerForm) {
      this.setFormControlDisable(changes['disabledForm'].currentValue);
    }
  }

  ngOnInit(): void {
    this.cwsTypeIndicator = LandingService.cwsTypeIndicator;
    this.initForm();
    this.payerForm.valueChanges.subscribe((value) => {
      // This should be emit value to parent component when value is valid
      if ((this, this.payerForm.valid)) {
        this.payerInfoChange.emit({
          name: this.parsePayerName(value.name ? value.name : this.payerInfo?.name),
          dob: value.dateOfBirth ? value.dateOfBirth : this.payerInfo?.dob,
          gender: value.gender ? value.gender : this.payerInfo?.gender,
          email: value.email ? value.email : this.payerInfo?.email,
          nationalIdType: value.identityType ? value.identityType : this.payerInfo?.nationalIdType,
          nationalId: value.identityNumber ? value.identityNumber : this.payerInfo?.nationalId
        });
      }
      this.isFormValid.emit(this.payerForm.valid);
    });
  }

  parsePayerName(payerName: string): string {
    if(!payerName) return '';
    return payerName?.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace (/Đ/g, "D").replace(/\s+/g, ' ').trim().toUpperCase();
  }

  onIdentityTypeChange(value: string) {
    if (value == Constant.identityTypeValues.passport) {
      this.identityNumberMaxLength = 9;
      this.payerForm.controls['identityNumber'].setValidators([
        Validators.required,
        Validators.pattern(Regexs.ONLY_PASSPORT_NUMBER)
      ]);
    }
    if (value == Constant.identityTypeValues.identityCitizen || value == Constant.identityTypeValues.military) {
      this.identityNumberMaxLength = 12;
      this.payerForm.controls['identityNumber'].setValidators([
        Validators.required,
        Validators.pattern(Regexs.ONLY_IDENTITY_NUMBER)
      ]);
    }
    if (value == Constant.identityTypeValues.CMND) {
      this.identityNumberMaxLength = 9;
      this.payerForm.controls['identityNumber'].setValidators([
        Validators.required,
        Validators.pattern(Regexs.ONLY_ID_NUMBER)
      ]);
    }
    this.payerForm.controls['identityNumber'].updateValueAndValidity();
    this.payerForm.controls['identityNumber'].markAsTouched();
  }

  initForm(){
    this.payerForm = this.formBuilder.group({
      name: new FormControl({value: '', disabled: !this.payerInfo?.name ? this.disabledForm: true}, {validators: [
        Validators.required,
        Validators.maxLength(80),
        //Validators.pattern(Regexs.ONLY_NAME)
      ], updateOn: 'change'}),
      gender: new FormControl({value: '', disabled: !this.payerInfo?.gender? this.disabledForm: true}, [Validators.required, Validators.maxLength(80)]),
      dateOfBirth: new FormControl({value: '', disabled: !this.payerInfo?.dob? this.disabledForm: true}, {validators: [
        Validators.required,
        ageCheckValidator(15)
      ], updateOn: 'blur'}),
      email: new FormControl({value: '', disabled: !this.payerInfo?.email? this.disabledForm: true}, [Validators.required, emailValidator()]),
      identityType: new FormControl({value: '', disabled: !this.payerInfo?.nationalIdType? this.disabledForm: true},  {
        validators: [Validators.required],
        updateOn: 'change'
      }),
      identityNumber: new FormControl({value: '', disabled: !this.payerInfo?.nationalId ? this.disabledForm: true}, {validators: [
        Validators.required,
        Validators.pattern(Regexs.ONLY_IDENTITY_NUMBER)
      ], updateOn: 'change'}),
    });
    if (this.payerInfo) {
      this.payerForm.patchValue({
        name: this.payerInfo.name,
        dateOfBirth: this.payerInfo.dob? this.payerInfo.dob  : '',
        gender: this.payerInfo.gender,
        email: this.payerInfo.email,
        identityType: this.payerInfo.nationalIdType,
        identityNumber: this.payerInfo.nationalId
      });
      
      if (this.payerInfo.nationalIdType == Constant.identityTypeValues.passport ) {
        this.identityNumberMaxLength = 9;
        this.payerForm.controls['identityNumber'].setValidators([
          Validators.required,
          Validators.pattern(Regexs.ONLY_PASSPORT_NUMBER)
        ]);
      } else if (this.payerInfo.nationalIdType == Constant.identityTypeValues.CMND) {
        this.identityNumberMaxLength = 9;
        this.payerForm.controls['identityNumber'].setValidators([
          Validators.required,
          Validators.pattern(Regexs.ONLY_ID_NUMBER)
        ]);
      } else {
        this.identityNumberMaxLength = 12;
        this.payerForm.controls['identityNumber'].setValidators([
          Validators.required,
          Validators.pattern(Regexs.ONLY_IDENTITY_NUMBER)
        ]);
      }

      // CWS
      if(this.payerInfo.email =='' && LandingService.sysCWS){
        this.payerForm.controls['email'].enable();
        this.isEditButton.emit(false);
      }
      if((this.cwsIdType =='6' || this.cwsIdType =='4') && !CommonService.cwsViewMode){
        this.payerForm.controls['identityType'].enable();
        this.payerForm.controls['identityNumber'].enable();
        this.payerForm.controls['identityNumber'].setValue('');
      }
      let formValid = this.payerForm.status == 'DISABLED'
      if(LandingService.sysCWS && LandingService.cwsTypeIndicator == '3'
            && this.payerForm.controls['identityType'].value!=''
            && this.payerForm.controls['identityNumber'].value!=''
            && this.payerForm.controls['email'].value!=''
        ){
        formValid = true;
      }
      
      if(!this.payerInfo.nationalIdType){this.payerForm.controls['identityType'].setValue(Constant.identityType[0].value);}      
      this.isFormValid.emit(formValid);
    }else {
      this.payerForm.controls['identityType'].setValue(Constant.identityType[0].value);
    }
  }

  setFormControlDisable(disabled: boolean) {
    for (const key in this.payerForm.controls) {
      if (disabled) {
        this.payerForm.controls[key].disable();
      }else if(['4','6'].indexOf(this.cwsIdType)>=0 && ['name','dateOfBirth','gender'].indexOf(key)>=0){
        //this.isShowIcon=false;
        this.payerForm.controls[key].disable();        
      } else {
        this.payerForm.controls[key].enable();
      }
    }
  }

  handleFocusOutDOB(event: any) {
    setTimeout(() => {
      const value = (event.target as HTMLInputElement).value;
      
      if(value !='' && !value.match(Regexs.DATE_FORMAT_DD_MM_YYYY)){
        this.payerForm.controls['dateOfBirth'].setErrors({ pattern: true });
        this.isPayerFormValid = false;
      }
    });
  }

  focus(event: any){
    const input = event.target as HTMLInputElement;
    setTimeout(() => {
      input.focus();
      if(input.value =='') {
        this.payerForm.controls['dateOfBirth'].setErrors(null);
      }
    }, 10);
  }

  bsValueChange(event: any, insuredDobDt: any) {
    setTimeout(() => {
      const date = insuredDobDt.dataset['date'];
      if (!date) {
        return;
      }
      if (!moment(event).isValid()) {
        insuredDobDt.value = date;
      } else {
        if (event != this.payerForm.get('dateOfBirth')?.value) {
          insuredDobDt.value = date;
        }
      }
      this.isPayerFormValid = this.payerForm.valid;
    });
  }

  onDpShown() {
    setTimeout(() => {
      const dp: any = document.getElementsByTagName('bs-datepicker-container')[0];
      dp?.scrollIntoViewIfNeeded(false);
    });
  }

  changeInsuredName() {
    const insuredName = this.payerForm.get('name')?.value;

    if (insuredName) {
      const formatedName = insuredName?.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace (/Đ/g, "D").replace (/đ/g, "d").replace(/\s+/g, ' ').trim();
      this.payerForm.get('name')?.setValue(formatedName.toUpperCase());
    }
  }
}
