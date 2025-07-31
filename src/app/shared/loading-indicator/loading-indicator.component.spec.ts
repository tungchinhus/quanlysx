import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingIndicatorComponent } from './loading-indicator.component';
import { LoadingService } from '../services/loading.service';
import { RsfConfigFactory } from '@rsf/rsf-angular-base';
import { By } from '@angular/platform-browser';

describe('LoadingIndicatorComponent', () => {
  let component: LoadingIndicatorComponent;
  let fixture: ComponentFixture<LoadingIndicatorComponent>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;

  beforeEach(() => {
    mockLoadingService = jasmine.createSpyObj('LoadingService', ['getLoadingState', 'setLoadingState'])
  })
  const configRecord: Record<string, any> = {
    environment: {
      envName: 'dev',
      production: true,
      apiUrl: ''
    }
  };
  RsfConfigFactory.init(configRecord);
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadingIndicatorComponent],
      providers: [{
        provide: LoadingService, useValue: mockLoadingService
      }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display with loading = true', () => {
    mockLoadingService.getLoadingState.and.returnValue(true);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.loading-indicator'))).toBeTruthy();
  });

  // it('should display with loading = false', () => {
  //   mockLoadingService.getLoadingState.and.returnValue(false);
  //   expect(component).toBeFalsy();
  // });

});
