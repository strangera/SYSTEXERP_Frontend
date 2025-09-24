import { Tls13070Response } from "@service/api/tls/tls13070.service";

export interface ReportColumn {
  field: string;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  visible?: boolean;  // 是否顯示 (可篩選欄位是否顯示？)
  format?: (value: any, index?: number, rowData?: any) => string | number | null; // 格式化(日期、時間...)
  exportFormat?: Record<string, string>[];
  groupField?: string; //
  isSubTotal?: boolean; // 是否為小計欄位
  isTotal?: boolean; // 是否為總計欄位
  showSort?: boolean;
  sortField?: string; // 排序欄位(預設為 field)
  disabled?: (value: any) => boolean;  // 是否禁用 (是否為禁用欄位)
  validate?: ((value: string, rowData: any, data: any[], field: string, header: string) => { isValid: boolean, errorMessage: string[]; })[]; // 驗證規則(如果是可輸入的欄位)
}

export interface ColumnGroup {
  field: string;
  header: string;
  align?: 'left' | 'center' | 'right';
}


export const data: Tls13070Response[] = [
  {
    "id": 9151,
    "talent_id": 9151,
    "apply_no": "0000000000",
    "upd_date": "2025-09-22T11:52:19.863",
    "VEN_Name": "南紡流通服務台",
    "ven_uniform": "00000000",
    "tlt_name": "階梯抽成測試資料",
    "tlt_no": "002766",
    "tlt_contract_bdate": "2025-09-01T00:00:00",
    "tlt_contract_edate": "2027-09-30T00:00:00",
    "expiration_fees": 0,
    "total_amt": null,
    "check_day": 0,
    "tlt_remark": "",
    "locationList": [
      {
        "talent_id": 9151,
        "location_no": "B1Z03",
        "tlt_space": 9.2
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 9200,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 506,
    "talent_id": 69072213,
    "apply_no": "00000001",
    "upd_date": "2015-06-09T15:09:07",
    "VEN_Name": "香港商酷彩法廚有限公司臺灣分公司",
    "ven_uniform": "28431141",
    "tlt_name": "LE CREUSET",
    "tlt_no": "000021",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 10000000,
    "check_day": 45,
    "tlt_remark": null,
    "locationList": [
      {
        "talent_id": 69072213,
        "location_no": "B1E16",
        "tlt_space": 8.2
      }
    ],
    "posList": [
      {
        "ECR_No": "000211",
        "ECR_TLT_No": "000021",
        "ECR_TLT_Name": "LE CREUSET"
      }
    ],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 2460,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 700,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 820,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 820,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 164000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 881,
    "talent_id": 138616202,
    "apply_no": "00000002",
    "upd_date": "2016-05-29T10:34:56",
    "VEN_Name": "高雄空廚股份有限公司",
    "ven_uniform": "70750455",
    "tlt_name": "高雄空廚",
    "tlt_no": "000233",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 25000000,
    "check_day": 45,
    "tlt_remark": "履約保證金:\r\n準時開業保證金:200000元；契約屆滿保證金:200000元。\r\n2016.06.02起新增一卡通手續費2%",
    "locationList": [
      {
        "talent_id": 138616202,
        "location_no": "B1B05",
        "tlt_space": 7.1
      }
    ],
    "posList": [
      {
        "ECR_No": "002331",
        "ECR_TLT_No": "000233",
        "ECR_TLT_Name": "高雄空廚"
      }
    ],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 10650,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 2485,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 1600,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 710000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 30,
    "talent_id": 43329113,
    "apply_no": "00000003",
    "upd_date": "2014-12-12T10:18:55",
    "VEN_Name": "伸地實業股份有限公司",
    "ven_uniform": "30948093",
    "tlt_name": "single noble",
    "tlt_no": "000068",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 8500000,
    "check_day": 45,
    "tlt_remark": "契約屆滿；198000\r\n",
    "locationList": [
      {
        "talent_id": 43329113,
        "location_no": "F2E28",
        "tlt_space": 19.8
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 11880,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 6930,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 6930,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 495000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 72,
    "talent_id": 43233583,
    "apply_no": "00000004",
    "upd_date": "2014-12-06T12:16:39",
    "VEN_Name": "娃娃城股份有限公司",
    "ven_uniform": "84132618",
    "tlt_name": "Baby City",
    "tlt_no": "000094",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2017-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 15000000,
    "check_day": 45,
    "tlt_remark": null,
    "locationList": [
      {
        "talent_id": 43233583,
        "location_no": "F4C03",
        "tlt_space": 34.2
      }
    ],
    "posList": [
      {
        "ECR_No": "000941",
        "ECR_TLT_No": "000094",
        "ECR_TLT_Name": "Baby City"
      }
    ],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 11970,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 10260,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 513000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 78,
    "talent_id": 43232646,
    "apply_no": "00000005",
    "upd_date": "2014-12-06T11:44:45",
    "VEN_Name": "台象股份有限公司",
    "ven_uniform": "13100376",
    "tlt_name": "ZOJIRUSHI 象印",
    "tlt_no": "000023",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 12000000,
    "check_day": 45,
    "tlt_remark": "履約保證:95000準時開業；95000契約屆滿",
    "locationList": [
      {
        "talent_id": 43232646,
        "location_no": "B1E21",
        "tlt_space": 9.5
      }
    ],
    "posList": [
      {
        "ECR_No": "000231",
        "ECR_TLT_No": "000023",
        "ECR_TLT_Name": "象印"
      }
    ],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 1500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 1500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 95000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 444,
    "talent_id": 52039206,
    "apply_no": "00000006",
    "upd_date": "2015-02-25T11:56:36",
    "VEN_Name": "棨泰健康科技股份有限公司",
    "ven_uniform": "84336367",
    "tlt_name": "富士按摩椅",
    "tlt_no": "000011",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 20000000,
    "check_day": 45,
    "tlt_remark": "履約保證；134000準時開業；134000契約屆滿",
    "locationList": [
      {
        "talent_id": 52039206,
        "location_no": "B1E02",
        "tlt_space": 13.4
      }
    ],
    "posList": [
      {
        "ECR_No": "000111",
        "ECR_TLT_No": "000011",
        "ECR_TLT_Name": "FUJI按摩椅"
      },
      {
        "ECR_No": "000112",
        "ECR_TLT_No": "000011",
        "ECR_TLT_Name": "FUJI按摩椅"
      }
    ],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 8040,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 4690,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 4690,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 536000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 1511,
    "talent_id": 196600444,
    "apply_no": "00000007",
    "upd_date": "2017-06-30T16:47:40",
    "VEN_Name": "一亨運動用品股份有限公司",
    "ven_uniform": "16102448",
    "tlt_name": "adidas",
    "tlt_no": "000076",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2017-06-30T00:00:00",
    "expiration_fees": null,
    "total_amt": 30000000,
    "check_day": 45,
    "tlt_remark": null,
    "locationList": [
      {
        "talent_id": 196600444,
        "location_no": "F3C01",
        "tlt_space": 35.2
      },
      {
        "talent_id": 196600444,
        "location_no": "F3C02",
        "tlt_space": 41.7
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 23070,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 23070,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 641200,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 351,
    "talent_id": 43362363,
    "apply_no": "00000008",
    "upd_date": "2014-12-16T16:31:35",
    "VEN_Name": "愛視優貿易有限公司",
    "ven_uniform": "54668389",
    "tlt_name": "ICU",
    "tlt_no": "000357",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2015-01-31T00:00:00",
    "expiration_fees": null,
    "total_amt": 350000,
    "check_day": 45,
    "tlt_remark": "履約保證金:\r\n1.準時開業保證金:23000元\r\n2.契約屆滿保證金:46000元",
    "locationList": [
      {
        "talent_id": 43362363,
        "location_no": "F1E02",
        "tlt_space": 4.6
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 2760,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 1610,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 1610,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 5000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 301,
    "talent_id": 151893606,
    "apply_no": "00000009",
    "upd_date": "2016-08-10T10:37:14",
    "VEN_Name": "中裕興業股份有限公司",
    "ven_uniform": "86206038",
    "tlt_name": "粘果 綠森",
    "tlt_no": "000107",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 10000000,
    "check_day": 45,
    "tlt_remark": "履約保證:92000準時開業；184000契約屆滿\r\n2016/02/18變更公司地址",
    "locationList": [
      {
        "talent_id": 151893606,
        "location_no": "F4E21",
        "tlt_space": 9.2
      },
      {
        "talent_id": 151893606,
        "location_no": "F4E22",
        "tlt_space": 9.2
      }
    ],
    "posList": [
      {
        "ECR_No": "001071",
        "ECR_TLT_No": "000107",
        "ECR_TLT_Name": "綠森藝術DIY"
      }
    ],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 11040,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 6440,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 6440,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 294400,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 359,
    "talent_id": 43569983,
    "apply_no": "00000010",
    "upd_date": "2014-12-22T19:46:17",
    "VEN_Name": "滿心企業股份有限公司",
    "ven_uniform": "12498877",
    "tlt_name": "Munsingwear/Felix Buhler",
    "tlt_no": "000249",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2017-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 15000000,
    "check_day": 45,
    "tlt_remark": "履約保證金:\r\n契約屆滿保證金:50000元。",
    "locationList": [
      {
        "talent_id": 43569983,
        "location_no": "F3C10",
        "tlt_space": 38.2
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 458400,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 4116,
    "talent_id": 288973962,
    "apply_no": "00000011",
    "upd_date": "2019-09-13T11:38:16",
    "VEN_Name": "台灣玩具反斗城貿易股份有限公司",
    "ven_uniform": "23167157",
    "tlt_name": "玩具反斗城ToysRus",
    "tlt_no": "000327",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2019-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 36000000,
    "check_day": 15,
    "tlt_remark": null,
    "locationList": [
      {
        "talent_id": 288973962,
        "location_no": "F4B04",
        "tlt_space": 303.8
      }
    ],
    "posList": [
      {
        "ECR_No": "003271",
        "ECR_TLT_No": "000327",
        "ECR_TLT_Name": "玩具反斗城ToysRus"
      },
      {
        "ECR_No": "003272",
        "ECR_TLT_No": "000327",
        "ECR_TLT_Name": "玩具反斗城ToysRus"
      },
      {
        "ECR_No": "003273",
        "ECR_TLT_No": "000327",
        "ECR_TLT_Name": "玩具反斗城ToysRus"
      }
    ],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 20000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 2000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 2000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 45570,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 150000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 319,
    "talent_id": 43232858,
    "apply_no": "00000012",
    "upd_date": "2014-12-06T11:42:33",
    "VEN_Name": "虎記股份有限公司",
    "ven_uniform": "23528997",
    "tlt_name": "TIGER 虎牌",
    "tlt_no": "000022",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 9000000,
    "check_day": 45,
    "tlt_remark": "履約保證:82000準時開業",
    "locationList": [
      {
        "talent_id": 43232858,
        "location_no": "B1E18",
        "tlt_space": 8.2
      }
    ],
    "posList": [
      {
        "ECR_No": "000221",
        "ECR_TLT_No": "000022",
        "ECR_TLT_Name": "虎牌"
      }
    ],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 1500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 1500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 2000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 65600,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 836,
    "talent_id": 119534590,
    "apply_no": "00000013",
    "upd_date": "2016-02-12T15:58:57",
    "VEN_Name": "滿心企業股份有限公司",
    "ven_uniform": "12498877",
    "tlt_name": "McGREGOR",
    "tlt_no": "000228",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 6000000,
    "check_day": 45,
    "tlt_remark": null,
    "locationList": [
      {
        "talent_id": 119534590,
        "location_no": "F3E05",
        "tlt_space": 15.1
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 1500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 4000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 241600,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 367,
    "talent_id": 44502214,
    "apply_no": "00000014",
    "upd_date": "2014-12-30T16:17:56",
    "VEN_Name": "多田企業有限公司",
    "ven_uniform": "70573521",
    "tlt_name": "epanouir",
    "tlt_no": "000061",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 8000000,
    "check_day": 45,
    "tlt_remark": "履約保證金:227000契約屆滿",
    "locationList": [
      {
        "talent_id": 44502214,
        "location_no": "F2E13",
        "tlt_space": 15
      },
      {
        "talent_id": 44502214,
        "location_no": "F2E12",
        "tlt_space": 7.7
      }
    ],
    "posList": [
      {
        "ECR_No": "000611",
        "ECR_TLT_No": "000061",
        "ECR_TLT_Name": "epanouir"
      }
    ],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 13620,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 8000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 8000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 6810,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 6810,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 454000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 236,
    "talent_id": 43561104,
    "apply_no": "00000015",
    "upd_date": "2014-12-19T15:43:47",
    "VEN_Name": "城企國際有限公司",
    "ven_uniform": "27463355",
    "tlt_name": "Dailo Shop",
    "tlt_no": "000066",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 12000000,
    "check_day": 45,
    "tlt_remark": "準時開業：284000",
    "locationList": [
      {
        "talent_id": 43561104,
        "location_no": "F2C03",
        "tlt_space": 21.3
      }
    ],
    "posList": [
      {
        "ECR_No": "000661",
        "ECR_TLT_No": "000066",
        "ECR_TLT_Name": "Dailo shop"
      }
    ],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 12780,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 6390,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 340800,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 251,
    "talent_id": 43231358,
    "apply_no": "00000016",
    "upd_date": "2014-12-06T09:25:33",
    "VEN_Name": "貝登堡國際股份有限公司",
    "ven_uniform": "84748403",
    "tlt_name": "貝登堡",
    "tlt_no": "000106",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 15000000,
    "check_day": 45,
    "tlt_remark": "履約保證金:137000準時開業；274000契約屆滿",
    "locationList": [
      {
        "talent_id": 43231358,
        "location_no": "F4E19",
        "tlt_space": 13.7
      },
      {
        "talent_id": 43231358,
        "location_no": "F4E20",
        "tlt_space": 13.7
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 16440,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 4000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 8220,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 8220,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 1096000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 268,
    "talent_id": 43337500,
    "apply_no": "00000017",
    "upd_date": "2014-12-13T13:00:12",
    "VEN_Name": "傲旎全球股份有限公司",
    "ven_uniform": "27952240",
    "tlt_name": "GNC",
    "tlt_no": "000248",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2015-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 9000000,
    "check_day": 45,
    "tlt_remark": "履約保證金:\r\n準時開業保證金:33500元；契約屆滿保證金:67000元。",
    "locationList": [
      {
        "talent_id": 43337500,
        "location_no": "B1E52",
        "tlt_space": 6.7
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 4020,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 2345,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 2345,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 67000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 22,
    "talent_id": 43230373,
    "apply_no": "00000018",
    "upd_date": "2014-12-05T18:36:08",
    "VEN_Name": "喬尼亞興業有限公司",
    "ven_uniform": "24311258",
    "tlt_name": "JUNIOR COFFEE",
    "tlt_no": "000024",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 10000000,
    "check_day": 45,
    "tlt_remark": "履約保證金:95000準時開業；95000契約屆滿",
    "locationList": [
      {
        "talent_id": 43230373,
        "location_no": "B1E22",
        "tlt_space": 9.5
      }
    ],
    "posList": [
      {
        "ECR_No": "000241",
        "ECR_TLT_No": "000024",
        "ECR_TLT_Name": "JUNIOR COFFEE"
      }
    ],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 5700,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 3325,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 3325,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 190000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 34,
    "talent_id": 43329403,
    "apply_no": "00000019",
    "upd_date": "2014-12-12T11:13:42",
    "VEN_Name": "瑰珀翠國際有限公司",
    "ven_uniform": "28701377",
    "tlt_name": "Steiff",
    "tlt_no": "000095",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2017-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 10000000,
    "check_day": 45,
    "tlt_remark": "履約保證:82500準時開業；165000契約屆滿",
    "locationList": [
      {
        "talent_id": 43329403,
        "location_no": "F4C04",
        "tlt_space": 16.5
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 5775,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 4950,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 148500,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 990,
    "talent_id": 153920218,
    "apply_no": "00000020",
    "upd_date": "2016-08-30T11:30:53",
    "VEN_Name": "軟盟國際流行事業有限公司",
    "ven_uniform": "27331593",
    "tlt_name": "Lilliputiens 力力布丁",
    "tlt_no": "000125",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 10000000,
    "check_day": 45,
    "tlt_remark": "2016.08.27更改抽成條件:2015年簽呈699號",
    "locationList": [
      {
        "talent_id": 153920218,
        "location_no": "F4E23",
        "tlt_space": 9.2
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 5520,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 3220,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 2760,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 276000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 878,
    "talent_id": 158331211,
    "apply_no": "00000021",
    "upd_date": "2016-09-25T11:58:38",
    "VEN_Name": "創信股份有限公司",
    "ven_uniform": "20849209",
    "tlt_name": "創信",
    "tlt_no": "000110",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 6000000,
    "check_day": 45,
    "tlt_remark": "第二年調降包底，抽成額需人工判斷",
    "locationList": [
      {
        "talent_id": 158331211,
        "location_no": "F4E26",
        "tlt_space": 10.4
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 6240,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 3120,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 3120,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 171600,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 165,
    "talent_id": 43336736,
    "apply_no": "00000022",
    "upd_date": "2014-12-13T11:10:27",
    "VEN_Name": "豆鄉商號：周素足",
    "ven_uniform": "10192800",
    "tlt_name": "同記安平豆花",
    "tlt_no": "000261",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2015-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 5000000,
    "check_day": 45,
    "tlt_remark": "履約保證；50000元準時開業;50000元契約屆滿",
    "locationList": [
      {
        "talent_id": 43336736,
        "location_no": "B1E29",
        "tlt_space": 3.3
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 1980,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 1155,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 1155,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 1155,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 132000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 317,
    "talent_id": 43232828,
    "apply_no": "00000023",
    "upd_date": "2014-12-06T11:41:22",
    "VEN_Name": "亞進企業有限公司",
    "ven_uniform": "23644320",
    "tlt_name": "HOMEWORKING",
    "tlt_no": "000015",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 8000000,
    "check_day": 45,
    "tlt_remark": "履約保證:64000準時開業；64000契約屆滿",
    "locationList": [
      {
        "talent_id": 43232828,
        "location_no": "B1E06",
        "tlt_space": 6.4
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 3840,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 2240,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 2240,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 240000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 617,
    "talent_id": 158331127,
    "apply_no": "00000024",
    "upd_date": "2016-09-25T11:52:22",
    "VEN_Name": "美固達企業有限公司",
    "ven_uniform": "28922717",
    "tlt_name": "SWAN",
    "tlt_no": "000109",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 7000000,
    "check_day": 45,
    "tlt_remark": "履約保證:52000準時開業；104000契約屆滿\r\n2016年包底原400萬調降320萬，其餘抽成人工判斷",
    "locationList": [
      {
        "talent_id": 158331127,
        "location_no": "F4E25",
        "tlt_space": 10.4
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 6240,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 3120,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 3120,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 166400,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 1047,
    "talent_id": 158331921,
    "apply_no": "00000025",
    "upd_date": "2016-09-25T13:26:26",
    "VEN_Name": "利聖國際股份有限公司",
    "ven_uniform": "80053680",
    "tlt_name": "ohoh-mini",
    "tlt_no": "000113",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 8000000,
    "check_day": 45,
    "tlt_remark": "2016/02/18變更公司地址\r\n第二年調降包底，底租要人工計算",
    "locationList": [
      {
        "talent_id": 158331921,
        "location_no": "F4E29",
        "tlt_space": 16.1
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 9660,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 5635,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 5635,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 257600,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 882,
    "talent_id": 138616233,
    "apply_no": "00000026",
    "upd_date": "2016-05-29T10:35:38",
    "VEN_Name": "豆腐村有限公司",
    "ven_uniform": "53221376",
    "tlt_name": "雪嶽山韓式料理",
    "tlt_no": "000277",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2016-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 32000000,
    "check_day": 45,
    "tlt_remark": "契約屆滿；500000\r\n準時開業：500000\r\n2016.06.02起新增一卡通手續費2%",
    "locationList": [
      {
        "talent_id": 138616233,
        "location_no": "B1B03",
        "tlt_space": 20.8
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 20000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 31200,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 20000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 20000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 7280,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 1248000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 262,
    "talent_id": 59012384,
    "apply_no": "00000027",
    "upd_date": "2015-04-18T15:12:08",
    "VEN_Name": "城楓食品坊",
    "ven_uniform": "37557676",
    "tlt_name": "斑鳩的窩",
    "tlt_no": "000007",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2015-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 15000000,
    "check_day": 45,
    "tlt_remark": null,
    "locationList": [
      {
        "talent_id": 59012384,
        "location_no": "B1B18",
        "tlt_space": 9.2
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 13800,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 3220,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 1600,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 460000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 2532,
    "talent_id": 194348423,
    "apply_no": "00000028",
    "upd_date": "2017-06-06T14:05:55",
    "VEN_Name": "東京牛角股份有限公司",
    "ven_uniform": "13134072",
    "tlt_name": "牛角 Gyu-Kaku",
    "tlt_no": "000120",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2017-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 30000000,
    "check_day": 45,
    "tlt_remark": "履約保證；702000準時開業；702000契約屆滿\r\n2016.03.16更新郵寄地址。",
    "locationList": [
      {
        "talent_id": 194348423,
        "location_no": "F5C04",
        "tlt_space": 70.2
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 20000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 28080,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 2600,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 5000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 20000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 20000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 24570,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 1053000,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  },
  {
    "id": 185,
    "talent_id": 43561515,
    "apply_no": "00000029",
    "upd_date": "2014-12-19T19:14:37",
    "VEN_Name": "關北企業有限公司",
    "ven_uniform": "24375652",
    "tlt_name": "關北紅豆餅",
    "tlt_no": "000031",
    "tlt_contract_bdate": "2014-12-28T00:00:00",
    "tlt_contract_edate": "2015-12-29T00:00:00",
    "expiration_fees": null,
    "total_amt": 6500000,
    "check_day": 45,
    "tlt_remark": null,
    "locationList": [
      {
        "talent_id": 43561515,
        "location_no": "B1E43",
        "tlt_space": 6.5
      }
    ],
    "posList": [],
    "rentList": [],
    "fareList": [
      {
        "CAP_Item": "A01",
        "CAP_Name": "開幕贊助費",
        "tpy_amount": 10000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A02",
        "CAP_Name": "識別證",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A03",
        "CAP_Name": "影印費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A04",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A05",
        "CAP_Name": "發票費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A06",
        "CAP_Name": "花車、道具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A07",
        "CAP_Name": "免洗餐具",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A08",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A09",
        "CAP_Name": "檢驗費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A10",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A11",
        "CAP_Name": "美工POP",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A12",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A13",
        "CAP_Name": "DM名條",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A14",
        "CAP_Name": "郵資-活動郵寄",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A15",
        "CAP_Name": "簡訊宣傳費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A16",
        "CAP_Name": "修繕費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A17",
        "CAP_Name": "B,C工程費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A18",
        "CAP_Name": "消檢費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A19",
        "CAP_Name": "圖審費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A20",
        "CAP_Name": "封板施工",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A21",
        "CAP_Name": "取餐CALL機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A22",
        "CAP_Name": "排油煙設備清潔維護",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A23",
        "CAP_Name": "水電清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A24",
        "CAP_Name": "滿千送百分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A25",
        "CAP_Name": "技師送審規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A26",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A27",
        "CAP_Name": "消防系統費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A28",
        "CAP_Name": "裝修期間租金<列管使用>",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A29",
        "CAP_Name": "檔期贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A30",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A31",
        "CAP_Name": "空調冰水費?",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A32",
        "CAP_Name": "裝修工程管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A33",
        "CAP_Name": "行銷贊助",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A34",
        "CAP_Name": "戶外店招",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A36",
        "CAP_Name": "嚴選金流手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A37",
        "CAP_Name": "滿千送佰-定額(春節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A38",
        "CAP_Name": "滿千送佰-定額(父親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A39",
        "CAP_Name": "一二三四五六七八九十",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "A40",
        "CAP_Name": "132",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B01",
        "CAP_Name": "公區管理費",
        "tpy_amount": 3900,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B02",
        "CAP_Name": "停車場分攤",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B03",
        "CAP_Name": "資訊管理系統維護費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B04",
        "CAP_Name": "POS租金",
        "tpy_amount": 2500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B05",
        "CAP_Name": "冷凍櫃租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B06",
        "CAP_Name": "倉庫租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B07",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B08",
        "CAP_Name": "春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B09",
        "CAP_Name": "週年慶贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B10",
        "CAP_Name": "母親節贊助費",
        "tpy_amount": 6000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B11",
        "CAP_Name": "年中慶贊助費",
        "tpy_amount": 3000,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B13",
        "CAP_Name": "固定租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B14",
        "CAP_Name": "清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B15",
        "CAP_Name": "場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B16",
        "CAP_Name": "燈箱",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B17",
        "CAP_Name": "手續費-匯款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B18",
        "CAP_Name": "自來水費",
        "tpy_amount": 500,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B19",
        "CAP_Name": "電力費用",
        "tpy_amount": 2275,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B20",
        "CAP_Name": "瓦斯費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 2275,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B22",
        "CAP_Name": "戶外店招費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B23",
        "CAP_Name": "滿千送佰-定額(母親節)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B24",
        "CAP_Name": "滿千送佰-定額(週年慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B25",
        "CAP_Name": "紙袋、包裝費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B26",
        "CAP_Name": "公區清潔費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B27",
        "CAP_Name": "取餐呼叫器",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B28",
        "CAP_Name": "滿千送佰-定額(年中慶)",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B29",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B30",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B31",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B32",
        "CAP_Name": "公共安全檢查規費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B33",
        "CAP_Name": "瓦斯遮斷閥",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B34",
        "CAP_Name": "消防安檢管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B35",
        "CAP_Name": "設備維護保養",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B36",
        "CAP_Name": "戶外店招費用-2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B37",
        "CAP_Name": "抽成櫃位租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B38",
        "CAP_Name": "行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B39",
        "CAP_Name": "消防安檢管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B40",
        "CAP_Name": "POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B41",
        "CAP_Name": "週年慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B42",
        "CAP_Name": "父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B43",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B44",
        "CAP_Name": "倉庫租借2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B45",
        "CAP_Name": "會員點數集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B46",
        "CAP_Name": "停車折抵集點機",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B47",
        "CAP_Name": "戶外店招費用-3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B48",
        "CAP_Name": "第二現場-POS租金",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B49",
        "CAP_Name": "第二現場-公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B50",
        "CAP_Name": "第二現場-行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B51",
        "CAP_Name": "第二現場-空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B52",
        "CAP_Name": "第二現場-電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B53",
        "CAP_Name": "第二現場-母親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B54",
        "CAP_Name": "第二現場-年中慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B55",
        "CAP_Name": "第二現場-週年慶贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B56",
        "CAP_Name": "第二現場-父親節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B57",
        "CAP_Name": "第二現場-春節贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B58",
        "CAP_Name": "電費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B59",
        "CAP_Name": "第二現場-POS租金2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B60",
        "CAP_Name": "第二現場-公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B61",
        "CAP_Name": "第二現場-行銷贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B62",
        "CAP_Name": "第二現場-空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B63",
        "CAP_Name": "第二現場-電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B64",
        "CAP_Name": "戶外店招費用-4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B65",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B66",
        "CAP_Name": "空調冰水費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B67",
        "CAP_Name": "行銷贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B68",
        "CAP_Name": "母親節贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B69",
        "CAP_Name": "母親節贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B70",
        "CAP_Name": "年中慶贊助費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B71",
        "CAP_Name": "年中慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B72",
        "CAP_Name": "設備維護保養3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B73",
        "CAP_Name": "週年慶贊助費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B74",
        "CAP_Name": "設備維護保養2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B75",
        "CAP_Name": "倉庫租借3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B76",
        "CAP_Name": "資訊管理系統維護費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B77",
        "CAP_Name": "公區管理費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B78",
        "CAP_Name": "倉庫租借4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B79",
        "CAP_Name": "空調冰水費4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B80",
        "CAP_Name": "空調冰水費5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B81",
        "CAP_Name": "空調冰水費6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B82",
        "CAP_Name": "其他扣款",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B83",
        "CAP_Name": "電力費用4",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B84",
        "CAP_Name": "倉庫租借5",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B85",
        "CAP_Name": "樓組加碼贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B86",
        "CAP_Name": "夏出清贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B87",
        "CAP_Name": "倉庫租借6",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B88",
        "CAP_Name": "123",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "B89",
        "CAP_Name": "測試項目",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 58500,
        "down_payment": 0
      },
      {
        "CAP_Item": "C02",
        "CAP_Name": "公區裝潢費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D01",
        "CAP_Name": "中信信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D02",
        "CAP_Name": "公區管理費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D03",
        "CAP_Name": "中信信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D04",
        "CAP_Name": "中信信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D05",
        "CAP_Name": "會員卡集點",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D06",
        "CAP_Name": "滿千送百分攤-依營業額",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D07",
        "CAP_Name": "中信信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D08",
        "CAP_Name": "單月累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D09",
        "CAP_Name": "有價券單筆超過十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D10",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D11",
        "CAP_Name": "電力費用",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D12",
        "CAP_Name": "聯合信用卡手續費-一般",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D13",
        "CAP_Name": "聯合信用卡手續費-三期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D14",
        "CAP_Name": "聯合信用卡手續費-六期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D15",
        "CAP_Name": "聯合信用卡手續費-十二期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D16",
        "CAP_Name": "滿千送百-發行",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D17",
        "CAP_Name": "滿千送百-兌回",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D18",
        "CAP_Name": "單月累積營業額超過50%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D19",
        "CAP_Name": "有價券單筆超過五十萬",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D20",
        "CAP_Name": "滿千送百-發行2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D21",
        "CAP_Name": "扣款收入-場地租借",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D22",
        "CAP_Name": "一卡通手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D23",
        "CAP_Name": "Line Pay 手續費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D24",
        "CAP_Name": "電力費用2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D25",
        "CAP_Name": "行銷贊助費",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D26",
        "CAP_Name": "公區管理費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D27",
        "CAP_Name": "公區管理費3",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D28",
        "CAP_Name": "信用卡手續費--二十四期",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D29",
        "CAP_Name": "空調冰水費2",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      },
      {
        "CAP_Item": "D30",
        "CAP_Name": "全租期累積營業額超過30%",
        "tpy_amount": 0,
        "tpy_totalamt": 0,
        "down_payment": 0
      }
    ]
  }
]
