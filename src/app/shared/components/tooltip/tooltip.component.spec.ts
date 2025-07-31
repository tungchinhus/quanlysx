import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { SharedModule } from '../../shared.module';

import { TooltipComponent } from './tooltip.component';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TooltipComponent ],
      providers: [
        TranslateService,
        TranslateStore,
        TranslateLoader
      ],
      imports: [
        SharedModule,
        BrowserAnimationsModule,
        NoopAnimationsModule,
        TranslateModule.forChild()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.toogle(null);
    expect(component).toBeTruthy();
  });

  it('should not toogle tooltip', () => {
    const event: any = { className: ['app-tooltip'] };
    component.isShow = true;
    component.onClick(event);
    component.toogle(null);
    expect(component).toBeTruthy();
  });
});
