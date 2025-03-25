
// 門市資訊
export interface StoreM {
  // 門市 ID
  id: number;
  // 屬於哪組織 ID
  ortId: number;
  // 店名縮寫(三碼)
  code: string;
  // 中文店名
  cName: string;
  // 英文店名
  eName: string;
  // 分店等級
  class: string;
  // 分店統一編號
  uniform: string | null;
  // 分店營業狀態
  status: string;
  // 電話號碼
  tel: string | null;
  // 傳真號碼
  fax: string | null;
  // 縣市ID
  sysbr00OId: number;
  // 鄉鎮區ID
  sysbr00Id: number;
  // 排序
  sort: number | null;
  // 地址
  address: string | null;
  area: string | null;
  floor: string | null;
  // 電子信箱
  email: string | null;
  // 分店負責人
  managerName: string | null;
  // 代幣幣值
  coinValue: number;
  // 經度
  longitude: number | null;
  // 緯度
  latitude: number | null;
  // 是否含湯姆貝貝
  isBaby: string;
  // 營業時間
  businessHours: string | null;
  // 開業時間
  startDate: string | null;
  // 停業時間
  closeDate: string | null;
  // 門店備註
  memo: string | null;
  // 分店種類一 (SYS1000直營店，加盟店)
  type1: string | null;
  // 分店種類二 (SYS1000獨立店，百貨店)
  type2: string | null;
  // 分店主機IP
  serverIp: string | null;
  // 分店主機名稱
  serverName: string | null;
  // 分店資料庫使用者
  dbUser: string | null;
  // 分店資料庫密碼
  dbPassword: string | null;
  // 分店資料庫連線名稱
  dbConnectName: string | null;
  // 分店資料庫名稱
  dbName: string | null;
  // facebook 連結
  facebookUrl: string | null;
  // line 連結
  lineUrl: string | null;
  // 建立時間
  crtDate: string | null;
  // 建立使用者ID
  crtUserId: number | null;
  // 更新時間
  updDate: string | null;
  // 更新使用者ID
  updUserId: number | null;
}

export interface Store {
  // 門市 ID
  id: number;
  // 中文店名
  cName: string;
  area: string | null;
  floor: string | null;
}
