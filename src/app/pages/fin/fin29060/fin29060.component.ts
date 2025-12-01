import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { Column, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { FIN29060Data, FIN29060Service, FIN29060TotalData, QueryFIN29060Request } from '../../../service/api/fin/fin29060.service';
import {
  FIN55050Detail,
  FIN55050Service
} from '../../../service/api/fin/fin55050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { DropDownListService } from './../../../service/utility/dropDownList.service';
import { Fin29060TableSubheaderComponent } from './fin29060-table-subheader/fin29060-table-subheader.component';
export interface GroupedFIN55050Detail extends FIN55050Detail {
  AccNo: string;
  AccCName: string;
  VouDate: string;
}
declare global {
  interface Window {
    handleAcpNoClick?: (acpNo: string) => void;
  }
}
//1.2.9.6 廠商付款明細表
@Component({
  selector: 'app-fin29060',
  templateUrl: './fin29060.component.html',
  styleUrl: './fin29060.component.scss',
  standalone: true,
  imports: [ButtonModule, Fin29060TableSubheaderComponent, DropdownRangeComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, InputTextComponent, RadiobuttonComponent, ButtonComponent, TranslateModule]
})
export class FIN29060Component extends BasicQueryPageComponent<FIN29060Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    STO_No: [""],
    VEN_No_From: [""],
    VEN_No_To: [""],
    ODM_Date_From: [null],
    ODM_Date_To: [null],
    PayRefDate_From: [null],
    PayRefDate_To: [null],
    AccNo_From: [""],
    AccNo_To: [""],
    ACP_Desc: [""],
    ShowUnpaid: [true],
    ShowZeroBalance: [true],
  });
  VendorNoOptions: { label: string; value: string }[] = []; // 廠客代號選項
  AccNoOptions: { label: string; value: string }[] = []; // 科目代號選項

  selectedItems: FIN29060Data[] = [];
  totalData: FIN29060TotalData[] = [];
  totalRecords = 0;
  pdfBtnLoading = false;
  excelBtnLoading = false;
  fullData: FIN29060Data[] = [];
  data: FIN29060Data[] = [];
  lazyBatchSize = 30;
  columns: Column[] = [
    { field: 'ACP_No', header: '應付帳款編號', visible: true, type: 'detail' },
    { field: 'VendorNo', header: '廠商編號', visible: true },
    { field: 'VendorName', header: '廠商名稱', visible: true },
    { field: 'AccNo', header: '會計科目', visible: true },
    { field: 'PostDate', header: '立帳日期', visible: true, format: formatDate },
    { field: 'ACP_Amt', header: '立帳金額', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
    { field: 'Summary', header: '摘要', visible: true },
    { field: 'PayAmt', header: '付款金額', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
    { field: 'PayRefDate', header: '開票/匯款日期', visible: true, format: formatDate },
    { field: 'BalanceAmt', header: '帳款餘額', visible: true, format: formatAmount },
    { field: 'NotPayAmy', header: '未付金額', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
    { field: 'PaymentNo', header: '電匯/開票/單號', visible: true },
    { field: 'VoucherNo', header: '傳票號碼', visible: true, type: 'detail' }
  ];

  // ----------------------------------------------------------------
  showUpOptions = [
    { value: 1, label: '顯示' },
    { value: 0, label: '不顯示' },
  ];

  constructor(
    private dropDownListService: DropDownListService,
    private fin55050Service: FIN55050Service,
    private fin29060Service: FIN29060Service
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN29060', '/FIN/FIN29060CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadOptions();
  }

  private loadOptions(): void {
    // 廠客代號
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.VendorNoOptions = res.Data.map((x: { No: string; Name: string }) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));
    // 科目代號
    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.AccNoOptions = res.Data.map((x: { No: string; Name: string }) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));

  }

  onDetailWithColValue(event: { row: FIN29060Data; col: any; value: any }) {
    const extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: event.row,
        fromRoute: this.router.url,
      },
    };
    if (event.col.field === 'ACP_No') {
      this.router.navigate([`/account/fin/fin24010cru`], extras);
    } else if (event.col.field === 'VoucherNo') {
      const vouNo = event.row?.VoucherNo;
      const handoff = {
        vouNo,
        fromRoute: window.location.pathname,
        ts: Date.now(),
      };
      localStorage.setItem('FIN55050_CRU_HANDOFF', JSON.stringify(handoff));
      localStorage.setItem('FIN55050_CRU_PROGNO', 'FIN55050');
      window.open('/account/fin/fin55050cru', '_blank', 'noopener');
    }
  }

  onSubmit(form: FormGroup) {
    this.submitted = true;
    if (form.invalid) return;

    this.loading = true;
    const body = form.value as QueryFIN29060Request;

    this.fin29060Service.queryFIN29060(body)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        const all = res.Data?.mainData ?? [];

        this.fullData = all;          // 所有資料
        this.totalRecords = all.length;

        // 顯示前 30筆
        this.data = this.fullData.slice(0, this.lazyBatchSize);
      });
  }


  private buildExportPayload(): QueryFIN29060Request {
    const raw = this.queryForm.getRawValue();

    return {
      STO_No: raw.STO_No || '',
      VEN_No_From: raw.VEN_No_From || '',
      VEN_No_To: raw.VEN_No_To || '',

      ODM_Date_From: raw.ODM_Date_From
        ? new Date(raw.ODM_Date_From).toISOString()
        : undefined,

      ODM_Date_To: raw.ODM_Date_To
        ? new Date(raw.ODM_Date_To).toISOString()
        : undefined,

      PayRefDate_From: raw.PayRefDate_From
        ? new Date(raw.PayRefDate_From).toISOString()
        : undefined,

      PayRefDate_To: raw.PayRefDate_To
        ? new Date(raw.PayRefDate_To).toISOString()
        : undefined,

      AccNo_From: raw.AccNo_From || '',
      AccNo_To: raw.AccNo_To || '',
      ACP_Desc: raw.ACP_Desc || '',

      ShowUnpaid: raw.ShowUnpaid,
      ShowZeroBalance: raw.ShowZeroBalance,
    };
  }


  onExportExcel() {
    if (!this.data?.length) {
      this.messageService.warnBubble('目前沒有資料可匯出');
      return;
    }

    const payload = this.buildExportPayload();

    this.excelBtnLoading = true;
    this.fin29060Service.exportFIN29060_Excel(payload)
      .pipe(finalize(() => this.excelBtnLoading = false))
      .subscribe({
        next: (r) => this.downloadFile(r, '.xlsx', '廠商付款明細表'),
        error: () => this.messageService.warnBubble('匯出 Excel 失敗')
      });
  }
  onExportPDF() {
    if (!this.data?.length) {
      this.messageService.warnBubble('目前沒有資料可匯出');
      return;
    }

    const payload = this.buildExportPayload();

    this.pdfBtnLoading = true;
    this.fin29060Service.exportFIN29060_PDF(payload)
      .pipe(finalize(() => this.pdfBtnLoading = false))
      .subscribe({
        next: (r) => this.downloadFile(r, '.pdf', '廠商付款明細表'),
        error: () => this.messageService.warnBubble('匯出 PDF 失敗')
      });
  }

  private downloadFile(resp: HttpResponse<Blob>, ext: string, name: string) {
    const blob = resp.body!;
    const fileName = `${name}_${new Date().getTime()}${ext}`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

}
