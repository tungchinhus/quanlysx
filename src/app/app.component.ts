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
    this.authService.checkAndUpdateLoginState();
    
    console.log('Checking login state:', {
      accessToken: !!accessToken,
      remembered,
      savedUser,
      isAuthServiceLoggedIn,
      hasValidToken
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
        
        if (this.rememberMe) {
          localStorage.setItem('rememberedUsername', this.loggedInUsername);
          localStorage.setItem('rememberedPassword', this.password);
          localStorage.setItem('rememberMe', 'true');          
        } else {
          localStorage.removeItem('rememberedUsername');
          localStorage.removeItem('rememberedPassword');
          localStorage.removeItem('rememberMe');
        }
        
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

        // Handle different response structures
        let accessToken = response.accessToken;
        if (!accessToken && response.token) {
          accessToken = response.token;
        }
        if (!accessToken && response.access_token) {
          accessToken = response.access_token;
        }
        if (!accessToken && response.data && response.data.accessToken) {
          accessToken = response.data.accessToken;
        }

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
          username: response.username || response.userName || response.user || '',
          firstName: response.firstName || response.first_name || response.firstName || '',
          lastName: response.lastName || response.last_name || response.lastName || '',
          hoten: response.hoten || response.fullName || response.name || response.username || '',
          email: response.email || '',
          userId: response.userId || response.id || 0,
          roles: response.roles || response.role || ['user']
        };
        
        // Sử dụng auth service để xử lý login success
        try {
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
        } catch (error) {
          console.error('Login success handling failed:', error);
          this.loginError = true;
          setTimeout(() => {
            this.loginError = false;
          }, 3000);
          return;
        }
        
        this.isLoggedIn = true;
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
        
        // Cập nhật trạng thái đăng nhập
        this.checkAndRestoreLoginState();
        
        console.log('Setting isLoginFormOpen to false');
        this.isLoginFormOpen = false; // Đóng form
        console.log('isLoginFormOpen after setting to false:', this.isLoginFormOpen);
        this.username = ''; // Clear form fields
        this.password = ''; // Clear form fields

        this.toggleUserDropdown(false);
        
        // Force close form after a short delay if it doesn't close automatically
        setTimeout(() => {
          if (this.isLoginFormOpen) {
            console.log('Force closing login form after timeout');
            this.isLoginFormOpen = false;
          }
        }, 100);
        
        // Lưu thông tin remember me
        if (this.rememberMe) {
          localStorage.setItem('rememberedUsername', this.loggedInUsername);
          localStorage.setItem('rememberedPassword', this.password);
          localStorage.setItem('rememberMe', 'true');          
        } else {
          localStorage.removeItem('rememberedUsername');
          localStorage.removeItem('rememberedPassword');
          localStorage.removeItem('rememberMe');
        }

        // Chuyển về trang landing mà không reload
        this.router.navigate(['/landing']);

      },
      error => {
        // Xử lý khi đăng nhập thất bại
        console.error('Đăng nhập thất bại:', error);
        
        // Xử lý các loại lỗi khác nhau
        let errorMessage = 'Đăng nhập thất bại';
        if (error.error) {
          errorMessage = error.error.message || error.error || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status) {
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
        
        console.error('Error details:', errorMessage);
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
