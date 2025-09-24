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
        "CAP_Item": "C01",
        "CAP_Name": "公區裝潢費",
        "tpy_amount": 0,
        "tpy_totalamt": 641200,
        "down_payment": 0
      },
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
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 1610,
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
        "CAP_Item": "B21",
        "CAP_Name": "空調冰水費",
        "tpy_amount": 1610,
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
    ]
  }
]
