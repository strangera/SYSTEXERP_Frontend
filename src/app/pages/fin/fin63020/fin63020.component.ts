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


    { field: 'CheckNo', header: '票據號碼' },

    { field: 'VendorNo', header: '廠客代號' },
    { field: 'VendorName', header: '廠商名稱' },

    { field: 'BankAccNo', header: '全省銀行代號' },
    { field: 'BankName', header: '銀行名稱' },

    { field: 'IssueDate', header: '託收日期', format: (v: any) => this.formatDate(v) },

    { field: 'AccountCode', header: '科目代號' },
    { field: 'AccountName', header: '科目名稱' },

    { field: 'ReceiveDate', header: '收票日期', format: (v: any) => this.formatDate(v) },
    { field: 'ReceiveStaff', header: '收票業務員代碼' },

    { field: 'CheckReceiptNo', header: '收票單號' },

    { field: 'ExpireDate', header: '到期日', format: (v: any) => this.formatDate(v) },
    { field: 'PayDate', header: '兌現日', format: (v: any) => this.formatDate(v) },

    { field: 'CheckAmount', header: '票面金額', format: this.moneyFormat },

    { field: 'CheckType', header: '票據種類' },      // 例：支票
    { field: 'NoEndorseYn', header: '是否客票' },    // 是 / 否

    { field: 'Remark', header: '備註' },

    { field: 'OrgId', header: '組織代號' },
    { field: 'OrgName', header: '組織名稱' },

    { field: 'StatusFlag', header: '狀態' },        // 兌現 / 未兌現
    { field: 'CheckStatus', header: '票據狀態' },   // 拋轉 / 未拋轉

    { field: 'VoucherNo', header: '傳票號碼' },
  ];

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0'; // ✅ 使用美式格式
  }

  /* ----------------- 下拉（先沿用假資料） ----------------- */
  vendorCodeOptions: any[] = [
    { value: '00000000-1', label: '00000000-1' },
    { value: '00000000-2', label: '00000000-2' },
  ];

  bankAccountCodeOptions: any[] = [
    { value: '110301', label: '110301' },
    { value: '110302', label: '110302' },
    { value: '110303', label: '110303' },
  ];

  // ✅ 新增：公司銀行科目代號託收銀行（若你之後要串不同 API，再換成真的 options）
  collectionBankAccountCodeOptions: any[] = [
    { value: '110301', label: '110301' },
    { value: '110302', label: '110302' },
    { value: '110303', label: '110303' },
  ];

  // ✅ 新增：收票業務員代碼
  receiveSalesCodeOptions: any[] = [
    { value: 'S001', label: 'S001' },
    { value: 'S002', label: 'S002' },
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

  // ✅ 新增：票據種類 / 是否客票
  billTypeOptions: any[] = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
  ];

  isCustomerBillOptions: any[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  /* ----------------- 查詢表單（依你最新 HTML） ----------------- */
  queryForm = this.formBuilder.group({
    // 第一列
    billNumber: ['' as string], // 票據號碼
    vendorCode: ['' as string], // 廠客代號
    bankAccountCode: ['' as string, [Validators.required]], // 銀行代號(公司銀行科目代號) ★必填

    // 第二列
    customerBankAccount: ['' as string], // 客戶銀行帳號
    issueDateStart: [null as Date | null], // 託收日(起)
    issueDateEnd: [null as Date | null], // 託收日(迄)
    collectionBankAccountCode: ['' as string], // 公司銀行科目代號託收銀行

    // 第三列
    receiveDateStart: [null as Date | null], // 收票日(起)
    receiveDateEnd: [null as Date | null], // 收票日(迄)
    receiveSalesCode: ['' as string], // 收票業務員代碼
    paymentBillNumber: ['' as string], // 收款單號（你原本是 PamNo）

    // 第四列
    dueDateStart: [null as Date | null], // 到期日(起)
    dueDateEnd: [null as Date | null], // 到期日(迄)
    preCashDateStart: [null as Date | null], // 預兌日(起)
    preCashDateEnd: [null as Date | null], // 預兌日(迄)
    cashDateStart: [null as Date | null], // 兌現日(起)
    cashDateEnd: [null as Date | null], // 兌現日(迄)

    // 第五列
    amountStart: [null as number | null], // 票面金額(起)
    amountEnd: [null as number | null], // 票面金額(迄)
    billType: ['' as string], // 票據種類
    isCustomerBill: ['' as string], // 是否客票

    // 第六列
    remarks: ['' as string], // 備註
    organizationCode: ['' as string], // 組織代號
    eventCode: ['' as string], // 活動代號

    // 第七列
    status: ['' as string], // 狀態
    billStatus: ['' as string], // 票據狀態
    paymentAccount: ['' as string], // 應收票據會計科目

    // 第八列
    voucherNumber: ['' as string], // 傳票號碼
    targetCode: ['' as string], // 對象別編號
    reconciliationKey: ['' as string], // 對帳KEY值

    // ✅ 保留你原本有的欄位（HTML 現在沒用到，但不想動 service 的話先留著）
    billTitle: ['' as string], // 票據抬頭（若你之後要再放回畫面）
    endorsementProhibited: ['' as string], // 禁止背書轉讓（若你之後要再放回畫面）
    collectionStatus: ['' as string], // 領取狀態
    collectionDateStart: [null as Date | null], // 領取日期(起)
    collectionDateEnd: [null as Date | null], // 領取日期(迄)

    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private fin63020Service: Fin63020Service,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
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

  /**
   * ⚠️ 重要：
   * 你最新 HTML 多了「客戶銀行帳號 / 收票日 / 預兌日 / 票據種類 / 是否客票 / 收票業務員...」，
   * 但目前 QueryFIN63020Request(後端) 不一定有對應欄位。
   *
   * 所以這裡先「只送你原本已對齊 SP 的那些欄位」，新增欄位先不送到後端（避免 API 因未知欄位報錯）。
   * 等你給我 SP/Request 欄位名稱，我再把 payload 對應補上。
   */
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

      // ✅ 原本已對齊 SP 的欄位（保持不變）
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
      // 第一列
      billNumber: '',
      vendorCode: '',
      bankAccountCode: '',

      // 第二列
      customerBankAccount: '',
      issueDateStart: null,
      issueDateEnd: null,
      collectionBankAccountCode: '',

      // 第三列
      receiveDateStart: null,
      receiveDateEnd: null,
      receiveSalesCode: '',
      paymentBillNumber: '',

      // 第四列
      dueDateStart: null,
      dueDateEnd: null,
      preCashDateStart: null,
      preCashDateEnd: null,
      cashDateStart: null,
      cashDateEnd: null,

      // 第五列
      amountStart: null,
      amountEnd: null,
      billType: '',
      isCustomerBill: '',

      // 第六列
      remarks: '',
      organizationCode: '',
      eventCode: '',

      // 第七列
      status: '',
      billStatus: '',
      paymentAccount: '',

      // 第八列
      voucherNumber: '',
      targetCode: '',
      reconciliationKey: '',

      // 保留欄位
      billTitle: '',
      endorsementProhibited: '',
      collectionStatus: '',
      collectionDateStart: null,
      collectionDateEnd: null,

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
