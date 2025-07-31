import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore
} from '@ngx-translate/core';
import { ResultFailedComponent } from './result-failed.component';
import { HttpErrorHandler } from 'src/app/shared/services/http-error-handler.service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
export class MatDialogMock {
  // When the component calls this.dialog.open(...) we'll return an object
  // with an afterClosed method that allows to subscribe to the dialog result observable.
  open() {
    return {
      afterClosed: () => of({action: true})
    };
  }
}
describe('ResultFailedComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResultFailedComponent],
      providers: [TranslateService, TranslateStore, TranslateLoader,HttpClient,HttpHandler,HttpErrorHandler,
        { provide: MatDialog, useClass: MatDialogMock },{
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get(): number {
                  return 6;
                }
              },
              queryParams:[{orderRef:'4324423342'}]
            }
          }
        }],
      imports: [HttpClientModule, TranslateModule.forChild()]
    }).compileComponents();
  });

  xit('should create', () => {
    const fixture = TestBed.createComponent(ResultFailedComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  xit('should call rePayment()', () => {
    const fixture = TestBed.createComponent(ResultFailedComponent);
    const component = fixture.componentInstance;
    component.rePayment();
    expect(component).toBeTruthy();
  });
});
