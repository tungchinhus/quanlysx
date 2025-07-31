import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { SharedModule } from '../../shared.module';

import { Button, DialogComponent } from './dialog.component';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;
  let dialogRef: MatDialogRef<DialogComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogComponent ],
      providers: [
        { provide: MatDialogRef, useValue: {
          close: () => {}
        } },
        { provide: MAT_DIALOG_DATA, useValue: {
          buttons: []
        } },
        TranslateService,
        TranslateStore,
        TranslateLoader
      ],
      imports: [
        SharedModule,
        TranslateModule.forChild()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close', () => {
    const button: Button = {
      title: 'button.goback',
      color: 'secondary',
      class: 'small',
      focusInitial: false,
      data: false
    };
    component.onClose(button);
    expect(component).toBeTruthy();
  });
});
