import { saveAs } from 'file-saver';
import { CurrentPageService } from './../../../core/layout/app.menulist/current-page.service';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, inject, Injectable } from '@angular/core';
import { QueryStateService } from '../../service/query-state.service';
import { TableService } from '../../componentkit/table/report.service';
import { HttpResponse } from '@angular/common/http';
import { Column } from '../../componentkit/table/table.model';
import { AuthService } from '../../../service/system/auth.service';
import { TableExport } from '../../componentkit/table/table-export/table-export.component';
import { REPORT_TITLES } from '../../componentkit/table/report-titles';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FunsrightInfo } from '@shared/models/system/funsrightInfo';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { SystemOptionsService } from '@service/system/sys1000.service';

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export abstract class BasicPrintDataComponent {
  IsPrint = true;
  exportDialog = false;
  exportStatus: 'PDF' | 'Excel' = 'PDF';

  cdr = inject(ChangeDetectorRef);
  queryState = inject(QueryStateService);
  currentPage = inject(CurrentPageService);
  tableService = inject(TableService);
  authService = inject(AuthService);
  messageService = inject(NotificationService);

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

  exportPDFDownload(event: TableExport, columns: Column[], apiUrl?: string): void {
    const ProgNo = this.currentPage.currentPageProgNoSubject.getValue() as string;
    const funInfo = this.authService.getUserPermissions(ProgNo); // 取得權限
    const queryState = this.queryState.getQueryState(`${apiUrl ? apiUrl : `query${ProgNo}`}`);
    const userInfo = this.authService.currentUserValue;
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // getMonth() 返回 0-11，所以要 +1
    const day = today.getDate().toString().padStart(2, '0');
    const formattedToday = `${year}${month}${day}`;
    const pdfColumns = columns.map(col => {
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
        visible: col.visible ? col.visible : true,
        exportFormat: exportFormat
      };
    });

    const body = {
      query_condition: {
        ServiceName: apiUrl ? `${apiUrl}` : `query${ProgNo}`,
        Conditions: queryState?.value || []
      },
      report_title: REPORT_TITLES[`query${ProgNo}`] || funInfo?.prog_name,
      columns: pdfColumns,
      config: {
        ...event,
        footer_DataType: ProgNo
      },
      file_name: `${userInfo?.user_No}_${funInfo?.prog_id}_${formattedToday}`
    };

    this.tableService.exportPDF(body).pipe(untilDestroyed(this)).subscribe({
      next: (response: HttpResponse<Blob>) => {
        if (response.body) {
          const contentDisposition = response.headers.get('content-disposition');
          let filename = `${body.file_name}.pdf`;
          if (contentDisposition) {
            const filenameRegex = /filename\*=UTF-8''(.+?)(?:\.pdf)?$|filename="(.+?)(?:\.pdf)?"$/;
            const matches = contentDisposition.match(filenameRegex);
            if (matches) {
              filename = matches[1] || matches[2] || filename;
              filename = decodeURIComponent(filename);
            }
            filename = filename.replace(/["']/g, '');
          }
          const blob = new Blob([response.body], { type: 'application/pdf' });
          saveAs(blob, filename);
        } else {
          console.error("Response body is empty!");
        }
        this.exportDialog = false;
      },
      error: (err: any) => {
        console.error('Error downloading PDF:', err);
        this.exportDialog = false;
      }
    });
  }
  exportExcelDownload(event: TableExport, columns: Column[], apiUrl?: string): void {
    const ProgNo = this.currentPage.currentPageProgNoSubject.getValue() as string;
    const funInfo = this.authService.getUserPermissions(ProgNo); // 取得權限
    const queryState = this.queryState.getQueryState(`${apiUrl ? apiUrl : `query${ProgNo}`}`);
    const userInfo = this.authService.currentUserValue;
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // getMonth() 返回 0-11，所以要 +1
    const day = today.getDate().toString().padStart(2, '0');
    const formattedToday = `${year}${month}${day}`;
    const excelColumns = columns.map(col => {
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
        visible: col.visible ? col.visible : true,
        exportFormat: exportFormat
      };
    });

    const body = {
      query_condition: {
        ServiceName: apiUrl ? `${apiUrl}` : `query${ProgNo}`,
        Conditions: queryState?.value
      },
      report_title: REPORT_TITLES[`query${ProgNo}`] || funInfo?.prog_name,
      columns: excelColumns,
      config: event,
      file_name: `${userInfo?.user_No}_${funInfo?.prog_id}_${formattedToday}`,
    };
    this.tableService.exportExcel(body).pipe(untilDestroyed(this)).subscribe({
      next: (response: HttpResponse<Blob>) => {
        if (response.body) {
          const contentDisposition = response.headers.get('content-disposition');
          let filename = `${body.file_name}.xlsx`; // 副檔名改為 .xlsx
          if (contentDisposition) {
            const filenameRegex = /filename\*=UTF-8''(.+?)(?:\.xlsx)?$|filename="(.+?)(?:\.xlsx)?"$/;  //  正則匹配.xlsx
            const matches = contentDisposition.match(filenameRegex);
            if (matches) {
              filename = matches[1] || matches[2] || filename;
              filename = decodeURIComponent(filename);
            }
            filename = filename.replace(/["']/g, '');
          }
          const blob = new Blob([response.body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); // 正確的 MIME 類型
          saveAs(blob, filename);
        } else {
          console.error("Response body is empty!");
        }
        this.exportDialog = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error downloading Excel:', err);
        this.exportDialog = false;
        this.cdr.detectChanges();
      }
    });
  }
  toggleVisibility(): void {
    this.IsPrint = !this.IsPrint;
  }
  public funInfo?: FunsrightInfo = { PrivilegeBehavior: [] } as unknown as FunsrightInfo;
  abstract tableKey: string | undefined; // table 唯一標識 (必填)
  getProgNo() {
    this.currentPage.currentPageProgNo$.pipe(untilDestroyed(this)).subscribe(progNo => {
      if (progNo) {
        this.funInfo = this.authService.getUserPermissions(progNo);
        this.tableKey = this.tableKey ? this.tableKey : progNo + 'TableQueryState';
        // this.cdr.detectChanges(); // 資料更新後觸發變更偵測
      } else {
        // 如果 progNo 為空，也將 funInfo 重置為安全預設值
        this.funInfo = { PrivilegeBehavior: [] } as unknown as FunsrightInfo;
      }
    });
  }
  // 權限
  canPerformAction(action: string): boolean {
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
