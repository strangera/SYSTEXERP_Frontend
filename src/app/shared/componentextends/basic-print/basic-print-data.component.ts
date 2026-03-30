/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, inject, Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SystemOptionsService } from '@service/system/sys1000.service';
import { SystemDataService } from '@service/system/system-data.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { FunsrightInfo } from '@shared/models/system/funsrightInfo';
import { FileExportService } from '@shared/service/file-export.service';
import { finalize } from 'rxjs';
import { AuthService } from '../../../service/system/auth.service';
import { REPORT_TITLES } from '../../componentkit/table/report-titles';
import { TableService } from '../../componentkit/table/report.service';
import { TableExport } from '../../componentkit/table/table-export/table-export.component';
import { Column } from '../../componentkit/table/table.model';
import { QueryStateService } from '../../service/query-state.service';
import { CurrentPageService } from './../../../core/layout/app.menulist/current-page.service';

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export abstract class BasicPrintDataComponent {
  IsPrint = true;
  exportDialog = false;
  exportLoading = false;
  exportStatus: 'PDF' | 'Excel' = 'PDF';

  cdr = inject(ChangeDetectorRef);
  queryState = inject(QueryStateService);
  currentPage = inject(CurrentPageService);
  tableService = inject(TableService);
  authService = inject(AuthService);
  messageService = inject(NotificationService);
  systemDataService = inject(SystemDataService);
  fileExportService = inject(FileExportService);
  datePipe = inject(DatePipe);
  constructor() {
    this.getProgNo();
  }

  export(status: 'PDF' | 'Excel'): void {
    if (status === 'PDF') {
      this.exportStatus = 'PDF';
      this.exportDialog = true;
    } else if (status === 'Excel') {
      this.exportStatus = 'Excel';
      this.exportDialog = true;
    }
  }

  exportPDFDownload(event: TableExport, columns: Column[], apiUrl?: string, DataKeyName?: string, PrintRemark?: boolean, Conditions?: any, PrintColumn?: Column[]): void {
    const ProgNo = this.currentPage.currentPageProgNoSubject.getValue() as string;
    const funInfo = this.systemDataService.getUserPermissions(ProgNo); // 取得權限
    const queryState = this.queryState.getQueryState(`${apiUrl ? apiUrl : `query${ProgNo}`}`);
    const userInfo = this.authService.currentUserValue;
    const formattedToday = this.datePipe.transform(new Date(), 'yyyyMMdd');
    const printColumns = PrintColumn ? PrintColumn : columns;
    const pdfColumns = printColumns.map(col => {
      const mappingList = SystemOptionsService.getOptions(col.field);
      let exportFormat: any = [];
      if (col.exportFormat) {
        exportFormat = col.exportFormat;
      } else if (mappingList.length > 0) {
        exportFormat = transformOptionsForExport(mappingList, 'SYS_Code', 'SYS_Name');
      } else if (isYNField(col.field)) {
        exportFormat = [{ 'Y': '是' }, { 'N': '否' }]; // 如果是 YN 欄位，設定固定的格式
      }
      return {
        field: col.field,
        header: col.header,
        align: (col as any).align || 'left',
        visible: col.visible ? col.visible : true,
        exportFormat: exportFormat,
        groupField: col.groupField
      };
    });

    const body = {
      query_condition: {
        ServiceName: apiUrl ? `${apiUrl}` : `query${ProgNo}`,
        Conditions: Conditions || queryState?.value || []
      },
      report_title: REPORT_TITLES[`query${ProgNo}`] || funInfo?.prog_name,
      columns: pdfColumns,
      config: {
        ...event,
        footer_DataType: PrintRemark ? ProgNo : undefined
      },
      file_name: `${userInfo?.user_No}_${funInfo?.prog_id}_${formattedToday}`,
      data_key_name: DataKeyName
    };
    this.exportLoading = true;
    const export$ = this.tableService.exportPDF(body)
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this), finalize(() => this.exportLoading = false)),
      '.pdf',
      (isLoading) => this.exportDialog = isLoading
    ).subscribe();
  }
  exportExcelDownload(event: TableExport, columns: Column[], apiUrl?: string, DataKeyName?: string, Conditions?: any, PrintColumn?: Column[]): void {
    const ProgNo = this.currentPage.currentPageProgNoSubject.getValue() as string; // 取得程式編號
    const funInfo = this.systemDataService.getUserPermissions(ProgNo); // 取得權限
    const queryState = this.queryState.getQueryState(`${apiUrl ? apiUrl : `query${ProgNo}`}`); // 取得查詢條件
    const userInfo = this.authService.currentUserValue;                                      // 取得使用者
    const formattedToday = this.datePipe.transform(new Date(), 'yyyyMMdd');                   // 格式化日期
    const printColumns = PrintColumn ? PrintColumn : columns;
    const excelColumns = printColumns.map(col => {
      const mappingList = SystemOptionsService.getOptions(col.field);
      let exportFormat: any = [];
      if (col.exportFormat) {             // 先檢查是否有 exportFormat
        exportFormat = col.exportFormat;
      } else if (mappingList.length > 0) {// 如果沒有 exportFormat，再檢查是否有 mappingList
        exportFormat = transformOptionsForExport(mappingList, 'SYS_Code', 'SYS_Name');
      } else if (isYNField(col.field)) { // 如果還是沒有 mappingList，再檢查是否是 YN 欄位
        exportFormat = [{ 'Y': '是' }, { 'N': '否' }]; // 如果是 YN 欄位，設定固定的格式
      }
      return {
        field: col.field,
        header: col.header,
        visible: col.visible ? col.visible : true,
        exportFormat: exportFormat,
        groupField: col.groupField
      };
    });

    const body = {
      query_condition: {
        ServiceName: apiUrl ? `${apiUrl}` : `query${ProgNo}`,
        Conditions: Conditions || queryState?.value || []
      },
      report_title: REPORT_TITLES[`query${ProgNo}`] || funInfo?.prog_name,
      columns: excelColumns,
      config: event,
      file_name: `${userInfo?.user_No}_${funInfo?.prog_id}_${formattedToday}`,
      data_key_name: DataKeyName
    };
    this.exportLoading = true;
    const export$ = this.tableService.exportExcel(body)
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this), finalize(() => this.exportLoading = false)), '.xlsx', (isLoading) => this.exportDialog = isLoading).subscribe();
  }
  toggleVisibility(): void {
    this.IsPrint = !this.IsPrint;
  }
  public funInfo?: FunsrightInfo = { PrivilegeBehavior: [] } as unknown as FunsrightInfo;
  abstract tableKey: string | undefined; // table 唯一標識 (必填)
  getProgNo() {
    this.currentPage.currentPageProgNo$.pipe(untilDestroyed(this)).subscribe(progNo => {
      if (progNo) {
        this.funInfo = this.systemDataService.getUserPermissions(progNo);
        this.tableKey = this.tableKey ? this.tableKey : progNo + 'TableQueryState';
      } else {
        this.funInfo = { PrivilegeBehavior: [] } as unknown as FunsrightInfo;
      }
    });
  }
  // 權限
  hasPermission(action: string): boolean {
    return this.funInfo?.PrivilegeBehavior?.some(behavior => behavior.function_code === action) || false;
  }
}
export const transformOptionsForExport = <T extends Record<string, any>>(
  options: T[],
  valueKey: keyof T = 'value',
  labelKey: keyof T = 'label',
) => {
  if (!options) {
    return [];
  }
  return options.map(item => {
    return {
      [item[valueKey]]: item[labelKey]
    };
  });
};


