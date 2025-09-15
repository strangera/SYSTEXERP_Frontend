// 開發環境的 API 路徑
export const environment = {
  production: false,
  version: '2025/01/15_V1 09:30', // 手動設定的預設值
  // AWSApiUrl: 'http://10.60.8.66/TSRD_WEBAPI',
  // AWSBaseUrl: 'http://10.60.8.66/TSRD_WEBAPI',
  BaseUrl: 'https://localhost:7271',
  ApiUrl: 'https://localhost:7271',
  // BaseUrl: 'http://10.7.55.13/TSRD_WEBAPI',
  // ApiUrl: 'http://10.7.55.13/TSRD_WEBAPI',
  // BaseUrl: 'https://43.207.4.99/TSRD_WEBAPIDEV',
  // ApiUrl: 'https://43.207.4.99/TSRD_WEBAPIDEV',
  // BaseUrl: 'https://10.3.11.2/TSRD_WEBAPIDEV',
  // ApiUrl: 'https://10.3.11.2/TSRD_WEBAPIDEV',
  // BaseUrl: 'https://localhost:44333',
  // ApiUrl: 'https://localhost:44333',
  // BaseUrl: 'http://localhost:5142',
  // ApiUrl: 'http://localhost:5142',


  PasswordKey: '8a9zx@a1231sdl!aafohc.u',
  PasswordIV: '12523648',
  APIKey:
    '7ea82465-9538-458d-8f9b-29244128e09609daeda1-0ac1-43f2-8a19-f765b2d02a2b',
  Service_Id: '01',
  Merchant_Id: '123456789012345',
  Terminal_Id: '88888888',
  timeout: 60,
  LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS: 'handleException.errors',
  pagesize: 12,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
