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
  khau_sx?: string; // Thêm field khau_sx
  roles?: string[]; // Thêm field roles
  firstName?: string; // Thêm field firstName
  lastName?: string; // Thêm field lastName
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
    // Cập nhật state service trước
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
    localStorage.removeItem('userId');
    
    console.log('Logout completed, all user data cleared');
    
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
    
    // Kiểm tra response có hợp lệ không
    if (!response) {
      console.error('Response is null or undefined');
      throw new Error('Invalid response: response is null or undefined');
    }
    
    // Kiểm tra accessToken có tồn tại không
    const accessToken = response.accessToken || response.AccessToken || response.token || response.Token || response.access_token;
    if (!accessToken) {
      console.error('No access token found in response:', response);
      throw new Error('Invalid token specified: No access token found in response');
    }
    
    console.log('Response accessToken:', accessToken);
    
    // Tự động xác định khau_sx dựa trên email nếu API không trả về
    let khau_sx = response.khau_sx || response.Khau_sx || response.khauSx || response.KhauSx;
    if (!khau_sx && (response.email || response.Email)) {
      const emailToCheck = response.email || response.Email;
      khau_sx = this.determineKhauSxFromEmail(emailToCheck);
      console.log('Auto-determined khau_sx from email:', khau_sx);
    }
    
    // Lưu thông tin user - sử dụng cấu trúc response thực tế
    localStorage.setItem('role', response.roles?.[0] || response.Roles?.[0] || 'user');
    localStorage.setItem('email', response.email || response.Email || '');
    localStorage.setItem('username', response.username || response.userName || response.UserName || '');
    localStorage.setItem('firstName', response.firstName || response.FirstName || '');
    localStorage.setItem('lastName', response.lastName || response.LastName || '');
    localStorage.setItem('hoten', response.hoten || response.Hoten || '');
    localStorage.setItem('userId', response.userId || response.UserId || '');
    localStorage.setItem('khau_sx', khau_sx || '');
    localStorage.setItem('idToken', accessToken);
    localStorage.setItem('accessToken', accessToken);
    
    console.log('Token saved to localStorage:', localStorage.getItem('accessToken'));
    console.log('khau_sx saved to localStorage:', localStorage.getItem('khau_sx'));
    
    // Cập nhật state
    this.stateService.setState(StorageKey.IS_LOGIN, true);
    
    // Lưu token trực tiếp vào sessionStorage thay vì qua SessionStorageService
    // để tránh lỗi JSON.parse với JWT token
    sessionStorage.setItem(StorageKey.TOKEN_KEY, accessToken);
    sessionStorage.setItem(StorageKey.USER_KEY, JSON.stringify(response));
    
    console.log('Token saved to sessionStorage:', sessionStorage.getItem(StorageKey.TOKEN_KEY));
  }

  // Thêm method để tự động xác định khau_sx dựa trên email
  private determineKhauSxFromEmail(email: string): string {
    const emailLower = email.toLowerCase();
    
    if (emailLower.includes('quandayha') || emailLower.includes('boidayha')) {
      return 'boidayha';
    } else if (emailLower.includes('quandaycao') || emailLower.includes('boidaycao')) {
      return 'boidaycao';
    } else if (emailLower.includes('quandayep') || emailLower.includes('boidayep')) {
      return 'boidayep';
    } else if (emailLower.includes('admin') || emailLower.includes('manager')) {
      return 'admin'; // Đánh dấu là admin/manager
    }
    
    // Mặc định nếu không xác định được
    return 'unknown';
  }

  // Thêm method để kiểm tra token
  isTokenValid(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  // Thêm method để lấy token
  getToken(): string | null {
    try {
      // Ưu tiên lấy từ sessionStorage trước, sau đó mới từ localStorage
      const sessionToken = sessionStorage.getItem(StorageKey.TOKEN_KEY);
      if (sessionToken && sessionToken !== 'null' && sessionToken !== 'undefined') {
        return sessionToken;
      }
      
      const localToken = localStorage.getItem('accessToken');
      if (localToken && localToken !== 'null' && localToken !== 'undefined') {
        return localToken;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
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

  // Thêm method để kiểm tra và cập nhật trạng thái đăng nhập
  checkAndUpdateLoginState(): boolean {
    const token = this.getToken();
    const hasValidToken = !!token && token !== 'null' && token !== 'undefined';
    
    // Cập nhật state service
    this.stateService.setState(StorageKey.IS_LOGIN, hasValidToken);
    
    console.log('Login state updated:', {
      hasValidToken,
      token: token ? 'exists' : 'none',
      stateServiceValue: this.stateService.getState(StorageKey.IS_LOGIN)
    });
    
    return hasValidToken;
  }

  // Thêm method để lấy thông tin user từ localStorage
  getUserInfoFromStorage(): any {
    return {
      username: localStorage.getItem('username') || '',
      firstName: localStorage.getItem('firstName') || '',
      lastName: localStorage.getItem('lastName') || '',
      hoten: localStorage.getItem('hoten') || '',
      email: localStorage.getItem('email') || '',
      role: localStorage.getItem('role') || '',
      userId: localStorage.getItem('userId') || '',
      khau_sx: localStorage.getItem('khau_sx') || ''
    };
  }
}
