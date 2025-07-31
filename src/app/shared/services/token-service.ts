import { BehaviorSubject, Observable, of } from 'rxjs';
import {Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { catchError, map, share, switchMap } from 'rxjs/operators';
import { Environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment';
import { HttpErrorHandler } from './http-error-handler.service';
import jwt_decode from "jwt-decode";
import { CommonService } from './common.service';
import { Constant } from 'src/app/constant/constant';
import { NavigationExtras, Router } from '@angular/router';
import { LandingService } from 'src/app/pages/landing/landing.service';

const options = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  }),
  observe: 'response' as const,
  params: {},
  reportProgress: false as const,
  responseType: 'json' as const,
  withCredentials: false as const
};

@Injectable()
export class TokenService implements HttpInterceptor {

  //private handleError: HandleError;
  private currentTokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private environment: Environment = new Environment(environment);

  constructor(private http: HttpClient,
              httpErrorHandler: HttpErrorHandler,
              private commonService: CommonService,
              private router: Router) {
    //this.handleError = httpErrorHandler.createHandleError('TokenService');
  }

  requestToken(): Observable<any> {
    this.currentTokenSubject.next('');
    return this.http.post<any>(this.environment.TOKEN_REQUEST_URL, null, options)
      .pipe(share(),
        map(res => {
          const token = res.body.data.access_token;
          console.log('token 1', token);
          localStorage.setItem('idToken', token);
          return token;
        }));
  }

  getToken(): Observable<any> {
    const idToken = localStorage.getItem('idToken');
    if (idToken && !this.isTimeout(idToken)) {
      return of(idToken);
    } else {
      return this.requestToken();
    }
  }
  requestAccessToken(): Observable<any> {
    this.currentTokenSubject.next('');
    const idToken = localStorage.getItem('idToken');
    const opts = {
      headers: new HttpHeaders({
        'Accept': '*/*',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }),
      observe: 'response' as const,
      params: {},
      reportProgress: false as const,
      responseType: 'json' as const,
      withCredentials: false as const
    };
    return this.http.post<any>(this.environment.ACCESS_TOKEN_REQUEST_URL, null, opts)
      .pipe(share(),
        map(res => {
          if (res.status === 200) {// && res.body.returnCode === 0) {
            localStorage.setItem('accessToken', res.body.accessToken);
            this.currentTokenSubject.next(res.body);
            return res.body.accessToken;
          }
        }));
  }
  getAccessToken(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && !this.isTimeout(accessToken)) {
      return of(accessToken);
    } else {
      return this.getToken().pipe(
        switchMap((newToken: string) => {
          return this.requestAccessToken();
        })
      );
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url === this.environment.TOKEN_REQUEST_URL ||
      req.url === this.environment.ACCESS_TOKEN_REQUEST_URL ||
      req.url.indexOf('asserts/mli-icons') >= 0) {
        //this.requestToken();
        return next.handle(req.clone());
      }
      if (req.url.indexOf('assets') < 0) {
        return this.getAccessToken().pipe(
          switchMap((newToken: string) => {
          return next.handle(this.addAuthenticationToken(req));
      }),
        catchError(error => {
          if (error.status === 401) {
            return this.currentTokenSubject.pipe(
              switchMap((newToken: string) => {
                return next.handle(this.addAuthenticationToken(req));
              })
            );
          } else if (error.status === 400) {
            if(error.error.httpCode == "400 BAD_REQUEST" && error.error.message == 'SessionId is expired.'){
              this.commonService.showSessionTimeoutPopup('landing')
            }
          } else if(error.status === 500) {
            if (error.error instanceof Blob && error.error.type === "application/json") {
              this.parseError(error.error);
            } else {
              this.showMaintenance(error.error)
            }
          }
          return next.handle(this.addAuthenticationToken(req));
        }));
    }
    return next.handle(req.clone());

  }

  showMaintenance(error: any) {
    if (error.message == Constant.maintenance_Mode.message){
      const navigationExtras: NavigationExtras = {
        state: {
          "mode": error.mode,
          "endTime": error.endTime
        }
      };
      this.router.navigate(['/maintenance'], navigationExtras);
    } else {
      this.commonService.showWarningDiaLog('policy-info.http-warning');
    }
  }

  parseError(error: any) {
    let reader = new FileReader();
    reader.onload = (e) => {
      try {
        const errmsg = JSON.parse((e.target as any).result);
        this.showMaintenance(errmsg);
      } catch (e) {
        this.commonService.showWarningDiaLog('policy-info.http-warning');
      }
    };
    reader.onerror = (e) => {
      this.commonService.showWarningDiaLog('policy-info.http-warning');
    };
    reader.readAsText(error);
  }
  

  private isTimeout(token: string): boolean {
    const decodedToken: any = jwt_decode(token);
    if (Date.now() < decodedToken.exp * 1000) {
      return false;
    } else {
      return true;
    }
  }

  private addAuthenticationToken(request: HttpRequest<any>): HttpRequest<any> {
    const accessToken = localStorage.getItem('accessToken');
    console.log('token 2', accessToken);
    let copiedRequest = request.clone({setHeaders : { Authorization: `Bearer ${accessToken}` }});
    let header = new HttpHeaders({ "Authorization": `Bearer ${accessToken}`});
    header.set('Content-Type', 'application/json;');
    if(LandingService.sysCWS){ // cws check session timeout
      copiedRequest = request.clone({setHeaders : { Authorization: `Bearer ${accessToken}`,ssId: `${LandingService.ssId}`}});
      header = new HttpHeaders({ "Authorization": `Bearer ${accessToken}`,ssId: `${LandingService.ssId}`});
    }
    CommonService.header = header;
    return copiedRequest;
  }
}
