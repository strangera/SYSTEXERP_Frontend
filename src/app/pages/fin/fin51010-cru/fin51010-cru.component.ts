import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin51010Service, QueryFIN51010DetailLine, QueryFIN51010Response, UpdateFIN51010Request } from '@service/api/fin/fin51010.service';
import { TLS2C040Service } from '@service/api/tls/tls2c040.service';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { PanelModule } from 'primeng/panel';
import { TabViewModule } from 'primeng/tabview';
import { finalize, forkJoin, shareReplay } from 'rxjs';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

@Component({
  selector: 'app-fin51010-cru',
  templateUrl: './fin51010-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule,
    InputTextComponent, ButtonComponent, TranslateModule,
    TableEditComponent, NgIf, CalendarComponent, DropdownComponent,
    TableReportComponent, TabViewModule
  ],
})
export class FIN51010CRUComponent extends BasicCruPageComponent<QueryFIN51010Response> implements OnInit {
  dataForm = this.formBuilder.group({
    VouNo: [{ value: null as string | null, disabled: true }],      // 傳票編號
    TransVouNo: [{ value: null as string | null, disabled: true }],      // 傳票編號
    Voucher_Name: [{ value: null as string | null, disabled: true }], // 傳票名稱 (種類名稱)
    SrcSheetType: [{ value: null as string | null, disabled: true }], // 傳票型態 (代碼)
    VouDate: [null, [Validators.required]],      // 傳票日期
    Remark: [null as string | null],                // 傳票摘要 (可編輯)
    SettleNo: [{ value: null as string | null, disabled: true }],     // 結帳單號
    Trans_Status: [{ value: null as string | null, disabled: true }], // 狀態
    CRT_USR_No: [{ value: null as string | null, disabled: true }],   // 建立者
    CRT_Date: [{ value: null as string | null, disabled: true }],     // 建立日
    UPD_USR_No: [{ value: null as string | null, disabled: true }],   // 修改者
    UPD_Date: [{ value: null as string | null, disabled: true }],     // 修改日
  });
  arData: any[] = []; // 應收資料
  arTotalRecords = 0;
  arFooterData = { ar_amt: 0 };
  arLoading = false;
  arColumns: ReportColumn[] = [
    { field: 'VOUNO', header: '應收帳款代號', align: 'left' },
    { field: 'ProjectNo', header: '專案代號', align: 'left', width: '40px' },
    { field: 'org_id', header: '組織代碼', align: 'left', width: '40px' },
    { field: 'org_name', header: '組織名稱', align: 'left' },
    { field: 'CustomerNo', header: '客戶代碼', align: 'left' },
    { field: 'DetailNo', header: '廠商代號', align: 'left' },
    { field: 'VouType', header: '傳票類型', align: 'left' },
    { field: 'sam_yyymm', header: '年月', align: 'left', width: '40px' },
    { field: 'sam_termno', header: '帳次', align: 'left', width: '40px' },
    { field: 'ar_amt', header: '應收帳款金額', format: formatAmount, isTotal: true, align: 'right' },
    { field: 'pta_amt', header: '沖帳金額', format: formatAmount, align: 'right' },
    { field: 'accno', header: '會計科目', align: 'left' },
    { field: 'ent_date', header: '立帳日期', align: 'left', format: formatDate },
    { field: 'perget_date', header: '預計收款日期', align: 'left', format: formatDate },
    { field: 'SrcVouNo', header: '原始憑證', align: 'left' },
    { field: 'notedesc', header: '備註', align: 'left' },
  ];
  apData: any[] = []; // 應付資料
  apFooterData = { ap_amt: 0 };
  apTotalRecords = 0;
  apLoading = false;
  apColumns: ReportColumn[] = [
    { field: 'VOUNO', header: '應付帳款代號', align: 'left' },
    { field: 'ProjectNo', header: '專案代號', align: 'left', width: '100px' },
    { field: 'org_id', header: '組織代碼', align: 'left', width: '50px' },
    { field: 'org_name', header: '組織名稱', align: 'left' },
    { field: 'CustomerNo', header: '客戶代碼', align: 'left' },
    { field: 'DetailNo', header: '廠商代號', align: 'left' },
    // 後端回傳 VouType = GLS1010.Voucher_Name（依傳票型態/種類對應的中文名稱）
    { field: 'VouType', header: '傳票類型', align: 'left' },
    { field: 'sam_yyymm', header: '年月', align: 'left', width: '50px' },
    { field: 'sam_termno', header: '帳次', align: 'left', width: '15px' },
    { field: 'ap_amt', header: '應付帳款金額', format: formatAmount, isTotal: true, align: 'right' },
    { field: 'pta_amt', header: '沖帳金額', format: formatAmount, align: 'right' },
    { field: 'accno', header: '會計科目', align: 'left' },
    { field: 'ent_date', header: '立帳日期', align: 'left', format: formatDate, width: '70px' },
    { field: 'perget_date', header: '預計付款日期', align: 'left', format: formatDate, width: '70px' },
    { field: 'SrcVouNo', header: '原始憑證', align: 'left' },
    { field: 'notedesc', header: '備註', align: 'left' },
    // { field: 'AP_Status', header: '狀態', align: 'left' },
  ];
  data: QueryFIN51010DetailLine[] = [];
  columns: EditColumn[] = [
    { field: 'SerNo', header: '序號', width: '60px', textAlign: 'left' },
    {
      field: 'AccNo', header: '科目代號', width: '120px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.ledgerOptions$, optionLabel: 'value', optionValue: 'value',
      templateLabel: 'label', showClear: false,
      onChange: (value: any, rowData: any) => {
        if (value) {
          this.dropdown.queryGls1005_ledgerMD().subscribe(options => {
            const selected = options?.find(opt => opt.value === value);
            if (selected) {
              rowData.AccCName = selected['Name'];
              rowData._dataStatus = 'modified';
            }
          });
        } else {
          rowData.AccCName = null;
        }
      }
    },
    { field: 'AccCName', header: '科目名稱', width: '180px', textAlign: 'left' },
    { field: 'NoteDesc', header: '摘要', type: 'input', textAlign: 'left', width: '300px' },
    { field: 'Debit_Amt', header: '借方金額', width: '120px', format: formatAmount, textAlign: 'right', aggregate: 'sum' },
    { field: 'Credit_Amt', header: '貸方金額', width: '120px', format: formatAmount, textAlign: 'right', aggregate: 'sum' },
    {
      field: 'ORG_ID', header: '組織代號', width: '120px', type: 'dropdown', textAlign: 'left', showClear: false,
      optionsAsync: true, options: () => this.sys3100Options$, optionLabel: 'No', optionValue: 'value', templateLabel: 'label',
      onChange: (value: any, rowData: any) => {
        if (value) {
          this.dropdown.querySys3100().subscribe(options => {
            const selected = options?.find(opt => opt.value === value);
            if (selected) {
              rowData.Org_Name = selected['Name'];
              rowData._dataStatus = 'modified';
            }
          });
        } else {
          rowData.Org_Name = null;
        }
      }
    },
    { field: 'Org_Name', header: '組織名稱', width: '120px', textAlign: 'left' },
    { field: 'ProjectNo', header: '活動代號', width: '120px', textAlign: 'left' },
    { field: 'PTA', header: '立沖代號', width: '120px', textAlign: 'left' },
    { field: 'DetailNo', header: '廠商編號', width: '120px', textAlign: 'left' },
    { field: 'SubDetailNo', header: '對象別編號', width: '120px', textAlign: 'left' },
  ];
  PostFlagOptions = getSYS1000Options('PostFlag');
  Trans_StatusOptions = getSYS1000Options('Trans_Status');
  private readonly ledgerOptions$ = this.dropdown.queryGls1005_ledgerMD().pipe(shareReplay(1));
  private readonly sys3100Options$ = this.dropdown.querySys3100().pipe(shareReplay(1));
  initTable = false;

