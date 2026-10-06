/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '@service/system/auth.service';
import { SystemOptionsService } from '@service/system/sys1000.service';
import { SystemDataService } from '@service/system/system-data.service';
import { FileExportService } from '@shared/service/file-export.service';
import { finalize } from 'rxjs';
import { CurrentPageService } from 'src/app/core/layout/app.menulist/current-page.service';
import { ReportColumn } from '../components/table-report/table-report.model';
import { QueryStateService } from '../service/query-state.service';
import { EXPORT_YN_FIELDS } from './export.constants';
import { REPORT_TITLES } from './report-titles';
import { TableService } from './report.service';

export interface ExportContext {
  apiUrl?: string;
  reportTitle?: string;
  dataKeyName?: string;
  conditions?: any;
  printRemark?: boolean;
  customFileName?: string;
  extraParams?: Record<string, any>;
  printRemarkText?: string;
}

export interface ExportParams {
  event: any;
  columns: any[];
  context: ExportContext;
  footerData?: any;
  expansionColumns?: any[];
}

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
  private readonly queryState = inject(QueryStateService); // 補上注入

  /**
   * 執行 PDF 匯出（100% 復刻舊底層邏輯版）
   */
  public executePdfExport(params: ExportParams, onLoadingChange?: (loading: boolean) => void): void {
    const { event, columns, context, footerData, expansionColumns } = params;

    const progNo = this.currentPage.currentPageProgNoSubject.getValue() as string;
    const funInfo = this.systemDataService.getUserPermissions(progNo);
    const userInfo = this.authService.currentUserValue;
    const formattedToday = this.datePipe.transform(new Date(), 'yyyyMMdd');

    const finalApiUrl = context.apiUrl;
    const serviceName = finalApiUrl ? `${finalApiUrl}` : `query${progNo}`;
    const stateCache = this.queryState.getQueryState(`${finalApiUrl || `query${progNo}`}`);
    const finalConditions = context.conditions || stateCache?.value || [];
    const fallbackTitleKey = finalApiUrl ? `${finalApiUrl}` : `query${progNo}`;
    const finalReportTitle = context.reportTitle || REPORT_TITLES[fallbackTitleKey] || funInfo?.prog_name;
    const finalPrintRemark = context.printRemark !== undefined ? context.printRemark : true;
    const finalDataKeyName = context.dataKeyName || undefined;

    const pdfColumns = columns.map(col => this.mapColumnField(col));
    const pdfExpansionColumns = expansionColumns && expansionColumns.length > 0 ? expansionColumns.map(col => this.mapColumnField(col)) : null;

    const body = {
      query_condition: { ServiceName: serviceName, Conditions: finalConditions },
      report_title: finalReportTitle,
      columns: pdfColumns,
      expansion_columns: pdfExpansionColumns,
      config: { ...event, footer_DataType: finalPrintRemark ? progNo : undefined },
      footer_data: footerData ? (Array.isArray(footerData) ? footerData : [footerData]) : null,
      // file_name 優先用 finalReportTitle（REPORT_TITLES/prog_name，跟 report_title 內容同一個來源），
      // 沒有才退回原本的 prog_id/progNo，避免下載檔名一直只顯示看不懂的作業代碼
      file_name: context.customFileName || `${userInfo?.user_No}_${finalReportTitle || funInfo?.prog_id || progNo}_${formattedToday}`,
      data_key_name: finalDataKeyName,
      print_remark_text: context.printRemarkText || undefined
    };

    // 【核心修正】通知組件開始轉圈圈
    if (onLoadingChange) onLoadingChange(true);
    const export$ = this.tableService.exportPDF(body);

    this.fileExportService.executeFileExport(
      // 利用 RxJS 的 finalize，確保無論成功或失敗，通通都會關閉 Loading
      export$.pipe(finalize(() => {
        if (onLoadingChange) onLoadingChange(false);
      })),
      '.pdf',
      // 【核心修正】把回呼對接進底層的第三個參數，這樣下載成功/失敗時，底層才會通知外面！
      (isLoading) => {
        if (onLoadingChange) onLoadingChange(isLoading);
      }
    ).subscribe();
  }

  /**
   * 執行 Excel 匯出
   */
  public executeExcelExport(params: ExportParams, onLoadingChange?: (loading: boolean) => void): void {
    const { event, columns, context, footerData, expansionColumns } = params;
    const progNo = this.currentPage.currentPageProgNoSubject.getValue() as string;
    const funInfo = this.systemDataService.getUserPermissions(progNo);
    const userInfo = this.authService.currentUserValue;
    const formattedToday = this.datePipe.transform(new Date(), 'yyyyMMdd');

    const finalApiUrl = context.apiUrl;
    const serviceName = finalApiUrl ? `${finalApiUrl}` : `query${progNo}`;
    const stateCache = this.queryState.getQueryState(`${finalApiUrl || `query${progNo}`}`);
    const finalConditions = context.conditions || stateCache?.value || [];
    const fallbackTitleKey = finalApiUrl ? `${finalApiUrl}` : `query${progNo}`;
    const finalReportTitle = context.reportTitle || REPORT_TITLES[fallbackTitleKey] || funInfo?.prog_name;
    const finalDataKeyName = context.dataKeyName || undefined;

    const excelColumns = columns.map(col => this.mapColumnField(col));
    const excelExpansionColumns = expansionColumns && expansionColumns.length > 0 ? expansionColumns.map(col => this.mapColumnField(col)) : null;

    const body = {
      query_condition: { ServiceName: serviceName, Conditions: finalConditions },
      report_title: finalReportTitle,
      columns: excelColumns,
      expansion_columns: excelExpansionColumns,
      config: { ...event, footer_DataType: context.printRemark !== false ? progNo : undefined },
      footer_data: footerData ? (Array.isArray(footerData) ? footerData : [footerData]) : null,
      // file_name 優先用 finalReportTitle（REPORT_TITLES/prog_name，跟 report_title 內容同一個來源），
      // 沒有才退回原本的 prog_id/progNo，避免下載檔名一直只顯示看不懂的作業代碼
      file_name: context.customFileName || `${userInfo?.user_No}_${finalReportTitle || funInfo?.prog_id || progNo}_${formattedToday}`,
      data_key_name: finalDataKeyName,
      print_remark_text: context.printRemarkText || undefined
    };

    // 【核心修正】Excel 同步打通 Loading 通訊鏈
    if (onLoadingChange) onLoadingChange(true);
    const export$ = this.tableService.exportExcel(body);

    this.fileExportService.executeFileExport(
      export$.pipe(finalize(() => {
        if (onLoadingChange) onLoadingChange(false);
      })),
      '.xlsx',
      (isLoading) => {
        if (onLoadingChange) onLoadingChange(isLoading);
      }
    ).subscribe();
  }

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
      reportType: col.reportType || ''
    };
  }
  private transformOptionsForExport<T extends Record<string, any>>(options: T[], valueKey = 'value', labelKey = 'label') {
    if (!options) return [];
    return options.map(item => ({
      [item[valueKey]]: item[labelKey]
    }));
  }
  private isYNField(field: string): boolean {
    return EXPORT_YN_FIELDS.has(field);
  }
}
