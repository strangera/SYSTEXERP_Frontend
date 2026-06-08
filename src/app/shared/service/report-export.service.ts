/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '@service/system/auth.service';
import { SystemOptionsService } from '@service/system/sys1000.service';
import { SystemDataService } from '@service/system/system-data.service';
import { FileExportService } from '@shared/service/file-export.service';
import { finalize } from 'rxjs';
import { CurrentPageService } from 'src/app/core/layout/app.menulist/current-page.service';
import { ExportParams, ReportColumn } from '../componentkit/table-report/table-report.model';
import { REPORT_TITLES } from '../componentkit/table/report-titles';
import { TableService } from '../componentkit/table/report.service';
import { QueryStateService } from './query-state.service';

@Injectable({
  providedIn: 'root'
})
export class ReportExportService {
  private readonly tableService = inject(TableService);
  private readonly authService = inject(AuthService);
  private readonly systemDataService = inject(SystemDataService);
  private readonly fileExportService = inject(FileExportService);
  private readonly currentPage = inject(CurrentPageService);
  private readonly datePipe = inject(DatePipe);
  private readonly queryState = inject(QueryStateService); // 💡 補上注入

  constructor() { }

  /**
   * 💡 執行 PDF 匯出（100% 復刻舊底層邏輯版）
   */
  public executePdfExport(params: ExportParams, onLoadingChange?: (loading: boolean) => void): void {
    const { event, columns, context, footerData, expansionColumns, legacyFallback } = params;

    // 1. 取得系統核心參數
    const progNo = this.currentPage.currentPageProgNoSubject.getValue() as string;
    const funInfo = this.systemDataService.getUserPermissions(progNo);
    const userInfo = this.authService.currentUserValue;
    const formattedToday = this.datePipe.transform(new Date(), 'yyyyMMdd');

    // 2. 💡 【精準復刻 1】ServiceName 的取值優先順序
    // 順序：新 Context 的 API -> 舊 Component 的 API -> 預設字串
    const finalApiUrl = context.apiUrl || legacyFallback?.apiUrl;
    const serviceName = finalApiUrl ? `${finalApiUrl}` : `query${progNo}`;

    // 3. 💡 【精準復刻 2】Conditions 查詢條件三層防禦
    // 順序：新 Context 條件 -> 舊 Component 條件 -> 快照緩存 -> 空陣列
    const stateCache = this.queryState.getQueryState(`${finalApiUrl ? finalApiUrl : `query${progNo}`}`);
    const finalConditions = context.conditions || legacyFallback?.conditions || stateCache?.value || [];

    // 4. 💡 【精準復刻 3】Report Title 報表標題優先順序
    const fallbackTitleKey = finalApiUrl ? `${finalApiUrl}` : `query${progNo}`;
    const finalReportTitle = context.reportTitle || legacyFallback?.reportTitle || REPORT_TITLES[fallbackTitleKey] || funInfo?.prog_name;

    // 5. 💡 【精準復刻 4】PrintRemark 與 DataKeyName
    const finalPrintRemark = context.printRemark !== undefined ? context.printRemark : (legacyFallback?.printRemark ?? true);
    const finalDataKeyName = context.dataKeyName || legacyFallback?.dataKeyName;

    // 6. 欄位格式轉換
    const pdfColumns = columns.map(col => this.mapColumnField(col));
    const pdfExpansionColumns = expansionColumns && expansionColumns.length > 0
      ? expansionColumns.map(col => this.mapColumnField(col))
      : null;

    // 7. 組裝 Payload Body
    const body = {
      query_condition: {
        ServiceName: serviceName,
        Conditions: finalConditions
      },
      report_title: finalReportTitle,
      columns: pdfColumns,
      expansion_columns: pdfExpansionColumns,
      config: {
        ...event,
        footer_DataType: finalPrintRemark ? progNo : undefined
      },
      footer_data: footerData ? (Array.isArray(footerData) ? footerData : [footerData]) : null,
      file_name: context.customFileName || `${userInfo?.user_No}_${funInfo?.prog_id || progNo}_${formattedToday}`,
      data_key_name: finalDataKeyName,
    };

    if (onLoadingChange) onLoadingChange(true);
    const export$ = this.tableService.exportPDF(body);

    this.fileExportService.executeFileExport(
      export$.pipe(finalize(() => { if (onLoadingChange) onLoadingChange(false); })),
      '.pdf',
      () => { }
    ).subscribe();
  }

