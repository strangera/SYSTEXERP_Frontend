import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS23040Service } from '../../../service/api/tls/tls23040.service';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls23040',
  templateUrl: './tls23040.component.html',
  styleUrls: ['./tls23040.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
    DropdownComponent,
    InputTextComponent,
    InputTextModule,
    ButtonComponent,
    DialogModule,
    RadioButtonModule,
    TranslateModule,
    TableComponent,
  ],
})
export class TLS23040Component extends BasicQueryPageComponent<any> {
  totalRecords = 0;
  data: any[] = [];

  readonly yesterday: Date = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 1); return d; })();

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [null], // ✅ 初始為 null（不會出現預設選項）
    TXN_No_Start: [null],
    TXN_No_End: [null],
    TLT_No: [[]],
    TXN_Status: [[]],
    TXN_FlagStatus: [[]],
    TXN_PkngUID: [''],
    TXN_MemCard: [''],
    TXN_GUIBegNo: [''],
    tlt_building: [''],
    tlt_floor: [[]],
    org_id: [[]],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  statusFlagOptions: any[] = [];
  TXN_SubtypeOptions: any[] = [];
  txnStatusOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  WhetherOptions: any[] = [];
  CounterOptions: any[] = [];

  constructor(
    private tls23040Service: TLS23040Service,
    private statusFlagService: StatusFlagService,
    private TXN_SubtypeService: TXN_SubtypeService,
    private txnStatusService: TxnStatusService,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23040', 'tls/tls23040cru', this.queryForm, (form) => this.onSubmit(form),);

    this.statusFlagService.getStatusFlags().subscribe((data) => (this.statusFlagOptions = data));

    this.TXN_SubtypeService.getTXNSubtype().subscribe((data) => (this.TXN_SubtypeOptions = data));

    this.txnStatusService.getTxnStatusOptions().subscribe((data) => (this.txnStatusOptions = data));

    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));

    this.tls11010Service.getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));

    this.tls11010Service.getOrgOptions().subscribe((res) => { this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value, })); });

    this.ECRNoService.getECRNo().subscribe((res) => { this.ECRNoOptions = (res ?? []).map((x: any) => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value, })); });

    this.counterNameService.getCounters().subscribe((res) => { this.CounterOptions = (res ?? []).map((x: any) => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value, })); });
  }
  // 送出查詢（無 doQuery / buildPayload）
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.value as any;

      // 轉本地 ISO(yyyy-MM-ddTHH:mm:ss) — 去掉時區偏移
      const toIso = (x: any) => {
        if (!x) return undefined; const d = typeof x === 'string' ? new Date(x) : (x as Date); if (isNaN(d.getTime())) return undefined; return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
      };

      // 組 payload（含分頁/排序）
      const payload: any = {
        ...val, TXN_DateStart: toIso(val?.TXN_DateStart), TXN_DateEnd: toIso(val?.TXN_DateEnd), pageSize: val?.pageSize, pageIndex: val?.pageIndex, SortBy: val?.SortBy, OrderBy: val?.OrderBy, Offset: val?.Offset,
      };

      // 數值欄位保險轉型
      if ((val?.TXN_No_Start ?? '') !== '') payload.TXN_No_Start = Number(val.TXN_No_Start);
      if ((val?.TXN_No_End ?? '') !== '') payload.TXN_No_End = Number(val.TXN_No_End);

      // 清除空字串/null/undefined/空陣列
      Object.keys(payload).forEach((k) => {
        const v = payload[k]; if (v === '' || v === null || v === undefined) delete payload[k]; if (Array.isArray(v) && v.length === 0) delete payload[k];
      });

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23040Service.queryTLS23040(payload).subscribe({
        next: (res) => {
          // 可能有多個分組，把所有 item 的 InvoiceDetail 串接起來
          const groups = Array.isArray(res?.Data) ? res.Data : [];
          const invoiceRows = groups
            .map((g: any) => g?.InvoiceDetail ?? [])
            .flat();

          // 如果你想以 PaymentDetail 或 DiscountDetail 為主，可以改這兩行來源
          // const payRows = groups.map(g => g?.PaymentDetail ?? []).flat();
          // const discRows = groups.map(g => g?.DiscountDetail ?? []).flat();

          this.data = invoiceRows;
          this.totalRecords = this.data.length; // 或者保留後端回傳的 TotalCount 視你的 TableComponent 需求
        }, error: (err) => { console.error('TLS23040 查詢失敗', err); this.messageService?.errorBubble?.('查詢失敗，請稍後再試'); }, complete: () => { this.loading = false; this.messageService?.unblockUi(); }
      });
    });
  }



  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  columns = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: (val: string) => { const d = new Date(val); return isNaN(d.getTime()) ? val : `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`; }, },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left', },
    { field: 'gui_track', header: '發票起始號碼(字軌)', visible: true },
    { field: 'GUIBegNo', header: '發票起始號碼', visible: true },
    { field: 'GUIEndNo', header: '發票結束號碼', visible: true },
    { field: 'TXN_TotGUI',header: '發票金額',visible: true,style: 'text-right',format: (val: number) => val?.toLocaleString('en-US') || '0',},
    { field: 'TXN_TotSaleAmt',header: '業績金額',visible: true,style: 'text-right',format: (val: number) => val?.toLocaleString('en-US') || '0',},
    { field: 'TXN_StatusName',header: '交易型態',visible: true,format: (val: any) =>  this.getLabelFromOptions(val, this.txnStatusOptions),},
    { field: 'TXN_TaxFreeCertNo',header: '外交官免稅卡號',visible: true,},
    { field: 'USR_No', header: '收銀員', visible: true },
    { field: 'TXN_PkngUID', header: '停車卡號', visible: true },
    { field: 'ORG_TXN_Date', header: '原交易日期', visible: true, format: (val: string) => { const d = new Date(val); return isNaN(d.getTime()) ? val : `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`; }, },
    { field: 'ORG_ECR_No', header: '原收銀機號', visible: true },
    { field: 'ORG_TXN_No', header: '原交易序號', visible: true },
    { field: 'TXN_MemCard', header: '會員卡號', visible: true },
    { field: 'TXN_TotPayScoreAmt', header: '會員積點折抵', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0', },
  ];
}
