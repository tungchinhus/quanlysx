import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

// Material Modules
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';

// Components
import { DSQuanDayComponent } from './ds-quan-day.component';

// Services
import { DSQuanDayService } from './ds-quan-day.service';
import { AuthServices } from '../../shared/services/authen/auth.service';

// Mocks
import { of } from 'rxjs';

describe('DSQuanDayComponent', () => {
  let component: DSQuanDayComponent;
  let fixture: ComponentFixture<DSQuanDayComponent>;
  let mockDSQuanDayService: jasmine.SpyObj<DSQuanDayService>;
  let mockAuthService: jasmine.SpyObj<AuthServices>;

  beforeEach(async () => {
    const dsQuanDayServiceSpy = jasmine.createSpyObj('DSQuanDayService', [
      'getNewWindings',
      'getCompletedWindings',
      'getBangVeDetails',
      'updateWindingStatus',
      'getWindingDetails'
    ]);

    const authServiceSpy = jasmine.createSpyObj('AuthServices', [
      'isLoggedIn',
      'getUserInfoFromStorage'
    ]);

    await TestBed.configureTestingModule({
      declarations: [DSQuanDayComponent],
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        
        // Material Modules
        MatTabsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDialogModule,
        MatChipsModule,
        MatTooltipModule,
        MatCardModule
      ],
      providers: [
        { provide: DSQuanDayService, useValue: dsQuanDayServiceSpy },
        { provide: AuthServices, useValue: authServiceSpy }
      ]
    }).compileComponents();

    mockDSQuanDayService = TestBed.inject(DSQuanDayService) as jasmine.SpyObj<DSQuanDayService>;
    mockAuthService = TestBed.inject(AuthServices) as jasmine.SpyObj<AuthServices>;
  });

  beforeEach(() => {
    // Setup default mock returns
    mockAuthService.isLoggedIn.and.returnValue(false);
    mockAuthService.getUserInfoFromStorage.and.returnValue({});

    fixture = TestBed.createComponent(DSQuanDayComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show authentication warning when not logged in', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    component.checkAuthentication();
    
    expect(component.isAuthenticated).toBeFalse();
  });

  it('should load data when authenticated', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.getUserInfoFromStorage.and.returnValue({
      userId: '123',
      role: 'user',
      khau_sx: 'boidayha'
    });

    mockDSQuanDayService.getNewWindings.and.returnValue(of([]));
    mockDSQuanDayService.getCompletedWindings.and.returnValue(of([]));

    component.checkAuthentication();
    component.loadData();

    expect(component.isAuthenticated).toBeTrue();
    expect(mockDSQuanDayService.getNewWindings).toHaveBeenCalledWith('123', 'ha');
    expect(mockDSQuanDayService.getCompletedWindings).toHaveBeenCalledWith('123', 'ha');
  });

  it('should get correct winding type display name for boidayha', () => {
    component.currentUserKhauSx = 'boidayha';
    expect(component.getWindingTypeDisplayName()).toBe('Quấn dây hạ');
  });

  it('should get correct winding type display name for boidaycao', () => {
    component.currentUserKhauSx = 'boidaycao';
    expect(component.getWindingTypeDisplayName()).toBe('Quấn dây cao');
  });

  it('should check user role correctly', () => {
    component.currentUserRole = 'user';
    expect(component.hasUserRole()).toBeTrue();

    component.currentUserRole = 'admin';
    expect(component.hasUserRole()).toBeTrue();

    component.currentUserRole = 'guest';
    expect(component.hasUserRole()).toBeFalse();
  });

  it('should apply filter to data sources', () => {
    const mockEvent = { target: { value: 'test' } } as any;
    
    // Setup data sources with some data
    component.newWindingsDataSource.data = [{ id: 1, kyhieubangve: 'test' }];
    component.completedWindingsDataSource.data = [{ id: 2, kyhieubangve: 'test' }];

    component.applyFilter(mockEvent);

    expect(component.newWindingsDataSource.filter).toBe('test');
    expect(component.completedWindingsDataSource.filter).toBe('test');
  });

  it('should handle tab change', () => {
    const mockEvent = { index: 1 };
    component.onTabChange(mockEvent);
    expect(component.selectedTabIndex).toBe(1);
  });
});
