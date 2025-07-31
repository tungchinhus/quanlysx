import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore
} from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';

import { PayerInfoComponent } from './payer-info.component';
import { HttpErrorHandler } from 'src/app/shared/services/http-error-handler.service';
import { RelationshipInfoComponent } from '../relationship-info/relationship-info.component';
import { PayerFormComponent } from '../payer-form/payer-form.component';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Data, PayerInfo, PolicyInfo } from '../models/payment.model';
import { RsfConfigFactory } from '@rsf/rsf-angular-base';

describe('PayerInfoComponent', () => {
  let component: PayerInfoComponent;
  let fixture: ComponentFixture<PayerInfoComponent>;
  let data = new Data();
  data.policyInfo = new PolicyInfo();
  data.cwsPayor = {};

  beforeEach(() => {
    const configRecord: Record<string, any> = {
      environment: {
        envName: 'dev',
        production: true,
        apiUrl: ''
      }
    };
    RsfConfigFactory.init(configRecord);
  });
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayerInfoComponent, PayerFormComponent, RelationshipInfoComponent],
      providers: [
        TranslateService, 
        TranslateStore,
        TranslateLoader,
        HttpClient,
        HttpHandler,
        HttpErrorHandler,
        MatDialog
      ],
      imports: [HttpClientModule, SharedModule, BrowserAnimationsModule, TranslateModule.forChild()]
    }).compileComponents();
    data['cwsPayor'] = {};
    fixture = TestBed.createComponent(PayerInfoComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  });

  it('should create', () => {
    data['cwsPayor'] = {};
    const fixture = TestBed.createComponent(PayerInfoComponent);
    const component = fixture.componentInstance;
    component.data = data;
    expect(component).toBeTruthy()
  });

  it('should call next()', () => {
    data['cwsPayor'] = {};
    const fixture = TestBed.createComponent(PayerInfoComponent);
    const component = fixture.componentInstance;
    component.data = data;
    spyOn(component, 'next').and.callThrough();
    component.next();
    expect(component.next).toHaveBeenCalled();
  });

  it('should call cancelTransaction()', () => {
    const fixture = TestBed.createComponent(PayerInfoComponent);
    const component = fixture.componentInstance;
    spyOn(component, 'cancelTransaction').and.callThrough();
    component.cancelTransaction();
    expect(component.cancelTransaction).toHaveBeenCalled();
  });

  it('should call onPayerInfoChange()', () => {
    const fixture = TestBed.createComponent(PayerInfoComponent);
    const component = fixture.componentInstance;
    spyOn(component, 'onPayerInfoChange').and.callThrough();
    component.onPayerInfoChange(new PayerInfo());
    expect(component.onPayerInfoChange).toHaveBeenCalled();
  });

  it('should call onPayerFormValid()', () => {
    const fixture = TestBed.createComponent(PayerInfoComponent);
    const component = fixture.componentInstance;
    spyOn(component, 'onPayerFormValid').and.callThrough();
    component.data = data;
    component.onPayerFormValid(true);
    expect(component.onPayerFormValid).toHaveBeenCalled();
  });
});
