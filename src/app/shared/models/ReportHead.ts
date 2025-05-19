// 不使用
export interface ReportHead {
  exporttime?: Date | string;    //報表產出時間
  exportuser?: string;            //使用者
  systemtime?: Date | string;     //系統日期
  reporttitle?: string;           //報表名稱
  reportname?: string;            //報表檔名
  outputvisible: boolean;         //是否只匯出顯示欄位
}
