/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

// ✅ table-report
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';

// Base
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// Service
import {
  ApiResponse,
  Fin63020Service,
  QueryFIN63020Request,
  QueryFIN63020Row,
  SortItem,
} from '../../../service/api/fin/fin63020.service';

@UntilDestroy()
@Component({
  selector: 'app-fin63020',
  templateUrl: './fin63020.component.html',
  styleUrls: ['./fin63020.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    AccordionModule,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeComponent,
    InputNumberRangeComponent,
    ButtonComponent,
    TableReportComponent,
  ],
})
export class FIN63020Component extends BasicQueryPageComponent<any> {
  /* ----------------- 列表狀態 ----------------- */
  data: QueryFIN63020Row[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: QueryFIN63020Row[] = [];
  lastQueryBody: any = null;
  footerData: any = undefined;
  tableVer = 0;

  readonly defaultSort: SortItem[] = [{ field: 'CheckNo', order: 1 }];

  /* ----------------- TableReport 欄位 ----------------- */
  columns: ReportColumn[] = [
    { field: 'RowNo', header: '序號' },
    { field: 'CanPickupYn', header: '可領取' },

    { field: 'CheckNo', header: '票據號碼' },
    { field: 'VendorNo', header: '廠客代號' },
    { field: 'CompanyAccNo', header: '公司銀行科目代號' },

    { field: 'IssueDate', header: '開票日', format: (v: any) => this.formatDate(v) },
    { field: 'ExpireDate', header: '到期日', format: (v: any) => this.formatDate(v) },
    { field: 'PayDate', header: '兌現日', format: (v: any) => this.formatDate(v) },

    { field: 'CheckAmount', header: '票面金額' },
    { field: 'CheckTitle', header: '票據抬頭' },
    { field: 'NoEndorseYn', header: '禁止背書轉讓' },

    { field: 'Remark', header: '備註' },
    { field: 'OrgId', header: '組織代號' },

    { field: 'StatusFlag', header: '狀態' },     // 到期/兌現
    { field: 'CheckStatus', header: '票據狀態' }, // 確認/拋轉

    { field: 'PickupStatus', header: '領取狀態' },
    { field: 'PickupDate', header: '領取日期', format: (v: any) => this.formatDateTime(v) },

    { field: 'VoucherNo', header: '傳票號碼' },
    { field: 'VoucherNoPaid', header: '到期傳票號碼' },
  ];

  /* ----------------- 下拉（先沿用你原本假資料） ----------------- */
  vendorCodeOptions: any[] = [
    { value: '00000000-1', label: '00000000-1' },
    { value: '00000000-2', label: '00000000-2' },
  ];

  bankAccountCodeOptions: any[] = [
    { value: '110301', label: '110301' },
    { value: '110302', label: '110302' },
    { value: '110303', label: '110303' },
  ];

  endorsementProhibitedOptions: any[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  organizationCodeOptions: any[] = [
    { value: 'ALL', label: '全公司' },
    { value: 'AUDIT', label: '稽核室' },
  ];

  eventCodeOptions: any[] = [
    { value: '001', label: '001' },
    { value: '002', label: '002' },
  ];

  // SP：CheckStatus 0/1/2/3/4/5（你原本只有3個，這邊補齊比較不會卡）
  billStatusOptions: any[] = [
    { value: '0', label: '作廢' },
    { value: '1', label: '未異動' },
    { value: '2', label: '到期' },
    { value: '3', label: '兌現' },
    { value: '4', label: '撤票' },
    { value: '5', label: '退票' },
  ];

  statusOptions: any[] = [
    { value: '1', label: '確認' },
    { value: '2', label: '拋轉' },
  ];

  collectionStatusOptions: any[] = [
    { value: '0', label: '未領' },
    { value: '1', label: '已領' },
    { value: '2', label: '郵寄' },
  ];

  targetCodeOptions: any[] = [
    { value: 'TNN', label: '臺南紡織股份有限公司' },
    { value: 'UNI', label: '統一企業股份有限公司' },
  ];

  /* ----------------- 查詢表單（對齊 SP 參數） ----------------- */
  queryForm = this.formBuilder.group({
    // 原畫面欄位（你 HTML 用這些 controlName）
    billNumber: ['' as string],             // ChkNo
    vendorCode: ['' as string],             // VenNo
    bankAccountCode: ['' as string, [Validators.required]], // CompanyAccNo ★必填

    issueDateStart: [null as Date | null],  // IssueDateFrom
    issueDateEnd: [null as Date | null],    // IssueDateTo
    dueDateStart: [null as Date | null],    // ExpireDateFrom
    dueDateEnd: [null as Date | null],      // ExpireDateTo
    cashDateStart: [null as Date | null],   // PayDateFrom
    cashDateEnd: [null as Date | null],     // PayDateTo

    amountStart: [null as number | null],   // AmtFrom
    amountEnd: [null as number | null],     // AmtTo

    billTitle: ['' as string],              // ChkTitle
    endorsementProhibited: ['' as string],  // VenCtrlYN Y/N
    remarks: ['' as string],                // Comment

    organizationCode: ['' as string],       // OrgId
    eventCode: ['' as string],              // ProjectNo

    billStatus: ['' as string],             // CheckStatus
    status: ['' as string],                 // Status

    collectionStatus: ['' as string],       // PickupType
    collectionDateStart: [null as Date | null], // PickupDateFrom
    collectionDateEnd: [null as Date | null],   // PickupDateTo

    paymentBillNumber: ['' as string],      // PamNo
    paymentAccount: ['' as string],         // ApCheckAccNo
    voucherNumber: ['' as string],          // VoucherNo
    targetCode: ['' as string],             // PartyTypeNo（目前 SP 未用，但保留）
    reconciliationKey: ['' as string],      // ReconKey（SP 未用，但保留）

    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private fin63020Service: Fin63020Service,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    // ProgNo / cruPage 依你實際路由調整
    this.initializePage('FIN63020', 'fin/fin63020cru', this.queryForm, (form) =>
      this.onSubmit(form)
    );
  }

  /* ----------------- 小工具 ----------------- */
  private formatDate(val: any): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
      d.getDate()
    ).padStart(2, '0')}`;
  }

  private formatDateTime(val: any): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
      d.getDate()
    ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`;
  }