// 這邊先寫死，看後續怎麼調整
export const isYNField = (field: string) => {
  // 定義一個欄位合擊
  const list: string[] = [
    'STO_Direct',
    'Instms_Flag',
    'water_flag',
    'electric_flag',
    'gas_flag',
    'edc_yn',
    'rent_ahead',
    'pos_yn',
    'cash_yn',
    'comm_yn',
    'vip_yn',
    'cap_saletype3',
    'cap_saletype4',
    'day_account',
    'rece_yn',
    'use_flag',
    'calc_date_type',
    'cap_saletype1',
    'cap_saletype2',
    'Group_Mark',
    'Donate_Mark',
    'STO_Direct',
    'INV_Cancel',
    'Invoice_Cancel',
    'PLU_Disc',
    'PLU_OpenOrderPrc',
    'PLU_StopSale',
    'PLU_IsStock',
    'VEN_DiscYN',
    'VEN_CTRLYN',
    'COL_Success',
    'COL_Runtime',
    'PLU_OpenPrc',
    'MAM_Week1',
    'MAM_Week2',
    'MAM_Week3',
    'MAM_Week4',
    'MAM_Week5',
    'MAM_Week6',
    'MAM_Week7',
    'MasterFlag',
    'VouPrintFlag',
    'ABAT_YN',
    'Budget_YN',
    'Org_YN',
    'Input_YN',
    'AutoShare',
    'ObjectNo',
    'AUS_ENABLED',
    'VIP_YN',
    'TXN_UseSalePrc',
    'PLU_Health',
    'PLU_Disc',
    'TBL_FullDnPos',
    'TBL_FullDnSto',
    'FLD_EnCode',
    'KEY_PRI',
    'TXN_ProcStatus',
    'PKG_will_issue_receipt',
    'TXN_VIP',
    'TXN_PreOrder',
    'ECR_ForceInput',
    'ECR_CustTypeEntry',
    'TBL_DnPos',
    'ECR_BoxReqCode',
    'ECR_SaleRpt8',
    'ECR_SaleRpt9',
    'ECR_SaleRpt10',
    'ECR_PcashValid',
    'ECR_PickUpValid',
    'ECR_ReprintGUI',
    'ECR_PrnLogo',
    'ECR_VoidTxn',
    'ECR_CreditNote',
    'ECR_RestoreVoid',
    'ECR_EdcSettle',
    'ECR_CustCntEntry',
    'ECR_CustTypeEntry',
    'ECR_ClerkEntry',
    'ECR_ForceMember',
    'ECR_VoidTxn',
    'ECR_CreditNote',
    'ECR_SelfReport',
    'ECR_SaleRpt1',
    'ECR_SaleRpt2',
    'ECR_SaleRpt3',
    'ECR_SaleRpt4',
    'ECR_SaleRpt5',
    'ECR_SaleRpt6',
    'ECR_SaleRpt7',
    'PAY_Ref',
    'PAY_OpenBox',
    'NOT_DispRt',
    'NOT_DispSpd',
    'NOT_DispBtn',
    'NOT_DispCd',
    'NOT_Prn',
    'PAY_DefActPay',
    'TSB_Enable',
  ];
  return list.includes(field);
};
