import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { SessionStorageService } from '../services/session/session-storage.service';
import { TokenService } from '../services/token-service';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  constructor(private storage: SessionStorageService,tokenSrv: TokenService) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const started = Date.now();
    let ok: string;
    const token = this.storage.getToken();
    
    // Chỉ thêm Authorization header nếu token tồn tại và hợp lệ
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } else {
      // Nếu không có token, chỉ thêm Content-Type
      request = request.clone({
        setHeaders: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    console.log('HttpConfigInterceptor', request);
    return next.handle(request).pipe(
      tap({
        // Succeeds when there is a response; ignore other events
        next: (event) => (ok = event instanceof HttpResponse ? 'succeeded' : ''),
        // Operation failed; error is an HttpErrorResponse
        error: (error) => (ok = 'failed')
      }),
      // Log when response observable either completes or errors
      finalize(() => {
        const elapsed = Date.now() - started;
        const msg = `${request.method} "${request.urlWithParams}" ${ok} in ${elapsed} ms.`;
      })
    );
  }
}
