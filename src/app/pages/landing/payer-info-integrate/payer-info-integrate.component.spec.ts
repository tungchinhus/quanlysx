import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TranslateModule, TranslateService, TranslateStore,
} from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { PayerInfoIntegrateComponent } from './payer-info-integrate.component';
import { Constant } from 'src/app/constant/constant';
import { CommonModule } from '@angular/common';
import { HttpErrorHandler } from 'src/app/shared/services/http-error-handler.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PayerFormComponent } from '../payer-form/payer-form.component';
import { RelationshipInfoComponent } from '../relationship-info/relationship-info.component';
import { LandingService } from '../landing.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { PayerInfo, RelationshipByPolicy } from '../models/payment.model';
import { RsfConfigFactory } from '@rsf/rsf-angular-base';
let lodash = require('lodash');
describe('PayerInfoIntegrateComponent', () => {
  let component: PayerInfoIntegrateComponent;
  let fixture: ComponentFixture<PayerInfoIntegrateComponent>;

  beforeEach(async () => {
    (<any>window)._ = lodash;
    const configRecord: Record<string, any> = {
      environment: {
        envName: 'dev',
        production: true,
        apiUrl: ''
      }
    };
    RsfConfigFactory.init(configRecord);
    await TestBed.configureTestingModule({
      declarations: [PayerInfoIntegrateComponent, PayerFormComponent, RelationshipInfoComponent],
      imports: [
        CommonModule,
        SharedModule,
        BrowserAnimationsModule,
        TranslateModule.forChild(Constant.translateConfig)
      ],
      providers: [HttpErrorHandler, TranslateStore, TranslateService, LandingService, CommonService]
    }).compileComponents();

    fixture = TestBed.createComponent(PayerInfoIntegrateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('should call onPaymentMethodChange() to onShowConfirm()', () => {
    const event = { value: 'momo' };
    spyOn(component, 'onShowConfirm').and.callThrough();
    component.totalAmount = Constant.FIFTY_MILLION + 1;
    component.onPaymentMethodChange(event);
    expect(component.paymentMethod).toEqual('momo');
    expect(component).toBeTruthy();
  });

  xit('should not call when is under limit (momo)', () => {
    const event = { value: 'momo' };
    spyOn(component, 'onShowConfirm').and.callThrough();
    component.totalAmount = Constant.FIFTY_MILLION;
    component.onPaymentMethodChange(event);
    expect(component.paymentMethod).toEqual('momo');
    expect(component.onShowConfirm).not.toHaveBeenCalled();
  });

  xit('should call onShowConfirm() when totalAmount is over limit (momo)', () => {
    const event = { value: 'momo' };
    spyOn(component, 'onShowConfirm').and.callThrough();
    component.totalAmount = Constant.FIFTY_MILLION + 1;
    component.onPaymentMethodChange(event);
    expect(component.paymentMethod).toEqual('momo');
    expect(component).toBeTruthy();
  });

  xit('should not call when is under limit (vnpay)', () => {
    const event = { value: 'vnpay' };
    spyOn(component, 'onShowConfirm').and.callThrough();
    component.totalAmount = Constant.HAFT_BILLION;
    component.onPaymentMethodChange(event);
    expect(component.onShowConfirm).not.toHaveBeenCalled();
  });

  xit('should call when totalAmount is over limit (momo)', () => {
    const event = { value: 'momo' };
    spyOn(component, 'onShowConfirm').and.callThrough();
    component.totalAmount = Constant.HAFT_BILLION + 1;
    component.onPaymentMethodChange(event);
    expect(component).toBeTruthy();
  });

  xit('should not call when is under limit (cybersource)', () => {
    const event = { value: 'cybersource' };
    spyOn(component, 'onShowConfirm').and.callThrough();
    component.totalAmount = Constant.HAFT_BILLION;
    component.onPaymentMethodChange(event);
    expect(component.onShowConfirm).not.toHaveBeenCalled();
  });

  xit('should call when totalAmount is over limit (cybersource)', () => {
    const event = { value: 'cybersource' };
    spyOn(component, 'onShowConfirm').and.callThrough();
    component.totalAmount = Constant.HAFT_BILLION + 1;
    component.onPaymentMethodChange(event);
    expect(component).toBeTruthy();
  });

  xit('should enable the next button', () => {
    component.editMode = false;
    component.paymentMethod = 'momo';
    component.checkBoxConfirm = true;
    fixture.detectChanges();
    expect(component.isDispayNextButton).toBeTrue();
  });

  xit('should disable the next button (editeMod = true)', () => {
    component.editMode = true;
    component.paymentMethod = 'momo';
    component.checkBoxConfirm = true;
    expect(component.isDispayNextButton).toBeFalse();
  });

  xit('should disable the next button (paymentMethod empty)', () => {
    component.editMode = false;
    component.paymentMethod = '';
    component.checkBoxConfirm = true;
    expect(component.isDispayNextButton).toBeFalse();
  });

  xit('should call savePayerInfo()', () => {
    spyOn(component, 'savePayerInfo').and.callThrough();
    component.savePayerInfo();
    expect(component.savePayerInfo).toHaveBeenCalled();
  });

  
  xit('should call editPayer()', () => {
    spyOn(component, 'editPayer').and.callThrough();
    component.editPayer();
    expect(component.editPayer).toHaveBeenCalled();
  });

  xit('should call onPayerInfoChange()', () => {
    spyOn(component, 'onPayerInfoChange').and.callThrough();
    component.onPayerInfoChange(new PayerInfo());
    expect(component.onPayerInfoChange).toHaveBeenCalled();
  });

  xit('should call onFormValid()', () => {
    spyOn(component, 'onFormValid').and.callThrough();
    component.onFormValid(true);
    expect(component.onFormValid).toHaveBeenCalled();
  });

  xit('should call onCheckBoxConfirm()', () => {
    spyOn(component, 'onCheckBoxConfirm').and.callThrough();
    component.onCheckBoxConfirm(true);
    expect(component.onCheckBoxConfirm).toHaveBeenCalled();
  });

  xit('should return relationship list by code', () => {
    const relation = new RelationshipByPolicy("01", "policy-owner", "O", "01", true)
    const list = [relation];
    const actual = component.getRelationListString(list);
    fixture.detectChanges();
    expect(actual).toEqual(['O']);
  });
  xit('should isMobileDevice', () => {
    // component.isMobileDevice();
    // expect(spyOn(component, 'isMobileDevice')).toEqual(true)
    const actual = component.isMobileDevice();
    fixture.detectChanges();
    expect(actual).toEqual(false);
  });
});
