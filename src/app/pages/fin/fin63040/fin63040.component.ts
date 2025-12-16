/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { Fin63040Service, QueryFIN63040Request, QueryFIN63040Row } from '../../../service/api/fin/fin63040.service';

@UntilDestroy()
@Component({
  selector: 'app-fin63040',
  templateUrl: './fin63040.component.html',
  styleUrl: './fin63040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarRangeComponent,
    InputTextComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class FIN63040Component extends BasicQueryPageComponent<any> implements OnInit {
  override ProgNo = 'FIN63040';

  /** 查詢表單：對齊 SP_FIN63040Query */
  queryForm = this.formBuilder.group({
    CompanyAccNo: [null as string | null, [Validators.required]], // 必填
    ChkNo: [null as string | null],

    PayDateFrom: [null as Date | null],
    PayDateTo: [null as Date | null],

    ExpireDateFrom: [null as Date | null],
    ExpireDateTo: [null as Date | null],

    PageSize: [10],
    PageIndex: [1],

    // ✅ 重點：明確讓 SortBy 是 array，不要被推斷成 null
    SortBy: this.formBuilder.control<any[]>([]),
  });

  /** 公司銀行科目代號 options（你之後接 DropDown API） */
  AccountcodeOptions: { label: string; value: string }[] = [];

  /** 表格資料 */
  data: QueryFIN63040Row[] = [];

  /** Table columns：欄位名稱對齊 SP 回傳 */
  columns: any[] = [
    { field: 'RowNo', header: '序號', visible: true },
    { field: 'CanCashYn', header: '可兌現', visible: true },
    { field: 'ChkNo', header: '票據號碼', visible: true },
    { field: 'VenNo', header: '廠客代號', visible: true },
    { field: 'VenName', header: '廠客名稱', visible: true },
    { field: 'AccNo', header: '科目代號', visible: true },
    { field: 'AccName', header: '科目名稱', visible: true },
    { field: 'IssueDate', header: '開票日', visible: true },
    { field: 'DueDate', header: '到期日', visible: true },
    { field: 'PayDate', header: '兌現日', visible: true },
    { field: 'ChkAmt', header: '票面金額', visible: true },
    { field: 'ChkTitle', header: '票據抬頭', visible: true },
    { field: 'Remark', header: '備註', visible: true },
    { field: 'Status', header: '狀態(到期/兌現)', visible: true },
    { field: 'CheckStatus', header: '票據狀態(確認/拋轉)', visible: true },
    { field: 'PickupStatus', header: '領取狀態', visible: true },
    { field: 'PickupDate', header: '領取日期', visible: true },
    { field: 'VoucherNo', header: '傳票號碼(開票)', visible: true },
    { field: 'VoucherNoPaid', header: '傳票號碼(兌現)', visible: true },
  ];

  constructor(
    private fin63040Service: Fin63040Service,
    private notificationService: NotificationService
  ) {
    super();
  }

  ngOnInit(): void {
    // ✅ 你的 Base initializePage 第二參數不是 FormGroup，所以不要傳
    this.initializePage(this.ProgNo);

    // TODO：需要公司銀行科目代號下拉就自己接 API 塞 AccountcodeOptions
    // this.loadAccountOptions();
  }

  /** 你們 Base 沒 canQuery()，先在本頁做一個 */
  canQuery(): boolean {
    return true;
  }

  /** 查詢 */
  onSubmit(frm: FormGroup): void {
    this.notificationService.blockUi();
    this.submitted = true;
    this.loading = true;

    if (frm.invalid || !this.canQuery()) {
      this.loading = false;
      this.notificationService.unblockUi();
      return;
    }

    const v = frm.getRawValue() as any;

    const req: QueryFIN63040Request = {
      PageSize: Number(v.PageSize ?? 10),
      PageIndex: Number(v.PageIndex ?? 1),
      SortBy: Array.isArray(v.SortBy) ? v.SortBy : [],

      CompanyAccNo: String(v.CompanyAccNo ?? '').trim(),
      ChkNo: v.ChkNo ? String(v.ChkNo).trim() : undefined,

      // ✅ 重點：回傳只能是 string | undefined（不要 null）
      PayDateFrom: this.toYMD(v.PayDateFrom),
      PayDateTo: this.toYMD(v.PayDateTo),
      ExpireDateFrom: this.toYMD(v.ExpireDateFrom),
      ExpireDateTo: this.toYMD(v.ExpireDateTo),
    };

    this.fin63040Service
      .queryFIN63040(req)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: any) => {
          if (res?.IsSuccess === false) {
            this.notificationService.errorBubble(res?.Message ?? '查詢失敗');
            this.data = [];
            return;
          }
          this.data = (res?.Data ?? []) as QueryFIN63040Row[];
        },
        error: () => {
          this.notificationService.errorBubble('查詢失敗');
          this.data = [];
        },
        complete: () => {
          this.loading = false;
          this.notificationService.unblockUi();
        },
      });
  }

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  onClearForm(): void {
    this.queryForm.reset();

    // ✅ 保留預設值（SortBy 型別正確就不會再噴 never[]）
    this.queryForm.patchValue({
      PageSize: 10,
      PageIndex: 1,
    });
    this.queryForm.controls.SortBy.setValue([]);

    this.data = [];
  }

  /** yyyy-MM-dd（只回 string 或 undefined） */
  private toYMD(d: Date | null | undefined): string | undefined {
    if (!d) return undefined;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return undefined;

    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
