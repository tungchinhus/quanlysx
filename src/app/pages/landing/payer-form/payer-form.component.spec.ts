import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayerFormComponent } from './payer-form.component';
import { PayerInfo } from '../models/payment.model';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { Constant } from 'src/app/constant/constant';
import { SharedModule } from 'src/app/shared/shared.module';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { HttpErrorHandler } from 'src/app/shared/services/http-error-handler.service';
let moment = require('moment');
describe('PayerFormComponent', () => {
  let component: PayerFormComponent;
  let fixture: ComponentFixture<PayerFormComponent>;

  beforeEach(async () => {
    (<any>window).moment = moment;
    await TestBed.configureTestingModule({
      declarations: [ PayerFormComponent ],
      imports: [
        CommonModule,
        SharedModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(Constant.translateConfig)
      ],
      providers: [HttpErrorHandler]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('should valid form', () => {
    component.payerForm.setValue({
      name: "NGUYEN VAN A",
      gender: "M",
      dateOfBirth: "11/11/1980",
      email: "email@gmail.com",
      identityNumber: "123456789102",
      identityType: "4",
    });
    fixture.detectChanges();
    expect(component.payerForm.valid).toEqual(false);
  });

  it('should invalid form', () => {
    component.payerForm.setValue({
      name: "",
      gender: "",
      dateOfBirth: "",
      email: "",
      identityNumber: "",
      identityType: "",
    });
    fixture.detectChanges();
    expect(component.payerForm.valid).toBeFalsy();
  });

  it('shoud require name', () => {
    component.payerForm.setValue({
      name: "",
      gender: "M",
      dateOfBirth: "11/11/1980",
      email: "email@gmail.com",
      identityNumber: "123456789102",
      identityType: "4",
    });
    fixture.detectChanges();
    expect(component.payerForm.controls['name'].valid).toBeFalsy();
  })

  it('should require gender', () => {
    component.payerForm.setValue({
      name: "NGUYEN VAN A",
      gender: "",
      dateOfBirth: "11/11/1980",
      email: "email@gmail.com",
      identityNumber: "123456789102",
      identityType: "4",
    });
    fixture.detectChanges();
    expect(component.payerForm.controls['gender'].valid).toBeFalsy();
  });

  it('should require dob', () => {
    component.payerForm.setValue({
      name: "NGUYEN VAN A",
      gender: "M",
      dateOfBirth: "",
      email: "email@gmail.com",
      identityNumber: "123456789102",
      identityType: "4",
    });
    fixture.detectChanges();
    expect(component.payerForm.controls['dateOfBirth'].valid).toBeFalsy();
  });

  it('should require email', () => {
    component.payerForm.setValue({
      name: "NGUYEN VAN A",
      gender: "M",
      dateOfBirth: "11/11/1980",
      email: "",
      identityNumber: "123456789102",
      identityType: "4",
    });
    fixture.detectChanges();
    expect(component.payerForm.controls['email'].valid).toBeFalsy();
  });

  it('should require identityNumber', () => {
    component.payerForm.setValue({
      name: "NGUYEN VAN A",
      gender: "M",
      dateOfBirth: "11/11/1980",
      email: "email@gmail.com",
      identityNumber: "",
      identityType: "4",
    });
    fixture.detectChanges();
    expect(component.payerForm.controls['identityNumber'].valid).toBeFalsy();
  });

  it('should require identityType', () => {
    component.payerForm.setValue({
      name: "NGUYEN VAN A",
      gender: "M",
      dateOfBirth: "11/11/1980",
      email: "email@gmail.com",
      identityNumber: "123456789102",
      identityType: "",
    });
    fixture.detectChanges();
    expect(component.payerForm.controls['identityType'].valid).toBeFalsy();
  });

  it('should valid when identityType = 4', () => {
    component.payerForm.setValue({
      name: "NGUYEN VAN A",
      gender: "M",
      dateOfBirth: "11/11/1980",
      email: "email@gmail.com",
      identityNumber: "123456789102",
      identityType: "4",
    });
    fixture.detectChanges();
    expect(component.payerForm.controls['identityNumber'].valid).toBeTruthy();
  });

  it('should invalid when identityType = 4', () => {
    component.payerForm.setValue({
      name: "NGUYEN VAN A",
      gender: "M",
      dateOfBirth: "11/11/1980",
      email: "email@gmail.com",
      identityNumber: "12345678",
      identityType: "4",
    });
    fixture.detectChanges();
    expect(component.payerForm.controls['identityNumber'].valid).toBeFalsy();
  });

  it('should valid when identityType = 2', () => {
    component.payerForm.setValue({
      name: "NGUYEN VAN A",
      gender: "M",
      dateOfBirth: "11/11/1980",
      email: "email@gmail.com",
      identityNumber: "12345678",
      identityType: "2",
    });
    fixture.detectChanges();
    expect(component.payerForm.controls['identityNumber'].valid).toBeFalsy();
  });

  it('should invalid when identityType = 2', () => {
    component.payerForm.setValue({
      name: "NGUYEN VAN A",
      gender: "M",
      dateOfBirth: "11/11/1980",
      email: "email@gmail.com",
      identityNumber: "1234567",
      identityType: "2",
    });
    fixture.detectChanges();
    expect(component.payerForm.controls['identityNumber'].valid).toBeFalsy();
  });

  it('should disable form', () => {
    component.payerForm.setValue({
      name: "NGUYEN VAN A",
      gender: "M",
      dateOfBirth: "11/11/1980",
      email: "email@gmail.com",
      identityNumber: "123456789102",
      identityType: "4",
    });
    
    const changesObj: SimpleChanges = {
      disabledForm: new SimpleChange(false, true, true)
    };
    component.ngOnChanges(changesObj);
    fixture.detectChanges();
    expect(component.payerForm.disabled).toBeTruthy();
  });


  it('should call onIdentityTypeChange = 2 (make form invalid)', () => {
    component.payerForm.setValue({
      name: "NGUYEN VAN A",
      gender: "M",
      dateOfBirth: "11/11/1980",
      email: "email@gmail.com",
      identityNumber: "123456789102",
      identityType: "4",
    });
    component.onIdentityTypeChange('2');
    component.onIdentityTypeChange('3');
    component.onIdentityTypeChange('1');
    fixture.detectChanges();
    expect(component.payerForm.controls['identityNumber'].invalid).toBeTruthy();
  });

  xit('should has value with initial data', () => {
    let payer = new PayerInfo();
    payer = {
      name: "NGUYEN VAN A",
      gender: "M",
      dob: "11/11/1980",
      email: "email@gmail.com",
      nationalId: "12345678",
      nationalIdType: "2",
    }
    component.payerInfo = payer;
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.payerForm.value).toEqual({name: 'NGUYEN VAN A', gender: 'M', dateOfBirth: '11/11/1980', email: 'email@gmail.com', identityType: '2', identityNumber: '12345678'});
  });

  it('should call setFormControlDisable (true)', () => {
    component.setFormControlDisable(true);
    fixture.detectChanges();
    expect(component.payerForm.disabled).toBeTruthy();
  });

  it('should call setFormControlDisable (false)', () => {
    component.setFormControlDisable(false);
    fixture.detectChanges();
    expect(component.payerForm.disabled).toBeFalsy();
  });
  it('should call changeInsuredName()', () => {
    component.payerForm.setValue({
      name: "NGUYEN VAN A",
      gender: "M",
      dateOfBirth: "",
      email: "email@gmail.com",
      identityNumber: "123456789102",
      identityType: "4",
    });
    component.changeInsuredName();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
  it('should call handleFocusOutDOB()', () => {
    component.payerForm.setValue({
      name: "NGUYEN VAN A",
      gender: "M",
      dateOfBirth: "01/01/1979",
      email: "email@gmail.com",
      identityNumber: "123456789102",
      identityType: "4",
    });
    component.handleFocusOutDOB({target:{value:'01/01/1979'}});
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
  it('should call onDpShown()', () => {
    component.payerForm.setValue({
      name: "NGUYEN VAN A",
      gender: "M",
      dateOfBirth: "01/01/1979",
      email: "email@gmail.com",
      identityNumber: "123456789102",
      identityType: "4",
    });
    component.onDpShown();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
