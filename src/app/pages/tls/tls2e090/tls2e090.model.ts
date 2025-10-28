import { ColumnGroup, formatAmount, ReportColumn } from "@shared/componentkit/table-report/table-report.model";

// 專櫃帳款試算彙總表 (queryTLS2E050) - 保持不變
export const columns1: ReportColumn[] = [
  // 廠商及專櫃基本資訊
  { field: 'ven_no', header: '廠商編號' },
  { field: 'VEN_Name', header: '廠商名稱' },
  { field: 'tlt_no', header: '專櫃編號' },
  { field: 'tlt_name', header: '櫃位名稱' },
  { field: 'tlt_term_type_Name', header: '抽成方式' },
  { field: 'sam_yyymm', header: '結帳年月' },
  { field: 'bus_type_name', header: '大分類' },
  { field: 'money_type_Name', header: '結帳方式' },

  // 帳務資訊
  { field: 'sam_termno', header: '帳次' },
  { field: 'check_day', header: '結帳後幾日付款' }, // 結帳後幾日付款

  // 銷貨淨額 group
  { field: 'sam_sales_namt', header: '應稅', isTotal: true, format: formatAmount, groupField: 'sales' },
  { field: 'sam_sales_notaxamt', header: '免稅', isTotal: true, format: formatAmount, groupField: 'sales' },
  { field: 'sam_sales_tax', header: '稅額', isTotal: true, format: formatAmount, groupField: 'sales' },

  // 抽成額 group
  { field: 'sam_profit', header: '應稅', isTotal: true, format: formatAmount, groupField: 'profit' },
  { field: 'sam_notax_profit', header: '免稅', isTotal: true, format: formatAmount, groupField: 'profit' },
  { field: 'sam_profit_tax', header: '稅額', isTotal: true, format: formatAmount, groupField: 'profit' },

  // 進貨 group
  { field: 'sam_ap_namt', header: '應稅', isTotal: true, format: formatAmount, groupField: 'ap' },
  { field: 'sam_ap_notaxamt', header: '免稅', isTotal: true, format: formatAmount, groupField: 'ap' },

  { field: 'sam_ap_tax', header: '進項稅額', isTotal: true, format: formatAmount },
  { field: 'sam_ap_amt', header: '進貨總額(含稅)', isTotal: true, format: formatAmount },

  // 應收帳款 group
  { field: 'sam_fare_namt', header: '代扣未稅(開立)', isTotal: true, format: formatAmount, groupField: 'receivable' },
  { field: 'sam_fare_tax', header: '代扣稅額', isTotal: true, format: formatAmount, groupField: 'receivable' },
  { field: 'sam_fare_notaxamt', header: '代扣金額(不開立)', isTotal: true, format: formatAmount, groupField: 'receivable' },
  { field: 'sam_rent_namt', header: '租金未稅', isTotal: true, format: formatAmount, groupField: 'receivable' },
  { field: 'sam_rent_tax', header: '租金稅額', isTotal: true, format: formatAmount, groupField: 'receivable' },
  { field: 'acc_receivable', header: '應收合計', isTotal: true, format: formatAmount, groupField: 'receivable' },
  // 最終合計
  { field: 'sam_under_limit_amt', header: '包底抽成不足(含稅)', isTotal: true, format: formatAmount },
  { field: 'acc_payable', header: '應付帳款(含稅)', isTotal: true, format: formatAmount },
];

export const columnGroup: ColumnGroup[] = [
  { field: 'sales', header: '銷貨淨額' },
  { field: 'profit', header: '抽成額' },
  { field: 'ap', header: '進貨' },
  { field: 'receivable', header: '應收帳款' },
];

// 專櫃銷貨彙總表 - 基礎欄位
const SALES_CHARGE_COLUMNS: ReportColumn[] = [
  { field: 'sad_date', header: '銷售日期' },
  { field: 'floor_desc', header: '樓層' },
  { field: 'tlt_no', header: '專櫃編號' },
  { field: 'tlt_name', header: '櫃位名稱' },
];

