import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS2j030Service } from '@service/api/tls/tls2j030.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AddButton, ReportColumn } from '@shared/components/table-report/table-report.model';
import { formatAmount, formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, formatDateToYYYY_MM_DD } from '../../../others/component/table/table.model';
import { GUI_STATUS_OPTIONS, TLS2J030Data } from './tls2j030.model';

// 2.2.18.3 後台發票換開補登作業
@Component({
  selector: 'app-tls2j030',
  templateUrl: './tls2j030.component.html',
  standalone: true,
  imports: [ButtonModule, AsyncPipe, NgIf, TableReportComponent, ButtonComponent, DropdownComponent, CalendarRangeComponent, InputTextComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, TranslateModule]
})
export class TLS2J030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    CHG_No: ['', [Validators.maxLength(12)]],
    GUI_INPUTDATE_Start: [new Date(), Validators.required],//換開日期起,必填
    GUI_INPUTDATE_End: [new Date(), Validators.required],//換開日期迄,必填
    TXN_Date_Start: [''],
    TXN_Date_End: [''],
    TXN_GUINo: ['', [Validators.maxLength(10)]],
    ORG_TXN_Date_Start: [''],
    ORG_TXN_Date_End: [''],
    TXN_GUIBegNo: ['', [Validators.maxLength(10)]],
    GUI_Status: [''],
    TXN_Uniform: [''],
    ...createPaginationConfig([{ field: 'CHG_No', order: 1 }]),
    pageSize: [1000],
  });

  totalRecords = 0;
  data: any[] = [];
  footerData: any = [];
  selectedItems: any[] = [];
  isNotECR = true;
  changeEcrNo = ''; // 目前使用的換開收銀機號
  clientIP = ''; // 目前電腦IP
  lastQueryBody: any = {};
  btnLoading2 = false;
  TXN_Uniform_noOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  GUI_STATS_Options = GUI_STATUS_OPTIONS;
  addButton: AddButton[] = [
    {
      label: '作廢',
      icon: 'pi pi-times-circle text-red-500',
      action: (rowData: TLS2J030Data) => {
        this.onInvalid(rowData);
      },
      // 1.換開機台才能執行作廢，2.換開狀態為正常且發票日未鎖定才能作廢
      disabled: (rowData: TLS2J030Data) => {
        if (this.isNotECR) return true;
        return rowData?.isInvoiceClose === "Y" || rowData?.GUI_Status === "1";
      }
    }
  ];
  columns: ReportColumn[] = [
    { field: 'CHG_No', header: '換開編號', visible: true },
    { field: 'GUI_InputDate', header: '換開日期', visible: true, format: formatDate },
    { field: 'TXN_Date', header: '換開發票日期', visible: true, format: formatDate },
    {
      field: 'ORG_TXN_Date', header: '來源發票日期', visible: true,
      cellClass: () => 'multiline-cell',
      format: (value: string) =>
        (value ?? '')
          .split(',')
          .map((s) => formatDate(s.trim()))
          .filter(Boolean)
          .join('\n'),
    },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, format: (value: number) => String(value ?? '').padStart(6, '0') },
    { field: 'TXN_GUINo', header: '換開發票號碼', visible: true },
    { field: 'TXN_SaleAmt', header: '銷售金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'TXN_Net', header: '未稅金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'TXN_SaleNoTax', header: '免稅金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'TXN_Tax', header: '稅額', visible: true, format: formatAmount, align: 'right' },
    { field: 'GUI_Status', header: '換開狀態', visible: true, format: (value) => this.formatStatus(value) },
    { field: 'GUI_CancelDate', header: '作廢日期', visible: true, format: formatDate },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: true },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true },
    { field: 'UPD_Date', header: '變更日期', visible: true, format: formatDate },
    { field: 'UPD_USR_No', header: '變更人員編號', visible: true },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: true },
  ];

  formatStatus(value: string | number | null | undefined) {
    // 防呆：如果是 null, undefined 或空字串，直接回傳空字串
    if (value == null || value === '') {
      return '';
    }

    // 正常處理
    return GUI_STATUS_OPTIONS.find(o => o.value === String(value))?.label ?? String(value);
  }
  detailNaturalData: any[] = [];  // 來源發票
  detailChangeData: any[] = [];   // 換開發票
  detailItemData: any[] = [];     // 換開發票明細

  constructor(
    public readonly tls2j030Service: TLS2j030Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  // 控制 checkbox 是否可選：1.換開機台才能執行刪除，2.電子發票不可刪，3.換開狀態為正常且發票日未鎖定才能刪除
  isRowSelectable = (rowData: TLS2J030Data): boolean => {
    if (this.isNotECR) return false;
    if (rowData?.TXN_GUIPaper === "E") return false;
    return rowData?.GUI_Status !== "1" && rowData?.isInvoiceClose !== "Y";
  }

  ngOnInit(): void {
    this.initializePage(
      'TLS2J030',
      'tls/tls2j030cru',
      this.queryForm,
      (form) => this.onSubmit(form)
    );
    this.checkECRMachine();
  }

  private checkECRMachine() {
    this.tls2j030Service.queryEcrNo().subscribe({
      next: (res: any) => {
        this.isNotECR = (res.Data.ECR_No === null);
        this.changeEcrNo = res.Data.ECR_No; // 目前使用的換開收銀機
        this.clientIP = res.Data.IP; // 目前電腦IP
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const req = {
        PageSize: frm.value.pageSize || 1000,
        PageIndex: frm.value.pageIndex || 1,
        CHG_No: frm.value.CHG_No ?? "",
        GUI_InputDate_Start: formatDateToYYYY_MM_DD(frm.value.GUI_INPUTDATE_Start),
        GUI_InputDate_End: formatDateToYYYY_MM_DD(frm.value.GUI_INPUTDATE_End),
        TXN_Date_Start: formatDateToYYYY_MM_DD(frm.value.TXN_Date_Start),
        TXN_Date_End: formatDateToYYYY_MM_DD(frm.value.TXN_Date_End),
        TXN_GUINo: frm.value.TXN_GUINo ?? "",
        ORG_TXN_Date_Start: formatDateToYYYY_MM_DD(frm.value.ORG_TXN_Date_Start),
        ORG_TXN_Date_End: formatDateToYYYY_MM_DD(frm.value.ORG_TXN_Date_End),
        TXN_GUIBegNo: frm.value.TXN_GUIBegNo ?? "",
        TXN_Uniform: frm.value.TXN_Uniform ?? "",
        GUI_Status: frm.value.GUI_Status ?? ""
      };

      this.loading = true;
      this.tls2j030Service.queryTLS2J030(req).pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.footerData = response.footerData;
            this.totalRecords = response.TotalCount || 0;
            const last = { ...req } as any;
            delete last.PageIndex;
            delete last.PageSize;
            last.pageIndex = req.PageIndex;
            last.pageSize = req.PageSize;
            this.lastQueryBody = last;
            this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
          } else {
            // API 回傳錯誤狀態
            this.messageService?.errorBubble(`查詢失敗：${response.Message || '系統錯誤'}`);
            this.data = [];
            this.totalRecords = 0;
            this.lastQueryBody = {};
          }
        },
      });
    });
  }
  override onDetail(row: any) {
    super.onDetail(row);
  }

  /** 刪除資料 */
  onDelete(deleteItems: any[]) {
    if (!deleteItems || deleteItems.length === 0) {
      this.messageService.warnBubble('請先選擇要刪除的資料', '警告');
      return;
    }
    this.messageService.confirm({
      header: '確認刪除',
      message: `確定要刪除選取的 ${deleteItems.length} 筆資料嗎？`,
      accept: () => {
        this.executeDelete(deleteItems);
      }
    });
  }
  private executeDelete(deleteItems: any[]) {
    const payload = {
      selectList: deleteItems.map(item => ({
        CHG_No: item.CHG_No || '',
      }))
    };
    this.loading = true;
    this.tls2j030Service.deleteTLS2J030(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((res) => {
        if (res?.Status === '0001' || res?.Message === '成功') {
          this.messageService.successBubble(`刪除成功 (處理了 ${res?.Data || deleteItems.length} 筆資料)`, '刪除成功');
          this.onSubmit(this.queryForm);
          this.selectedItems = [];
        } else {
          this.messageService.errorBubble(`刪除失敗：${res?.Message || '系統錯誤'}`);
        }
      });
  }

  /**作廢 */
  onInvalid(item: TLS2J030Data) {
    this.messageService.confirm({
      header: '確認作廢',
      message: `確定要作廢這筆換開資料嗎？`,
      accept: () => {
        const payload = {
          CHG_No: item.CHG_No || '',
          TXN_Date: item.TXN_Date ? new Date(item.TXN_Date).toISOString() : new Date().toISOString(),
          ECR_No: item.ECR_No || '',
          TXN_No: Number(item.TXN_No) || 0,
          TXN_GUINo: item.TXN_GUINo || ''
        };
        this.loading = true;
        this.tls2j030Service.invalidTLS2J030(payload).pipe(untilDestroyed(this), finalize(() => { this.loading = false; }))
          .subscribe((res) => {
            if (res?.Status === '0000' || res?.Message === '成功') {
              this.messageService.successBubble('作廢成功');
              this.onSubmit(this.queryForm);
              this.selectedItems = [];
            } else {
              this.messageService.errorBubble(`作廢失敗：${res?.Message || '系統錯誤'}`);
            }
          });
      }
    });
  }

  // 匯出 PDF
  onExportPDF() {
    if (this.data.length === 0) {
      this.messageService.warnBubble('沒有資料可以匯出');
      return;
    }

    this.btnLoading2 = true;

    const startDate = this.queryForm.value.GUI_INPUTDATE_Start
      ? formatDateToYYYY_MM_DD(this.queryForm.value.GUI_INPUTDATE_Start)
      : formatDateToYYYY_MM_DD(new Date());

    const endDate = this.queryForm.value.GUI_INPUTDATE_End
      ? formatDateToYYYY_MM_DD(this.queryForm.value.GUI_INPUTDATE_End)
      : formatDateToYYYY_MM_DD(new Date());
    const exportData = {
      CHG_No: this.queryForm.value.CHG_No ?? '',
      GUI_InputDate_Start: startDate,
      GUI_InputDate_End: endDate,
      TXN_Date_Start: this.queryForm.value.TXN_Date_Start ? formatDateToYYYY_MM_DD(this.queryForm.value.TXN_Date_Start) : '',
      TXN_Date_End: this.queryForm.value.TXN_Date_End ? formatDateToYYYY_MM_DD(this.queryForm.value.TXN_Date_End) : '',
      TXN_GUINo: this.queryForm.value.TXN_GUINo ?? '',
      ORG_TXN_Date_Start: this.queryForm.value.ORG_TXN_Date_Start ? formatDateToYYYY_MM_DD(this.queryForm.value.ORG_TXN_Date_Start) : '',
      ORG_TXN_Date_End: this.queryForm.value.ORG_TXN_Date_End ? formatDateToYYYY_MM_DD(this.queryForm.value.ORG_TXN_Date_End) : '',
      TXN_GUIBegNo: this.queryForm.value.TXN_GUIBegNo ?? '',
      GUI_Status: this.queryForm.value.GUI_Status ?? '',
      TXN_Uniform: this.queryForm.value.TXN_Uniform ?? '',
    };

    this.tls2j030Service.exportTLS2J030PDF(exportData)
      .pipe(finalize(() => (this.btnLoading2 = false)))
      .subscribe({
        next: (blob) => {
          const url = globalThis.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `發票換開報表_${formatDateToYYYY_MM_DD(new Date())}.pdf`;
          link.click();
          globalThis.URL.revokeObjectURL(url);

          this.messageService.successBubble('PDF 匯出成功');
        },
      });
  }

}
