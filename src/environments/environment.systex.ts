// 精誠 (SYSTEX) 正式環境的 API 路徑
// 這支是 environment.prod.ts 的鏡像，只有 brand 物件換成精誠。
// 若 demo 後端網址與南紡不同，改下面的 BaseUrl / ApiUrl 即可。
export const environment = {
  production: true,
  showDebugToggleInMenu: true,
  version: '@@BUILD_VERSION@@', // 由 pre-build.js 寫入
  BaseUrl: '/TSRDWEB', // Demo：/TSRDWEB，合群：/SYSTEXWEB
  ApiUrl: '/TSRD_WEBAPI', // Demo：/TSRD_WEBAPI，合群：/SYSTEX_WEBAPI
  // 品牌設定（精誠）。
  brand: {
    companyFullName: '精誠資訊',
    companyName: '精誠資訊',
    title: '精誠資訊',
    documentTitle: '精誠資訊 | 商場管理系統',
    logo: 'assets/layout/images/logo-systex.webp',
    loginLogo: 'assets/layout/images/logo-systex.webp',
    walletName: '精誠錢包',
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
