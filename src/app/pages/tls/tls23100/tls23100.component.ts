import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { PaymentTypeService } from '../../../service/basic/payment-type.service';
import { TLS23100Service } from '../../../service/api/tls/tls23100.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tls23100',
  templateUrl: './tls23100.component.html',
  styleUrls: ['./tls23100.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
  ],
})
export class TLS23100Component extends BasicQueryPageComponent<any> {
  //此頁面所需參數
  showPageSizeDialog = false;
  customPageSize = 1000;
  Data: any[] = [];
  totalRecords = 0;
   readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  //request
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday as Date, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [[]],
    TLT_No: [[]],
    CRD_Type: [[]],
    CRD_No: [],
    tlt_building: [],
    tlt_floor: [[]],
    org_id: [[]],
    ...createPaginationConfig([{ field: 'TLT_No', order: 1 }]),
  });

  //response
  columns: any[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true, style: 'text-left' },
    {
      field: 'tlt_name',
      header: '櫃位名稱',
      visible: true,
      style: 'text-left',
    },
    { field: 'PAY_NO', header: '付款別', visible: true },
    { field: 'PAY_NAME', header: '付款名稱', visible: true },
    { field: 'CRD_Type', header: '信用卡卡別', visible: true },
    { field: 'CRD_Name', header: '信用卡', visible: true },
    { field: 'CRD_No', header: '信用卡卡號', visible: true },
    {
      field: 'TXN_PayAmt',
      header: '金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
  ];
  //column 所需格式
  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0'; // ✅ 使用美式格式
  }
  //下拉選單
  paymentTypeOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];
  ECRNoOptions: any[] = [];
  //匯入所需Services
  constructor(
    private paymentTypeService: PaymentTypeService,
    private tls23100Service: TLS23100Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }
  //頁面起始
  ngOnInit(): void {
    this.initializePage('TLS23100', 'tls/tls23100cru', this.queryForm);
    //收銀機號下拉
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    //專櫃編號下拉
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    //付款別下拉
    this.paymentTypeService
      .getPaymentTypes()
      .subscribe((data) => (this.paymentTypeOptions = data));
    //館別下拉
    this.tls11010Service
      .getBuildingOptions()
      .subscribe((data) => (this.BUILDING_NO_Options = data));
    //樓層下拉
    this.floorService
      .getFloors()
      .subscribe((data) => (this.floorOptions = data));

    //組織代碼下拉
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions =
        res?.map((x) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
  }

  confirmPageSizeAndNavigate(): void {
    this.submitted = true;

    // ✅ 驗證查詢表單是否有效
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      this.queryForm.markAllAsTouched();
      return;
    }

    // ✅ 取出表單值並處理空字串 => null
    const rawFormValue: Record<string, any> = { ...this.queryForm.value };

    for (const key in rawFormValue) {
      const value = rawFormValue[key];

      if (typeof value === 'string' && value.trim() === '') {
        rawFormValue[key] = null;
      }
    }

    // ✅ 加入自定義筆數參數（PageSize 是後端預期欄位）
    const queryFormValue = {
      ...rawFormValue,
      pageSize: this.customPageSize, // 前端使用的
      PageSize: this.customPageSize, // 傳給後端
      PageIndex: 1, // 預設查詢第 1 頁
    };

    // ✅ 啟用 loading 與畫面鎖定
    this.loading = true;
    this.messageService.blockUi();

    // ✅ 呼叫查詢 API
    this.tls23100Service.queryTLS23100(queryFormValue).subscribe({
      next: (res) => {
        if (res.Status === '0000') {
          // ✅ 儲存查詢條件
          this.queryStateService.setQueryState(this.ProgNo, queryFormValue);

          // ✅ 導頁到報表模式頁面並帶入查詢結果
          this.router
            .navigate(['account/tls/tls23100cru'], {
              state: {
                queryFormValue,
                pageSize: this.customPageSize,
                data: res.Data || [],
              },
            })
            .then(() => {
              // ✅ 路由完成後解除 loading 與 dialog
              this.loading = false;
              this.messageService.unblockUi();
              this.showPageSizeDialog = false;
            });
        } else {
          // ❌ 查詢失敗提示
          this.messageService.errorBubble('查詢失敗');
          this.loading = false;
          this.messageService.unblockUi();
          this.showPageSizeDialog = false;
        }
      },
      error: () => {
        // ❌ 連線或伺服器錯誤處理
        this.messageService.errorBubble('查詢錯誤');
        this.loading = false;
        this.messageService.unblockUi();
        this.showPageSizeDialog = false;
      },
    });
  }
}
