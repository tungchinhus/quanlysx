import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { SharedModule } from '../shared.module';

import { ComponentsComponent } from './components.component';
import { SliderContentComponent } from './slider/slider-content/slider-content.component';
import { SliderComponent } from './slider/slider.component';

describe('ComponentsComponent', () => {
  let component: ComponentsComponent;
  let fixture: ComponentFixture<ComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ComponentsComponent,
        SliderComponent,
        SliderContentComponent
      ],
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

    fixture = TestBed.createComponent(ComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
