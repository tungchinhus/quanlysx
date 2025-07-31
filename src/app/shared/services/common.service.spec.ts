import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { SharedModule } from '../shared.module';

import { CommonService } from './common.service';
let moment = require('moment');

describe('CommonService', () => {
  let service: CommonService;

  beforeEach(() => {
    (<any>window).moment = moment;
    TestBed.configureTestingModule({
      providers: [
        MatDialog,
        TranslateService,
        TranslateStore,
        TranslateLoader
      ],
      imports: [
        SharedModule,
        BrowserAnimationsModule,
        TranslateModule.forChild()
      ]
    });
    service = TestBed.inject(CommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show dialog', () => {
    const config: MatDialogConfig = {
      panelClass: 'small',
      data: {
        title: 'payment-info.confirm-dialog-title',
        content: 'payment-info.confirm-dialog-content',
        buttons: [{
          title: 'button.goback',
          color: 'secondary',
          class: 'small',
          focusInitial: false,
          data: false
        }, {
          title: 'button.next',
          color: 'primary',
          class: 'small',
          focusInitial: true,
          data: true
        }]
      }
    };
    const dialogRef = service.showDialog(config);
    expect(dialogRef).toBeDefined();
  });
});
