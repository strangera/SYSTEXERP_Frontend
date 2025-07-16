import { Column } from "../../../shared/componentkit/table/table.model";

export const txnStatusOptions = [
  { label: '一般交易', value: 'N' },
  { label: '退貨交易', value: 'E' },
  { label: '作廢交易', value: 'D' },
];
export const txnTaxTypeOptions = [
  { label: '免稅', value: '0' },
  { label: '應稅', value: '1' },
  { label: '零稅', value: '2' },
];
export const txnTaxTypeOptions2 = [
  { label: '免稅', value: '0' },
  { label: '應稅', value: '1' },
];
export const TXN_GUI_CarrTypeOptions = [
  { label: '悠遊載具卡', value: '1K0001' },
  { label: '手機條碼', value: '3J0002' },
  { label: '自然人憑證', value: 'CQ0001' },
  { label: '一卡通載具', value: '1H0001' },
  { label: '信用卡載具', value: 'EK0002' },
  { label: '取消載具', value: '#' },
]
// 新增 國際條碼、商品編號
// 若為 自營櫃位，顯示 國際條碼、商品編號(對應商品管理編號欄位) 可輸入欄位，若不是 直接自動代入專櫃編號欄位
// 單價=定價 欄位
// 若為自營櫃位，輸入國際條碼、商品編號時 會自動代出單價金額，並可允許修改。若為專櫃為自行輸入
// 單價小計金額，顯示。(計算：數量*單價金額)
// 單項折扣讓金額，存入折扣總額欄位、單項折扣讓金額。
// 單項銷售金額，數量*單價金額-單項折扣讓金額，並存入銷售金額
// 類別：分類抽成類別，下拉選單讀取 專櫃抽成主檔的TLT_ID( 下拉為此專櫃找抽成類別)
// 稅別：讀取 專櫃抽成主檔的CAG_TAXTYPE 自動代入
// 折扣別=專櫃折數代碼欄位，自動代入
export const POS5007Columns: Column[] = [
  { field: 'PLU_MagNo', header: '商品編號/國際條碼', type: 'input' }, // TLTTALENT.STORE_WAY = 1為專櫃 2=自營 若為自營櫃時, 讀取POS2004.PLU_MAGNO, 若為專櫃, 則不允許修改
  { field: 'TXN_Qty', header: '數量', type: 'inputNumber' },
  { field: 'PLU_FixPrc', header: '單價金額', type: 'inputNumber' }, // 若為自營商品, POS2004.PLU_FixPrc, 允許修改
  { field: 'TXN_Amt', header: '單價小計金額' }, // (計算：數量*單價金額)
  { field: 'TXN_Disc', header: '單價折扣讓金額', type: 'inputNumber' },
  { field: 'TXN_SaleAmt', header: '單價銷售金額' }, // 數量*單價金額-單項折扣讓金額
  { field: 'TLT_ID', header: '類別', type: 'dropdown' }, // 讀取TLTTALENT_CHARGEM 專櫃抽成主檔的 TLT_ID
  { field: 'PLU_TaxType', header: '稅別' }, // TLTTALENT_CHARGEM.CAG_TAXTYPE 專櫃抽成主檔
  { field: 'TXN_DiscCode', header: '折扣別' }, // 讀取TLTTALENT_CHARGED.CAG_BARCODE
]
export const POS5007Columns2: Column[] = [
  { field: 'PLU_MagNo', header: '商品編號/國際條碼' }, // TLTTALENT.STORE_WAY = 1為專櫃 2=自營 若為自營櫃時, 讀取POS2004.PLU_MAGNO, 若為專櫃, 則不允許修改
  { field: 'TXN_Qty', header: '數量', type: 'inputNumber' },
  { field: 'PLU_FixPrc', header: '單價金額' }, // 若為自營商品, POS2004.PLU_FixPrc, 允許修改
  { field: 'TXN_Amt', header: '單價小計金額' }, // (計算：數量*單價金額)
  { field: 'TXN_Disc', header: '單價折扣讓金額', type: 'inputNumber' },
  { field: 'TXN_SaleAmt', header: '單價銷售金額' }, // 數量*單價金額-單項折扣讓金額
  { field: 'TLT_ID', header: '類別', type: 'dropdown' }, // 讀取TLTTALENT_CHARGEM 專櫃抽成主檔的 TLT_ID
  { field: 'PLU_TaxType', header: '稅別' }, // TLTTALENT_CHARGEM.CAG_TAXTYPE 專櫃抽成主檔
  { field: 'TXN_DiscCode', header: '折扣別' }, // 讀取TLTTALENT_CHARGED.CAG_BARCODE
]

// 將所有支付別(pos1006)預先放入，若需要的則要使用者打 v，若有打v 需傳送給後端
// 信用卡卡號/券號/應收帳款對象 對應到 付款卡號、券號、付款註記 欄位(欄位 (可利用 pos1006，付款別型態判斷要怎麼傳送給後端)
// 信用卡別 對應 付款信用卡卡別 欄位，下拉選單 (可利用 pos1006，付款別型態判斷)
// 分期數 對應  期別 欄位 (信用卡才需要)，下拉選單(sys1000.sys_type)
export const POS5008Columns: Column[] = [
  { field: 'PAY_Type', header: '付款別', type: 'dropdown' },// 付款別型態，POS1006.PAY_Type
  { field: 'TXN_PayAmt', header: '金額', type: 'inputNumber' },
  { field: 'CRD_Type', header: '信用卡別', type: 'dropdown' }, // 付款信用卡卡別，V=VISA、M=MASTER、J=JCB、A=AE、D=DINVER、S=銀聯卡、O=其他
  { // 若不是信用卡的話, 該欄位的值就放在券號欄位
    // 若是信用卡的話, 該欄位的值就放在付款卡號欄位
    // 若POS1006.PAY_Type = A 應收帳款時,  該欄位的值就放在付款註記欄位
    field: 'CRD_No_TXN_CouponNo_TXN_PayDesc',
    header: '信用卡卡號/券號/應收付款對象',
    type: 'input'
  },
  { field: 'TERM_No', header: '分期數', type: 'dropdown' },// 期別，0=一般，其餘為分期的期數
]
