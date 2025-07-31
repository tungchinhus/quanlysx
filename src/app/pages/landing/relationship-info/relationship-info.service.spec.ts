import { TestBed } from '@angular/core/testing';
import { RelationshipInfoService } from './relationship-info.service';
import { PolicyInfo, RelationshipByPolicy } from '../models/payment.model';
import { CommonService } from 'src/app/shared/services/common.service';
import { Overlay } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';

describe('RelationshipInfoService', () => {
  let service: RelationshipInfoService;
  let commonService: CommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RelationshipInfoService, CommonService, Overlay,MatDialog], // Thêm Overlay vào danh sách phụ thuộc
    });
    service = TestBed.inject(RelationshipInfoService);
    commonService = TestBed.inject(CommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return relationship list', () => {
    const relationshipList = service.getRelationshipList();
    expect(relationshipList).toEqual(["policy-owner", "main-life-insured", "beneficiary"]);
  });

  it('should return empty list if policyInfo is undefined', () => {
    const mappingList = service.getMappingList(undefined, []);
    expect(mappingList).toEqual([]);
  });

  it('should return mapping list based on policyInfo and existed relationship', () => {
    const policyInfo: PolicyInfo = { rows: [{ policyNumber: 'P1', billAmount: 250 }] };
    const existedRelationship: RelationshipByPolicy[] = [{ policyNumber: 'P1', relationship: 'Owner', relationshipCode: 'O', billId: 'B1',isDisplay: true }];

    const mappingList = service.getMappingList(policyInfo, existedRelationship);
    expect(mappingList).toEqual([
      {
        policyNumber: 'P1',
        relationship: 'policy-owner',
        relationshipCode: 'O',
        billId: 'B1',
        isDisplay: false,
      }
    ]);
  });

  it('should check display relationship', () => {
    const policyMappingList: RelationshipByPolicy[] = [{ policyNumber: 'P1', relationship: 'policy-owner', relationshipCode: 'O', billId: 'B1',isDisplay: true }];
    const isDisplay = service.checkDisplayRelationship(policyMappingList);
    expect(isDisplay).toBe(true);
  });

  it('should get relationship code', () => {
    const relationCode = service.getRelationshipCode('policy-owner');
    expect(relationCode).toBe('O');
  });
})