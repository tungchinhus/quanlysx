export interface OPolicyInfo {
  checked?: boolean;
  dueDate?: Date;
  policyNumber?: string;
  ownerName?: string;
  premiumType?: string;
  payAmount?: number;
  billAmount?: number;
  rows?: OPolicyInfo[];
}

export class PolicyInfo implements OPolicyInfo {
  checked?: boolean;
  dueDate?: Date;
  policyNumber?: string;
  ownerName?: string; //insured
  premiumType?: string; //paymentReason
  payAmount?: number;
  billAmount?: number;
  rows?: PolicyInfo[];
  billId?: string;
  relToOwner?: any;
}

export class searchQuery {
  policyNumber?: string;
  insuredName?: string; //insured
  insuredDob?: string;
  paymentReason?: string; //paymentReason
}

export interface OPayerInfo {
  name: string;
  email: string;
  dob: string;
  nationalIdType: string;
  nationalId: string;
}

export class PayerInfo implements OPayerInfo {
  name!: string;
  email!: string;
  dob!: string;
  nationalIdType!: string;
  nationalId!: string;
  gender!: string | undefined;
}

export interface OPaymentMethod {
  type: string;
  term: boolean;
}

export class PaymentMethod implements OPaymentMethod {
  type!: string;
  term!: boolean;
}

export interface OData {
  policyInfo?: OPolicyInfo;
  payerInfo?: OPayerInfo;
  paymentMethod?: OPaymentMethod;
}

export class Data implements OData {
  paymentTypeIndicator!: string;
  policyInfo!: PolicyInfo;
  relationshipByPolicy!: RelationshipByPolicy[];
  searchQuery!: searchQuery;
  payerInfo!: PayerInfo;
  paymentMethod!: PaymentMethod;
  addmore!: string;
  redirectData: any;
  policyInfoDisplayList!: PolicyInfoDisplay[];
  policySearchNum!: any;
  cwsPayor!: any;
  isCWS!: boolean;
  cwsPolicylst!: any;
  cwspolicyDefault!:any
  cwsTypeIndicator!:any
  cwsUrl!:any
}

export class RelationshipByPolicy {
  billId: string | undefined;
  policyNumber: string | undefined;
  relationship: string | undefined;
  relationshipCode: any;
  isDisplay: boolean;
  constructor(policyNumber: string | undefined, relationship: string | undefined, relationshipCode: string | undefined, billId: string | undefined, isDisplay: boolean) {
    this.billId = billId;
    this.policyNumber = policyNumber;
    this.relationship = relationship;
    this.relationshipCode = relationshipCode;
    this.isDisplay = isDisplay || false;
  }
}
export class TransactionRequest {
  policyInfo: PolicyInfo;
  payerInfo: PayerInfo;
  paymentMethod: string;
  relationList: RelationshipByPolicy[];
  additionalInfo: any
  
  constructor(policyInfo: PolicyInfo, payerInfo: PayerInfo, paymentMethod: string, relationList: RelationshipByPolicy[],additionalInfo: any) {
    this.policyInfo = policyInfo;
    this.payerInfo = payerInfo;
    this.paymentMethod = paymentMethod;
    this.relationList = relationList;
    this.additionalInfo = additionalInfo
  }
}

export class TransactionDataResponse {
  paymentData: any;
  paymentMethod: string;

  constructor(paymentData: any, paymentMethod: string) {
    this.paymentData = paymentData;
    this.paymentMethod = paymentMethod;
  }
}

export class PolicyInfoDisplay {
  [x: string]: unknown;
  policyNumber?: string;
  ownerName?: string;
  premiumType?: string;
  totalAmount?: number;
  billIds?: string[];

  constructor(policyNumber: string | undefined, ownerName: string | undefined, premiumType: string | undefined, totalAmount: number | undefined, billIds: string[] | undefined) {
    this.policyNumber = policyNumber;
    this.ownerName = ownerName;
    this.premiumType = premiumType;
    this.totalAmount = totalAmount;
    this.billIds = billIds;
  }
}