// 生產環境的 API 路徑
export const environment = {
  production: true,
  showDebugToggleInMenu: true,
  version: '@@BUILD_VERSION@@', // 手動設定的預設值
  BaseUrl: '/TSRD_WEBAPI',
  ApiUrl: '/TSRD_WEBAPI',
  // 品牌設定（南紡）。精誠正式版走 environment.systex.ts。
  brand: {
    companyFullName: '南紡流通事業股份有限公司(南紡購物中心)',
    companyName: '南紡流通事業股份有限公司',
    title: '南紡管理平台',
    documentTitle: '南紡購物中心 | 商場管理系統',
    logo: 'assets/layout/images/logo.webp',
    loginLogo: 'assets/layout/images/login_logo.webp',
    walletName: '南紡錢包',
  },
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
  devPassword: '53472035',
};
