import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelationshipInfoComponent } from './relationship-info.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { RelationshipInfoService } from './relationship-info.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { LandingService } from '../landing.service';
import { of } from 'rxjs';

describe('RelationshipInfoComponent', () => {
  let component: RelationshipInfoComponent;
  let fixture: ComponentFixture<RelationshipInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RelationshipInfoComponent],
      providers: [
        FormBuilder,
        RelationshipInfoService,
        CommonService,
        LandingService,
      ],
    });
    fixture = TestBed.createComponent(RelationshipInfoComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  
});