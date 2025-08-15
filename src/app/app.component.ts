import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { TranslateService } from '@ngx-translate/core';
import { Constant, Lang, Nav } from './constant/constant';
import { Title } from '@angular/platform-browser';
import { CommonService } from './shared/services/common.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { LoginComponent } from './shared/components/login/login.component';
import { AuthServices } from './shared/services/authen/auth.service';


export interface UserLoginDto {
  Email: string;
  Password: string;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
title: string = 'quanlysx';
  showFiller: boolean = false;
  isScrolled: boolean = false;
  activeNavId: number = 0;
  navigations = Constant.navigations;
  languages = Constant.languages;
  mobileMenuOpened: boolean = false;
  subMenuOpened: boolean = false;
  currentLanguage!: Lang;
  idleTimeout: any;
  isShowingTimeout: boolean = false;
  redirectFrom!: string;
  currentRoute: any;
  lastAction: number = Date.now();
  timeout!: number;
  cwstimeout!: number;

  // Login Form States
  isLoginFormOpen: boolean = false;
  loginError: boolean = false;
  username: string = '';
  password: string = '';
  rememberMe: boolean = false;
  isRegisterFormVisible: boolean = false;
  registerError: boolean = false;
  registerUsername: string = '';
  registerPassword: string = '';
  registerEmail: string = '';
  // Thêm các trường đăng ký khác nếu có (hoten, phoneNumber, ngaySinh)
  registerHoten: string = '';
  registerPhoneNumber: string = '';
  registerNgaySinh: string = '';

  // New states for logged-in user and dropdown
  isLoggedIn: boolean = false;
  loggedInUsername: string = '';
  showUserDropdown: boolean = false;
  loggedInUser: string | null = null;
  isProfileMenuOpen: boolean = false;

  // Event subscription để unsubscribe khi component destroy
  private eventSubscription!: Subscription;

  private users = [
    { username: 'totruong', password: 'user123', email: 'totruong1@hh.com', role: 'totruong' },
    { username: 'boidayha', password: 'user123', email: 'boidayha@hh.com', role: 'boidayha' },
    { username: 'boidaycao', password: 'user123', email: 'boidaycao@hh.com', role: 'boidaycao' }
  ];
  

  constructor(
    private pageTitle:Title,
    private translateService: TranslateService,
    private commonService: CommonService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private localeService: BsLocaleService,
    public authService: AuthServices
  ) { }

