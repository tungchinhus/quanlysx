import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { TYPE_MESSAGE } from '../enums/common.enum';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/constant/constant';
import { NavigationExtras, Router } from '@angular/router';
import { ApiConstant } from 'src/app/constant/api.constant';
import { LandingService } from 'src/app/pages/landing/landing.service';
import { DialogComponent } from '../dialogs/dialog/dialog.component';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

declare const moment: any;
declare const $: any;

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  static sysCWS = false;
  static ssId='';
  visibleTemplatePDF = false;
  static header: HttpHeaders;
  static currency = "VND";
  static maitenanceMode = Constant.maintenance_Mode.off;
  static maintenanceEndTime = "";
  dataConfig: any;
  static isStopCheckStatus = false;
  static isRefreshPage= true;
  static cwsViewMode: boolean = false;
  event = new Subject<any>();
  SERVER_API_URL = '';
  private notification = new Subject<any>();
  notificationMethodCall$ = this.notification.asObservable();
  resetForm = new Subject<any>();
  isShowingTimeout = false;
  constructor(private dialog: MatDialog, private router: Router, private http: HttpClient,private _snackBar: MatSnackBar,) {}

  setServerAPIURL(serverAPIURL: any) {
    this.SERVER_API_URL = serverAPIURL;
  }
  getServerAPIURL() {
    return this.SERVER_API_URL + '/';
  }

  getDisplayErr(errCode: string) {
    let display = '';
    Constant.errCodeList.map((item: any) => {
      if (item.value == errCode) {
        display = item.name;
      }
    });
    return display;
  }

  pushEvent(data: any) {
    this.event.next(data);
  }

  getEvent() {
    return this.event;
  }

  showDialog(config: MatDialogConfig) {
    const defaultConfig: MatDialogConfig = {
      panelClass: 'small' // for other size: medium, large
    };
    const dialogRef = this.dialog.open(DialogComponent, {
      ...defaultConfig,
      ...config
    });
    return dialogRef;
  }

  setUsernameAuthenticationInfo(body: any) {
    let k = Object.keys(body)[0];
    if (body[k].hasOwnProperty('authenticationInfo')) {
      body[k].authenticationInfo.username = localStorage.getItem('userID');
    }
    return body;
  }

  callNotification(type: TYPE_MESSAGE, title: string, description: string, options?: '') {
    this.notification.next({
      type,
      title,
      description,
      options
    });
  }

  showWarningDiaLog(contentStr: string) {
    this.showDialog({
      panelClass: 'small',
      data: {
        content: contentStr,
        buttons: [
          {
            title: 'button.ok',
            color: 'primary',
            class: 'small',
            focusInitial: true,
            data: false
          }
        ]
      }
    });
  }

  pushResetFormEvent() {
    this.resetForm.next({});
  }

  getResetFormEvent() {
    return this.resetForm;
  }

  selectOpenedChange(event: boolean) {
    if (event) {
      const overlay = document.getElementsByClassName('cdk-overlay-pane')[0] as HTMLElement;
      const offset = $($('.cdk-overlay-pane')[0]).offset();
      // const offsetTop = overlay?.offsetTop || 0;
      const offsetHeight = overlay?.offsetHeight || 0;
      const extraHeight = 110;
      if ((offset?.top || 0) + offsetHeight + extraHeight > window.screen.availHeight) {
        const contain = document.getElementsByTagName('mat-drawer-content');
        if (contain[0]) {
          const scrollTop = contain[0].scrollTop;
          const top =
            (offset?.top || 0) + offsetHeight - window.screen.availHeight + scrollTop + extraHeight;
          contain[0].scrollTo({ top, behavior: 'smooth' });
          // $('html, body').animate({
          //   scrollTop: top
          // }, 100);
        }
      }
    }
  }
  getMaintenancePage() {
    const url = ApiConstant.getApiUrl('getMaintenance');
    this.http.get(url).subscribe((response: any) => {
      if (response.mode == Constant.maintenance_Mode.on) {
        CommonService.maitenanceMode = response.mode;
        CommonService.maintenanceEndTime = response.endTime;
        const navigationExtras: NavigationExtras = {
          state: {
            mode: response.mode,
            endTime: response.endTime
          }
        };
        this.router.navigate(['/maintenance'], navigationExtras);
        this.pushEvent(response);
      } else if (this.router.routerState.snapshot.url == '/maintenance') {
        this.router.navigate(['/landing']);
      }
    });
  }

  getConfig() {
    const url = ApiConstant.getApiUrl('getConfig');
    this.http.get(url).subscribe((response: any) => {
      if (response) {
        localStorage.setItem('dataConfig',JSON.stringify(response));
      }
    });
  }

  showSessionTimeoutPopup(sysRedirect: any) {
    this.isShowingTimeout = true;
    this.dialog.closeAll();
    const dialogRef = this.showDialog({
      panelClass: 'small',
      disableClose: true,
      data: {
        content: 'sessionTimeout.title',
        buttons: [
          {
            title: 'sessionTimeout.ok',
            color: 'primary',
            class: 'small',
            focusInitial: true,
            data: true
          }
        ]
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if(result){
        if(LandingService.sysCWS){
          CommonService.isRefreshPage=false;
        window.open(window.location.href.split('?ss')[0], '_self');
        } else{
          this.router.navigate(['/landing'], { replaceUrl: true });
          this.pushResetFormEvent();
        }
        this.isShowingTimeout = false;
      }
      
      // const environment = RsfConfigFactory.getEnv() as Environment;
      // const redirect = lodash.find(environment.redirectUrls, { source: sysRedirect });
      // if (redirect) {
      //   window.open(redirect.url, '_self');
      // } else {
      //   this.router.navigate(['/landing'], { replaceUrl: true });
      //   this.pushResetFormEvent();
      // }
      //this.isShowingTimeout = false;
    });
  }
  checkCwsExpiredDate() {
    const current = moment();
    const cwsExpiredDate= localStorage.getItem('cwsTimeOut');
    const cwsExpired = moment(cwsExpiredDate);
    const timeSeconds = cwsExpired.diff(current,'seconds');
    if(timeSeconds<= 0){
      this.showSessionTimeoutPopup(Constant.sysRedirect.LANDING);              
    }
  }

  thongbao(text: string,action: string,type: 'success' | 'error' | 'warning' | 'info'): void {
      let config = new MatSnackBarConfig();
      config.verticalPosition = 'top'; // Đặt vị trí dọc là "trên cùng"
      config.horizontalPosition = 'right'; // Đặt vị trí ngang là "bên phải"
      config.duration = 3000; // Tùy chọn: Thời gian hiển thị (ví dụ 3 giây)
      config.panelClass = ['snackbar-custom', `snackbar-${type}`];
      this._snackBar.open(text, action, config);
    }
}
