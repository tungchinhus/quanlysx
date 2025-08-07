import { Component, HostListener, OnInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { TranslateService } from '@ngx-translate/core';
import { Constant, Lang, Nav } from './constant/constant';
import { Title } from '@angular/platform-browser';
import { CommonService } from './shared/services/common.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
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
export class AppComponent implements OnInit {
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
    private authService: AuthServices
  ) { }

  @HostListener('window:click', ["$event"])
  @HostListener('window:scroll', ["$event"])
  //@HostListener('mousemove', ["$event"])
  @HostListener('keypress', ["$event"])
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    
    // Chỉ đóng user dropdown khi click bên ngoài hoàn toàn
    // Không đóng khi hover ra khỏi auth-section hoặc dropdown
    if (target.closest('.user-dropdown-menu') || target.closest('.auth-section')) {
      // Không làm gì - giữ dropdown mở
      return;
    }
    
    // Chỉ đóng khi click bên ngoài hoàn toàn
    this.showUserDropdown = false;
  }

  ngOnInit(): void {
    if (localStorage.getItem('rememberMe') && localStorage.getItem('rememberedUsername')) {
      this.loggedInUser = localStorage.getItem('rememberedUsername');
      this.username = localStorage.getItem('rememberedUsername') || '';
      this.password = localStorage.getItem('rememberedPassword') || '';
      this.rememberMe = localStorage.getItem('rememberMe') === 'true';
      this.isLoginFormOpen = false;
      this.isRegisterFormVisible = false;
      this.isProfileMenuOpen = true;
      this.isLoggedIn = true;
      
      // Khôi phục tên hiển thị từ firstName và lastName
      const firstName = localStorage.getItem('firstName') || '';
      const lastName = localStorage.getItem('lastName') || '';
      const hoten = localStorage.getItem('hoten') || '';
      const username = localStorage.getItem('username') || '';
      
      if (firstName && lastName) {
        this.loggedInUsername = `${firstName} ${lastName}`;
      } else if (firstName) {
        this.loggedInUsername = firstName;
      } else if (lastName) {
        this.loggedInUsername = lastName;
      } else if (hoten) {
        this.loggedInUsername = hoten;
      } else if (username) {
        this.loggedInUsername = username;
      } else {
        this.loggedInUsername = localStorage.getItem('rememberedUsername') || '';
      }
    }
    const remembered = localStorage.getItem('rememberMe');
    const savedUser = localStorage.getItem('rememberedUsername');

  if (remembered === 'true' && savedUser) {
    this.loggedInUser = savedUser;
  }
    this.currentLanguage = this.languages.find(lang => lang.code === this.translateService.getDefaultLang()) as Lang;  
    const namePage = this.translateService.instant("page-title");
    this.pageTitle.setTitle(namePage);
    //this.timeout = parseInt(localStorage.getItem('sessionTimeout') || Constant.sessionTimeout.toString());
    //this.sessionTimeout();
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
        localStorage.setItem('rememberMe', 'true');          
      } else {
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberMe');
      }
      
      this.router.navigate(['/landing']);
      return;
    }

    this.authService.login(loginCredentials).subscribe(
      response => {
        // Xử lý khi đăng nhập thành công
        console.log('Đăng nhập thành công:', response);
        console.log('Response structure:', JSON.stringify(response, null, 2));
        
        // Kiểm tra xem response có accessToken không
        if (!response) {
          console.error('Response is null or undefined:', response);
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
          localStorage.setItem('rememberMe', 'true');          
        } else {
          localStorage.removeItem('rememberedUsername');
          localStorage.removeItem('rememberMe');
        }

        // Chuyển về trang landing mà không reload
        this.router.navigate(['/landing']);

      },
      error => {
        // Xử lý khi đăng nhập thất bại
        console.error('Đăng nhập thất bại:', error);
        console.error('Error details:', error.error || error.message);
        this.loginError = true;
        // Hiển thị lỗi cụ thể từ backend nếu có
        // error.error.message hoặc error.message
        setTimeout(() => {
          this.loginError = false;
        }, 3000);
      }
    );
  }

  logout(): void {
    // Sử dụng auth service để logout
    this.authService.logout();
    
    // Cập nhật UI state
    this.isLoggedIn = false;
    this.loggedInUsername = '';
    this.isLoginFormOpen = false;
    this.isProfileMenuOpen = false;
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
    this.showUserDropdown = !this.showUserDropdown;
    
    // Không cần thêm event listeners vì onDocumentClick đã xử lý hover
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
}
