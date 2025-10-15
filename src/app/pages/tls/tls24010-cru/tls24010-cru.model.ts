import { ValidationErrors } from "@angular/forms";
import { Column } from "../../../shared/componentkit/table/table.model";

export const txnStatusOptions = [
  { label: '一般交易', value: 'N' },
  { label: '退貨交易', value: 'E' },
  { label: '作廢交易', value: 'D' },
];
export const TXN_GUI_CarrTypeOptions = [
  { label: '手機條碼', value: '3J0002' },
  { label: '自然人憑證', value: 'CQ0001' },
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


// TXN_GUIVehicle 檢核邏輯(基本檢核邏輯：以/為起始作為判斷，目前總長度共為8碼，條碼除第1碼為/外只會有0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ + - .這39個字元)
// 宣告一個驗證方法給TXN_GUIVehicle表單欄位使用並回傳錯誤訊息
// ValidationService.ts - 新增方法

/**
 * TXN_GUIVehicle 檢核邏輯
 * 1. 總長度為 8 碼
 * 2. 第 1 碼為 '/'
 * 3. 第 2 碼後只允許 [0-9 A-Z a-z + - .]
 */
export function guiVehicleValidator(control: { value: string | null }): ValidationErrors | null {
  const value = control.value;

  // 1. 如果值為空，則不進行驗證，交由 required 處理
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // 將值轉換為字串並 trim
  const vehicle = value.toString().trim();

  // 2. 檢核長度必須為 8 碼
  if (vehicle.length !== 8) {
    return { invalidGuiVehicle: true };
  }

  // 3. 檢核第 1 碼必須是 '/'
  if (vehicle.charAt(0) !== '/') {
    return { invalidGuiVehicle: true };
  }

  // 4. 檢核第 2 碼到第 8 碼的字元內容
  // Regex 解讀:
  // ^: 字串開頭
  // \/: 第一個字元必須是 /
  // [0-9A-Za-z+-\.] 會匹配 0-9, A-Z, a-z, +, -, .
  // {7}: 緊接著必須是 7 個符合前面字元集的字元
  // $: 字串結尾
  const vehicleBodyRegex = /^\/([0-9A-Za-z+\-.]){7}$/;

  if (!vehicleBodyRegex.test(vehicle)) {
    return { invalidGuiVehicle: true };
  }

  // 驗證通過
  return null;
}
