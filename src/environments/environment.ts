// 開發環境的 API 路徑
// API host 動態跟著瀏覽器網址走：本機開 localhost:4200 → API 打 localhost:5142（跟原本一樣）；
// 手機/其他裝置連開發機的 dev server → API 自動指回同一台開發機（後端需綁 0.0.0.0 才連得到）。
// SSR 等沒有 location 的環境退回 localhost。
const devApiHost = typeof location !== 'undefined' ? location.hostname : 'localhost';

export const environment = {
  production: false,
  version: '2025/01/15_V1 09:30', // 手動設定的預設值
  showDebugToggleInMenu: true,
  BaseUrl: `http://${devApiHost}:5142`,
  ApiUrl: `http://${devApiHost}:5142`,
  // BaseUrl: 'https://localhost:7271',
  // ApiUrl: 'https://localhost:7271',

  // BaseUrl: 'https://10.3.11.6/TSRD_WEBAPI',
  // ApiUrl: 'https://10.3.11.6/TSRD_WEBAPI',

  // 品牌設定（南紡）。精誠版走 environment.systex.ts，兩版差異集中在這個物件。
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
