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
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, takeUntil, timeout, catchError } from 'rxjs/operators';
import { TableComponent } from '@shared/componentkit/table/table.component';
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
    TableComponent,
  ]
})
export class TLS23100Component extends BasicQueryPageComponent<any> {

  //此頁面所需參數

  data: any[] = [];
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
    Pay_No: [[]],
    CRD_No: [],
    tlt_building: [],
    tlt_floor: [[]],
    org_id: [[]],
    
    ...createPaginationConfig([{ field: 'TLT_No', order: 1 }]),
  });

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
    this.initializePage('TLS23100', 'tls/tls23100', this.queryForm, (form) => this.onSubmit(form));

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

      columns = [
      { field: 'ECR_No', header: '收銀機號', visible: true },
      { field: 'TXN_No', header: '交易序號', visible: true },
      { field: 'tlt_no', header: '專櫃編號', visible: true, style: 'text-left' },
      { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
      { field: 'PAY_NO', header: '付款別', visible: true },
      { field: 'PAY_NAME', header: '付款名稱', visible: true },
      { field: 'Pay_No', header: '信用卡卡別', visible: true },
      { field: 'CRD_Name', header: '信用卡', visible: true },
      { field: 'CRD_No', header: '信用卡卡號', visible: true },
      { field: 'TXN_PayAmt', header: '金額', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    ];
// 送出查詢（無 doQuery / buildPayload）
onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    const val = this.queryForm.getRawValue() as any;

    // 由 pageIndex/pageSize 推算 Offset（0-based）
    const offset =
      Number.isFinite(val?.pageIndex) && Number.isFinite(val?.pageSize)
        ? Math.max(0, (val.pageIndex - 1) * val.pageSize)
        : undefined;

    // SortMeta[] -> "field ASC,DESC"
    const orderBy =
      Array.isArray(val?.SortBy) && val.SortBy.length
        ? val.SortBy.map((s: any) => `${s.field} ${s.order === 1 ? 'ASC' : 'DESC'}`).join(',')
        : undefined;

    // 本地 ISO(yyyy-MM-ddTHH:mm:ss) — 去掉時區偏移
    const toIso = (x: any) => {
      if (!x) return undefined;
      const d = typeof x === 'string' ? new Date(x) : (x as Date);
      if (isNaN(d.getTime())) return undefined;
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19);
    };

    // 組 payload（保留分頁/排序）
    const payload: any = {
      TXN_DateStart: toIso(val?.TXN_DateStart),
      TXN_DateEnd:   toIso(val?.TXN_DateEnd),
      ECR_No:        val?.ECR_No,       // 可為陣列或字串，後端自理
      TLT_No:        val?.TLT_No,
      Pay_No:      val?.Pay_No,
      CRD_No:        val?.CRD_No,
      tlt_building:  val?.tlt_building,
      tlt_floor:     val?.tlt_floor,
      org_id:        val?.org_id,
      pageSize:      val?.pageSize,
      pageIndex:     val?.pageIndex,
      SortBy:        val?.SortBy,
      ...(offset  !== undefined ? { Offset:  offset } : {}),
      ...(orderBy ? { OrderBy: orderBy } : {}),
    };

    // 移除空字串 / null / undefined / 空陣列
    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });

    this.loading = true;
    this.messageService?.blockUi();

    this.tls23100Service.queryTLS23100(payload).subscribe({
      next: (res: any) => {
        // 期待：{ Data: [{ totalPayAmt, tLS23100Details: [...] }], TotalCount, ... }
        const data = res?.Data;
        const wrapper = Array.isArray(data) ? data[0] : data;

        const details =
          wrapper?.tLS23100Details ??
          wrapper?.TLS23100Details ??
          wrapper?.tls23100Details ??
          [];

        this.data = Array.isArray(details) ? details : [];

        // 總筆數（若 API 有回傳 TotalCount 則用之，否則用陣列長度）
        this.totalRecords =
          typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;

        // 若前端需顯示總金額可自取：
        // this.totalPayAmt = typeof wrapper?.totalPayAmt === 'number' ? wrapper.totalPayAmt : 0;
      },
      error: (err) => {
        console.error('TLS23100 查詢失敗', err);
        this.messageService?.errorBubble?.('查詢失敗，請稍後再試');
      },
      complete: () => {
        this.loading = false;
        this.messageService?.unblockUi();
      },
    });
  });
}



}
