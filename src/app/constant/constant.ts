import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader } from '@ngx-translate/core';
import { DATE_FORMAT } from 'src/app/shared/utils/localFormat';

class Item {
  link!: string;
  title!: string;
}

export class Nav {
  id!: number;
  link!: string;
  iconSrc!: string;
  mobileIconSrc!: string;
  title!: string;
  mobileTitle!: string;
  items?: Item[];
}

export class Lang {
  code!: string;
  name!: string;
}

export class Constant {
  public static navigations: Nav[] = [
    {
      id: 1,
      link: 'https://www.manulife.com.vn/',
      iconSrc: 'app-global-icon',
      mobileIconSrc: 'assets/images/mobile-manulife.svg',
      title: 'navigator.manulife',
      mobileTitle: 'navigator.manulife'
    },
    {
      id: 2,
      link: 'https://hopdongcuatoi.manulife.com.vn/',
      iconSrc: 'app-connect-icon',
      mobileIconSrc: 'assets/images/mobile-connect.svg',
      title: 'navigator.connect',
      mobileTitle: 'navigator.mobile-connect'
    },
    {
      id: 3,
      link: 'https://www.manulife.com.vn/vi/lien-he.html',
      iconSrc: 'app-contact-icon',
      mobileIconSrc: 'assets/images/mobile-contact.svg',
      title: 'navigator.contact',
      mobileTitle: 'navigator.contact'
    }
  ];
  static sessionTimeout: 10000;
  
  public static createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
  }

  public static translateConfig = {
    loader: {
      provide: TranslateLoader,
      useFactory: this.createTranslateLoader,
      deps: [HttpClient]
    },
    extends: true
  };

  public static languages: Lang[] = [
    {
      code: 'vi',
      name: 'language.vietnamese'
    },
    {
      code: 'en',
      name: 'language.english'
    }
  ];

  public static paymentMethod: any={
    momo : 'momo',
    cybersource: 'cybersource',
    vnpay: 'vnpay'
  };

  public static errCodeList: any=[
    {
      name: 'error-codes.01',
      value: '01'
    },
    {
      name: 'error-codes.02',
      value: '02'
    },
    {
      name: 'error-codes.03',
      value: '03'
    },
    {
      name: 'error-codes.04',
      value: '04'
    },
    {
      name: 'error-codes.E05',
      value: 'E05'
    },
    {
      name: 'error-codes.E06',
      value: 'E06'
    },
    {
      name: 'error-codes.E07',
      value: 'E07'
    },
    {
      name: 'error-codes.E08',
      value: 'E08'
    },
    {
      name: 'error-codes.E00361',
      value: 'E00361'
    },
    {
      name: 'error-codes.E00306',
      value: 'E00306'
    },
    {
      name: 'error-codes.E99023',
      value: 'E99023'
    },
    {
      name: 'error-codes.E99021',
      value: 'E99021'
    }
  ]

  public static currencyRegex = /(\d)(?=(\d{3})+(?!\d))/g;

  public static datePattern = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;

  public static numberOnlyRegex = /[^0-9]+/g;

  public static dotRegex = /\./g;

  public static HUNDRED_MILLION = 100000000;

  public static TWO_HUNDRED_MILLION = 200000000;

  public static FIFTY_MILLION = 50000000;

  public static HAFT_BILLION = 500000000;

  public static gender = [
    {
      name: 'payer-form.gender.female',
      value: 'F'
    },
    {
      name: 'payer-form.gender.male',
      value: 'M'
    },
    {
      name: 'payer-form.gender.none',
      value: '0'
    }
  ]; 

 public static identityType = [
    {
      name: 'payer-form.identity-citizen',
      value: '7'
    },
    {
      name: 'payer-form.passport',
      value: '2'
    },
    {
      name: 'payer-form.military',
      value: '3'
    },
    {
      name: 'payer-form.CMND',
      value: '1'
    }
  ];

  public static identityTypeValues: any = {
    identityCitizen: '7',
    passport: '2',
    military: '3',
    CMND: '1'
  };

  public static cyberSourceCardType: any = {
    visa: '001',
    mastercard: '002',
    jcb: '007'
  };
  
  public static minDOB: Date = new Date(DATE_FORMAT.LIMIT_YEAR, 0, 1);
  public static maxDOB: Date = new Date();
  public static INVALID_DATE = 'INVALID_DATE';
  //public static sessionTimeout: number = 1800000; // ms
  public static cwsTimeout: number = 3600000; // ms
  public static sysRedirect: any={
    LANDING : 'landing',
    CWS: 'CWS'
  };
  //public static waitList = [12000, 12000, 12000, 12000, 12000,12000, 12000, 12000, 12000, 12000];
  public static device: any={
    mobile : 'mobile',
    desktop: 'desktop'
  };
  public static maintenance_Mode: any={
    on : 'on',
    off: 'off',
    message: 'MAINTENANCE MODE ON'
  };
}

export interface ParamsHandleError {
  error: any;
  title: '';
  callbackError?: () => void;
}

export interface ParamsHandleSuccess {
  messageSuccess: 'Success';
  title: '';
  callbackSuccess?: () => void;
}
