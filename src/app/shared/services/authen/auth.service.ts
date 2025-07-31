import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageKey } from '../../enums/storage-key.enum';
import { CacheService } from '../cache/cache.service';
import { SessionStorageService } from '../session/session-storage.service';
import { StateService } from '../state.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const SERVER_URL = '';
@Injectable({
  providedIn: 'root'
})
export class AuthServices {
  constructor(
    private stateService: StateService,
    private session: SessionStorageService,
    private http: HttpClient,
    private tokenStorage: SessionStorageService,
    private cache: CacheService
  ) {}

  // login(bodyData: any): Observable<any> {
  //   return this.http.post(SERVER_URL + APIs.AUTH_LOGIN, bodyData, httpOptions);
  // }

  logout() {
    this.stateService.setState(StorageKey.IS_LOGIN, false);
    this.tokenStorage.remove(StorageKey.TOKEN_KEY);
    this.tokenStorage.remove(StorageKey.USER_KEY);
  }

  isLoggedIn(): boolean {
    const isBool = window._.isBoolean(this.stateService.getState(StorageKey.IS_LOGIN));
    return isBool && this.stateService.getState(StorageKey.IS_LOGIN);
  }

  // reAuthenticate(refreshToken: string): Observable<any> {
  //   return this.http.post(APIs.RE_AUTHENTICATE, { refreshToken });
  // }

  // logoutTimeout(): Observable<any> {
  //   return this.proxy.get<any>(this.config.logoutTimeout)
  // }

  hasSession(): boolean {
    const session = this.session.get(StorageKey.LOGINED_SESSION);
    return !!session;
  }

  setLogin(key: string): void {
    this.cache.set(key, true);
  }

  setSession(key: string): void {
    this.session.set(key, true);
  }

  clearSession(): void {
    this.session.remove(StorageKey.FIRST_LOGIN);
  }

  clearLogin(): void {
    this.cache.remove(StorageKey.FIRST_LOGIN);
  }

  isFirstTimeLogin(): boolean {
    return !!this.cache.get(StorageKey.FIRST_LOGIN);
  }

  redirect(path: string) {
    window.location.href = path;
  }
}
