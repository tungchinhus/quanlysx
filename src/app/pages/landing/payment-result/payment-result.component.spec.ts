import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentResultComponent } from './payment-result.component';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { PAYMENT_STATUS } from 'src/app/shared/enums/common.enum';
import { LandingService } from '../landing.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { Constant } from 'src/app/constant/constant';
import { MatDialog } from '@angular/material/dialog';

describe('PaymentResultComponent', () => {
  let component: PaymentResultComponent;
  let fixture: ComponentFixture<PaymentResultComponent>;
  let landingService: jasmine.SpyObj<LandingService>;
  let router: jasmine.SpyObj<Router>;
  let route: ActivatedRoute;
  let location: Location;
  let commonService: CommonService;
  let loadingService: LoadingService;

  beforeEach(() => {
    const landingServiceSpy = jasmine.createSpyObj('LandingService', ['getTranInfo']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);

    TestBed.configureTestingModule({
      declarations: [PaymentResultComponent],
      providers: [
        { provide: LandingService, useValue: landingServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },MatDialog // Cung cấp đối tượng giả lập của ActivatedRoute
      ],
    });

    fixture = TestBed.createComponent(PaymentResultComponent);
    component = fixture.componentInstance;
    landingService = TestBed.inject(LandingService) as jasmine.SpyObj<LandingService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    route = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>; // Sử dụng giả lập của ActivatedRoute
    location = TestBed.inject(Location);
    commonService = TestBed.inject(CommonService);
    loadingService = TestBed.inject(LoadingService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to landing when status is not provided', () => {
    spyOn(router, 'navigate');
    route.snapshot.queryParams = {};
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['landing'], {});
  });

  it('should call goSuccess when status is SUCCESS', () => {
    spyOn(router, 'navigate');
    route.snapshot.queryParams = { orderRef: '123', status: PAYMENT_STATUS.SUCCESS };
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/result-passed'], jasmine.any(Object));
  });

  it('should call goFailed when status is FAILED and maintenance mode is not on', () => {
    spyOn(router, 'navigate');
    LandingService.maitenanceMode = Constant.maintenance_Mode.off;
    route.snapshot.queryParams = { orderRef: '123', status: PAYMENT_STATUS.FAILED };
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/result-failed'], jasmine.any(Object));
  });

  it('should call getStatus when status is not SUCCESS or FAILED', () => {
    spyOn(component, 'getStatus');
    route.snapshot.queryParams = { orderRef: '123', status: 'PENDING' };
    component.ngOnInit();
    expect(component.getStatus).toHaveBeenCalled();
  });
});