// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// 生產環境的 API 路徑
export const environment = {
  production: false,
  ApiUrl: 'http://localhost:4200',//'http://localhost:7205',
  BaseUrl: 'http://43.207.4.99/TSRDWEB',
  AWSApiUrl: 'http://43.207.4.99/TSRDWEB',
  AWSBaseUrl: 'http://43.207.4.99/TSRDWEB',
  PasswordKey: '8a9zx@a1231sdl!aafohc.u',
  PasswordIV: '12523648',
  APIKey: '7ea82465-9538-458d-8f9b-29244128e09609daeda1-0ac1-43f2-8a19-f765b2d02a2b',
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
