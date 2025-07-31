import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Data, PayerInfo, PolicyInfo, RelationshipByPolicy } from '../models/payment.model';
import { RelationshipInfoService } from '../relationship-info/relationship-info.service';
import { PayerInfoService } from './payer-info.service';
import { LandingService } from '../landing.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-payer-info',
  templateUrl: './payer-info.component.html',
  styleUrls: ['./payer-info.component.scss']
})
export class PayerInfoComponent implements OnInit{
  @Input() data!: Data;
  policyInfo!: PolicyInfo;
  totalAmount: number = 0;
  isFormValid: boolean = false;
  documentInputMaxlength: number = 12; // Default
  selectedDocumentType = '4'; // Default
  payerInfo!: PayerInfo;
  relationshipByPolicy: RelationshipByPolicy[] = [];
  isDisplayRelationship: boolean = false;
  isdisabledForm: boolean = false;
  isCWS: boolean = false;
  payeridType = ["7","2","3","1"];
  cwsIdType = ''
  RelationTo =false;

  constructor(
    private service: PayerInfoService,
    private relationshipInfoService: RelationshipInfoService,
    private landingService: LandingService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.RelationTo =false;
    this.policyInfo = this.service.getPolicyInfo(this.data) ?? new PolicyInfo();
    this.totalAmount = this.service.getTotalAmount(this.policyInfo);
    this.payerInfo = new PayerInfo();    

    if(this.data.cwsPayor){
      this.cwsIdType = this.data.cwsPayor.idType;
      this.payerInfo = {
        name: this.data.cwsPayor.name,
        dob: this.data.cwsPayor.birthDateStr,
        gender: this.data.cwsPayor.gender,
        email: this.data.cwsPayor.idType == '4'? '':this.data.cwsPayor.email,
        nationalIdType: this.data.cwsPayor.idType == '4' || this.data.cwsPayor.idType == '6'? '7':this.data.cwsPayor.idType,
        nationalId: this.data.cwsPayor.idType == '4' || this.data.cwsPayor.idType == '6'? '':this.data.cwsPayor.identifier
      };
      this.isdisabledForm = this.data.cwsPayor.idType == '4' || this.data.cwsPayor.idType == '6'? false :true;
    }
  }

  next() {
    if(this.data.cwsPayor){
      CommonService.cwsViewMode = true;
      this.landingService.pushEvent({
        step: 'payer-info-integrate',
        data: {
          policyInfo: this.policyInfo,
          payerInfo: this.payerInfo,
          paymentMethod: null,
          relationshipByPolicy: this.relationshipByPolicy,
        }
      });
    } else {
      this.service.confirmPayerInfo(this.policyInfo, this.payerInfo, this.relationshipByPolicy);
    }
    
  }

  cancelTransaction() {
    this.service.cancelTransaction();
  }

  onPayerInfoChange(value: PayerInfo) {    
    this.payerInfo = value;
  }

  onPayerFormValid(value: boolean) {
    this.isFormValid = value;
  }

  onSelectRelationship(value: RelationshipByPolicy[]) {
    this.relationshipByPolicy = value;
    // move alert here
    const policyMappingList = this.relationshipInfoService.getMappingList(this.policyInfo, this.relationshipByPolicy);
    this.isDisplayRelationship = this.relationshipInfoService.checkDisplayRelationship(policyMappingList);
    this.cd.detectChanges();
  }

}