import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentInfoComponent } from './payment-info.component';
import { LandingService } from '../landing.service';
import { Data, PayerInfo, PaymentMethod, PolicyInfo, PolicyInfoDisplay, searchQuery } from '../models/payment.model';
import { CommonService } from 'src/app/shared/services/common.service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { data } from 'jquery';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('PaymentInfoComponent', () => {
  let component: PaymentInfoComponent;
  let fixture: ComponentFixture<PaymentInfoComponent>;
  let landingService: LandingService;
  let commonService: CommonService;
  let dialog: MatDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentInfoComponent],
      providers: [
        LandingService,
        CommonService,
        MatDialog,HttpClient,HttpHandler
        // Add other dependencies here
      ],
    });

    fixture = TestBed.createComponent(PaymentInfoComponent);
    component = fixture.componentInstance;
    landingService = TestBed.inject(LandingService);
    commonService = TestBed.inject(CommonService);
    dialog = TestBed.inject(MatDialog);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize properties in ngOnInit', () => {
    const data: Data = {
      paymentTypeIndicator: '',
      policyInfo: new PolicyInfo,
      relationshipByPolicy: [],
      searchQuery: new searchQuery,
      payerInfo: new PayerInfo,
      paymentMethod: new PaymentMethod,
      addmore: '',
      redirectData: undefined,
      policyInfoDisplayList: [],
      policySearchNum: undefined,
      cwsPayor: undefined,
      isCWS: false,
      cwsPolicylst: undefined,
      cwspolicyDefault: undefined,
      cwsTypeIndicator: undefined,
      cwsUrl: undefined
    };
    component.data = data;

    fixture.detectChanges(); // Trigger ngOnInit

    expect(component.searchQuery).toEqual(data.searchQuery);
    expect(component.isCWS).toBe(LandingService.sysCWS);
    expect(component.policyInfo).toEqual(data.policyInfo);
    expect(component.isDisable).toBe(component.policyInfo.rows.length > 0);
    expect(component.policyInfoDisplayList).toEqual(data.policyInfoDisplayList);
  });

  it('should calculate total amount correctly', () => {
    const policyInfo = {
      rows: [
        { billAmount: 100 },
        { billAmount: 200 },
        { billAmount: 300 },
      ],
    };
    component.policyInfo = policyInfo;

    component.getTotalAmount();

    expect(component.totalAmount).toBe(600);
  });

  it('should handle policy removal', () => {
    const policyInfoDisplayList: PolicyInfoDisplay[] = [
      { billIds: ['1', '2'], policyNumber: 'Policy1' },
      { billIds: ['3', '4'], policyNumber: 'Policy2' },
    ];
    const policyInfo = {
      rows: [
        { billId: 1, billAmount: 100 },
        { billId: 2, billAmount: 200 },
        { billId: 3, billAmount: 300 },
        { billId: 4, billAmount: 400 },
      ],
    };
    component.policyInfoDisplayList = policyInfoDisplayList;
    component.policyInfo = policyInfo;

    component.handleRemovePolicy(policyInfoDisplayList[0]);

    expect(component.policyInfoDisplayList).toEqual([policyInfoDisplayList[1]]);
    expect(component.policyInfo.rows.length).toBe(2);
    expect(component.totalAmount).toBe(700);
  });

  it('should navigate to the next step when total amount is within limit', () => {
    const data: Data = {
      paymentTypeIndicator: '',
      policyInfo: new PolicyInfo,
      relationshipByPolicy: [],
      searchQuery: new searchQuery,
      payerInfo: new PayerInfo,
      paymentMethod: new PaymentMethod,
      addmore: '',
      redirectData: undefined,
      policyInfoDisplayList: [],
      policySearchNum: undefined,
      cwsPayor: undefined,
      isCWS: false,
      cwsPolicylst: undefined,
      cwspolicyDefault: undefined,
      cwsTypeIndicator: undefined,
      cwsUrl: undefined
    };
    component.data = data;

    component.totalAmount = 500; // Set total amount within the limit
    const navigateSpy = spyOn(landingService, 'pushEvent');

    component.next();

    expect(navigateSpy).toHaveBeenCalledWith({
      step: 'payer-info',
      data: {},
    });
  });

  it('should set isOverlimit to true when total amount exceeds the limit', () => {
    component.totalAmount = 1000; // Set total amount exceeding the limit

    component.next();

    expect(component.isOverlimit).toBe(true);
  });

  it('should handle policy removal confirmation', () => {
    const policyInfoDisplayList: PolicyInfoDisplay[] = [
      { billIds: ['1', '2'], policyNumber: 'Policy1' },
    ];
    component.policyInfoDisplayList = policyInfoDisplayList;

    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: jasmine.createSpy() });
    const dialogSpy = spyOn(dialog, 'open').and.returnValue(dialogRefSpyObj);
    dialogRefSpyObj.afterClosed.and.returnValue(of(true));

    component.policyRemove(0, policyInfoDisplayList[0]);

    expect(dialogSpy).toHaveBeenCalledOnceWith({
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
            data: true,
          },
          {
            title: 'button.no',
            color: 'primary',
            class: 'small',
            focusInitial: true,
            data: false,
          },
        ],
      },
    });

    expect(component.isOverlimit).toBe(true);
  });
});