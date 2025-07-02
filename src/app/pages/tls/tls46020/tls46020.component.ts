import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS46020Item, TLS46020Service } from '../../../service/api/tls/tls46020.service';
import { Column, createPaginationConfig, formatAmount, formatDate, formatDateTime, formatTimeHHMM, formatYN } from '../../../shared/componentkit/table/table.model';
import { finalize } from 'rxjs';
import { ECR_GUI_Type_Option, ECR_SernoType_Option } from './tls46020.model';

// 2.4.6.2  POS環境變數維護作業
@Component({
  selector: 'app-tls46020',
  templateUrl: './tls46020.component.html',
})
export class TLS46020Component extends BasicQueryPageComponent<TLS46020Item> implements OnInit {
  queryForm = this.formBuilder.group({
    ECR_TmplNo: ['', [Validators.maxLength(20)]], // 環境變數編號
    ECR_TmplBegDate: [null], // 環境變數啟用日期
    ECR_TmplEndDate: [null], // 環境變數截止日期
    ECR_TmplDesc: ['', [Validators.maxLength(20)]], // 環境變數備註
    ...createPaginationConfig([{ field: 'ECR_TmplNo', order: 1 }]), // 分頁和排序參數
  });
  ECR_SernoType_Options = ECR_SernoType_Option; // 交易序號模式選項
  ECR_GUI_Type_Option = ECR_GUI_Type_Option; // 發票使用類別選項
  totalRecords = 0;
  data: TLS46020Item[] = [];
  columns: Column[] = [
    { field: 'ECR_TmplNo', header: '模版編號', visible: true },
    { field: 'ECR_TmplDesc', header: '模版備註', visible: true },
    { field: 'ECR_TmplStatus', header: '模版狀態', visible: true, format: value => value === 'A' ? '啟用' : '停用' }, // 資料庫中有此欄位，前端資料也有
    { field: 'ECR_TmplBegDate', header: '模版有效啟始日期', visible: true, format: formatDate }, // 已有 format
    { field: 'ECR_TmplEndDate', header: '模版有效截止日期', visible: true, format: formatDate }, // 新增 format
    { field: 'ECR_SernoType', header: '交易序號模式', visible: true, format: value => this.ECR_SernoType_Options.find(item => item.value === value)?.label || value }, // 修正為資料庫註解的「交易序號模式」
    { field: 'ECR_GUI_Type', header: '發票使用類別', visible: true, format: value => this.ECR_GUI_Type_Option.find(item => item.value === value)?.label || value }, // 修正為資料庫註解的「發票使用類別」
    { field: 'ECR_TimeTickInvl', header: '系統對時間隔(秒)', visible: true },
    { field: 'ECR_Interval', header: '上下傳異動檔間隔(秒)', visible: true }, // 補上
    { field: 'ECR_MaxQty', header: '單筆交易數量上限', visible: true },
    { field: 'ECR_MaxAmt', header: '單筆交易金額上限', visible: true, format: formatAmount },
    { field: 'ECR_MaxItemAmt', header: '單一明細金額上限', visible: true }, // 修正為資料庫註解的「單一明細金額上限」
    { field: 'ECR_MaxDisc', header: '單筆交易最大折扣比率限制', visible: true },
    { field: 'ECR_EdcTimeout', header: '信用卡刷卡機連線時限(秒)', visible: true },
    { field: 'ECR_EdcSettle', header: '信用卡刷卡機連動日結', visible: true, format: formatYN }, // 新增 format (Y/N)
    { field: 'ECR_ForceInput', header: '是否強制輸入付款金額', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_CustCntEntry', header: '是否輸入來客數', visible: true, format: formatYN }, // 已有 format, 校正為 Y/N 判斷
    { field: 'ECR_CustTypeEntry', header: '是否輸入客層數', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_ClerkEntry', header: '是否強制輸入營業員', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_ForceMember', header: '是否強制輸入會員編號', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_SettleDD', header: '清機提示日期', visible: true, format: value => (value === 'T' ? '當天' : '隔天') }, // 補上
    { field: 'ECR_SettleHHNN', header: '清機提示時間-時分', visible: true, format: formatTimeHHMM }, // 補上
    { field: 'ECR_VoidTxn', header: '是否允許作廢交易', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_VoidRstDay', header: '作廢交易限制天數', visible: true }, // 補上
    { field: 'ECR_CreditNote', header: '是否允許開立折讓單', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_RestoreVoid', header: '是否允許回復已作廢交易', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_GUI_PeriodQty', header: '機台每期電子發票預設配號數量', visible: true }, // 補上
    { field: 'ECR_GUI_MinQty', header: '機台電子發票最小安全存量', visible: true }, // 補上
    { field: 'ECR_SelfReport', header: '是否執行自我報帳', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_SaleRpt1', header: '是否列印收銀員交班表', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_SaleRpt2', header: '是否列印收銀機財務報表', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_SaleRpt3', header: '是否列印時段銷售報表', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_SaleRpt4', header: '是否列印部門銷售報表', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_SaleRpt5', header: '是否列印單品銷售報表', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_SaleRpt6', header: '是否列印銷貨明細表', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_SaleRpt7', header: '是否列印作廢明細表', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_SaleRpt8', header: '是否列印自我報帳(現額報告)帳條', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_SaleRpt9', header: '是否列印保全現金帳條(現金明細表)', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_SaleRpt10', header: '保留', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_PcashValid', header: '零用金是否需要認證', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_PickUpValid', header: '中途取現是否需要認證', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_ReprintGUI', header: '是否允許執行補印發票', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_PrnLogo', header: '是否列印商標', visible: true, format: formatYN }, // 補上 format (Y/N)
    { field: 'ECR_Logo1', header: '商標1 (門市名稱)', visible: true }, // 補上
    { field: 'ECR_Logo2', header: '商標2 (門市地址)', visible: true }, // 補上
    { field: 'ECR_Logo3', header: '商標3 (門市電話)', visible: true }, // 補上
    { field: 'ECR_Logo4', header: '商標4 (門市統一編號)', visible: true }, // 補上
    { field: 'ECR_Logo5', header: '商標5', visible: true }, // 補上
    { field: 'ECR_Logo6', header: '商標6', visible: true }, // 補上
    { field: 'ECR_KBLevel', header: '機台鍵盤等級', visible: true }, // 補上
    { field: 'ECR_KBType', header: '鍵盤型態', visible: true }, // 補上
    { field: 'ECR_Scanner', header: '掃描器型態', visible: true }, // 補上
    { field: 'ECR_ScannerCom', header: '掃描器連接埠', visible: true }, // 補上
    // { field: 'ECR_MSR', header: 'MSR型態', visible: true }, // 後端JSON中沒有，資料庫有
    // { field: 'ECR_MSRCom', header: 'MSR連接埠', visible: true }, // 後端JSON中沒有，資料庫有
    { field: 'ECR_ScrType', header: '收銀畫面樣式', visible: true }, // 補上
    { field: 'ECR_CD', header: '客戶顯示器型態', visible: true }, // 補上
    { field: 'ECR_CDCom', header: '客戶顯示器連接埠', visible: true }, // 補上
    { field: 'ECR_ExtScr', header: '收銀外接顯示器名稱', visible: true }, // 補上
    { field: 'ECR_ExtScrCom', header: '收銀外接顯示器連接埠', visible: true }, // 補上
    { field: 'ECR_GUIPrn', header: '發票印表機型態', visible: true }, // 補上
    { field: 'ECR_GUICom', header: '發票印表機連接埠', visible: true }, // 補上
    { field: 'ECR_SlipPrn', header: '收據印表機型態', visible: true }, // 補上
    { field: 'ECR_SlipPrnCom', header: '收據印表機連接埠', visible: true }, // 補上
    // { field: 'ECR_OrderPrn', header: '訂單印表機型態', visible: true }, // 後端JSON中沒有，資料庫有
    // { field: 'ECR_OrderPrnCom', header: '訂單印表機連接埠', visible: true }, // 後端JSON中沒有，資料庫有
    { field: 'ECR_LablePrn', header: '標籤印表機型態', visible: true }, // 補上
    { field: 'ECR_LablePrnCom', header: '標籤印表機連接埠', visible: true }, // 補上
    { field: 'ECR_EDC', header: '信用卡刷卡機型態', visible: true }, // 補上
    { field: 'ECR_EDCCom', header: '信用卡刷卡機連接埠', visible: true }, // 補上
    { field: 'ECR_EDC2', header: '第二台信用卡刷卡機型態', visible: true }, // 補上
    { field: 'ECR_EDC2Com', header: '第二台信用卡刷卡機連接埠', visible: true }, // 補上
    { field: 'ECR_EDC3', header: '第三台信用卡刷卡機型態', visible: true }, // 補上
    { field: 'ECR_EDC3Com', header: '第三台信用卡刷卡機連接埠', visible: true }, // 補上
    { field: 'ECR_ElecSVCrdA', header: '悠遊卡型態', visible: true }, // 補上
    { field: 'ECR_ElecSVCrdACom', header: '悠遊卡連接埠', visible: true }, // 補上
    { field: 'ECR_ElecSVCrdB', header: '一卡通型態', visible: true }, // 補上
    { field: 'ECR_ElecSVCrdBCom', header: '一卡通連接埠', visible: true }, // 補上
    { field: 'ECR_ElecSVCrdC', header: '愛金卡型態', visible: true }, // 補上
    { field: 'ECR_ElecSVCrdCCom', header: '愛金卡連接埠', visible: true }, // 補上
    { field: 'ECR_ElecPay', header: '電子支付型態', visible: true }, // 補上
    { field: 'ECR_ElecPayCom', header: '電子支付連接埠', visible: true }, // 補上
    { field: 'ECR_Drawer', header: '錢櫃型態', visible: true }, // 補上
    { field: 'ECR_DrawerCom', header: '錢櫃連接埠', visible: true }, // 補上
    { field: 'ECR_Device1Name', header: '週邊裝置1 名稱', visible: true }, // 補上
    { field: 'ECR_Device1Com', header: '週邊裝置1 連接埠', visible: true }, // 補上
    { field: 'ECR_Device2Name', header: '週邊裝置2 名稱', visible: true }, // 補上
    { field: 'ECR_Device2Com', header: '週邊裝置2 連接埠', visible: true }, // 補上
    { field: 'ECR_Device3Name', header: '週邊裝置3 名稱', visible: true }, // 補上
    { field: 'ECR_Device3Com', header: '週邊裝置3 連接埠', visible: true }, // 補上
    { field: 'ECR_Device4Name', header: '週邊裝置4 名稱', visible: true }, // 補上
    { field: 'ECR_Device4Com', header: '週邊裝置4 連接埠', visible: true }, // 補上
    { field: 'ECR_Device5Name', header: '週邊裝置5 名稱', visible: true }, // 補上
    { field: 'ECR_Device5Com', header: '週邊裝置5 連接埠', visible: true }, // 補上
    { field: 'ECR_Device6Name', header: '週邊裝置6 名稱', visible: true }, // 補上
    { field: 'ECR_Device6Com', header: '週邊裝置6 連接埠', visible: true }, // 補上
    { field: 'ECR_Device7Name', header: '週邊裝置7 名稱', visible: true }, // 補上
    { field: 'ECR_Device7Com', header: '週邊裝置7 連接埠', visible: true }, // 補上
    { field: 'ECR_Device8Name', header: '週邊裝置8 名稱', visible: true }, // 補上
    { field: 'ECR_Device8Com', header: '週邊裝置8 連接埠', visible: true }, // 補上
    { field: 'ECR_Device9Name', header: '週邊裝置9 名稱', visible: true }, // 補上
    { field: 'ECR_Device9Com', header: '週邊裝置9 連接埠', visible: true }, // 補上
    { field: 'ECR_Device10Name', header: '週邊裝置10 名稱', visible: true }, // 補上
    { field: 'ECR_Device10Com', header: '週邊裝置10 連接埠', visible: true }, // 補上
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDateTime }, // 新增 format
    { field: 'CRT_USR_No', header: '建立人員', visible: true }, // 補上
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true }, // 移除了 CRT_USR_Name 上不必要的 format，因為它是字串
    { field: 'UPD_Date', header: '變更日期', visible: true, format: formatDateTime }, // 新增 format
    { field: 'UPD_USR_No', header: '變更人員', visible: true }, // 補上
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: true } // 補上
  ];

  constructor(
    private tls46020Service: TLS46020Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS46020', '/TLS/TLS46020cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls46020Service.queryTLS46020(frm.value).pipe(finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
}
