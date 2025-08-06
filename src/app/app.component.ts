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
  @HostListener('mousemove', ["$event"])
  @HostListener('keypress', ["$event"])

  ngOnInit(): void {
    if (localStorage.getItem('rememberMe') && localStorage.getItem('rememberedUsername') && localStorage.getItem('rememberedPassword')) {
      this.loggedInUser = localStorage.getItem('rememberedUsername');
      this.username = localStorage.getItem('rememberedUsername') || '';
      this.password = localStorage.getItem('rememberedPassword') || '';
      this.rememberMe = localStorage.getItem('rememberMe') === 'true';
      this.isLoginFormOpen = false;
      this.isRegisterFormVisible = false;
      this.isProfileMenuOpen = true;
      this.isLoggedIn = true;
      this.loggedInUsername = localStorage.getItem('rememberedUsername') || '';
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

    // document.addEventListener('visibilitychange', () => {
    //   if (!this.isShowingTimeout && ((Date.now() - this.lastAction >= this.timeout))) {
    //     console.log('visibilitychange', Date.now() - this.lastAction);
    //     clearTimeout(this.idleTimeout);
    //     this.commonService.showSessionTimeoutPopup(Constant.sysRedirect.LANDING);
    //   }
    // } , false);
    
    // window.addEventListener('beforeunload', (event) => {
    //   if(!CommonService.isRefreshPage){
    //     return;
    //   }
    //   event.preventDefault();
    //   return event.returnValue = 'Are you sure you want to exit?';
    // }, {capture: true});    
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
    this.isLoginFormOpen = false;
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

    this.authService.login(loginCredentials).subscribe(
      response => {
        // Xử lý khi đăng nhập thành công
        console.log('Đăng nhập thành công:', response);
        this.isLoggedIn = true;
        this.loggedInUsername = response.username; // Lấy username từ response
        this.isLoginFormOpen = false; // Đóng form
        this.username = ''; // Clear form fields
        this.password = ''; // Clear form fields

        // Lưu token hoặc thông tin người dùng vào Local Storage/Session Storage
        // Ví dụ: localStorage.setItem('accessToken', response.accessToken);
        // localStorage.setItem('user', JSON.stringify(response));

        if (this.rememberMe) {
          localStorage.setItem('rememberedUsername', this.loggedInUsername);
          localStorage.setItem('rememberMe', 'true');
          // Không nên lưu mật khẩu trực tiếp, chỉ username nếu cần "Remember Me"
        } else {
          localStorage.removeItem('rememberedUsername');
          localStorage.removeItem('rememberMe');
        }

      },
      error => {
        // Xử lý khi đăng nhập thất bại
        console.error('Đăng nhập thất bại:', error);
        this.loginError = true;
        // Hiển thị lỗi cụ thể từ backend nếu có
        // error.error.message hoặc error.message
        setTimeout(() => {
          this.loginError = false;
        }, 3000);
      }
    );
  }

  // handleLogin(): void {
  //   // For demonstration purposes, hardcode a successful login for 'user123' with password '12232'
  //   if (this.username === 'user123' && this.password === 'user123') {
  //     if (this.rememberMe) {
  //       localStorage.setItem('rememberedUsername', this.username);
  //       localStorage.setItem('rememberedPassword', this.password);
  //       localStorage.setItem('rememberMe', 'true');
  //     } else {
  //       localStorage.removeItem('rememberedUsername');
  //       localStorage.removeItem('rememberedPassword');
  //       localStorage.removeItem('rememberMe');
  //     }
  //     this.isLoggedIn = true;
  //     this.loggedInUsername = this.username;
  //     this.isLoginFormOpen = false;
  //     this.username = '';
  //     this.password = '';
  //     console.log('Đăng nhập thành công (ví dụ)');
  //   } else {
  //     this.loginError = true;
  //     setTimeout(() => {
  //       this.loginError = false;
  //     }, 3000);
  //   }
  // }

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
    this.showUserDropdown = showprofileMenu;
  }
}
