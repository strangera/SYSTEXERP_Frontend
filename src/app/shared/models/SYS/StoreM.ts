// 門市資訊
export interface StoreM {
  id: number;          // 門市 ID
  ortId: number;       // 屬於哪組織 ID
  code: string;        // 店名縮寫(三碼)
  cName: string;       // 中文店名
  eName: string;       // 英文店名
  class: string;       // 分店等級
  uniform: string | null; // 分店統一編號
  status: string;      // 分店營業狀態
  tel: string | null;    // 電話號碼
  fax: string | null;    // 傳真號碼
  sysbr00OId: number;  // 縣市ID
  sysbr00Id: number;   // 鄉鎮區ID
  sort: number | null;   // 排序
  address: string | null; // 地址
  area: string | null;
  floor: string | null;
  email: string | null;   // 電子信箱
  managerName: string | null; // 分店負責人
  coinValue: number;   // 代幣幣值
  longitude: number | null; // 經度
  latitude: number | null;  // 緯度
  isBaby: string;      // 是否含湯姆貝貝
  businessHours: string | null; // 營業時間
  startDate: string | null;   // 開業時間
  closeDate: string | null;   // 停業時間
  memo: string | null;      // 門店備註
  type1: string | null;     // 分店種類一 (SYS1000直營店，加盟店)
  type2: string | null;     // 分店種類二 (SYS1000獨立店，百貨店)
  serverIp: string | null;    // 分店主機IP
  serverName: string | null;  // 分店主機名稱
  dbUser: string | null;      // 分店資料庫使用者
  dbPassword: string | null;  // 分店資料庫密碼
  dbConnectName: string | null; // 分店資料庫連線名稱
  dbName: string | null;      // 分店資料庫名稱
  facebookUrl: string | null; // facebook 連結
  lineUrl: string | null;     // line 連結
  crtDate: string | null;    // 建立時間
  crtUserId: number | null;  // 建立使用者ID
  updDate: string | null;    // 更新時間
  updUserId: number | null;  // 更新使用者ID
}

export interface Store {
  id: number;          // 門市 ID
  cName: string;       // 中文店名
  area: string | null;
  floor: string | null;
}