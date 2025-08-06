import { Column } from "../../../shared/componentkit/table/table.model";

export const txnStatusOptions = [
  { label: '一般交易', value: 'N' },
  { label: '退貨交易', value: 'E' },
  { label: '作廢交易', value: 'D' },
];
export const TXN_GUI_CarrTypeOptions = [
  { label: '悠遊載具卡', value: '1K0001' },
  { label: '手機條碼', value: '3J0002' },
  { label: '自然人憑證', value: 'CQ0001' },
  { label: '一卡通載具', value: '1H0001' },
  { label: '信用卡載具', value: 'EK0002' },
  { label: '取消載具', value: '#' },
]
// 付款信用卡卡別，V=VISA、M=MASTER、J=JCB、A=AE、D=DINVER、S=銀聯卡、O=其他
export const CRD_TypeOptions = [
  { label: 'VISA', value: 'V' },
  { label: 'MASTER', value: 'M' },
  { label: 'JCB', value: 'J' },
  { label: 'AE', value: 'A' },
  { label: 'DINVER', value: 'D' },
  { label: '銀聯卡', value: 'S' },
  { label: '其他', value: 'O' },
]
// 將所有支付別(pos1006)預先放入，若需要的則要使用者打 v，若有打v 需傳送給後端
// 信用卡卡號/券號/應收帳款對象 對應到 付款卡號、券號、付款註記 欄位(欄位 (可利用 pos1006，付款別型態判斷要怎麼傳送給後端)
// 信用卡別 對應 付款信用卡卡別 欄位，下拉選單 (可利用 pos1006，付款別型態判斷)
// 分期數 對應  期別 欄位 (信用卡才需要)，下拉選單(sys1000.sys_type)
export const POS5008Columns: Column[] = [
  { field: 'PAY_Type', header: '付款別', },// 付款別型態，POS1006.PAY_Type
  { field: 'TXN_PayAmt', header: '金額', type: 'inputNumber' },
  { field: 'CRD_Type', header: '信用卡別', type: 'dropdown' }, // 付款信用卡卡別，V=VISA、M=MASTER、J=JCB、A=AE、D=DINVER、S=銀聯卡、O=其他
  { // 若不是信用卡的話, 該欄位的值就放在券號欄位 不是0的話
    // 若是信用卡的話, 該欄位的值就放在付款卡號欄位 若是0的話
    // 若POS1006.PAY_Type = A 應收帳款時,  該欄位的值就放在付款註記欄位
    field: 'CRD_No_TXN_CouponNo_TXN_PayDesc',
    header: '信用卡卡號/券號/應收付款對象',
    type: 'input'
  },
  { field: 'TERM_No', header: '分期數', type: 'dropdown' },// 期別，0=一般，其餘為分期的期數
]

export enum STORE_WAY {
  專櫃 = '1',
  自營 = '2',
}

export enum TLS24010_EDIT_TYPE {
  專櫃編號修正 = "TLTNoEdit",
  折數修正 = "DiscCodeEdit",
  抽成類別修正 = "TLTIdEdit",
  付款別修正 = "PayNoEdit",
  是否為預售交易修正 = "PreOrderEdit",
  交易資料作廢 = "VoidEdit"
}