  constructor(
    private readonly fin51010Service: Fin51010Service,
    private readonly dropdown: DropdownApiService,
    public readonly tLS2C040Service: TLS2C040Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initData();
  }
  initData() {
    this.initTable = false;
    this.initializePage('FIN51010', this.dataForm);
    const mainId = this.rowdata?.id;
    if (!mainId) return;
    this.formTitle = '傳票資料';
    this.invoiceData = [];

    this.arLoading = true;
    this.apLoading = true;

    const detail$ = this.fin51010Service.queryFIN51010Detail({ GLS6001_ID: mainId });
    const ar$ = this.tLS2C040Service.queryTLS2C040_GLS6004({ id: mainId });
    const ap$ = this.tLS2C040Service.queryTLS2C040_GLS6005({ id: mainId });

    forkJoin({ detail: detail$, ar: ar$, ap: ap$ }).pipe(
      finalize(() => {
        this.loading = false;
        this.arLoading = false;
        this.apLoading = false;
      }),
      untilDestroyed(this)
    ).subscribe(({ detail, ar, ap }) => {
      // 1. 主資料
      if (detail.Data && detail.Data.length > 0) {
        const mainData = detail.Data[0];
        this.dataForm.patchValue(mainData as any, { emitEvent: false });
        this.data = (mainData.LineList || []).map((line: any) => ({
          ...line,
          AccNo: line.AccNo?.trim(),
          ORG_ID: line.ORG_ID?.trim(),
        }));

        const sheetType = mainData.SrcSheetType?.trim();
        if (sheetType === 'PT' || sheetType === 'WT' || sheetType === 'PU') {
          this.loadInvoiceData(sheetType, sheetType === 'WT' ? mainData.VouNo : mainId);
        }
      }

      // 2. 應收帳款
      if (ar.Data) {
        this.arData = [...(ar.Data._GLS6004List || [])];
        this.arFooterData = { ar_amt: ar.Data?.Total_ar_amt };
        this.arTotalRecords = ar.TotalCount;
      }

      // 3. 應付帳款
      if (ap.Data) {
        this.apData = [...(ap.Data._GLS6005List || [])];
        this.apFooterData = { ap_amt: ap.Data?.Total_AP_Amt };
        this.apTotalRecords = ap.TotalCount;
      }

      // 三支 API 都完成後才初始化 table
      this.initTable = true;
    });
  }
  onTabChange(index: number) {
    // 強制重新賦值，觸發 OnPush 變更偵測
    if (index === 1) {
      this.arData = [...this.arData];
    } else if (index === 2) {
      this.apData = [...this.apData];
    } else if (index === 3) {
      this.invoiceData = [...this.invoiceData];
    }
  }
  onSubmit(frm: FormGroup) {
    const mainId = this.rowdata?.id;
    if (mainId) {
      this.messageService.confirm({
        header: '確定修改嗎?',
        accept: () => {
          this.handleSubmit(frm, () => {
            const modifiedDetails = this.data.filter((d: any) => d._dataStatus === 'modified').map((d: any) => ({
              GLS6002_ID: d.id,
              AccNo: d.AccNo,
              NoteDesc: d.NoteDesc,
              ORG_ID: d.ORG_ID
            }));
            const body: UpdateFIN51010Request = {
              GLS6001_ID: mainId,
              VouDate: frm.value.VouDate,
              Remark: frm.value.Remark,
              DetailList: modifiedDetails
            };
            this.fin51010Service.updateFIN51010(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
              this.messageService.successBubble(res.Message || '修改成功');
              this.onCancel();
            });
          });
        }
      })
    }
  }

  onClear() {
    this.initData();
  }


  // 1. 在類別屬性區宣告發票相關變數
  invoiceData: any[] = [];
  invoiceTotalRecords = 0;
  invoiceLoading = false;
  invoiceFooterData = { InvoiceAmount: 0, NetAmount: 0, TaxAmount: 0 };
  // 2. 定義進項發票的 Columns (結構與你的傳票明細 columns 一致，但改為 ReportColumn 格式)
  invoiceColumns: ReportColumn[] = [
    { field: 'VoucherType', header: '發票格式', format: v => getSYS1000('VoucherType', v), align: 'left', width: '25px' },
    { field: 'TrackNo', header: '字軌', align: 'left', width: '25px' },
    { field: 'InvoiceNo', header: '發票號碼', align: 'left', width: '60px' },
    { field: 'InvoiceDate', header: '發票日期', align: 'left', format: formatDate, width: '70px' },
    { field: 'DeclareYM', header: '申報年月', align: 'left', width: '50px' },
    { field: 'VendorTaxID', header: '廠商統一編號', align: 'left', width: '70px' },
    { field: 'InvoiceUsage', header: '發票用途', align: 'left', format: v => getSYS1000('PUR_DirectType', v), width: '50px' },
    { field: 'InvoiceAmount', header: '發票總金額', align: 'right', format: formatAmount, isTotal: true },
    { field: 'TaxType', header: '課稅別', format: v => getSYS1000('PUR_TaxType', v), align: 'left' },
    { field: 'NetAmount', header: '發票未稅金額', align: 'right', format: formatAmount, isTotal: true },
    { field: 'TaxAmount', header: '發票稅額', align: 'right', format: formatAmount, isTotal: true },
    { field: 'DeductionCodeDesc', header: '扣抵代號', format: v => getSYS1000('PUR_DiscNo', v), align: 'left' },
    { field: 'CategoryType', header: '類別區分', format: v => getSYS1000('PUR_Type', v), align: 'left' },
    { field: 'SourceDocNo', header: '憑證單號', align: 'left' },
    { field: 'TotalCount', header: '彙整張數', align: 'right', format: formatAmount },
  ];
  /** 新增：依據 PT、WT 或 PU 調用不同 API 載入進項發票 */
  loadInvoiceData(type: 'PT' | 'WT' | 'PU', mainId: number | string) {
    this.invoiceLoading = true;

    let apiCall$;

    // 根據類別分流 API
    switch (type) {
      case 'PT':
        apiCall$ = this.fin51010Service.queryPTInvoice({
          GLS6001_ID: mainId as number
        });
        break;

      case 'WT':
        apiCall$ = this.fin51010Service.queryWTInvoice({
          VouNo: mainId as string
        });
        break;

      case 'PU':
        apiCall$ = this.fin51010Service.queryPUInvoice({
          GLS6001_ID: mainId as number
        });
        break;
    }

    apiCall$.pipe(
      finalize(() => this.invoiceLoading = false),
      untilDestroyed(this)
    ).subscribe(res => {
      if (res.Data) {
        this.invoiceData = res.Data || [];
        this.invoiceTotalRecords = res.TotalCount || res.Data.length;

        this.invoiceFooterData = this.invoiceData.reduce((acc, row) => ({
          InvoiceAmount: acc.InvoiceAmount + (Number(row.InvoiceAmount) || 0),
          NetAmount: acc.NetAmount + (Number(row.NetAmount) || 0),
          TaxAmount: acc.TaxAmount + (Number(row.TaxAmount) || 0),
        }), {
          InvoiceAmount: 0,
          NetAmount: 0,
          TaxAmount: 0
        });
      }
    });
  }
}
