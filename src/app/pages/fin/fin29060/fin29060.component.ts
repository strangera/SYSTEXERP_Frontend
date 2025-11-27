import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { TableSubheaderComponent } from '@shared/componentkit/table/table-subheader/table-subheader.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { FIN29060Data, FIN29060Service, QueryFIN29060Request } from '../../../service/api/fin/fin29060.service';
import {
  FIN55050Detail,
  FIN55050Service
} from '../../../service/api/fin/fin55050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { DropDownListService } from './../../../service/utility/dropDownList.service';
export interface GroupedFIN55050Detail extends FIN55050Detail {
  AccNo: string;
  AccCName: string;
  VouDate: string;
}
//1.2.9.6 廠商付款明細表
@Component({
  selector: 'app-fin29060',
  templateUrl: './fin29060.component.html',
  styleUrl: './fin29060.component.scss',
  standalone: true,
  imports: [ButtonModule, TableSubheaderComponent, DropdownRangeComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, InputTextComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule]
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
    ...createPaginationConfig([{ field: 'ACP_No', order: 1 }]),
  });
  VendorNoOptions: { label: string; value: string }[] = []; // 廠客代號選項
  AccNoOptions: { label: string; value: string }[] = []; // 科目代號選項
  data: FIN29060Data[] = [];
  selectedItems: FIN29060Data[] = [];
  totalRecords = 0;
  pdfBtnLoading = false;
  excelBtnLoading = false;
  columns: Column[] = [
    {
      field: 'ACP_No',
      header: '應付帳款編號',
      visible: true,
      htmlFormat: true,
      format: (value: string) => {
        // 處理 NULL、undefined 或空字串的情況
        if (!value || value === 'null' || value === 'undefined') {
          return '<span style="color: #999;">-</span>';
        }
        return `<a href="javascript:void(0)" onclick="window.handleAcpNoClick('${value}')" style="color: #007ad9; text-decoration: underline; cursor: pointer;">${value}</a>`;
      }
    },
    { field: 'VendorNo', header: '廠商編號', visible: true },
    { field: 'VendorName', header: '廠商名稱', visible: true },
    { field: 'AccNo', header: '會計科目', visible: true },
    { field: 'PostDate', header: '立帳日期', visible: true, format: formatDate },
    { field: 'ACP_Amt', header: '立帳金額', visible: true, format: formatAmount },
    { field: 'Summary', header: '摘要', visible: true },
    { field: 'PayAmt', header: '付款金額', visible: true, format: formatAmount },
    { field: 'PayRefDate', header: '開票/匯款日期', visible: true, format: formatDate },
    { field: 'BalanceAmt', header: '帳款餘額', visible: true, format: formatAmount },
    { field: 'PaymentNo', header: '電匯/開票/單號', visible: true },
    { field: 'VoucherNo', header: '傳票號碼', visible: true, type: 'detail' }
  ];

  // ----------------------------------------------------------------
  showUpOptions = [
    { value: 1, label: '顯示' },
    { value: 2, label: '不顯示' },
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
    this.setupGlobalClickHandler();
  }

  private setupGlobalClickHandler(): void {
    // 設定全域方法處理 ACP_No 點擊
    Object.assign(window, {
      handleAcpNoClick: (acpNo: string) => {
        this.onAcpNoClick({ ACP_No: acpNo } as FIN29060Data);
      }
    });
  }

  onAcpNoClick(row: FIN29060Data) {
    const acpNo = row?.ACP_No;
    if (!acpNo || acpNo === 'null' || acpNo === 'undefined' || acpNo.trim() === '') {
      this.messageService?.warnBubble?.('無法開啟，缺少應付帳款編號。');
      return;
    }

    try {
      const handoff = {
        acpNo,
        fromRoute: window.location.pathname,
        ts: Date.now(),
      };
      localStorage.setItem('FIN24010_CRU_HANDOFF', JSON.stringify(handoff));
      localStorage.setItem('FIN24010_CRU_PROGNO', 'FIN24010');
      console.log('[FIN24010] 已儲存 handoff:', handoff);
    } catch (err) {
      console.error('[FIN24010] handoff save failed:', err);
      this.messageService?.warnBubble?.('寫入交接資料失敗。');
    }

    window.open('/account/fin/fin24010cru', '_blank', 'noopener');
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
  override onDetail(row: FIN29060Data) {
    const vouNo = row?.VoucherNo;
    if (!vouNo) {
      this.messageService?.warnBubble?.('無法開啟，缺少傳票號碼。');
      return;
    }

    try {
      const handoff = {
        vouNo,
        fromRoute: window.location.pathname,
        ts: Date.now(),
      };
      localStorage.setItem('FIN55050_CRU_HANDOFF', JSON.stringify(handoff));
      localStorage.setItem('FIN55050_CRU_PROGNO', 'FIN55050');
      console.log('[FIN55050] 已儲存 handoff:', handoff);
    } catch (err) {
      console.error('[FIN55050] handoff save failed:', err);
      this.messageService?.warnBubble?.('寫入交接資料失敗。');
    }

    window.open('/account/fin/fin55050cru', '_blank', 'noopener');
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      this.loading = true;

      const requestData: QueryFIN29060Request = {
        PageSize: formValue.PageSize || 10,
        PageIndex: formValue.PageIndex || 1,
        SortBy: formValue.SortBy || [{ field: 'ACP_No', order: 1 }],
        STO_No: formValue.STO_No || '',
        VEN_No_From: formValue.VEN_No_From || '',
        VEN_No_To: formValue.VEN_No_To || '',
        ODM_Date_From: formValue.ODM_Date_From ? new Date(formValue.ODM_Date_From).toISOString() : undefined,
        ODM_Date_To: formValue.ODM_Date_To ? new Date(formValue.ODM_Date_To).toISOString() : undefined,
        PayRefDate_From: formValue.PayRefDate_From ? new Date(formValue.PayRefDate_From).toISOString().split('T')[0] : undefined,
        PayRefDate_To: formValue.PayRefDate_To ? new Date(formValue.PayRefDate_To).toISOString().split('T')[0] : undefined,
        AccNo_From: formValue.AccNo_From || '',
        AccNo_To: formValue.AccNo_To || '',
        ACP_Desc: formValue.ACP_Desc || '',
        ShowUnpaid: formValue.ShowUnpaid === true,
        ShowZeroBalance: formValue.ShowZeroBalance === true
      };

      this.fin29060Service
        .queryFIN29060(requestData)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
          next: (response) => {
            if (response && response.Data) {
              this.data = response.Data;
              this.totalRecords = response.TotalCount || 0;
            } else {
              this.data = [];
              this.totalRecords = 0;
            }
          },

        });
    });
  }
  private buildExportPayload(): QueryFIN29060Request {
    const raw = this.queryForm.getRawValue();

    return {
      PageSize: raw.pageSize ?? 10,
      PageIndex: raw.pageIndex ?? 1,

      // 後端 input 內沒有 OrderBy / Offset，我移除（要我可以加進 QueryFIN29060Request）
      SortBy: raw.SortBy ?? [{ field: 'ACP_No', order: 1 }],

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
        ? new Date(raw.PayRefDate_From).toISOString().split('T')[0]
        : undefined,

      PayRefDate_To: raw.PayRefDate_To
        ? new Date(raw.PayRefDate_To).toISOString().split('T')[0]
        : undefined,

      AccNo_From: raw.AccNo_From || '',
      AccNo_To: raw.AccNo_To || '',
      ACP_Desc: raw.ACP_Desc || '',

      ShowUnpaid: raw.ShowUnpaid === true,
      ShowZeroBalance: raw.ShowZeroBalance === true,
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
