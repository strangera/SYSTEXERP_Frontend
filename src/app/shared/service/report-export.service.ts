/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { SystemOptionsService } from '@service/system/sys1000.service';
import { SystemDataService } from '@service/system/system-data.service';
import { AuthService } from '@service/system/auth.service';
import { FileExportService } from '@shared/service/file-export.service';
import { TableService } from '../componentkit/table/report.service';
import { CurrentPageService } from 'src/app/core/layout/app.menulist/current-page.service';
import { ExportParams, ReportColumn } from '../componentkit/table-report/table-report.model';
import { REPORT_TITLES } from '../componentkit/table/report-titles';

@Injectable({
  providedIn: 'root'
})
export class ReportExportService {
  // 💡 透過 inject 取得後端通訊與系統基礎服務
  private readonly tableService = inject(TableService);
  private readonly authService = inject(AuthService);
  private readonly systemDataService = inject(SystemDataService);
  private readonly fileExportService = inject(FileExportService);
  private readonly currentPage = inject(CurrentPageService);
  private readonly datePipe = inject(DatePipe);

  constructor() { }

  /**
   * 💡 執行 PDF 匯出
   */
  public executePdfExport(params: ExportParams, onLoadingChange?: (loading: boolean) => void): void {
    const { event, columns, context, footerData, expansionColumns } = params;

    // 1. 取得動態系統參數
    const progNo = this.currentPage.currentPageProgNoSubject.getValue() as string;
    const funInfo = this.systemDataService.getUserPermissions(progNo);
    const userInfo = this.authService.currentUserValue;
    const formattedToday = this.datePipe.transform(new Date(), 'yyyyMMdd');

    // 2. 欄位格式轉換
    const pdfColumns = columns.map(col => this.mapColumnField(col));
    const pdfExpansionColumns = expansionColumns && expansionColumns.length > 0
      ? expansionColumns.map(col => this.mapColumnField(col))
      : null;

    // 3. 組裝 Payload Body (整合新時代 context 與預設值)
    const body = {
      query_condition: {
        ServiceName: context.apiUrl || `query${progNo}`,
        Conditions: context.conditions || []
      },
      report_title: context.reportTitle || REPORT_TITLES[context.apiUrl || `query${progNo}`] || funInfo?.prog_name,
      columns: pdfColumns,
      expansion_columns: pdfExpansionColumns,
      config: {
        ...event,
        footer_DataType: context.printRemark !== false ? progNo : undefined
      },
      footer_data: footerData ? (Array.isArray(footerData) ? footerData : [footerData]) : null,
      file_name: `${userInfo?.user_No}_${funInfo?.prog_id || progNo}_${formattedToday}`,
      data_key_name: context.dataKeyName,
    };

    // 4. 發送匯出請求
    if (onLoadingChange) onLoadingChange(true);
    const export$ = this.tableService.exportPDF(body);

    this.fileExportService.executeFileExport(
      export$.pipe(finalize(() => { if (onLoadingChange) onLoadingChange(false); })),
      '.pdf',
      () => { } // 💡 彈窗關閉邏輯交由外面 Component 控制，這裡傳空函式即可
    ).subscribe();
  }

  /**
   * 💡 執行 Excel 匯出
   */
  public executeExcelExport(params: ExportParams, onLoadingChange?: (loading: boolean) => void): void {
    const { event, columns, context, footerData, expansionColumns } = params;

    const progNo = this.currentPage.currentPageProgNoSubject.getValue() as string;
    const funInfo = this.systemDataService.getUserPermissions(progNo);
    const userInfo = this.authService.currentUserValue;
    const formattedToday = this.datePipe.transform(new Date(), 'yyyyMMdd');

    const excelColumns = columns.map(col => this.mapColumnField(col));
    const excelExpansionColumns = expansionColumns && expansionColumns.length > 0
      ? expansionColumns.map(col => this.mapColumnField(col))
      : null;

    const body = {
      query_condition: {
        ServiceName: context.apiUrl || `query${progNo}`,
        Conditions: context.conditions || []
      },
      report_title: context.reportTitle || REPORT_TITLES[context.apiUrl || `query${progNo}`] || funInfo?.prog_name,
      columns: excelColumns,
      expansion_columns: excelExpansionColumns,
      config: event,
      footer_data: footerData ? (Array.isArray(footerData) ? footerData : [footerData]) : null,
      file_name: `${userInfo?.user_No}_${funInfo?.prog_id || progNo}_${formattedToday}`,
      data_key_name: context.dataKeyName
    };

    if (onLoadingChange) onLoadingChange(true);
    const export$ = this.tableService.exportExcel(body);

    this.fileExportService.executeFileExport(
      export$.pipe(finalize(() => { if (onLoadingChange) onLoadingChange(false); })),
      '.xlsx',
      () => { }
    ).subscribe();
  }

