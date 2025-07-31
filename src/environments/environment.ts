interface EnvironmentConfig {
    envName: string,
    production: boolean,
    apiUrl: string,
    appBaseHref: string,
    TOKEN_REQUEST_URL: string,
    CLIENT_KEY: string,
    CLIENT_SECRET: string,
    CLIENT_SCOPE: string;
    ACCESS_TOKEN_REQUEST_URL: string;
    redirectUrls: RedirectUrl[];
    stripe: {
        publishableKey: string;
        secretKey: string;
    };
}

interface RedirectUrl {
    source: string,
    url: string
}

export class Environment implements EnvironmentConfig {
    public readonly envName: string;
    public readonly production: boolean;
    public readonly apiUrl: string;
    public readonly appBaseHref: string;
    public readonly TOKEN_REQUEST_URL: string;
    public readonly CLIENT_KEY: string;
    public readonly CLIENT_SECRET: string;
    public readonly CLIENT_SCOPE: string;
    public readonly ACCESS_TOKEN_REQUEST_URL: string;
    public readonly redirectUrls: RedirectUrl[];
    public readonly stripe: {
        readonly publishableKey: string;
        readonly secretKey: string;
    };
    // public readonly newRelicConfig: {
    //     readonly accountID: string,
    //     readonly trustKey: string,
    //     readonly agentID: string,
    //     readonly licenseKey: string,
    //     readonly applicationID: string
    // }
    constructor(envConfig:EnvironmentConfig) {
        this.envName = envConfig.envName;
        this.production = envConfig.production;
        this.apiUrl = envConfig.apiUrl;
        this.appBaseHref = envConfig.appBaseHref
        this.TOKEN_REQUEST_URL = envConfig.TOKEN_REQUEST_URL;
        this.CLIENT_KEY = envConfig.CLIENT_KEY;
        this.CLIENT_SECRET = envConfig.CLIENT_SECRET;
        this.CLIENT_SCOPE = envConfig.CLIENT_SCOPE;
        this.ACCESS_TOKEN_REQUEST_URL = envConfig.ACCESS_TOKEN_REQUEST_URL;
        this.redirectUrls = envConfig.redirectUrls;
        this.stripe = {
            publishableKey: envConfig.stripe.publishableKey,
            secretKey: envConfig.stripe.secretKey
        };
        // this.newRelicConfig = {
        //     accountID: envConfig.newRelicConfig.accountID,
        //     trustKey: envConfig.newRelicConfig.trustKey,
        //     agentID: envConfig.newRelicConfig.agentID,
        //     licenseKey: envConfig.newRelicConfig.licenseKey,
        //     applicationID: envConfig.newRelicConfig.applicationID
        // };
    }
}

export const environment = {
  envName: 'development',
  production: false,
  apiUrl: 'http://localhost:4200',
  appBaseHref: '/quanlysx/',
  TOKEN_REQUEST_URL: 'your_token_request_url',
  CLIENT_KEY: 'your_client_key',
  CLIENT_SECRET: 'your_client_secret',
  CLIENT_SCOPE: 'your_client_scope',
  ACCESS_TOKEN_REQUEST_URL: 'your_access_token_request_url',
  redirectUrls: [],
  stripe: {
    publishableKey: 'your_publishable_key_here',
    secretKey: 'your_secret_key_here'
  }
};