  @HostListener('window:click', ["$event"])
  @HostListener('window:scroll', ["$event"])
  //@HostListener('mousemove', ["$event"])
  @HostListener('keypress', ["$event"])
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Đóng dropdown user nếu click ra ngoài
    if (this.showUserDropdown) {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-profile-btn') && !target.closest('.user-dropdown-menu')) {
        this.closeUserDropdown();
      }
    }
    
    // Đóng mobile menu nếu click ra ngoài
    if (this.mobileMenuOpened) {
      const target = event.target as HTMLElement;
      if (!target.closest('.hamburger-menu') && !target.closest('.mobile-menu')) {
        this.closeMobileMenu();
      }
    }
  }

  ngOnInit(): void {
    console.log('🔍 AppComponent ngOnInit called');
    console.log('🔍 Current route:', this.router.url);
    
    // Lắng nghe event từ các component con để mở popup đăng nhập
    this.eventSubscription = this.commonService.getEvent().subscribe((event: any) => {
      if (event && event.action === 'openLoginForm') {
        this.openLoginForm();
      }
    });

    // Kiểm tra và khôi phục trạng thái đăng nhập từ localStorage và auth service
    this.checkAndRestoreLoginState();
    
    // Thiết lập ngôn ngữ và các cài đặt khác
    this.currentLanguage = this.languages.find(lang => lang.code === this.translateService.getDefaultLang()) as Lang;  
    const namePage = this.translateService.instant("page-title");
    this.pageTitle.setTitle(namePage);
    
    // Xử lý query params và route events
    this.route.queryParams.subscribe((params: any) => {
      if (params.source) {
        this.redirectFrom = params.source;
      }
    });
    
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event;
      console.log('🔍 NavigationEnd event:', event);
      console.log('🔍 New URL:', event.url);
    });
  }

  // Thêm method mới để kiểm tra và khôi phục trạng thái đăng nhập
  private checkAndRestoreLoginState(): void {
    const accessToken = localStorage.getItem('accessToken');
    const remembered = localStorage.getItem('rememberMe');
    const savedUser = localStorage.getItem('rememberedUsername');
    
    // Kiểm tra token từ auth service
    const isAuthServiceLoggedIn = this.authService.isLoggedIn();
    const hasValidToken = this.authService.isTokenValid();
    
    // Cập nhật trạng thái đăng nhập trong auth service
    const loginStateUpdated = this.authService.checkAndUpdateLoginState();
    
    console.log('Checking login state:', {
      accessToken: !!accessToken,
      remembered,
      savedUser,
      isAuthServiceLoggedIn,
      hasValidToken,
      loginStateUpdated
    });

    if (hasValidToken && (isAuthServiceLoggedIn || accessToken)) {
      // Khôi phục trạng thái đăng nhập
      this.isLoggedIn = true;
      
      // Lấy thông tin user từ auth service
      const userInfo = this.authService.getUserInfoFromStorage();
      
      // Tạo tên hiển thị
      if (userInfo.firstName && userInfo.lastName) {
        this.loggedInUsername = `${userInfo.firstName} ${userInfo.lastName}`;
      } else if (userInfo.firstName) {
        this.loggedInUsername = userInfo.firstName;
      } else if (userInfo.lastName) {
        this.loggedInUsername = userInfo.lastName;
      } else if (userInfo.hoten) {
        this.loggedInUsername = userInfo.hoten;
      } else if (userInfo.username) {
        this.loggedInUsername = userInfo.username;
      } else if (userInfo.email) {
        this.loggedInUsername = userInfo.email;
      } else {
        this.loggedInUsername = 'User';
      }
      
      // Khôi phục thông tin đăng nhập nếu có remember me
      if (remembered === 'true' && savedUser) {
        this.username = savedUser;
        this.password = localStorage.getItem('rememberedPassword') || '';
        this.rememberMe = true;
      }
      
      console.log('Login state restored:', {
        isLoggedIn: this.isLoggedIn,
        loggedInUsername: this.loggedInUsername,
        userInfo
      });
      
      // Cập nhật UI
      this.updateLoginUI();
    } else {
      // Đảm bảo trạng thái đăng xuất
      this.isLoggedIn = false;
      this.loggedInUsername = '';
      this.isLoginFormOpen = false;
      this.isProfileMenuOpen = false;
      
      // Xóa token không hợp lệ
      if (accessToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
      }
      
      console.log('User not logged in, cleared invalid state');
      
      // Cập nhật UI
      this.updateLoginUI();
    }
  }

  onScroll() {
    this.isScrolled = false;
    const content: any = document.getElementsByClassName('menu-sidenav-content')[0];
    const top = content.getBoundingClientRect().top;
    const scrollTop = 80;
    if (top !== scrollTop) {
      this.isScrolled = true;
    }
  }

  openMenu(event: any, menu: MatDrawer, nav: any) {
    if (nav.items?.length) {
      this.activeNavId = nav.id;
      event.stopPropagation();
      menu.open();
    }
  }

  submenu(nav: Nav) {
    if (nav.items?.length) {
      this.activeNavId = nav.id;
      this.subMenuOpened = true;
    }
  }

  async changeLanguage(lang: Lang) {
    // await this.translateService.use(lang.code);
    // this.currentLanguage = lang;
    const deaultLang = lang.code;
    this.currentLanguage = lang;
    this.translateService.setDefaultLang(deaultLang);
    localStorage.setItem('selectedLang',deaultLang);
    this.localeService.use(deaultLang);
    try {
      await this.translateService.use(deaultLang).toPromise();
    } catch (err) {
      console.log(err);
    }
    const namePage = this.translateService.instant("page-title");
    this.pageTitle.setTitle(namePage);
  }

  sessionTimeout() {
    if (this.isShowingTimeout) {
      return;
    }
    this.idleTimeout = setTimeout(() => {
      clearTimeout(this.idleTimeout);
      if(CommonService.maitenanceMode != Constant.maintenance_Mode.on){
        this.commonService.showSessionTimeoutPopup(Constant.sysRedirect.LANDING);
      }      
    }, this.timeout);
  }

  openLoginDialog() {
    this.dialog.open(LoginComponent, {
      width: '400px',
      disableClose: true,
      data: { redirectFrom: this.redirectFrom }
    });
  }
  
  // Login/Register Form Handlers
  openLoginForm(): void {
    this.isLoginFormOpen = true;
    this.isRegisterFormVisible = false; // Always start with login form
    this.loginError = false;
  }

  closeLoginForm(): void {
    console.log('closeLoginForm called');
    this.isLoginFormOpen = false;
    console.log('isLoginFormOpen after closeLoginForm:', this.isLoginFormOpen);
  }

  handleLogin(): void {
    this.loginError = false; // Reset error message
    // Tạo đối tượng DTO để gửi lên API
    const loginCredentials: UserLoginDto = {
      Email: this.username,
      Password: this.password
    };

    if (!loginCredentials.Email || !loginCredentials.Password) {
      this.loginError = true;
      // You can add a more specific message here if needed
      return;
    }

    console.log('Sending login request with credentials:', loginCredentials);

    // For testing purposes, if API is not accessible, use mock login
    if (this.username === 'test' && this.password === 'test') {
      console.log('Using mock login for testing');
      const mockResponse = {
        accessToken: 'mock-token-' + Date.now(),
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        hoten: 'Test User',
        email: 'test@example.com',
        userId: 1,
        roles: ['user']
      };
      
      try {
        this.authService.handleLoginSuccess(mockResponse);
        this.isLoggedIn = true;
        // Tạo tên hiển thị từ firstName và lastName cho mock login
        let displayName = '';
        if (mockResponse.firstName && mockResponse.lastName) {
          displayName = `${mockResponse.firstName} ${mockResponse.lastName}`;
        } else if (mockResponse.firstName) {
          displayName = mockResponse.firstName;
        } else if (mockResponse.lastName) {
          displayName = mockResponse.lastName;
        } else if (mockResponse.hoten) {
          displayName = mockResponse.hoten;
        } else if (mockResponse.username) {
          displayName = mockResponse.username;
        } else {
          displayName = 'User';
        }
        this.loggedInUsername = displayName;
        
        // Cập nhật trạng thái đăng nhập
        this.checkAndRestoreLoginState();
        
        console.log('Mock login: Setting isLoginFormOpen to false');
        this.isLoginFormOpen = false;
        console.log('Mock login: isLoginFormOpen after setting to false:', this.isLoginFormOpen);
        
        // Lưu thông tin remember me trước khi clear
        if (this.rememberMe) {
          localStorage.setItem('rememberedUsername', this.loggedInUsername);
          const passwordToRemember = this.password;
          localStorage.setItem('rememberedPassword', passwordToRemember);
          localStorage.setItem('rememberMe', 'true');          
        } else {
          localStorage.removeItem('rememberedUsername');
          localStorage.removeItem('rememberedPassword');
          localStorage.removeItem('rememberMe');
        }
        
        // Clear form fields sau khi lưu remember me
        this.username = '';
        this.password = '';
        this.toggleUserDropdown(false);
        
        // Force close form after a short delay if it doesn't close automatically
        setTimeout(() => {
          if (this.isLoginFormOpen) {
            console.log('Mock login: Force closing login form after timeout');
            this.isLoginFormOpen = false;
          }
        }, 100);
        
        this.router.navigate(['/landing']);
        return;
      } catch (error) {
        console.error('Mock login failed:', error);
        this.loginError = true;
        setTimeout(() => {
          this.loginError = false;
        }, 3000);
        return;
      }
    }

    this.authService.login(loginCredentials).subscribe(
      response => {
        // Xử lý khi đăng nhập thành công
        console.log('Đăng nhập thành công:', response);
        console.log('Response structure:', JSON.stringify(response, null, 2));
        console.log('Response type:', typeof response);
        console.log('Response keys:', response ? Object.keys(response) : 'No response');
        
        // Kiểm tra xem response có hợp lệ không
        if (!response) {
          console.error('Response is null or undefined:', response);
          this.loginError = true;
          setTimeout(() => {
            this.loginError = false;
          }, 3000);
          return;
        }
        
        // Kiểm tra xem response có phải là object không
        if (typeof response !== 'object') {
          console.error('Response is not an object:', response);
          this.loginError = true;
          setTimeout(() => {
            this.loginError = false;
          }, 3000);
          return;
        }
        
        // Kiểm tra xem response có phải là array không (nếu có thì lấy phần tử đầu tiên)
        if (Array.isArray(response)) {
          console.log('Response is an array, taking first element');
          if (response.length > 0) {
            response = response[0];
          } else {
            console.error('Response array is empty');
            this.loginError = true;
            setTimeout(() => {
              this.loginError = false;
            }, 3000);
            return;
          }
        }

        // Handle different response structures
        let accessToken = response.accessToken || response.AccessToken;
        console.log('Initial accessToken check:', accessToken);
        
        if (!accessToken && response.token) {
          accessToken = response.token;
          console.log('Found token in response.token:', accessToken);
        }
        if (!accessToken && response.Token) {
          accessToken = response.Token;
          console.log('Found token in response.Token:', accessToken);
        }
        if (!accessToken && response.access_token) {
          accessToken = response.access_token;
          console.log('Found token in response.access_token:', accessToken);
        }
        if (!accessToken && response.data && response.data.accessToken) {
          accessToken = response.data.accessToken;
          console.log('Found token in response.data.accessToken:', accessToken);
        }
        if (!accessToken && response.data && response.data.AccessToken) {
          accessToken = response.data.AccessToken;
          console.log('Found token in response.data.AccessToken:', accessToken);
        }
        if (!accessToken && response.data && response.data.token) {
          accessToken = response.data.token;
          console.log('Found token in response.data.token:', accessToken);
        }
        if (!accessToken && response.data && response.data.Token) {
          accessToken = response.data.Token;
          console.log('Found token in response.data.Token:', accessToken);
        }
        if (!accessToken && response.result && response.result.accessToken) {
          accessToken = response.result.accessToken;
          console.log('Found token in response.result.accessToken:', accessToken);
        }
        if (!accessToken && response.result && response.result.AccessToken) {
          accessToken = response.result.AccessToken;
          console.log('Found token in response.result.AccessToken:', accessToken);
        }
        if (!accessToken && response.result && response.result.token) {
          accessToken = response.result.token;
          console.log('Found token in response.result.token:', accessToken);
        }
        if (!accessToken && response.result && response.result.Token) {
          accessToken = response.result.Token;
          console.log('Found token in response.result.Token:', accessToken);
        }

        console.log('Final accessToken value:', accessToken);

        if (!accessToken) {
          console.error('Response không có accessToken:', response);
          console.error('Available keys in response:', Object.keys(response));
          this.loginError = true;
          setTimeout(() => {
            this.loginError = false;
          }, 3000);
          return;
        }

        // Normalize response structure
        const normalizedResponse = {
          accessToken: accessToken,
          username: response.username || response.userName || response.UserName || response.user || response.User || response.email || response.Email || '',
          firstName: response.firstName || response.FirstName || response.first_name || response.firstName || response.name || response.Name || '',
          lastName: response.lastName || response.LastName || response.last_name || response.lastName || response.surname || response.Surname || '',
          hoten: response.hoten || response.Hoten || response.fullName || response.FullName || response.name || response.Name || response.username || response.UserName || response.email || response.Email || '',
          email: response.email || response.Email || response.username || response.UserName || '',
          userId: response.userId || response.UserId || response.id || response.Id || response.user_id || 0,
          roles: response.roles || response.Roles || response.role || response.Role || response.userRoles || response.UserRoles || ['user']
        };
        
        console.log('Normalized response:', normalizedResponse);
        console.log('Response keys available:', Object.keys(response));
        
        // Sử dụng auth service để xử lý login success
        try {
          console.log('Calling authService.handleLoginSuccess with:', normalizedResponse);
          this.authService.handleLoginSuccess(normalizedResponse);
          
          // Debug: Check if token was saved
          console.log('Token after handleLoginSuccess:', localStorage.getItem('accessToken'));
          console.log('Token from getToken():', this.authService.getToken());
          
          // Verify token was actually saved
          const savedToken = localStorage.getItem('accessToken');
          if (!savedToken) {
            console.error('Token không được lưu vào localStorage!');
            this.loginError = true;
            setTimeout(() => {
              this.loginError = false;
            }, 3000);
            return;
          }
          
          console.log('Token successfully saved, proceeding with login completion');
        } catch (error) {
          console.error('Login success handling failed:', error);
          this.loginError = true;
          setTimeout(() => {
            this.loginError = false;
          }, 3000);
          return;
        }
        
        this.isLoggedIn = true;
        console.log('Login state set to true');
        
        // Tạo tên hiển thị từ firstName và lastName
        let displayName = '';
        if (normalizedResponse.firstName && normalizedResponse.lastName) {
          displayName = `${normalizedResponse.firstName} ${normalizedResponse.lastName}`;
        } else if (normalizedResponse.firstName) {
          displayName = normalizedResponse.firstName;
        } else if (normalizedResponse.lastName) {
          displayName = normalizedResponse.lastName;
        } else if (normalizedResponse.hoten) {
          displayName = normalizedResponse.hoten;
        } else if (normalizedResponse.username) {
          displayName = normalizedResponse.username;
        } else {
          displayName = 'User';
        }
        
        this.loggedInUsername = displayName;
        console.log('Display name set to:', displayName);
        
        // Cập nhật trạng thái đăng nhập
        console.log('Calling checkAndRestoreLoginState...');
        this.checkAndRestoreLoginState();
        
        console.log('Setting isLoginFormOpen to false');
        this.isLoginFormOpen = false; // Đóng form
        console.log('isLoginFormOpen after setting to false:', this.isLoginFormOpen);
        // Lưu thông tin remember me
        if (this.rememberMe) {
          console.log('Saving remember me information...');
          localStorage.setItem('rememberedUsername', this.loggedInUsername);
          // Lưu password trước khi clear
          const passwordToRemember = this.password;
          localStorage.setItem('rememberedPassword', passwordToRemember);
          localStorage.setItem('rememberMe', 'true');
          console.log('Remember me information saved');
        } else {
          console.log('Clearing remember me information...');
          localStorage.removeItem('rememberedUsername');
          localStorage.removeItem('rememberedPassword');
          localStorage.removeItem('rememberMe');
          console.log('Remember me information cleared');
        }

        // Clear form fields sau khi lưu remember me
        this.username = ''; // Clear form fields
        this.password = ''; // Clear form fields
        console.log('Form fields cleared');

        this.toggleUserDropdown(false);
        console.log('User dropdown toggled to false');
        
        // Force close form after a short delay if it doesn't close automatically
        setTimeout(() => {
          if (this.isLoginFormOpen) {
            console.log('Force closing login form after timeout');
            this.isLoginFormOpen = false;
          }
        }, 100);
        
        // Chuyển về trang landing mà không reload
        console.log('Navigating to /landing...');
        this.router.navigate(['/landing']);
        console.log('Navigation completed');

      },
      error => {
        // Xử lý khi đăng nhập thất bại
        console.error('Đăng nhập thất bại:', error);
        console.error('Error type:', typeof error);
        console.error('Error structure:', JSON.stringify(error, null, 2));
        
        // Xử lý các loại lỗi khác nhau
        let errorMessage = 'Đăng nhập thất bại';
        if (error.error) {
          errorMessage = error.error.message || error.error || errorMessage;
          console.error('Error from error.error:', error.error);
        } else if (error.message) {
          errorMessage = error.message;
          console.error('Error from error.message:', error.message);
        } else if (error.status) {
          console.error('Error status:', error.status);
          switch (error.status) {
            case 401:
              errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng';
              break;
            case 403:
              errorMessage = 'Tài khoản bị khóa hoặc không có quyền truy cập';
              break;
            case 404:
              errorMessage = 'Không tìm thấy tài khoản';
              break;
            case 500:
              errorMessage = 'Lỗi máy chủ, vui lòng thử lại sau';
              break;
            default:
              errorMessage = 'Lỗi kết nối, vui lòng kiểm tra mạng và thử lại';
          }
        }
        
        console.error('Final error message:', errorMessage);
        this.loginError = true;
        
        // Hiển thị lỗi cụ thể từ backend nếu có
        setTimeout(() => {
          this.loginError = false;
        }, 3000);
      }
    );
  }

  logout(): void {
    console.log('Logging out user:', this.loggedInUsername);
    
    // Sử dụng auth service để logout
    this.authService.logout();
    
    // Cập nhật UI state
    this.isLoggedIn = false;
    this.loggedInUsername = '';
    this.isLoginFormOpen = false;
    this.isProfileMenuOpen = false;
    this.showUserDropdown = false;
    
    // Cập nhật trạng thái đăng nhập
    this.checkAndRestoreLoginState();
    
    console.log('Logout completed, UI state updated');
  }

  toggleForm(): void {
    this.isRegisterFormVisible = !this.isRegisterFormVisible;
    this.loginError = false; // Reset error when toggling form
    this.registerError = false; // Reset error when toggling form
  }

  handleRegister(): void {
    if (this.registerUsername && this.registerPassword && this.registerEmail) {
      console.log('Đăng ký thành công:', {
        username: this.registerUsername,
        password: this.registerPassword,
        email: this.registerEmail,
      });
      this.isRegisterFormVisible = false;
      this.isLoginFormOpen = true; // Switch back to login form
      this.registerUsername = '';
      this.registerPassword = '';
      this.registerEmail = '';
    } else {
      this.registerError = true;
      setTimeout(() => {
        this.registerError = false;
      }, 3000);
    }
  }

  toggleUserDropdown(showprofileMenu: boolean): void {
    // Toggle dropdown - nếu đang mở thì đóng, nếu đang đóng thì mở
    this.showUserDropdown = showprofileMenu;
    
    console.log('Dropdown toggled:', this.showUserDropdown);
  }

  // Method để đóng dropdown khi click vào menu items
  closeUserDropdown(): void {
    this.showUserDropdown = false;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpened = !this.mobileMenuOpened;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpened = false;
  }

  // Test method to verify token saving
  testTokenSaving(): void {
    console.log('Testing token saving...');
    const testResponse = {
      accessToken: 'test-token-12345',
      username: 'testuser',
      hoten: 'Test User',
      email: 'test@example.com',
      userId: 1,
      roles: ['user']
    };
    
    console.log('Test response:', testResponse);
    this.authService.handleLoginSuccess(testResponse);
    
    console.log('Token after test save:', localStorage.getItem('accessToken'));
    console.log('Token from getToken():', this.authService.getToken());
  }

  // Thêm method để kiểm tra trạng thái đăng nhập từ bên ngoài
  checkLoginStatus(): void {
    this.checkAndRestoreLoginState();
  }

  // Thêm method để cập nhật UI khi trạng thái đăng nhập thay đổi
  updateLoginUI(): void {
    if (this.isLoggedIn) {
      // Ẩn form đăng nhập nếu đang mở
      this.isLoginFormOpen = false;
      this.isRegisterFormVisible = false;
      
      // Đóng dropdown user nếu đang mở
      this.showUserDropdown = false;
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe để tránh memory leak
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }
}