  private toYmd(d: Date | string | null | undefined): string | undefined {
    if (!d) return undefined;
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return undefined;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private toIso(d: Date | string | null | undefined): string | undefined {
    if (!d) return undefined;
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return undefined;
    return dt.toISOString();
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter((x) => x && typeof x.field === 'string' && typeof x.order === 'number')
      .map((x) => ({ field: String(x.field), order: x.order as number }));
    return cleaned.length ? cleaned : fallback;
  }

  private buildQueryPayload(base: any): QueryFIN63020Request {
    const pageIndex =
      Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1;
    const pageSize =
      Number.isFinite(base?.pageSize) && base.pageSize > 0 ? base.pageSize : 30;

    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const payload: QueryFIN63020Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      ChkNo: (base?.billNumber ?? '').trim() || undefined,
      VenNo: (base?.vendorCode ?? '').trim() || undefined,

      // ★必填：對齊 SP 的 @CompanyAccNo
      CompanyAccNo: String(base?.bankAccountCode ?? '').trim(),

      IssueDateFrom: this.toYmd(base?.issueDateStart),
      IssueDateTo: this.toYmd(base?.issueDateEnd),
      ExpireDateFrom: this.toYmd(base?.dueDateStart),
      ExpireDateTo: this.toYmd(base?.dueDateEnd),
      PayDateFrom: this.toYmd(base?.cashDateStart),
      PayDateTo: this.toYmd(base?.cashDateEnd),

      AmtFrom:
        base?.amountStart == null || base?.amountStart === ''
          ? undefined
          : Number(base.amountStart),
      AmtTo:
        base?.amountEnd == null || base?.amountEnd === ''
          ? undefined
          : Number(base.amountEnd),

      ChkTitle: (base?.billTitle ?? '').trim() || undefined,
      VenCtrlYN: (base?.endorsementProhibited ?? '').trim() || undefined,
      Comment: (base?.remarks ?? '').trim() || undefined,

      OrgId: (base?.organizationCode ?? '').trim() || undefined,
      ProjectNo: (base?.eventCode ?? '').trim() || undefined,

      CheckStatus: (base?.billStatus ?? '').trim() || undefined,
      Status: (base?.status ?? '').trim() || undefined,

      PickupType: (base?.collectionStatus ?? '').trim() || undefined,
      // SP 是 datetime，這邊用 ISO 最保險
      PickupDateFrom: this.toIso(base?.collectionDateStart),
      PickupDateTo: this.toIso(base?.collectionDateEnd),

      PamNo: (base?.paymentBillNumber ?? '').trim() || undefined,
      ApCheckAccNo: (base?.paymentAccount ?? '').trim() || undefined,
      VoucherNo: (base?.voucherNumber ?? '').trim() || undefined,

      PartyTypeNo: (base?.targetCode ?? '').trim() || undefined,
      ReconKey: (base?.reconciliationKey ?? '').trim() || undefined,
    };

    // 清掉空值
    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  /* ✅ 給 table-report 用 */
  public queryFIN63020ForReport = (body: any) =>
    this.fin63020Service.queryFIN63020(this.buildQueryPayload(body || {})).pipe(
      map((res: ApiResponse<QueryFIN63020Row[] | QueryFIN63020Row>) => {
        const src = (res as any)?.Data;
        const rows: QueryFIN63020Row[] = Array.isArray(src) ? src : src ? [src] : [];
        const totalCount = Number((res as any)?.TotalCount ?? rows.length) || rows.length;
        return { Data: rows, TotalCount: totalCount, GrandTotal: null };
      })
    );

  onSubmit(frm: any) {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    const raw = this.queryForm.getRawValue();
    const payload = this.buildQueryPayload(raw);
    payload.PageIndex = 1;

    this.loading = true;
    this.data = [];
    this.selectedItems = [];
    this.footerData = undefined;
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.tableVer++;

    this.fin63020Service
      .queryFIN63020(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<QueryFIN63020Row[]>) => {
          const rows: QueryFIN63020Row[] = Array.isArray(response?.Data) ? response.Data : [];

          this.data = rows;
          const realTotal = Number((response as any)?.TotalCount ?? rows.length) || rows.length;

          setTimeout(() => {
            this.totalRecords = realTotal;
            this.viewTotalRecords = realTotal;
            this.lastQueryBody = { ...payload };
          });

          this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('FIN63020 query API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.viewTotalRecords = 0;
          this.footerData = undefined;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  onClear(frm: any) {
    frm.reset({
      billNumber: '',
      vendorCode: '',
      bankAccountCode: '',

      issueDateStart: null,
      issueDateEnd: null,
      dueDateStart: null,
      dueDateEnd: null,
      cashDateStart: null,
      cashDateEnd: null,

      amountStart: null,
      amountEnd: null,

      billTitle: '',
      endorsementProhibited: '',
      remarks: '',

      organizationCode: '',
      eventCode: '',
      billStatus: '',
      status: '',
      collectionStatus: '',
      collectionDateStart: null,
      collectionDateEnd: null,

      paymentBillNumber: '',
      paymentAccount: '',
      voucherNumber: '',
      targetCode: '',
      reconciliationKey: '',

      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.footerData = undefined;
    this.lastQueryBody = null;
  }
}