  /**
   * 💡 複製原本舊底層的欄位對應轉換核心邏輯 (移出舊 Component)
   */
  private mapColumnField(col: ReportColumn) {
    const mappingList = SystemOptionsService.getOptions(col.field);
    let exportFormat: any = [];
    if (col.exportFormat) {
      exportFormat = col.exportFormat;
    } else if (mappingList.length > 0) {
      exportFormat = this.transformOptionsForExport(mappingList, 'SYS_Code', 'SYS_Name');
    } else if (this.isYNField(col.field)) {
      exportFormat = [{ 'Y': '是' }, { 'N': '否' }];
    }
    return {
      field: col.field,
      header: col.header,
      align: col.align || 'center',
      visible: col.visible !== false,
      exportFormat: exportFormat,
      groupField: col.groupField,
      reportType: col.reportType || '',
    };
  }

  private transformOptionsForExport<T extends Record<string, any>>(options: T[], valueKey = 'value', labelKey = 'label') {
    if (!options) return [];
    return options.map(item => ({ [item[valueKey]]: item[labelKey] }));
  }

  // 💡 把原本寫死在 BasicPrintData 的 Y/N 清單完美封裝在此 Service 內部
  private isYNField(field: string): boolean {
    const list: string[] = [
      'STO_Direct', 'Instms_Flag', 'water_flag', 'electric_flag', 'gas_flag', 'edc_yn', 'rent_ahead', 'pos_yn', 'cash_yn', 'comm_yn', 'vip_yn', 'cap_saletype3', 'cap_saletype4', 'day_account', 'rece_yn', 'use_flag', 'calc_date_type', 'cap_saletype1', 'cap_saletype2', 'Group_Mark', 'Donate_Mark', 'INV_Cancel', 'Invoice_Cancel', 'PLU_Disc', 'PLU_OpenOrderPrc', 'PLU_StopSale', 'PLU_IsStock', 'VEN_DiscYN', 'VEN_CTRLYN', 'COL_Success', 'COL_Runtime', 'PLU_OpenPrc', 'MAM_Week1', 'MAM_Week2', 'MAM_Week3', 'MAM_Week4', 'MAM_Week5', 'MAM_Week6', 'MAM_Week7', 'MasterFlag', 'VouPrintFlag', 'ABAT_YN', 'Budget_YN', 'Org_YN', 'Input_YN', 'AutoShare', 'ObjectNo', 'AUS_ENABLED', 'VIP_YN', 'TXN_UseSalePrc', 'PLU_Health', 'TBL_FullDnPos', 'TBL_FullDnSto', 'FLD_EnCode', 'KEY_PRI', 'TXN_ProcStatus', 'PKG_will_issue_receipt', 'TXN_VIP', 'TXN_PreOrder', 'ECR_ForceInput', 'ECR_CustTypeEntry', 'TBL_DnPos', 'ECR_BoxReqCode', 'ECR_SaleRpt8', 'ECR_SaleRpt9', 'ECR_SaleRpt10', 'ECR_PcashValid', 'ECR_PickUpValid', 'ECR_ReprintGUI', 'ECR_PrnLogo', 'ECR_VoidTxn', 'ECR_CreditNote', 'ECR_RestoreVoid', 'ECR_EdcSettle', 'ECR_CustCntEntry', 'ECR_ClerkEntry', 'ECR_ForceMember', 'ECR_SelfReport', 'ECR_SaleRpt1', 'ECR_SaleRpt2', 'ECR_SaleRpt3', 'ECR_SaleRpt4', 'ECR_SaleRpt5', 'ECR_SaleRpt6', 'ECR_SaleRpt7', 'PAY_Ref', 'PAY_OpenBox', 'NOT_DispRt', 'NOT_DispSpd', 'NOT_DispBtn', 'NOT_DispCd', 'NOT_Prn', 'PAY_DefActPay', 'TSB_Enable'
    ];
    return list.includes(field);
  }
}
