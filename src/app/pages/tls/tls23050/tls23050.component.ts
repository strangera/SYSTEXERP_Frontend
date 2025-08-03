import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { TLS23050Service } from '../../../service/api/tls/tls23050.service';
import { TypeService } from '../../../service/basic/type.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-tls23050',
    templateUrl: './tls23050.component.html',
    styleUrls: ['./tls23050.component.scss'],
    standalone: true,
    imports: [
        MenubarComponent,
        AccordionModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarRangeQuickComponent,
        RadiobuttonComponent,
        MultiSelectComponent,
        DropdownComponent,
        InputTextModule,
        ButtonComponent,
        TranslateModule,
    ],
})
export class TLS23050Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    TXN_DateStart: [new Date('2024-01-01'), [Validators.required]],
    TXN_DateEnd: [new Date('2024-01-31'), [Validators.required]],
    rece_yn: [null],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    ECR_No: [],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;
  showPageSizeDialog = false;
  customPageSize = 1000;

  WhetherOptions: any[] = [];
  typeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];

  constructor(
    private tls23050Service: TLS23050Service,
    private whetherService: WhetherService,
    private typeService: TypeService,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23050', '', this.queryForm, (form) =>
      this.onSubmit(form),
    );
    // ✅ 回上一頁後不保留 loading 狀態
    if (history.state?.fromCru) {
      this.loading = false;
    }
    this.whetherService
      .getWhetherOptions()
      .subscribe((data) => (this.WhetherOptions = data));
    this.typeService
      .getTypeOptions()
      .subscribe((data) => (this.typeOptions = data));
    this.floorService
      .getFloors()
      .subscribe((data) => (this.floorOptions = data));

    this.tls11010Service.getBuildingOptions().subscribe((data) => {
      this.BUILDING_NO_Options = data;
    });

    this.tls11010Service.getOrgOptions().subscribe((data) => {
      this.OrganizationCodeOptions =
        data?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });

    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions =
        data?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (this.loading) return;

    if (form.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      return;
    }

    this.handleSubmit(form, () => {
      const payload = this.cleanFormPayload({ ...form.value });

      this.loading = true;
      this.messageService.blockUi();

      this.tls23050Service
        .queryTLS23050(payload)
        .pipe(
          timeout(30000),
          catchError((err) => {
            this.messageService.errorBubble('查詢失敗');
            this.loading = false;
            this.messageService.unblockUi();
            return of({ Status: '9999', Data: [] });
          }),
        )
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              this.data = res.Data || [];
              this.totalRecords = res.TotalCount || this.data.length;
              this.queryStateService.setQueryState(this.ProgNo, payload);
              this.messageService.successBubble('查詢成功');
            } else {
              this.data = [];
              this.totalRecords = 0;
              this.messageService.errorBubble('查詢失敗');
            }
          },
          complete: () => {
            this.loading = false;
            this.messageService.unblockUi();
          },
        });
    });
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

    this.tls23050Service
      .queryTLS23050(queryFormValue)
      .pipe(
        timeout(30000),
        catchError((err) => {
          this.messageService.errorBubble('查詢失敗');
          this.loading = false;
          this.messageService.unblockUi();
          return of({ Status: '9999', Data: [] });
        }),
      )
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            const resultData = res.Data || [];

            this.queryStateService.setQueryState(this.ProgNo, queryFormValue);

            // ✅ 導向 CRU 頁面
            this.router.navigate(['account/tls/tls23050cru'], {
              state: {
                queryFormValue,
                pageSize: this.customPageSize,
                data: resultData,
                fromCru: true,
              },
            });

            this.messageService.successBubble('查詢成功');
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

  private cleanFormPayload(payload: any): any {
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

    return {
      ...payload,
      pageSize: payload.pageSize ?? 30,
      pageIndex: (payload.pageIndex ?? 1) - 1,
      Offset: 0,
      OrderBy: '',
      SortBy: payload.SortBy ?? [{ field: 'ECR_No', order: 1 }],
    };
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  columns: any[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    {
      field: 'tlt_name',
      header: '櫃位名稱',
      visible: true,
      style: 'text-left',
    },
    {
      field: 'TXN_TotPayAmt',
      header: '總金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt10',
      header: '現金',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt41',
      header: '聯合連線',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt42',
      header: '聯合離線',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt12',
      header: '聯合紅利',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt81',
      header: '[信用卡]中信停車場',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt43',
      header: '中信連線',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt44',
      header: '中信離線',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt14',
      header: '中信紅利',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt82',
      header: '[一卡通]停車場',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt52',
      header: '一卡通',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt20',
      header: '禮券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt62',
      header: '商品提貨單',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt77',
      header: '感熱紙抵用券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt71',
      header: '商品抵用券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt30',
      header: '貴賓提貨單(應收帳款)',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt73',
      header: '外來禮券(抵用券)',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt72',
      header: '外來提貨單(抵用券)',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt74',
      header: '活動券(自營)',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt75',
      header: '折價券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt76',
      header: '現抵',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt24',
      header: '禮券餘額代卡',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt25',
      header: '提貨單餘代卡',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt07',
      header: '會員折抵',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt55',
      header: 'LINE Pay',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt83',
      header: '[LINE Pay]停車場',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt78',
      header: 'APP抵用券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt79',
      header: 'APP提貨單',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt21',
      header: 'APP禮券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt53',
      header: '悠遊卡',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt56',
      header: '一卡通錢包',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt57',
      header: '台灣Pay',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt58',
      header: '南紡錢包',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt59',
      header: '即享券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt60',
      header: '喜客券',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt22',
      header: '[外來提貨單]高夢',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_PayAmt23',
      header: '[外來禮券]高夢',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'PreSale_Received',
      header: '預售訂金',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'PreSale_Checkout',
      header: '預售實收結帳',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_OverAmt',
      header: '溢收金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_ReturnAmt',
      header: '退貨金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_ExchangeAmt',
      header: '換貨金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_CancelAmt',
      header: '作廢金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
  ];
}
