import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { PolicyInfo, RelationshipByPolicy } from '../models/payment.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { RelationshipInfoService } from './relationship-info.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { LandingService } from '../landing.service';

@Component({
  selector: 'app-relationship-info',
  templateUrl: './relationship-info.component.html',
  styleUrls: ['./relationship-info.component.scss']
})
export class RelationshipInfoComponent implements OnInit, OnChanges {
  @Input() policyInfo: PolicyInfo | undefined;
  @Input() relationshipByPolicy: RelationshipByPolicy[] = [];
  @Input() disabledForm: boolean = false;
  //@Input() disableRelationTo: boolean=false;
  @Output() selectedRelationship = new EventEmitter<RelationshipByPolicy[]>();
  policyMappingList: RelationshipByPolicy[] = [];
  relationshipList: string[] = [];
  isDisplayRelationship: boolean = false;
  relationshipForm!: FormGroup;
  isCws=false;
  cwsTypeIndicator = ''
  openedChange = CommonService.prototype.selectOpenedChange;

  constructor(private formBuilder: FormBuilder, private service: RelationshipInfoService) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['disabledForm'] && this.relationshipForm) {
      this.setFormControlDisable(changes['disabledForm'].currentValue);
    }
  }

  ngOnInit(): void {
    this.isCws = LandingService.sysCWS;
    this.cwsTypeIndicator=LandingService.cwsTypeIndicator;
    this.relationshipList = this.service.getRelationshipList();
    this.relationshipForm = this.formBuilder.group({});
    this.policyMappingList = this.service.getMappingList(this.policyInfo, this.relationshipByPolicy);
    this.isDisplayRelationship = this.service.checkDisplayRelationship(this.policyMappingList);
    this.policyMappingList.forEach((item) => {
      const formControlName = item.billId ? item.billId : '';
      this.relationshipForm.addControl(formControlName, new FormControl({value: item.relationship, disabled: LandingService.cwsTypeIndicator == '3'?true: this.disabledForm}));
      this.relationshipForm.controls[formControlName].setValue(item.relationship);
    });

    this.selectedRelationship.emit(this.policyMappingList);
    // if(this.disableRelationTo){
    //   this.setFormControlDisable(true)
    // }
  }

  onSelectRelationship(policyNumber: string, relationship: string) {
    this.policyMappingList = this.policyMappingList.map((item) => {
      if (item.policyNumber === policyNumber) {
        item.relationship = relationship;
        item.relationshipCode = this.service.getRelationshipCode(relationship);
      }

      return item;
    });

    this.selectedRelationship.emit(this.policyMappingList);
  }

  setFormControlDisable(disabled: boolean) {
    for (const key in this.relationshipForm.controls) {
      if (disabled) {
        this.relationshipForm.controls[key].disable();
      }else {
        LandingService.sysCWS?this.relationshipForm.controls[key].disable(): this.relationshipForm.controls[key].enable();
      }
    }
  }
}