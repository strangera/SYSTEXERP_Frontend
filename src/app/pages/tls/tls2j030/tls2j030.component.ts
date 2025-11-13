import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { createPaginationConfig, formatDateToYYYY_MM_DD } from '../../../shared/componentkit/table/table.model';
import { NgIf } from '@angular/common';
import { TLS2j030Service } from '@service/api/tls/tls2j030.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';
import { formatAmount, formatDateTime, formatDateToYYYYMMDD } from '@shared/componentkit/table2/table2.model';

// 2.2.18.3 後台發票換開補登作業
@Component({
  selector: 'app-tls2j030',
  templateUrl: './tls2j030.component.html',
  styleUrl: './tls2j030.component.scss',
  standalone: true,
  imports: [NgIf, TableReportComponent, ButtonComponent, DropdownComponent, CalendarRangeComponent, InputTextComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, TranslateModule]
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
    ...createPaginationConfig([{ field: 'CHG_No', order: 1 }])
  });

  totalRecords = 0;
  data: any[] = [];
  selectedItems: any[] = [];
  isNotECR = false;
  lastQueryBody: any = {};

  GUI_STATS_Options = [
    { label: '正常', value: '0' },
    { label: '刪除', value: '1' }
  ];
  columns: ReportColumn[] = [
    { field: 'CHG_No', header: '換開編號', visible: true },
    { field: 'GUI_InputDate', header: '換開日期', visible: true, format: formatDateToYYYY_MM_DD },
    { field: 'TXN_Date', header: '來源發票日期', visible: true, format: formatDateToYYYY_MM_DD },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'TXN_GUIBegNo', header: '來源發票號碼', visible: true },
    { field: 'TXN_TotGui', header: '來源發票金額', visible: true, format: formatAmount },
    {
      field: 'GUI_Status',
      header: '換開狀態',
      visible: true,
      format: (value) => this.formatStatus(value)
    },
    { field: 'GUI_CancelDate', header: '刪除日期', visible: true, format: formatDateToYYYY_MM_DD },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDateToYYYY_MM_DD },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: true },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true },
    { field: 'UPD_Date', header: '變更日期', visible: true },
    { field: 'UPD_USR_No', header: '變更人員編號', visible: true },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: true },
  ];
  formatStatus(value: string) {
    const item = this.GUI_STATS_Options.find(o => o.value === value);
    return item?.label ?? value;
  }


  constructor(
    private dropDownListService: DropDownListService,
    public readonly tls2j030Service: TLS2j030Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2J030', 'TLS/TLS2J030cru', this.queryForm, (form) => this.onSubmit(form));
    // this.checkECRMachine();
  }

  // private checkECRMachine() {
  //   const ip = this.authService.currentUserValue?.client_ip;
  //   if (!ip) {
  //     this.isNotECR = true;
  //     return;
  //   }

  //   this.tls2j030Service.checkECR(ip).subscribe({
  //     next: (res) => {
  //       this.isNotECR = !res.isValid;
  //     },
  //   });
  // }

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
        GUI_Status: frm.value.GUI_Status ?? ""
      };

      this.loading = true;
      this.tls2j030Service.queryTLS2J030(req).pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe({
        next: (response) => {

          // 檢查 API 回應狀態
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.totalRecords = response.TotalCount || 0;
            this.lastQueryBody = req;
            // 儲存查詢狀態
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

}