// 專櫃銷貨彙總表 - 銷售明細欄位 (包含含稅/未稅/抽成額/趴數)
const SALES_DETAIL_COLUMNS: ReportColumn[] = [
  // 正品 (000)
  { field: 'Amt000', header: '正品', isTotal: true, format: formatAmount },
  { field: 'Namt000', header: '正品', isTotal: true, format: formatAmount },
  { field: 'Profit000', header: '正品抽成額', isTotal: true, format: formatAmount },
  { field: 'Per000', header: '正品%' }, // 已修改為 "折扣名稱%"

  // 九五折 (095)
  { field: 'Amt095', header: '九五折', isTotal: true, format: formatAmount },
  { field: 'Namt095', header: '九五折', isTotal: true, format: formatAmount },
  { field: 'Profit095', header: '九五折抽成額', isTotal: true, format: formatAmount },
  { field: 'Per095', header: '九五折%' }, // 已修改為 "折扣名稱%"

  // 九折 (090)
  { field: 'Amt090', header: '九折', isTotal: true, format: formatAmount },
  { field: 'Namt090', header: '九折', isTotal: true, format: formatAmount },
  { field: 'Profit090', header: '九折抽成額', isTotal: true, format: formatAmount },
  { field: 'Per090', header: '九折%' }, // 已修改為 "折扣名稱%"

  // 八五折 (085)
  { field: 'Amt085', header: '八五折', isTotal: true, format: formatAmount },
  { field: 'Namt085', header: '八五折', isTotal: true, format: formatAmount },
  { field: 'Profit085', header: '八五折抽成額', isTotal: true, format: formatAmount },
  { field: 'Per085', header: '八五折%' }, // 已修改為 "折扣名稱%"

  // 八折 (080)
  { field: 'Amt080', header: '八折', isTotal: true, format: formatAmount },
  { field: 'Namt080', header: '八折', isTotal: true, format: formatAmount },
  { field: 'Profit080', header: '八折抽成額', isTotal: true, format: formatAmount },
  { field: 'Per080', header: '八折%' }, // 已修改為 "折扣名稱%"

  // 七五折 (075)
  { field: 'Amt075', header: '七五折', isTotal: true, format: formatAmount },
  { field: 'Namt075', header: '七五折', isTotal: true, format: formatAmount },
  { field: 'Profit075', header: '七五折抽成額', isTotal: true, format: formatAmount },
  { field: 'Per075', header: '七五折%' }, // 已修改為 "折扣名稱%"

  // 七折 (070)
  { field: 'Amt070', header: '七折', isTotal: true, format: formatAmount },
  { field: 'Namt070', header: '七折', isTotal: true, format: formatAmount },
  { field: 'Profit070', header: '七折抽成額', isTotal: true, format: formatAmount },
  { field: 'Per070', header: '七折%' }, // 已修改為 "折扣名稱%"

  // 六折 (060)
  { field: 'Amt060', header: '六折', isTotal: true, format: formatAmount },
  { field: 'Namt060', header: '六折', isTotal: true, format: formatAmount },
  { field: 'Profit060', header: '六折抽成額', isTotal: true, format: formatAmount },
  { field: 'Per060', header: '六折%' }, // 已修改為 "折扣名稱%"

  // 五折 (050)
  { field: 'Amt050', header: '五折', isTotal: true, format: formatAmount },
  { field: 'Namt050', header: '五折', isTotal: true, format: formatAmount },
  { field: 'Profit050', header: '五折抽成額', isTotal: true, format: formatAmount },
  { field: 'Per050', header: '五折%' }, // 已修改為 "折扣名稱%"

  // 特價 (999)
  { field: 'Amt999', header: '特價', isTotal: true, format: formatAmount },
  { field: 'Namt999', header: '特價', isTotal: true, format: formatAmount },
  { field: 'Profit999', header: '特價抽成額', isTotal: true, format: formatAmount },
  { field: 'Per999', header: '特價%' }, // 已修改為 "折扣名稱%"
];

// 2. 專櫃銷貨彙總表-依抽成 (queryTLS2E090SalCharge) 的欄位
export const columns2: ReportColumn[] = [
  ...SALES_CHARGE_COLUMNS,
  ...SALES_DETAIL_COLUMNS,
];

// 3. 專櫃銷貨彙總表-依類別 (queryTLS2E090SalChargeCategory) 的欄位
export const columns3: ReportColumn[] = [
  { field: 'sad_date', header: '銷售日期' },
  { field: 'floor_desc', header: '樓層' },
  { field: 'tlt_no', header: '專櫃編號' },
  { field: 'tlt_name', header: '櫃位名稱' },
  { field: 'tlt_id', header: '類別' }, // 依 Swagger 新增欄位
  { field: 'tlt_id_desc', header: '類別名稱' }, // 依 Swagger 新增欄位
  ...SALES_DETAIL_COLUMNS,
];
