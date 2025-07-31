import { TestBed } from '@angular/core/testing';

import { HttpClient, HttpHandler } from '@angular/common/http';
import { HttpErrorHandler } from '../services/http-error-handler.service';
import { LoadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';
import { MatDialog } from '@angular/material/dialog';

describe('LoadingInterceptor', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [LoadingInterceptor, HttpClient, HttpHandler, HttpErrorHandler, LoadingService,MatDialog]
    })
  );

  it('should be created', () => {
    const interceptor: LoadingInterceptor = TestBed.inject(LoadingInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
