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
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
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
import { PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentDetail, DiscountDetail, InvoiceDetail } from './tls23040.model';

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
    PrimeTemplate,
    ButtonDirective,
    TranslateModule,
  ],
})
export class TLS23040Component extends BasicQueryPageComponent<any> {

  totalRecords = 0;
  showPageSizeDialog = false;
  customPageSize = 10;
  useSummaryMode = false; // 預設為明細表模式
  displayMode: 'Report' | 'ByPaymentType' | 'ByDiscountType' = 'Report';

  queryForm = this.formBuilder.group({
    TXN_DateStart: [new Date('2024-01-01'), [Validators.required]],
    TXN_DateEnd: [new Date('2024-01-01'), [Validators.required]],
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

  columns: any[] = [
    {
      field: 'TXN_Date',
      header: '銷售日期',
      visible: true,
      format: (val: string) => {
        const d = new Date(val);
        return isNaN(d.getTime())
          ? val
          : `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
      },
    },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    {
      field: 'tlt_name',
      header: '櫃位名稱',
      visible: true,
      style: 'text-left',
    },
    { field: 'gui_track', header: '發票起號(字軌)', visible: true },
    { field: 'GUIBegNo', header: '發票起始號碼', visible: true },
    { field: 'GUIEndNo', header: '發票結束號碼', visible: true },
    {
      field: 'TXN_TotGUI',
      header: '發票金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
    {
      field: 'TXN_TotSaleAmt',
      header: '業績金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
    {
      field: 'TXN_Status',
      header: '交易型態',
      visible: true,
      format: (val: any) =>
        this.getLabelFromOptions(val, this.txnStatusOptions),
    },
    { field: 'TXN_TaxFreeCertNo', header: '外交官免稅卡號', visible: true },
    { field: 'USR_No', header: '收銀員', visible: true },
    { field: 'TXN_PkngUID', header: '停車卡號', visible: true },
    {
      field: 'ORG_TXN_Date',
      header: '原交易日期',
      visible: true,
      format: (val: string) => {
        const d = new Date(val);
        return isNaN(d.getTime())
          ? val
          : `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
      },
    },
    { field: 'ORG_ECR_No', header: '原收銀機號', visible: true },
    { field: 'ORG_TXN_No', header: '原交易序號', visible: true },
    { field: 'TXN_MemCard', header: '會員卡號', visible: true },
    {
      field: 'TXN_TotPayScoreAmt',
      header: '會員積點折抵',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
  ];

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
    this.initializePage('TLS23040', '', this.queryForm);
    this.useSummaryMode = false; // 預設為明細表模式

    this.statusFlagService
      .getStatusFlags()
      .subscribe((data) => (this.statusFlagOptions = data));
    this.TXN_SubtypeService.getTXNSubtype().subscribe(
      (data) => (this.TXN_SubtypeOptions = data),
    );
    this.txnStatusService
      .getTxnStatusOptions()
      .subscribe((data) => (this.txnStatusOptions = data));

    this.floorService
      .getFloors()
      .subscribe((data) => (this.floorOptions = data));
    this.tls11010Service
      .getBuildingOptions()
      .subscribe((data) => (this.BUILDING_NO_Options = data));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  //報表模式

  private cleanFormPayload(payload: any): any {
    delete payload.displayMode;

    for (const key in payload) {
      const val = payload[key];
      if (
        val === '' ||
        val === null ||
        (Array.isArray(val) && val.length === 0)
      ) {
        payload[key] = null;
      }
    }

    // ✅ 如果 ECR_No 是 null，就轉為空陣列（後端需要陣列型別）
    if (!Array.isArray(payload.ECR_No)) {
      payload.ECR_No = payload.ECR_No == null ? [] : [payload.ECR_No];
    }

    if (payload['IsHaveTERM_No'] === 'Y') payload['IsHaveTERM_No'] = true;
    if (payload['IsHaveTERM_No'] === 'N') payload['IsHaveTERM_No'] = false;

    return {
      ...payload,
      pageSize: payload.pageSize ?? 30,
      pageIndex: (payload.pageIndex ?? 1) - 1,
      Offset: 0,
      OrderBy: '',
      SortBy: payload.SortBy ?? [{ field: 'ID', order: 1 }],
    };
  }



  goToReportMode(): void {
    if (!this.customPageSize || this.customPageSize <= 0) {
      this.customPageSize = 1000;
    }
    this.showPageSizeDialog = true;
  }

  confirmPageSizeAndNavigate(): void {
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      this.queryForm.markAllAsTouched();
      return;
    }

    const queryFormValue = this.cleanFormPayload({
      ...this.queryForm.value,
      pageSize: this.customPageSize,
    });

    this.loading = true;
    this.messageService.blockUi();

    this.tls23040Service
      .queryTLS23040(queryFormValue)
      .pipe(
        timeout(30000),
        catchError((err) => {
          if (err.name === 'TimeoutError') {
            this.messageService.warnBubble('查詢時間過久，請嘗試縮小查詢條件範圍');
          } else {
            this.messageService.errorBubble('查詢失敗');
          }
          this.loading = false;
          this.messageService.unblockUi();
          // 用空陣列回傳，型別一致
          return of({ Status: '9999', Data: [], Error: null, Meta: null, Message: '', TotalCount: 0, TotalPage: 0 });
        }),
      )
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            const groups = res.Data || [];

            let dataToNavigate:
              | InvoiceDetail[]
              | PaymentDetail[]
              | DiscountDetail[] = [];

            switch (this.displayMode) {
              case 'Report':
                // ✅ 只拿發票/交易明細
                dataToNavigate = groups.flatMap(g => g.InvoiceDetail ?? []);
                break;
              case 'ByPaymentType':
                // ✅ 只拿付款明細
                dataToNavigate = groups.flatMap(g => g.PaymentDetail ?? []);
                break;
              case 'ByDiscountType':
                // ✅ 只拿折扣明細
                dataToNavigate = groups.flatMap(g => g.DiscountDetail ?? []);
                break;
            }

            // 紀錄查詢狀態
            this.queryStateService.setQueryState(this.ProgNo, queryFormValue);

            // 帶資料去 CRU 頁
            this.router.navigate(['account/tls/tls23040cru'], {
              state: {
                queryFormValue,
                pageSize: this.customPageSize,
                data: dataToNavigate,
                displayMode: this.displayMode,
                // 也可順帶 totalCount/totalPage 若你要用
                totalCount: res.TotalCount,
                totalPage: res.TotalPage,
              },
            });
          } else {
            this.messageService.errorBubble('查詢失敗');
          }
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
          this.showPageSizeDialog = false;
        },
      });
  }
}
