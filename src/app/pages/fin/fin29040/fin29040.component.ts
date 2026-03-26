import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { FIN29040Service } from '@service/api/fin/fin29040.service';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
//
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { finalize } from 'rxjs';

import { formatAmount, formatDate } from '@shared/componentkit/table/table.model';

//1.2.9.4 AP及ARNET之報表
@Component({
  selector: 'app-fin29040',
  templateUrl: './fin29040.component.html',
  styleUrl: './fin29040.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN29040Component extends BasicQueryPageComponent<any> implements OnInit {
  //
  queryForm = this.formBuilder.group({
    startdate: [, [Validators.required]], // 查詢年月
    enddate: [, [Validators.required]], // 查詢年月
    showUp: [1, [Validators.required]], // 報表方式
    factoryID: [], // 廠客代號
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
  ];
  selectedItems: any[] = [];
  columns: any[] = [
    { field: 'PartyNo', header: '廠客代號', visible: true },
    { field: 'PartyName', header: '廠客名稱', visible: true },
    { field: 'SourceType', header: '資料來源別', visible: true },
    { field: 'PaymentAmount', header: '付款金額', visible: true, format: formatAmount },
    { field: 'APAR_ID', header: '應收/付ID', visible: true },
    { field: 'BookDate', header: '立帳日期', visible: true, format: formatDate },
    { field: 'ExpectedPayDate', header: '預計收/付款日 退保留款/貼現日', visible: true, format: formatDate },
    // { field: 'ReturnReserveDate', header: '退保留款/貼現日', visible: true },
    { field: 'Remark', header: '備註', visible: true },
    { field: 'AccountNo', header: '會計科目', visible: true },
    // 其他欄位
  ];

  // ----------------------------------------------------------------
  factoryIDOptions: any[] = [];
  showUpOptions: any[] = [
    { value: 1, label: '顯示全部' },
    { value: 2, label: '顯示負值' },
  ];
  totalRecords = 0;
  exportPDFbtnLoading = false;
  exportExcelbtnLoading = false;

  constructor(
    private dropDownListService: DropDownListService,
    private fin29040Service: FIN29040Service
  ) {
    super(); // 呼叫父類建構子
  }
  ngOnInit(): void {

    this.initializePage('FIN29040', '/FIN/FIN29040cru', this.queryForm, (form) => this.onSubmit(form));

    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.factoryIDOptions = response.Data.map(item => ({ ...item, label: `${item.VEN_No} - ${item.Name}`, value: item.VEN_No }));
    });
  }

  onSubmit(form: FormGroup) {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      this.fin29040Service.queryFIN29040(this.buildQueryPayload(formValue))
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((response) => {
          this.data = response.Data ?? [];
          this.totalRecords = response.TotalCount ?? this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, formValue);
        });
    });
  }

  // ========= 匯出 =========
  onExportPDF(form: FormGroup) {
    const formValue = form.getRawValue();
    if (!formValue.startdate || !formValue.enddate) {
      this.messageService?.warnBubble?.('請輸入立帳日期（起訖）');
      return;
    }

    this.exportPDFbtnLoading = true;
    this.fin29040Service.exportFIN29040PDF(this.buildQueryPayload(formValue))
      .pipe(untilDestroyed(this), finalize(() => (this.exportPDFbtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', 'AP及AR淨額報表'),
        error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
      });
  }

  onExportExcel(form: FormGroup) {
    const formValue = form.getRawValue();
    if (!formValue.startdate || !formValue.enddate) {
      this.messageService?.warnBubble?.('請輸入立帳日期（起訖）');
      return;
    }

    this.exportExcelbtnLoading = true;
    this.fin29040Service.exportFIN29040080Excel(this.buildQueryPayload(formValue))
      .pipe(untilDestroyed(this), finalize(() => (this.exportExcelbtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.xlsx', 'AP及AR淨額報表'),
        error: () => this.messageService?.warnBubble?.('匯出 Excel 失敗。'),
      });
  }

  /** 產生查詢 payload */
  private buildQueryPayload(formValue: any): any {
    return {
      ...formValue,
      ACP_Date_From: this.toDateOnly(formValue.ACP_Date_From),
      ACP_Date_To: this.toDateOnly(formValue.ACP_Date_To),
      ACP_ExpectPayDate_From: this.toDateOnly(formValue.ACP_ExpectPayDate_From),
      ACP_ExpectPayDate_To: this.toDateOnly(formValue.ACP_ExpectPayDate_To),
    };
  }

  // ========= 本地工具 =========
  private toDateOnly(d: any): string | null {
    if (!d) return null;
    const dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return null;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const da = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  }

  private handleFileExport(resp: any, ext: '.pdf' | '.xlsx', baseName: string) {
    const blob = resp?.body instanceof Blob ? resp.body : resp;
    const fileName = `${baseName}_${new Date().getTime()}${ext}`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
