import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN29040Service } from '@service/api/fin/fin29040.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { formatAmount, formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { ReportSignatureComponent } from '@shared/biz-components/report-signature/report-signature.component';

//1.2.9.4 AP及ARNET之報表
@Component({
  selector: 'app-fin29040',
  templateUrl: './fin29040.component.html',
  standalone: true,
  imports: [ReportSignatureComponent, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN29040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    startdate: [null, [Validators.required]], // 查詢年月
    enddate: [null, [Validators.required]], // 查詢年月
    showUp: [1, [Validators.required]], // 報表方式
    factoryID: [], // 廠客代號
  });
  data: any[] = [];
  summaryData: any[] = [];
  selectedItems: any[] = [];
  columns: ReportColumn[] = [
    { field: 'PartyNo', header: '廠客代號', align: 'left' },
    { field: 'PartyName', header: '廠客名稱', align: 'left' },
    { field: 'SourceType', header: '資料來源別', align: 'left' },
    { field: 'PaymentAmount', header: '付款金額', format: formatAmount, isSubTotal: true, align: 'right' },
    { field: 'APAR_ID', header: '應收/付ID', align: 'left' },
    { field: 'BookDate', header: '立帳日期', format: formatDate, align: 'left' },
    { field: 'ExpectedPayDate', header: '預計收/付款日 退保留款/貼現日', format: formatDate, align: 'left' },
    { field: 'Remark', header: '備註', align: 'left' },
    { field: 'AccountNo', header: '會計科目', align: 'left' },
  ];

  factoryIDOptions: any[] = [];
  showUpOptions: any[] = [{ value: 1, label: '顯示全部' }, { value: 2, label: '顯示負值' },];
  totalRecords = 0;
  exportPDFbtnLoading = false;
  exportExcelbtnLoading = false;

  constructor(
    private dropDownListService: DropDownListService,
    private fin29040Service: FIN29040Service
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('FIN29040');
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.factoryIDOptions = response.Data.map(item => ({ ...item, label: `${item.VEN_No} - ${item.Name}`, value: item.VEN_No }));
    });
  }
  onSubmit(form: FormGroup) {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      this.fin29040Service.queryFIN29040(this.buildQueryPayload(formValue))
        .pipe(
          untilDestroyed(this),
          finalize(() => (this.loading = false))
        )
        .subscribe((processedData) => {
          // 分別存入不同的變數
          this.data = processedData.DataList;
          this.summaryData = processedData.SummaryList;
          console.log('Processed Data:', processedData); // 可以在這裡查看處理後的資料結構
          this.totalRecords = processedData.TotalCount;
        });
    });
  }

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
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    globalThis.URL.revokeObjectURL(url);
  }
}
