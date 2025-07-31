import { TestBed } from '@angular/core/testing';

import { PayerInfoService } from './payer-info.service';
import { LandingService } from '../landing.service';
import { CommonModule } from '@angular/common';
import { MatDialogModule} from '@angular/material/dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { HttpErrorHandler } from 'src/app/shared/services/http-error-handler.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Data } from '../models/payment.model';
import { RsfConfigFactory } from '@rsf/rsf-angular-base';

describe('PayerInfoService', () => {
  let service: PayerInfoService;

  beforeEach(() => {
    const configRecord: Record<string, any> = {
      environment: {
        envName: 'dev',
        production: true,
        apiUrl: ''
      }
    };
    RsfConfigFactory.init(configRecord);
    TestBed.configureTestingModule({
      imports: [CommonModule, OverlayModule, MatDialogModule, HttpClientModule, BrowserAnimationsModule],
      providers: [LandingService, HttpErrorHandler],
    });
    service = TestBed.inject(PayerInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be return totalAmount', () => {
    const policyInfo = {
      rows: [
        {
          policyNumber: '123456789',
          billAmount: 1000000000,
        }
      ]
    }
    const actual = service.getTotalAmount(policyInfo);
    expect(actual).toBe(1000000000);
  });

  it('should return policyInfo', () => {
    let data = new Data()
    data.policyInfo = {}
    const actual = service.getPolicyInfo(data);
    expect(actual).toBeTruthy();
  });
  it('should not return policyInfo', () => {
    const data = new Data();
    const actual = service.getPolicyInfo(data);
    expect(actual).not.toBeTruthy();
  });
});
