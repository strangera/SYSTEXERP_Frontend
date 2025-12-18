import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS2j030Service } from '@service/api/tls/tls2j030.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatDate } from '@shared/componentkit/table/table.model';
import { formatAmount } from '@shared/componentkit/table2/table2.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, formatDateToYYYY_MM_DD } from '../../../shared/componentkit/table/table.model';
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
    TXN_Date_Start: [''],
    TXN_Date_End: [''],
    GUI_INPUTDATE_Start: [new Date(), Validators.required],//換開日期起,必填
    GUI_INPUTDATE_End: [new Date(), Validators.required],//換開日期迄,必填
    TXN_GUIBegNo: ['', [Validators.maxLength(10)]],
    GUI_Status: ['0'],
    TXN_Uniform: [''],
    ...createPaginationConfig([{ field: 'CHG_No', order: 1 }])
  });

  totalRecords = 0;
  data: any[] = [];
  selectedItems: any[] = [];
  isNotECR = false;
  lastQueryBody: any = {};
  btnLoading2 = false;
  TXN_Uniform_noOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  GUI_STATS_Options = GUI_STATUS_OPTIONS;
  columns: ReportColumn[] = [
    { field: 'CHG_No', header: '換開編號', visible: true },
    { field: 'TXN_Date', header: '換開日期', visible: true, format: formatDate },
    // { field: 'TXN_Date', header: '來源發票日期', visible: true, format: formatDateToYYYY_MM_DD },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    { field: 'TXN_SaleAmt', header: '銷售金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'TXN_Net', header: '未稅金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'TXN_SaleNoTax', header: '免稅金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'TXN_Tax', header: '稅額', visible: true, format: formatAmount, align: 'right' },
    {
      field: 'GUI_Status',
      header: '換開狀態',
      visible: true,
      format: (value) => this.formatStatus(value)
    },
    { field: 'GUI_CancelDate', header: '刪除日期', visible: true, format: formatDate },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: true },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true },
    { field: 'UPD_Date', header: '變更日期', visible: true },
    { field: 'UPD_USR_No', header: '變更人員編號', visible: true },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: true },
  ];

  formatStatus(value: string | number) {
    return GUI_STATUS_OPTIONS.find(o => o.value === String(value))?.label ?? String(value);
  }
  detailNaturalData: any[] = [];  // 來源發票
  detailChangeData: any[] = [];   // 換開發票
  detailItemData: any[] = [];     // 換開發票明細

  constructor(
    private dropDownListService: DropDownListService,
    public readonly tls2j030Service: TLS2j030Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  // 控制 checkbox 是否可選 - 當 GUI_Status 為 "1" 時不可選
  isRowSelectable = (rowData: TLS2J030Data): boolean => {
    return rowData?.GUI_Status !== "1";
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
    const ip = this.authService.currentUserValue?.client_ip;
    if (!ip) {
      this.isNotECR = true;
      return;
    }
    this.tls2j030Service.queryEcrNo(ip).subscribe({
      next: (res: any) => {
        this.isNotECR = (res.Data === null);

        if (this.isNotECR) {
          this.queryForm.disable();
        } else {
          this.queryForm.enable();
        }
      }
    });

  }

  onSubmit(frm: FormGroup) {
    if (this.isNotECR) return;
    this.handleSubmit(frm, () => {
      const req = {
        PageSize: frm.value.pageSize || 30,
        PageIndex: frm.value.pageIndex || 1,
        CHG_No: frm.value.CHG_No ?? "",
        GUI_InputDate_Start: formatDateToYYYY_MM_DD(frm.value.GUI_INPUTDATE_Start),
        GUI_InputDate_End: formatDateToYYYY_MM_DD(frm.value.GUI_INPUTDATE_End),
        TXN_Date_Start: formatDateToYYYY_MM_DD(frm.value.TXN_Date_Start),
        TXN_Date_End: formatDateToYYYY_MM_DD(frm.value.TXN_Date_End),
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
            this.totalRecords = response.TotalCount || 0;
            this.lastQueryBody = req;
            this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
          } else {
            // API 回傳錯誤狀態
            console.error('API Error:', response);
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
        TXN_Date: item.TXN_Date ? new Date(item.TXN_Date).toISOString() : new Date().toISOString(),
        ECR_No: item.ECR_No || '',
        TXN_No: Number(item.TXN_No) || 0,
        TXN_GUINo: item.TXN_GUINo || ''
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
      .subscribe({
        next: (res) => {
          console.log('Delete API Response:', res);
          if (res?.Status === '0001' || res?.Message === '成功') {
            this.messageService.successBubble(`刪除成功 (處理了 ${res?.Data || deleteItems.length} 筆資料)`, '刪除成功');
            this.onSubmit(this.queryForm);
            this.selectedItems = [];
          } else {
            this.messageService.errorBubble(`刪除失敗：${res?.Message || '系統錯誤'}`);
          }
        },
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
      TXN_Date_Start: this.queryForm.value.TXN_Date_Start
        ? formatDateToYYYY_MM_DD(this.queryForm.value.TXN_Date_Start)
        : '',
      TXN_Date_End: this.queryForm.value.TXN_Date_End
        ? formatDateToYYYY_MM_DD(this.queryForm.value.TXN_Date_End)
        : '',
      TXN_GUIBegNo: this.queryForm.value.TXN_GUIBegNo ?? '',

      GUI_Status: this.queryForm.value.GUI_Status ?? '',
      TXN_Uniform: this.queryForm.value.TXN_Uniform ?? '',
    };

    this.tls2j030Service.exportTLS2J030PDF(exportData)
      .pipe(finalize(() => (this.btnLoading2 = false)))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `發票換開報表_${formatDateToYYYY_MM_DD(new Date())}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);

          this.messageService.successBubble('PDF 匯出成功');
        },
      });
  }

}
