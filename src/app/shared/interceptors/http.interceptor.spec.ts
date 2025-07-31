import { TestBed } from '@angular/core/testing';

import { HttpConfigInterceptor } from './http.interceptor';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { HttpErrorHandler } from '../services/http-error-handler.service';
import { MatDialog } from '@angular/material/dialog';

describe('HttpInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      HttpConfigInterceptor,HttpClient,HttpHandler,HttpErrorHandler,MatDialog]
  }));

  xit('should be created', () => {
    const interceptor: HttpConfigInterceptor = TestBed.inject(HttpConfigInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
