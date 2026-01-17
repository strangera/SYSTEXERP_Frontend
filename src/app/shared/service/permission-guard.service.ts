import { inject, Injectable } from '@angular/core';
import { SystemDataService } from '@service/system/system-data.service';
import { FunsrightInfo } from '../models/system/funsrightInfo';

export enum Actions {
  // CRUD
  Query = '10',          // 查詢/讀取 (R)
  Create = '20',         // 新增 (C)
  Edit = '30',           // 修改 (U)
  Delete = '40',         // 刪除 (D)
  // 匯入/匯出相關
  Report = '50',         // 報表
  Print = '60',          // 列印
  ExportExcel = '70',    // 匯出 EXCEL
  ExcelImport = '130',   // 匯入 EXCEL
  ImportCSV = '240',     // 匯入CSV
  ExportTemplate = '320',// 匯出範本
  TagPrint = '300',      // 產生標籤檔
  ImageImport = '330',   // 匯入圖片
  ImageExport = '340',   // 匯出圖片
  // 其他特殊權限
  Audit = '80',            // 審核
  AntiAudit = '90',        // 反審核
  Download = '100',        // 下傳
  Invalidate = '110',      // 作廢
  ShowContract = '120',    // 顯示合約
  CounterNoCorrection = '140', // 專櫃編號修正
  DiscountCorrection = '150',  // 折數修正
  CommissionTypeCorrection = '160', // 抽成類別修正
  PaymentTypeCorrection = '170',    // 付款別修正
  PresaleCorrection = '180',       // 是否為預售交易修正
  InvalidateTransaction = '190',   // 交易資料作廢
  ExportPledge = '200',            // 匯出切結書
  ConfirmDailyClose = '210',       // 確定日結
  AntiDailyClose = '220',          // 反日結
  TransferFile = '230',            // 轉檔
  AllocateNumber = '250',          // 配號
  CancelInvalidate = '260',        // 取消作廢
  CarryForward = '270',            // 結轉
  Preview = '280',                 // 預覽
  CancelDocument = '290',          // 取消單據
  CloseCase = '310',               // 結案
}

@Injectable({
  providedIn: 'root'
})
export class PermissionGuardService {
  private systemDataService = inject(SystemDataService);

  /**
   * 獲取指定程式代碼的權限物件。
   * @param progNo 程式代碼 (例如: 'TLS14020')
   * @returns FunsrightInfo | undefined
   */
  getPermissions(progNo: string): FunsrightInfo | undefined {
    return this.systemDataService.getUserPermissions(progNo.toUpperCase());
  }

  /**
   * 檢查使用者是否擁有特定行為權限。
   * @param progNo 程式代碼 (例如: 'TLS14020')
   * @param actionCode 權限代碼 (例如: Action.Approve)
   * @returns boolean
   */
  hasPermission(progNo: string, actionCode: string | Actions): boolean {
    const permissions = this.getPermissions(progNo);
    const action = String(actionCode);

    return permissions?.PrivilegeBehavior?.some(
      behavior => behavior.function_code === action
    ) || false;
  }
}
