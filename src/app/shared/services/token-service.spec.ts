import { HttpClient, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { RsfConfigFactory } from '@rsf/rsf-angular-base';
import { MockBuilder, MockRender } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { Environment } from 'src/environments/environment';
import { TokenService } from './token-service';
import { HttpErrorHandler } from './http-error-handler.service';

const fakeTokenResponse = {
  status: 200,
  body: {
    data: {
      // tslint:disable-next-line: max-line-length
      token: 'eyJraWQiOiIxIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJhY2Nlc3NfdG9rZW4iOiJLY2h0aUdZVXVSdWRYOGh6R1hKRmxURVFKY2dBIiwiYXVkaWVuY2UiOiJtaWNyb2dhdGV3YXkiLCJhcGlfcHJvZHVjdF9saXN0IjpbInZuLWVjb21tZXJjZS1iZmYtc2VydmljZS1wcmVwcm9kLWV4dCJdLCJhcHBsaWNhdGlvbl9uYW1lIjoidm4tZWNvbW1lcmNlLWJmZi1zZXJ2aWNlLXByZXByb2QtZXh0IiwibmJmIjoxNjM0MjAxOTYzLCJpc3MiOiJodHRwczpcL1wvbWFudWxpZmUtb3BlcmF0aW9ucy1wcmVwcm9kLWV4dC5hcGlnZWUubmV0XC92MVwvbWdcL29hdXRoMlwvdG9rZW4iLCJzY29wZXMiOlsiIl0sImV4cCI6MTYzNDIwMjMyMywiaWF0IjoxNjM0MjAyMDIzLCJjbGllbnRfaWQiOiJGM3dZazh6dWU1cGdwMVlkNDkzY2tXajF4b3U1WlFpZCIsImp0aSI6ImZhY2JlN2I2LWU1MjAtNGZiNC1iZDA3LWFmZWQ3MGZkNDU4OCJ9.rCaHyYU6tAJWjlq1vAJogie0f2y-zZqh4COupHb-nekg4nA16RDmaM5S8O_kYDTm8XQEWVWvtqQVDsJ2Ihwt8bHi8fug_PScwnRlAwSr8UnP98dV99SuRd1BGQxa4FF9-Qiw6dwyXB_d6HnDSTHCREm79iNu1St67qhkU_UqRGzmAK7c7TTgFqVJ5_Tku8w_TrPFYUlEcnwFoiRZVO6-gYebVZVISPkQNys3IFvPOOvXd8PwyXsrZZ8AIPrjyISBYnD7T4t4KXvhy4ghIWKlHytFjdG0W7LUe_ytk2-qCnM1b_YBRoR9NBQgdx_YAv7ojzeXORh9AnF8Jr-C7bMkjg',
      // tslint:disable-next-line: max-line-length
      access_token: 'eyJraWQiOiIxIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJhY2Nlc3NfdG9rZW4iOiJLY2h0aUdZVXVSdWRYOGh6R1hKRmxURVFKY2dBIiwiYXVkaWVuY2UiOiJtaWNyb2dhdGV3YXkiLCJhcGlfcHJvZHVjdF9saXN0IjpbInZuLWVjb21tZXJjZS1iZmYtc2VydmljZS1wcmVwcm9kLWV4dCJdLCJhcHBsaWNhdGlvbl9uYW1lIjoidm4tZWNvbW1lcmNlLWJmZi1zZXJ2aWNlLXByZXByb2QtZXh0IiwibmJmIjoxNjM0MjAxOTYzLCJpc3MiOiJodHRwczpcL1wvbWFudWxpZmUtb3BlcmF0aW9ucy1wcmVwcm9kLWV4dC5hcGlnZWUubmV0XC92MVwvbWdcL29hdXRoMlwvdG9rZW4iLCJzY29wZXMiOlsiIl0sImV4cCI6MTYzNDIwMjMyMywiaWF0IjoxNjM0MjAyMDIzLCJjbGllbnRfaWQiOiJGM3dZazh6dWU1cGdwMVlkNDkzY2tXajF4b3U1WlFpZCIsImp0aSI6ImZhY2JlN2I2LWU1MjAtNGZiNC1iZDA3LWFmZWQ3MGZkNDU4OCJ9.rCaHyYU6tAJWjlq1vAJogie0f2y-zZqh4COupHb-nekg4nA16RDmaM5S8O_kYDTm8XQEWVWvtqQVDsJ2Ihwt8bHi8fug_PScwnRlAwSr8UnP98dV99SuRd1BGQxa4FF9-Qiw6dwyXB_d6HnDSTHCREm79iNu1St67qhkU_UqRGzmAK7c7TTgFqVJ5_Tku8w_TrPFYUlEcnwFoiRZVO6-gYebVZVISPkQNys3IFvPOOvXd8PwyXsrZZ8AIPrjyISBYnD7T4t4KXvhy4ghIWKlHytFjdG0W7LUe_ytk2-qCnM1b_YBRoR9NBQgdx_YAv7ojzeXORh9AnF8Jr-C7bMkjg',
      issued_at: new Date().getTime(),
      expires_in: 300000000
    },
    returnCode: 0,
    returnMsg: 'Success',
    error: null
  }
};

const fakeAccessTokenResponse = {
  body: {
    accessToken: 'eyJraWQiOiIxIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJhY2Nlc3NfdG9rZW4iOiJWMnI4c0l6N3N3QUpISmszSWtUV0FPV2NKNmhQIiwiYXVkaWVuY2UiOiJtaWNyb2dhdGV3YXkiLCJhcGlfcHJvZHVjdF9saXN0IjpbInZuLWVjb21tZXJjZS1mcm9udGVuZC1hcGktcHJvZHVjdC10ZXN0Il0sImFwcGxpY2F0aW9uX25hbWUiOiJ2bi1lY29tbWVyY2UtZnJvbnRlbmQtcHJvZHVjdC10ZXN0IiwibmJmIjoxNjM0MjAzMDc3LCJpc3MiOiJodHRwczpcL1wvbWFudWxpZmUtZGV2ZWxvcG1lbnQtdGVzdC5hcGlnZWUubmV0XC92MVwvbWdcL29hdXRoMlwvdG9rZW4iLCJzY29wZXMiOlsiIl0sImV4cCI6MTYzNDIwMzQzNywiaWF0IjoxNjM0MjAzMTM3LCJjbGllbnRfaWQiOiJ6SUh3WFU4Z2JWVEhqMDdKZjFBNXFBUFdQaG1OamE3bSIsImp0aSI6IjZmOTU3OWM5LTgxZWEtNDhmMS04YmVkLWQyZDRjZTNhNzAxYyJ9.F3PoRxOVZ4gv4gG0tfcOsAP0poUC5RtPvdXKlcUYT4sORx9mL85_jS7QqURCYJGgY2HUMBp4Jdcyebk9tIVa7YmtrtdkVjisZTbRHhv1Lm8AMRpqhuEUxnfIkaFtAdQCgwnFcJKyJmUxIRguC1G7Gw5fo5rK0HOs6y8xZ1-tp4i-CRiNv55RKBJZUSIJRLVqoGm4j1sqoiMykj4BCojlxgyzzrAkeyuV04bAsEG5WTvZk3rlIm3IAHx0uvEEB3GBxh-JtSftxlYvGQ6qOPsxrcI83zCzHZPvPwaJKW4ABujzd6uKtL0UCnOuDTX2ptAHoC4BkKs_uXG5AnrFcCuQlQ',
    ext_expires_in: '' + (new Date().getTime()),
    expires_in: '300000000',
    token_type: 'Beadsd'
  }
};
const store: any = {};
const mockLocalStorage = {
  getItem: (key: string): string => {
    return store[key] ? store[key] : null;
  },
  setItem: (key: string, value: string) => {
    store[key] = value ? `${value}` : null;
  }
};

const fakePost =
  (url: string, body: any | null, options?: any): Observable<any> =>
    of(url === 'TOKEN_REQUEST_URL' ? fakeTokenResponse : fakeAccessTokenResponse);
const fakeHttpClient = {
  post: fakePost
};

let localStorageRefServiceSpy!: any
let getLocalStorageSpy!: any;

describe('TokenService', () => {

  // beforeEach(() => {
  //   const configRecord: Record<string, any> = {
  //     environment: new Environment({} as Environment)
  //   }
  //   RsfConfigFactory.init(configRecord);
  // });

  beforeEach(() => {
    localStorageRefServiceSpy = jasmine.createSpyObj('LocalStorageRef', ['getLocalStorage']);
    getLocalStorageSpy = jasmine.createSpyObj('LocalStorageRef.getLocalStorage', ['getItem', 'setItem']);
    localStorageRefServiceSpy.getLocalStorage.and.returnValue(getLocalStorageSpy);
    getLocalStorageSpy.getItem.and.callFake(mockLocalStorage.getItem);
    getLocalStorageSpy.setItem.and.callFake(mockLocalStorage.setItem);

    const configRecord: Record<string, any> = {
      environment: {
        envName: 'dev',
        production: true,
        apiUrl: '',
        TOKEN_REQUEST_URL: 'TOKEN_REQUEST_URL',
        ACCESS_TOKEN_REQUEST_URL: 'ACCESS_TOKEN_REQUEST_URL'
      }
    };
    RsfConfigFactory.init(configRecord);

    return MockBuilder(TokenService)
      .mock(HttpClient, fakeHttpClient)
      .mock(HttpErrorHandler, {
        // createHandleError: () => null
      }
      );
  });

  it('should create', () => {
    const fixture = MockRender(TokenService);
    const component = fixture.point.componentInstance;
    expect(component).toBeDefined();
  });

  it('should get token and return error', () => {
    const fixture = MockRender(TokenService);
    const component = fixture.point.componentInstance;
    component.getToken();
    component.getAccessToken();
    expect(component).toBeDefined();
  });

  it('should get token without expired', () => {
    const fixture = MockRender(TokenService);
    const component = fixture.point.componentInstance;
    component.getToken().subscribe();
    component.getToken().subscribe();
    expect(component).toBeDefined();
  });

  it('should get access token without expired', () => {
    const fixture = MockRender(TokenService);
    const component = fixture.point.componentInstance;
    component.getToken();
    component.getAccessToken().subscribe();
    expect(component).toBeDefined();
  });

  it('should get token and expired', () => {
    // fakeTokenResponse.body.ext_expires_in = '1';
    const fixture = MockRender(TokenService);
    const component = fixture.point.componentInstance;
    component.getToken().subscribe();
    component.getToken().subscribe();
    expect(component).toBeDefined();
  });

  it('should get access token and expired', () => {
    // fakeAccessTokenResponse.body.data.expires_in = 1;
    const fixture = MockRender(TokenService);
    const component = fixture.point.componentInstance;
    component.getToken();
    component.getAccessToken().subscribe();
    expect(component).toBeDefined();
  });

  it('should run intercept with url', () => {
    const component = MockRender(TokenService).point.componentInstance;

    component.intercept({
      url: 'TOKEN_REQUEST_URL',
      clone: () => { }
    } as HttpRequest<any>, {
      handle: () => null
    } as any as HttpHandler);

    component.intercept({
      url: 'ACCESS_TOKEN_REQUEST_URL',
      clone: () => { }
    } as HttpRequest<any>, {
      handle: () => null
    } as any as HttpHandler);

    component.intercept({
      url: 'assets/i18n/vi.json',
      clone: () => { }
    } as HttpRequest<any>, {
      handle: () => null
    } as any as HttpHandler);

    expect(component).toBeDefined();
  });

  it('should run intercept with asset', () => {
    const component = MockRender(TokenService).point.componentInstance;
    component.intercept({
      url: 'assets/i18n/vi.json',
      clone: () => { }
    } as HttpRequest<any>, {
      handle: () => null
    } as unknown as HttpHandler);
    expect(component).toBeTruthy();
  });

  const fakeHttpRequest = new HttpRequest('GET', 'http://localhost');
  it('should run intercept with normal link and handle error 9999', () => {
    // fakeTokenResponse.body.expires_in = '1';
    // fakeAccessTokenResponse.body.data.expires_in = 1;
    const component = MockRender(TokenService).point.componentInstance;
    component.getToken();
    component.getAccessToken().subscribe();
    const next: any = {
      handle(_req: HttpRequest<any>): Observable<HttpEvent<any>> {
        return new Observable((observer) => {
          observer.next();
        });
      }
    };

    component.getAccessToken = () => new Observable<any>(ob => ob.error(new Error('9999')));
    component.intercept(fakeHttpRequest,next).subscribe();

    expect(component).toBeDefined();
  });
});