  /**
   * 💡 執行 Excel 匯出（100% 復刻舊底層邏輯版）
   */
  public executeExcelExport(params: ExportParams, onLoadingChange?: (loading: boolean) => void): void {
    const { event, columns, context, footerData, expansionColumns, legacyFallback } = params;

    const progNo = this.currentPage.currentPageProgNoSubject.getValue() as string;
    const funInfo = this.systemDataService.getUserPermissions(progNo);
    const userInfo = this.authService.currentUserValue;
    const formattedToday = this.datePipe.transform(new Date(), 'yyyyMMdd');

    // 💡 預設值分流邏輯同上
    const finalApiUrl = context.apiUrl || legacyFallback?.apiUrl;
    const serviceName = finalApiUrl ? `${finalApiUrl}` : `query${progNo}`;
    const stateCache = this.queryState.getQueryState(`${finalApiUrl ? finalApiUrl : `query${progNo}`}`);
    const finalConditions = context.conditions || legacyFallback?.conditions || stateCache?.value || [];
    const fallbackTitleKey = finalApiUrl ? `${finalApiUrl}` : `query${progNo}`;
    const finalReportTitle = context.reportTitle || legacyFallback?.reportTitle || REPORT_TITLES[fallbackTitleKey] || funInfo?.prog_name;
    const finalDataKeyName = context.dataKeyName || legacyFallback?.dataKeyName;

    const excelColumns = columns.map(col => this.mapColumnField(col));
    const excelExpansionColumns = expansionColumns && expansionColumns.length > 0
      ? expansionColumns.map(col => this.mapColumnField(col))
      : null;

    const body = {
      query_condition: {
        ServiceName: serviceName,
        Conditions: finalConditions
      },
      report_title: finalReportTitle,
      columns: excelColumns,
      expansion_columns: excelExpansionColumns,
      config: event,
      footer_data: footerData ? (Array.isArray(footerData) ? footerData : [footerData]) : null,
      file_name: context.customFileName || `${userInfo?.user_No}_${funInfo?.prog_id || progNo}_${formattedToday}`,
      data_key_name: finalDataKeyName
    };

    if (onLoadingChange) onLoadingChange(true);
    const export$ = this.tableService.exportExcel(body);

    this.fileExportService.executeFileExport(
      export$.pipe(finalize(() => { if (onLoadingChange) onLoadingChange(false); })),
      '.xlsx',
      () => { }
    ).subscribe();
  }

  // ... mapColumnField, transformOptionsForExport, isYNField 維持原樣完全不動 ...
  private mapColumnField(col: ReportColumn) { const mappingList = SystemOptionsService.getOptions(col.field); let exportFormat: any = []; if (col.exportFormat) { exportFormat = col.exportFormat; } else if (mappingList.length > 0) { exportFormat = this.transformOptionsForExport(mappingList, 'SYS_Code', 'SYS_Name'); } else if (this.isYNField(col.field)) { exportFormat = [{ 'Y': '是' }, { 'N': '否' }]; } return { field: col.field, header: col.header, align: col.align || 'center', visible: col.visible !== false, exportFormat: exportFormat, groupField: col.groupField, reportType: col.reportType || '', }; }
  private transformOptionsForExport<T extends Record<string, any>>(options: T[], valueKey = 'value', labelKey = 'label') { if (!options) return []; return options.map(item => ({ [item[valueKey]]: item[labelKey] })); }
  private isYNField(field: string): boolean { const list: string[] = ['STO_Direct', 'Instms_Flag', 'water_flag', 'electric_flag', 'gas_flag', 'edc_yn', 'rent_ahead', 'pos_yn', 'cash_yn', 'comm_yn', 'vip_yn', 'cap_saletype3', 'cap_saletype4', 'day_account', 'rece_yn', 'use_flag', 'calc_date_type', 'cap_saletype1', 'cap_saletype2', 'Group_Mark', 'Donate_Mark', 'INV_Cancel', 'Invoice_Cancel', 'PLU_Disc', 'PLU_OpenOrderPrc', 'PLU_StopSale', 'PLU_IsStock', 'VEN_DiscYN', 'VEN_CTRLYN', 'COL_Success', 'COL_Runtime', 'PLU_OpenPrc', 'MAM_Week1', 'MAM_Week2', 'MAM_Week3', 'MAM_Week4', 'MAM_Week5', 'MAM_Week6', 'MAM_Week7', 'MasterFlag', 'VouPrintFlag', 'ABAT_YN', 'Budget_YN', 'Org_YN', 'Input_YN', 'AutoShare', 'ObjectNo', 'AUS_ENABLED', 'VIP_YN', 'TXN_UseSalePrc', 'PLU_Health', 'TBL_FullDnPos', 'TBL_FullDnSto', 'FLD_EnCode', 'KEY_PRI', 'TXN_ProcStatus', 'PKG_will_issue_receipt', 'TXN_VIP', 'TXN_PreOrder', 'ECR_ForceInput', 'ECR_CustTypeEntry', 'TBL_DnPos', 'ECR_BoxReqCode', 'ECR_SaleRpt8', 'ECR_SaleRpt9', 'ECR_SaleRpt10', 'ECR_PcashValid', 'ECR_PickUpValid', 'ECR_ReprintGUI', 'ECR_PrnLogo', 'ECR_VoidTxn', 'ECR_CreditNote', 'ECR_RestoreVoid', 'ECR_EdcSettle', 'ECR_CustCntEntry', 'ECR_ClerkEntry', 'ECR_ForceMember', 'ECR_SelfReport', 'ECR_SaleRpt1', 'ECR_SaleRpt2', 'ECR_SaleRpt3', 'ECR_SaleRpt4', 'ECR_SaleRpt5', 'ECR_SaleRpt6', 'ECR_SaleRpt7', 'PAY_Ref', 'PAY_OpenBox', 'NOT_DispRt', 'NOT_DispSpd', 'NOT_DispBtn', 'NOT_DispCd', 'NOT_Prn', 'PAY_DefActPay', 'TSB_Enable']; return list.includes(field); }
}
