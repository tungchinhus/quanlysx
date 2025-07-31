import { Injectable } from '@angular/core';
import { PolicyInfo, RelationshipByPolicy } from '../models/payment.model';
import { Constant } from 'src/app/constant/constant';
import { CommonService } from 'src/app/shared/services/common.service';

@Injectable({
  providedIn: 'root'
})
export class RelationshipInfoService {

  relationshipList: string[] = [
    "policy-owner",
    "main-life-insured",
    "beneficiary",
  ];

  relationshipMapping: Map<string, string> = new Map([
    ["policy-owner", "O"],
    ["main-life-insured", "I"],
    ["beneficiary", "B"],
  ]);

  constructor(public commonService: CommonService) { }
  
  /**
   * Return relationship list
   * @returns string[]
   */
  getRelationshipList(): string[] {
    return this.relationshipList;
  }

  /**
   * Get mapping list by policy info and existed relationship
   * If policyInfo is null or undefined then return empty list
   * If existedRelationship is not empty, return existedRelationship
   * Else return the mapping list by default value
   * @param policyInfo 
   * @param existedRelationship 
   * @returns RelationshipByPolicy[]
   */
  getMappingList(policyInfo: PolicyInfo | undefined, existedRelationship: RelationshipByPolicy[]): RelationshipByPolicy[] {
    // if(existedRelationship?.length > 0) {
    //   return existedRelationship;
    // }
    if (policyInfo ==  undefined || policyInfo == null || policyInfo.rows == undefined || policyInfo.rows == null ) return [];
    const { rows } = policyInfo;
    let policyMap = new Map<string, number>();
    let policyMapShowing = new Map<string, string>();
    rows.forEach((item) => {
      const key = item.policyNumber as string;
      if(policyMap.has(key)) {
        let totalBill = policyMap.get(key) as number;
        totalBill += item.billAmount ? item.billAmount : 0;
        policyMap.set(key, totalBill);
      } else {
        policyMap.set(key, item.billAmount ? item.billAmount : 0);
      }
    });
    return rows.filter((item) => {
      if(item.policyNumber) {
        const billAmount = policyMap.get(item.policyNumber);
        return billAmount ? billAmount > this.commonService.dataConfig.TWO_HUNDRED_MILLION : false;
      }
      return false;
    }).map((item) => {
      const key = item.policyNumber as string;
      let relOwner = this.relationshipList[0];

      for (let indx = 0; indx < existedRelationship.length; indx++) {
        for (const [display, value] of this.relationshipMapping.entries()) {
        if(!item.relToOwner && existedRelationship[indx].billId == item.billId){
          relOwner = existedRelationship[indx]?.relationship as string;
        } else{
            if (value === item.relToOwner) {
              relOwner = display;
            }
        }
      }
      }      
      const relationshipByPolicy = new RelationshipByPolicy(item.policyNumber, relOwner, this.getRelationshipCode(relOwner), item.billId, !policyMapShowing.has(key));
      policyMapShowing.set(key, 'existed');

      return relationshipByPolicy;
    });
  }

  /**
   *  Check display relationship
   *  @param policyMappingList
   *  @return boolean
   */
   checkDisplayRelationship(policyMappingList: RelationshipByPolicy[]): boolean {
    return policyMappingList.length > 0
  }

  /**
   * Get mapping value from relation list
   * 
   * @param relation 
   * @returns String
   */
  getRelationshipCode(relation: string): string | undefined {
    return this.relationshipMapping.get(relation);
  }

}
