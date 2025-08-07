import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageKey } from '../../enums/storage-key.enum';
import { CacheService } from '../cache/cache.service';
import { SessionStorageService } from '../session/session-storage.service';
import { StateService } from '../state.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

// Định nghĩa DTO cho Login
export interface UserLoginDto {
  Email: string;
  Password: string;
}

// Định nghĩa DTO cho Login Response
export interface LoginResponseDto {
  accessToken: string;
  username: string;
  hoten: string;
  userId: number;
  email: string;
  // Thêm các thuộc tính khác tùy theo API trả về
}

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
    private cache: CacheService,
    private router: Router
  ) {}

  // login(bodyData: any): Observable<any> {
  //   return this.http.post(SERVER_URL + APIs.AUTH_LOGIN, bodyData, httpOptions);
  // }

  logout() {
    this.stateService.setState(StorageKey.IS_LOGIN, false);
    
    // Xóa token và user info khỏi sessionStorage
    sessionStorage.removeItem(StorageKey.TOKEN_KEY);
    sessionStorage.removeItem(StorageKey.USER_KEY);
    
    // Xóa tất cả thông tin user khỏi localStorage
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('hoten');
    localStorage.removeItem('khau_sx');
    localStorage.removeItem('rememberedUsername');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('idToken');
    localStorage.removeItem('accessToken');
    
    // Chuyển về trang landing mà không reload
    this.router.navigate(['/landing']);
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

  // Cải thiện method redirect để sử dụng Angular Router
  redirect(path: string) {
    this.router.navigate([path]);
  }

  // Thêm method để redirect với query params
  redirectWithParams(path: string, params: any) {
    this.router.navigate([path], { queryParams: params });
  }

  // Thêm method để redirect với state
  redirectWithState(path: string, state: any) {
    this.router.navigate([path], { state: state });
  }

  login(credentials: any): Observable<any> {
    const url = 'https://localhost:7190/api/Account/login';
    console.log('Making login request to:', url);
    console.log('With credentials:', credentials);
    return this.http.post(url, credentials);
  }

  // Thêm method để xử lý login thành công
  handleLoginSuccess(response: any): void {
    console.log('handleLoginSuccess called with response:', response);
    console.log('Response accessToken:', response.accessToken);
    
    // Lưu thông tin user - sử dụng cấu trúc response thực tế
    localStorage.setItem('role', response.roles?.[0] || 'user');
    localStorage.setItem('email', response.email || '');
    localStorage.setItem('username', response.username || '');
    localStorage.setItem('firstName', response.firstName || '');
    localStorage.setItem('lastName', response.lastName || '');
    localStorage.setItem('hoten', response.hoten || '');
    localStorage.setItem('userId', response.userId?.toString() || '');
    localStorage.setItem('idToken', response.accessToken || '');
    localStorage.setItem('accessToken', response.accessToken || '');
    
    console.log('Token saved to localStorage:', localStorage.getItem('accessToken'));
    
    // Cập nhật state
    this.stateService.setState(StorageKey.IS_LOGIN, true);
    
    // Lưu token trực tiếp vào sessionStorage thay vì qua SessionStorageService
    // để tránh lỗi JSON.parse với JWT token
    sessionStorage.setItem(StorageKey.TOKEN_KEY, response.accessToken);
    sessionStorage.setItem(StorageKey.USER_KEY, JSON.stringify(response));
    
    console.log('Token saved to sessionStorage:', sessionStorage.getItem(StorageKey.TOKEN_KEY));
  }

  // Thêm method để kiểm tra token
  isTokenValid(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  // Thêm method để lấy token
  getToken(): string | null {
    // Ưu tiên lấy từ sessionStorage trước, sau đó mới từ localStorage
    const sessionToken = sessionStorage.getItem(StorageKey.TOKEN_KEY);
    if (sessionToken) {
      return sessionToken;
    }
    return localStorage.getItem('accessToken');
  }

  // Thêm method để lấy thông tin user
  getUserInfo(): any {
    const userInfoString = sessionStorage.getItem(StorageKey.USER_KEY);
    if (userInfoString) {
      try {
        return JSON.parse(userInfoString);
      } catch (error) {
        console.error('Error parsing user info:', error);
        return null;
      }
    }
    return null;
  }
}
