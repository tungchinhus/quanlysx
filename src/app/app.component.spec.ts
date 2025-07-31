import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { MaterialModule } from './shared/material/material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { FooterComponent } from './shared/components/footer/footer.component';
import { Constant, Lang, Nav } from './constant/constant';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';

declare global {
  interface Window {
    _: any;
  }
}

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let translateService = {
    use: (lang: string) => new BehaviorSubject<any>({}).asObservable(),
    getDefaultLang: () => {},
    addLangs: () => {},
    setDefaultLang: () => {},
    instant: ()=>{} 
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        FooterComponent,
        
      ],
      imports: [
        MaterialModule,
        HttpClientModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot(Constant.translateConfig)
      ],
      providers: [
        // { provide: TranslateService, useValue: jasmine.createSpyObj('TranslateService', ['use', 'getDefaultLang', 'addLangs', 'setDefaultLang'])},
        { provide: TranslateService, useValue: translateService },
        TranslateStore,
        TranslateLoader
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
  });

  xit('should create the app', () => {
    app.ngOnInit();
    app.onScroll();

    const lang: Lang = Constant.languages[0];
    expect(app).toBeTruthy();
  });

  it(`should have as title 'quanlysx'`, () => {
    expect(app.title).toEqual('quanlysx');
  });

  it(`should open menu`, () => {
    const menu = TestBed.createComponent(MatDrawer);
    const event = {
      stopPropagation: () => {}
    };
    const nav: Nav = {
      id: 1,
      link: '/',
      iconSrc: 'assets/images/manulife.svg',
      mobileIconSrc: 'assets/images/mobile-manulife.svg',
      title: 'navigator.manulife',
      mobileTitle: 'navigator.manulife',
      items: [{
        link: '',
        title: ''
      }]
    };
    app.openMenu(event, menu.componentInstance, nav);
    expect(app.activeNavId).toEqual(1);
  });

  it(`should open submenu`, () => {
    const nav: Nav = {
      id: 1,
      link: '/',
      iconSrc: 'assets/images/manulife.svg',
      mobileIconSrc: 'assets/images/mobile-manulife.svg',
      title: 'navigator.manulife',
      mobileTitle: 'navigator.manulife',
      items: [{
        link: '',
        title: ''
      }]
    };
    app.submenu(nav);
    expect(app.activeNavId).toEqual(1);
  });

  // it(`should change language`, async () => {
  //   //const lang: Lang = Constant.languages[0] as Lang;
  //   await app.changeLanguage(Constant.languages[0] as Lang);
  //   expect(app.currentLanguage.code).toEqual('vi');
  // });

  // it('should render title', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.nativeElement as HTMLElement;
  //   expect(compiled.querySelector('.content span')?.textContent).toContain('quanlysx app is running!');
  // });
});
