import { Environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment';

export class ApiConstant {
  private static apis = {
    getPolicies: '/quanlysx/assets/data/data.json',
    payment: 'https://sea-emt-dev-api.ap.manulife.com/ext/vn-payment-bff-service/v1/payments/search',
    initPayment: 'https://sea-emt-dev-api.ap.manulife.com/ext/vn-payment-bff-service/v1/payment/gateway',
    printReceipt:'https://sea-emt-dev-api.ap.manulife.com/ext/vn-payment-bff-service/v1/payment/order/pdf',
    transactionStatus: 'https://sea-emt-dev-api.ap.manulife.com/ext/vn-payment-bff-service/v1/payment/order',//v1/payment/status'
    getTranInfo: 'https://sea-emt-dev-api.ap.manulife.com/ext/vn-payment-bff-service/v1/payment/receipt',
    transStatusUpdate: 'https://sea-emt-dev-api.ap.manulife.com/ext/vn-payment-bff-service/v1/payment/status',
    getMaintenance: 'https://sea-emt-dev-api.ap.manulife.com/ext/vn-payment-bff-service/v1/system/status',
    getSessionDetailCWS: 'https://sea-emt-dev-api.ap.manulife.com/ext/vn-payment-bff-service/v1/ses-map',
    getConfig: 'https://sea-emt-dev-api.ap.manulife.com/ext/vn-payment-bff-service/v1/config'
  };
  public static getApiUrl = (propName: string) => {
    const env = new Environment(environment);
    const api = ApiConstant.apis[propName as keyof typeof ApiConstant.apis];
    return `${env.apiUrl}${api}`;
  };
}
