import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin32010Service } from '@service/api/fin/fin32010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { formatAmount } from './../../../shared/componentkit/table-report/table-report.model';
//1.3.2.1 應收帳款維護
@Component({
  selector: 'app-fin32010',
  templateUrl: './fin32010.component.html',
  styleUrl: './fin32010.component.scss',
  standalone: true,
  imports: [AsyncPipe, CalendarRangeQuickComponent, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, CalendarComponent, InputNumberRangeComponent, InputTextComponent, ButtonComponent, TranslateModule]
})
export class FIN32010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ARS_No: ["", [Validators.maxLength(14)]],
    ORG_ID: [null, [Validators.maxLength(20)]],
    sam_yyymm: ["", [Validators.maxLength(6)]],
    sam_termno: [null, [Validators.max(99)]],
    ARS_Amt_From: [null, [Validators.max(9999999999)]],
    ARS_Amt_To: [null, [Validators.max(9999999999)]],
    PTA_Amt_From: [null, [Validators.max(9999999999)]],
    PTA_Amt_To: [null, [Validators.max(9999999999)]],
    BalAmt_From: [null, [Validators.max(9999999999)]],
    BalAmt_To: [null, [Validators.max(9999999999)]],
    PTA_Date_From: [null],
    PTA_Date_To: [null],
    ARS_Date_From: [null],
    ARS_Date_To: [null],
    CustNo: [null],
    Uniform_No: [null, [Validators.maxLength(16)]],
    AccNo: [null, [Validators.maxLength(50)]],
    ARS_SourceNo: [null, [Validators.maxLength(80)]],
    VouNo: ["", [Validators.maxLength(12)]],
    PostFlag: [null, [Validators.maxLength(100)]],
    ARS_Status: [null],
    SubDetailNo: [""],
    NoteDesc: [null, [Validators.maxLength(160)]],
  });
  // 表格
  // ----------------------------------------------------------------
  pageSize = 20;
  pageIndex = 1;
  sortBy = '';
  totalRecords = 0;
  data: any[] = [];
  lastQueryBody: any | null = null;
  columns: ReportColumn[] = [
    { field: 'RowNo', header: '序號', visible: false },
    { field: 'ARS_ID', header: '應收ID' },
    { field: 'ARS_Amt', header: '應收金額', format: formatAmount },
    { field: 'PTA_Amt', header: '沖帳金額', format: formatAmount },
    { field: 'ARS_BalAmt', header: '應收帳款餘額', format: formatAmount },
    { field: 'ARS_Date', header: '立帳日期', format: formatDate },
    { field: 'PTA_Date', header: '預計收款日', format: formatDate },
    { field: 'CustInfo', header: '廠商編號' },
    { field: 'NoteDesc', header: '摘要' },
    { field: 'VouNo', header: '傳票號碼' },
    { field: 'VouStatus', header: '傳票狀態' },
    { field: 'ARS_StatusName', header: '應收狀態' },
  ];
  // 下拉選單/多選列表的 Options 宣告 (必須與 HTML 中的 options 屬性對應)
  Org_IdOptions = this.dropDown.querySys3100(); // 組織代碼
  VEN_BNK_No_ParamOptions = this.dropDown.queryAps1001NoBranch(); // 匯款銀行代號
  VEN_No_ParamOptions = this.dropDown.queryPos2013({ VEN_Flag: '' }); // 廠商編號
  AccNo_ParamOptions = this.dropDown.queryGls1005(); // 會計科目代號
  VouStatusOptions = getSYS1000Options('VOU_Status'); // 傳票狀態
  ACP_Status_ParamOptions = getSYS1000Options('ACP_Status'); // 應付狀態
  SubDetailNo_ParamOptions = this.dropDown.queryGLS1016();  // 對象別編號
  constructor(
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe,
    public readonly fin32010Service: Fin32010Service,
  ) {
    super();
  }

  // 禁止編輯的判斷：已改為永遠允許編輯（不以 VouNo 判斷）
  editDisabledByVouNo = (_rowData: any): boolean => {
    return false;
  }

  ngOnInit(): void {
    this.initializePage('FIN32010', 'fin/FIN32010cru', this.queryForm, (form) => this.onSubmit(form));

  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

      const body: any = {
        PageSize: this.pageSize,
        PageIndex: this.pageIndex,
        // 兼容共用 table-report：同時帶小寫 pageSize/pageIndex
        pageSize: this.pageSize,
        pageIndex: this.pageIndex,
        Offset: 0,
        OrderBy: "",
        SortBy: this.sortBy
          ? [{ field: this.sortBy, order: 1 }]
          : [],

        // ← 加入所有查詢欄位
        ARS_No: frm.value.ARS_No ?? "",
        ORG_ID: frm.value.ORG_ID ?? "",
        sam_yyymm: frm.value.sam_yyymm ?? "",
        sam_termno: frm.value.sam_termno ?? null,

        ARS_Amt_From: frm.value.ARS_Amt_From ?? null,
        ARS_Amt_To: frm.value.ARS_Amt_To ?? null,
        PTA_Amt_From: frm.value.PTA_Amt_From ?? null,
        PTA_Amt_To: frm.value.PTA_Amt_To ?? null,
        BalAmt_From: frm.value.BalAmt_From ?? null,
        BalAmt_To: frm.value.BalAmt_To ?? null,

        PTA_Date_From: frm.value.PTA_Date_From ?? null,
        PTA_Date_To: frm.value.PTA_Date_To ?? null,
        ARS_Date_From: frm.value.ARS_Date_From ?? null,
        ARS_Date_To: frm.value.ARS_Date_To ?? null,

        CustNo: frm.value.CustNo ?? "",
        Uniform_No: frm.value.Uniform_No ?? "",
        AccNo: frm.value.AccNo ?? "",
        ARS_SourceNo: frm.value.ARS_SourceNo ?? "",
        VouNo: frm.value.VouNo ?? "",
        PostFlag: frm.value.PostFlag ?? null,
        ARS_Status: frm.value.ARS_Status ?? null,
        SubDetailNo: frm.value.SubDetailNo ?? "",
        NoteDesc: frm.value.NoteDesc ?? "",

        ACP_YYYYMM: frm.value.ACP_YYYYMM ?? ""
      };

      this.fin32010Service.queryFIN32010(body)
        .pipe(finalize(() => this.loading = false), untilDestroyed(this))
        .subscribe(response => {
          const rows = response.Data ?? [];
          // 把狀態代碼轉成文字顯示
          this.data = rows.map((r: any) => ({
            ...r,
            ARS_StatusName: this.ACP_Status_ParamOptions.find(opt => String(opt.value) === String(r.ARS_StatusCode))?.label ?? r.ARS_StatusCode
          }));
          this.totalRecords = response.TotalCount ?? 0;
          this.lastQueryBody = body;
        });
    });
  }


}
