import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { CarrierTypeService } from '../../../service/basic/carrier-type.service';
import { TLS23010Service } from '../../../service/api/tls/tls23010.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { FloorService } from '../../../service/basic/floor.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CashierService } from '../../../service/basic/cashier.service';
import { Subscription } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
interface MainData {
  SYS_StoreNo: string;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  tlt_no?: string;
  tlt_name?: string;
  // 可依需求加更多欄位…
  [key: string]: any;
}

const now = new Date();

//型態別報表
@Component({
  selector: 'app-tls23010',
  templateUrl: './tls23010.component.html',
  styleUrls: ['./tls23010.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
    InputTextComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    DialogModule,
    RadioButtonModule,
    PrimeTemplate,
    ButtonDirective,
    TranslateModule,
  ],
})
export class TLS23010Component extends BasicQueryPageComponent<any> {
  displayMode: 'Detail' | 'Summary' = 'Detail'; // 預設顯示明細報表
  querySubscription: Subscription | null = null;

  progressValue = 0;
  showPageSizeDialog = false;
  customPageSize = 1000;

  queryForm = this.formBuilder.group({
    TXN_DateStart: [new Date('2024-01-01'), [Validators.required]],
    TXN_DateEnd: [new Date('2024-01-31'), [Validators.required]],
    ECR_No: [[]], // ✅ 收銀機號 → 陣列
    TXN_No_Start: [null], // 交易序號(起)
    TXN_No_End: [null], // 交易序號(迄)
    TLT_No: [[]], // ✅ 專櫃編號 → 陣列
    TXN_GUIBegNo: [''], // 發票起始號碼
    TXN_GUIEndNo: [''], // 發票結束號碼
    TXN_Status: [[]], // ✅ 狀態 → 陣列
    TXN_FlagStatus: [[]], // ✅ 狀態旗標 → 陣列
    USR_No: [''], // 收銀員編號
    TXN_PreOrderNo: [''], // 預售/訂金編號
    TXN_PkngUID: [''], // 停車卡號
    TXN_MemCard: [''], // 會員卡號
    TXN_Uniform: [''], // 統一編號
    TXN_GUILoveCode: [''], // 愛心碼
    TXN_GUI_CarrType: [[]], // ✅ 載具種類 → 陣列
    TXN_GUI_CarrId: [''], // 載具號碼

    rece_yn: [''], // 是否開立業主發票 (s/空)
    cash_yn: [''], // 是否為業主收現 (s/空)
    tlt_building: [''], // 館別
    tlt_floor: [[]], // ✅ 樓層 → 陣列
    org_id: [[]], // ✅ 組織代碼 → 陣列

    TXN_Subtype: [''], // 交易附屬型態

    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]), // 包含 PageSize, PageIndex, Offset, OrderBy, SortBy
  });

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  // 下拉選單選項
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  TXN_SubtypeOptions: any[] = [];
  statusFlagOptions: any[] = [];
  whetherOptions: any[] = [];
  transactionSubTypeOptions: any[] = [];
  carrierTypeOptions: any[] = [];
  txnStatusOptions: any[] = [];
  cashierOptions: any[] = []; // 收銀員下拉選單
  ECRNoOptions: any[] = []; // 收銀機號下拉選單
  checkTotalAmount = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
  ];
  CounterOptions: any[] = []; // 專櫃選項

  columns: any[] = [
    {
      field: 'TXN_Date',
      header: '銷售日期',
      visible: true,
      format: (val: string) => {
        const date = new Date(val);
        return isNaN(date.getTime())
          ? val
          : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      },
    },
    // {
    //   field: 'TXN_Time',
    //   header: '銷售時間',
    //   visible: true,
    //   format: (val: string) => {
    //     const date = new Date(val);
    //     if (isNaN(date.getTime())) return val;

    //     const yyyy = date.getFullYear();
    //     const MM = (date.getMonth() + 1).toString().padStart(2, '0');
    //     const dd = date.getDate().toString().padStart(2, '0');
    //     const HH = date.getHours().toString().padStart(2, '0');
    //     const mm = date.getMinutes().toString().padStart(2, '0');

    //     return `${yyyy}/${MM}/${dd} ${HH}:${mm}`;
    //   }
    // },
    { field: 'ECR_No', header: '機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, style: 'text-right' },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    {
      field: 'tlt_name',
      header: '櫃位名稱',
      visible: true,
      style: 'text-left',
    }, // 非 POS5006 欄位，UI 顯示用
    // { field: 'SYS_StoreNo', header: '店號', visible: false },

    { field: 'TXN_Uniform', header: '統一編號', visible: true },
    { field: 'TXN_GUIBegNoFirstNo', header: '字軌', visible: true }, // 假設為字軌顯示
    { field: 'TXN_GUIBegNo', header: '起始發票號碼', visible: true },
    { field: 'TXN_GUIEndNo', header: '結束發票號碼', visible: true },
    {
      field: 'TXN_TotGUI',
      header: '發票金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
    {
      field: 'TXN_TotSaleAmt',
      header: '銷售金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
    {
      field: 'TXN_TotOver',
      header: '溢收金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
    {
      field: 'TXN_FlagStatus',
      header: '狀態旗標',
      visible: true,
      format: (val: any) =>
        this.getLabelFromOptions(val, this.statusFlagOptions),
    },
    {
      field: 'TXN_Status',
      header: '交易型態',
      visible: true,
      format: (val: any) =>
        this.getLabelFromOptions(val, this.txnStatusOptions),
    },
    {
      field: 'TXN_Subtype',
      header: '交易附屬型態',
      visible: true,
      format: (val: any) =>
        this.getLabelFromOptions(val, this.transactionSubTypeOptions),
    },
    {
      field: 'TXN_TotPayAmt',
      header: '訂金實收',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
    { field: 'TXN_TaxFreeCertNo', header: '外交官免稅卡號', visible: true },
    { field: 'TXN_Time', header: '起始時間', visible: true },
    { field: 'TXN_Time', header: '結束時間', visible: true },

    { field: 'USR_No', header: '收銀員', visible: true, style: 'text-left' },
    { field: 'TXN_PreOrderNo', header: '預售/訂金單號', visible: true },
    { field: 'ORG_TXN_Date', header: '原交易日期', visible: true },
    { field: 'ORG_ECR_No', header: '原收銀機號', visible: true },
    { field: 'ORG_TXN_No', header: '原交易序號', visible: true },
    { field: 'TXN_PkngUID', header: '停車車牌', visible: true },
    { field: 'TXN_MemID', header: '會員卡號', visible: true },
    {
      field: 'TXN_TotDisc',
      header: '折扣/讓金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
    {
      field: 'TXN_YN',
      header: '銷貨清單列印狀態',
      visible: true,
      format: () => '是',
    },

    {
      field: 'TXN_DonateType',
      header: '捐贈狀態',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.whetherOptions),
    },
    { field: 'TXN_GUILoveCode', header: '捐贈社福團體代碼', visible: true },
    { field: 'TXN_GUIRemark', header: '防偽隨機碼', visible: true },
    {
      field: 'TXN_GUI_CarrType',
      header: '載具種類',
      visible: true,
      format: (val: any) =>
        this.getLabelFromOptions(val, this.carrierTypeOptions),
    },
    { field: 'TXN_GUI_CarrId', header: '共通性載具號碼', visible: true },
    {
      field: 'TXN_PrintGUI',
      header: '電子發票是否列印', //是從 **POS5006.TXN_PrintTimes** 計算出來的結果。
      visible: true,
      format: (val: any) => this.getYesNoLabel(val),
    },
    {
      field: 'TXN_PrintGUI',
      header: '信用卡別',
      visible: true,
      format: (val: any) => this.getYesNoLabel(val),
    },
    {
      field: 'TXN_PrintGUI',
      header: '號碼',
      visible: true,
      format: (val: any) => this.getYesNoLabel(val),
    },
    {
      field: 'TXN_PrintGUI',
      header: '分期期數',
      visible: true,
      format: (val: any) => this.getYesNoLabel(val),
    },
    {
      field: 'TXN_PrintGUI',
      header: '金額',
      visible: true,
      format: (val: any) => this.getYesNoLabel(val),
    },
  ];

  // 展開式表格的載入狀態
  expandLoading = false;
  //data為detailColumns 的data的data

  getYesNoLabel(value: any): string {
    return value === 'Y' ? '是' : value === 'N' ? '否' : value;
  }

  constructor(
    private tls23010Service: TLS23010Service,
    private statusFlagService: StatusFlagService,
    private whetherService: WhetherService,
    private TXN_SubtypeService: TXN_SubtypeService,
    private carrierTypeService: CarrierTypeService,
    private tls11010Service: Tls11010Service,
    private floorService: FloorService,
    private txnStatusService: TxnStatusService,
    private counterNameService: CounterNameService,
    private ECRNoService: ECRNoService,
    private cashierService: CashierService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23010', '', this.queryForm, (f) =>
      this.onSubmit(f),
    );
    const savedQuery = localStorage.getItem('TLS23010_queryForm');
    if (savedQuery) {
      const parsedQuery = JSON.parse(savedQuery);
      this.queryForm.patchValue(parsedQuery);
    }
    this.floorService
      .getFloors()
      .subscribe((data) => (this.floorOptions = data));

    this.statusFlagService
      .getStatusFlags()
      .subscribe((data) => (this.statusFlagOptions = data));
    this.whetherService
      .getWhetherOptions()
      .subscribe((data) => (this.whetherOptions = data));
    this.TXN_SubtypeService.getTXNSubtype().subscribe(
      (data) => (this.TXN_SubtypeOptions = data),
    );
    this.carrierTypeService
      .getCarrierType()
      .subscribe((data) => (this.carrierTypeOptions = data));
    this.tls11010Service
      .getBuildingOptions()
      .subscribe((res) => (this.BUILDING_NO_Options = res));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
    this.txnStatusService
      .getTxnStatusOptions()
      .subscribe((data) => (this.txnStatusOptions = data));
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
    this.cashierService.getCashierOptions().subscribe((res) => {
      this.cashierOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
    this.customPageSize = 1000; // ✅ 強制設值
  }
  onSubmit(form: FormGroup): void {
    if (this.loading) return;

    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫所有必填欄位');
      form.markAllAsTouched();
      return;
    }

    this.handleSubmit(form, () => {
      const payload = { ...form.value };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '') payload[k] = null;
      });

      this.loading = true;
      this.messageService.blockUi();

      this.tls23010Service.queryTLS23010(payload, this.displayMode).subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.data = res.Data || [];
            this.totalRecords = res.TotalCount || this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, payload);
            
          } else {
            this.data = [];
            this.totalRecords = 0;
            this.messageService.errorBubble('查詢失敗');
          }
        },
        error: () => {
          this.messageService.errorBubble('查詢錯誤');
          this.loading = false;
          this.messageService.unblockUi();
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });

      localStorage.setItem('TLS23010_queryForm', JSON.stringify(payload));
    });
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  goToReportMode(): void {
    if (!this.customPageSize || this.customPageSize <= 0) {
      this.customPageSize = 1000;
    }
    this.showPageSizeDialog = true;
  }
  fetchDetailData = async (payload: any): Promise<any[]> => {
    const { TXN_Date, ECR_No, TXN_No } = payload;

    const body = {
      TXN_DateStart: TXN_Date,
      TXN_DateEnd: TXN_Date,
      ECR_No: [ECR_No],
      TXN_No_Start: TXN_No,
      TXN_No_End: TXN_No,
      // ✅ 不需要 PageSize、PageIndex、Offset、OrderBy、SortBy
    };

    return new Promise((resolve) => {
      this.tls23010Service.queryTLS23010(body, 'Detail').subscribe({
        next: (res) => {
          const detailList = res?.Data?.[0]?.DetailList ?? [];
          resolve(detailList);
        },
        error: () => resolve([]),
      });
    });
  };

 confirmPageSizeAndNavigate(): void {
  this.submitted = true;
  if (this.queryForm.invalid) {
    this.messageService.warnBubble('請確認欄位資料是否完整');
    this.queryForm.markAllAsTouched();
    return;
  }

  const rawFormValue = { ...this.queryForm.value };
  for (const key in rawFormValue) {
    const typedKey = key as keyof typeof rawFormValue;
    if (rawFormValue[typedKey] === '') {
      rawFormValue[typedKey] = null;
    }
  }

  const queryFormValue = {
    ...rawFormValue,
    pageSize: this.customPageSize,
  };

  this.loading = true;
  this.messageService.blockUi();

  this.tls23010Service
    .queryTLS23010(queryFormValue, this.displayMode)
    .subscribe({
      next: (res) => {
        if (res.Status === '0000') {
          const mainData = (res.Data || []).map((row: any) => ({
            ...row,
            TXN_Key: `${row.TXN_Date}_${row.ECR_No}_${row.TXN_No}`,
            DetailList: row.DetailList || [],
          }));

          this.queryStateService.setQueryState(this.ProgNo, queryFormValue);

          // ✅ 等路由跳轉完成才解除 Loading
          this.router.navigate(['account/tls/tls23010cru'], {
            state: {
              queryFormValue,
              pageSize: this.customPageSize,
              data: mainData,
              displayMode: this.displayMode,
            },
          }).then(() => {
            this.loading = false;
            this.messageService.unblockUi();
            this.showPageSizeDialog = false;
          });

        } else {
          this.messageService.errorBubble('查詢失敗');
          this.loading = false;
          this.messageService.unblockUi();
          this.showPageSizeDialog = false;
        }
      },
      error: () => {
        this.messageService.errorBubble('查詢錯誤');
        this.loading = false;
        this.messageService.unblockUi();
        this.showPageSizeDialog = false;
      }
    });
}



  cancelQuery(): void {
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
      this.querySubscription = null;
    }
    this.loading = false;
    this.showPageSizeDialog = false;
  }
}
