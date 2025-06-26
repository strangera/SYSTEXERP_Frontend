import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColumnLabelService {
  private readonly fieldMap: Record<string, string> = {
    TXN_TotPayAmt: '總金額',
    TXN_PayAmt10: '現金',
    TXN_PayAmt41: '聯合連線',
    TXN_PayAmt42: '聯合離線',
    TXN_PayAmt12: '聯合紅利',
    TXN_PayAmt81: '[信用卡]中信停車場',
    TXN_PayAmt43: '中信連線',
    TXN_PayAmt44: '中信離線',
    TXN_PayAmt14: '中信紅利',
    TXN_PayAmt82: '[一卡通]停車場',
    TXN_PayAmt52: '一卡通',
    TXN_PayAmt20: '禮券',
    TXN_PayAmt62: '商品提貨單',
    TXN_PayAmt77: '感熱紙抵用券',
    TXN_PayAmt71: '商品抵用券',
    TXN_PayAmt30: '貴賓提貨單(應收帳款)',
    TXN_PayAmt73: '外來禮券(抵用券)',
    TXN_PayAmt72: '外來提貨單(抵用券)',
    TXN_PayAmt74: '活動券(自營)',
    TXN_PayAmt75: '折價券',
    TXN_PayAmt76: '現抵',
    TXN_PayAmt24: '禮券餘額代卡',
    TXN_PayAmt25: '提貨單餘代卡',
    TXN_PayAmt07: '會員折抵',
    TXN_PayAmt55: 'LINE Pay',
    TXN_PayAmt83: '[LINE Pay]停車場',
    TXN_PayAmt78: 'APP抵用券',
    TXN_PayAmt79: 'APP提貨單',
    TXN_PayAmt21: 'APP禮券',
    TXN_PayAmt53: '悠遊卡',
    TXN_PayAmt56: '一卡通錢包',
    TXN_PayAmt57: '台灣Pay',
    TXN_PayAmt58: '南紡錢包',
    TXN_PayAmt59: '即享券',
    TXN_PayAmt60: '喜客券',
    TXN_PayAmt22: '[外來提貨單]高夢',
    TXN_PayAmt23: '[外來禮券]高夢',
    PreSale_Received: '預售訂金',
    PreSale_Checkout: '預售實收結帳',
    TXN_OverAmt: '溢收金額',
    TXN_ReturnAmt: '退貨金額',
    TXN_ExchangeAmt: '換貨金額',
    TXN_CancelAmt: '作廢金額',
    TXN_AgentAmt: '代收金額'
  };

  getLabel(field: string): string {
    return this.fieldMap[field] || field;
  }

  getAllFieldMappings(): { field: string; label: string }[] {
    return Object.entries(this.fieldMap).map(([field, label]) => ({ field, label }));
  }
}
