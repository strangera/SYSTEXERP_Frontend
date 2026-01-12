/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';

import {
  FIN55010Detail,
  FIN55010Service,
} from '../../../service/api/fin/fin55010.service';

import { Location } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableSubheaderComponent } from '@shared/componentkit/table/table-subheader/table-subheader.component';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-fin55010',
  templateUrl: './fin55010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TranslateModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    TableSubheaderComponent,
    InputTextRangeComponent,
    RadiobuttonComponent
  ]
})
export class FIN55010Component extends BasicQueryPageComponent<FIN55010Detail> implements OnInit {

  constructor(
    private fin55010Service: FIN55010Service,
    private dropDownListService: DropDownListService,
    private readonly location: Location,
  ) {
    super();
  }

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  /** 匯出 loading 共用旗標 */
  btnLoading = false;

  /** 記住上一次查詢的 payload（供匯出使用） */
  private lastQueryBody: any | null = null;

  queryForm = this.formBuilder.group({
    DateFrom: [this.yesterday, Validators.required],
    DateTo: [this.yesterday, Validators.required],
    // DateFrom: ['2025-04-01', Validators.required],
    // DateTo: ['2025-04-30', Validators.required],
    VouNoFrom: [null],
    VouNoTo: [null],
    CRT_USR: [null],
    CRT_DateFrom: [null],
    CRT_DateTo: [null],
    VoucherTypeList: [null],
    VouStatusList: [null],
    PrintType: ['A4R'],
    ...createPaginationConfig([])
  });

  data: FIN55010Detail[] = [];
  selectedItems: FIN55010Detail[] = [];
  totalRecords = 0;

  columns: Column[] = [
    { field: 'VouNo', header: '傳票號碼', visible: true, type: 'detail' },
    { field: 'VoucherType_Name', header: '傳票種類', visible: true },
    { field: 'VouDate', header: '傳票日期', visible: true },
    { field: 'VouStatus', header: '傳票狀態', visible: true },
    { field: 'NoteDesc', header: '摘要', visible: true },
    { field: 'VoucherType', header: '傳票型態', visible: true },
    { field: 'VouAmt', header: '傳票金額', visible: true, format: formatAmount },
    { field: 'DetailCount', header: '明細筆數', visible: true },
  ];

  //#region 下拉
  VoucherTypeListOptions: any[] = [];
  VouStatusListOptions: any[] = [
    { label: '作廢', value: '0' },
    { label: '建立', value: '1' },
    { label: '確認', value: '2' },
    { label: '過帳', value: '3' },
  ];
  PrintTypeOptions: any[] = [
    { label: 'A4橫式', value: 'A4R' },
    { label: 'A4直式', value: 'A4C' },
    { label: '一般', value: 'Normal' },
  ];
  //#endregion

  ngOnInit(): void {
    this.initializePage('FIN55010', 'account/fin/fin55010cru', this.queryForm, (form) => this.onSubmit(form));
    // ✅ 預先把 ProgNo 寫入一次，避免你從其它地方直開 CRU
    try { localStorage.setItem('FIN55010_CRU_PROGNO', 'FIN55010'); } catch { }

    this.loadOptions();

    const saved = this.queryStateService.getQueryStateValue(this.ProgNo);
    if (saved) {
      this.queryForm.patchValue(this.coerceDates(saved), { emitEvent: false });
      this.lastQueryBody = saved;
    }

    this.queryForm.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      });
  }

  private coerceDates(raw: any) {
    const fix = (v: any) => {
      if (!v) return v;
      if (v instanceof Date) return v;
      const d = new Date(v);
      return isNaN(d.getTime()) ? v : d;
    };
    return {
      ...raw,
      DateFrom: fix(raw?.DateFrom),
      DateTo: fix(raw?.DateTo),
      CRT_DateFrom: fix(raw?.CRT_DateFrom),
      CRT_DateTo: fix(raw?.CRT_DateTo),
    };
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.fin55010Service.queryFIN55010(form.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((response) => {
          this.data = response.Data ?? [];
          this.totalRecords = response.TotalCount ?? this.data.length;

          // 記住本次查詢（匯出用）
          this.lastQueryBody = form.getRawValue();

          // 保存查詢狀態
          this.queryStateService.setQueryState(this.ProgNo, this.lastQueryBody);
        });
    });
  }

  override onLazyLoadData(event: any, form: FormGroup) {
    form.patchValue({
      pageSize: event?.pageSize,
      pageIndex: event?.pageIndex,
      SortBy: event?.SortBy
    }, { emitEvent: false });

    this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
  }

  /** 清單 → 明細（CRU）：使用 localStorage 交接資料 */
  override onDetail(row: FIN55010Detail) {
    const vouNo = row?.VouNo;
    if (!vouNo) {
      this.messageService?.warnBubble?.('無法開啟，缺少傳票號碼。');
      return;
    }

    // 儲存交接資料到 localStorage（含 ProgNo）
    // 參考fin54025寫法
    try {
      const handoff = {
        vouNo,
        fromRoute: window.location.pathname,
        ts: Date.now(),
      };
      localStorage.setItem('FIN55010_CRU_HANDOFF', JSON.stringify(handoff));
      localStorage.setItem('FIN55010_CRU_PROGNO', 'FIN55010'); // ✅ 存 ProgNo
      const externalUrl = this.location.prepareExternalUrl('/account/fin/fin55010cru');
      const finalUrl = `${window.location.origin}${externalUrl}`;
      // 開新分頁
      window.open(finalUrl, '_blank', 'noopener');
      console.log('[FIN55010] 已儲存 handoff:', handoff);
    } catch (err) {
      console.error('[FIN55010] handoff save failed:', err);
      this.messageService?.warnBubble?.('寫入交接資料失敗。');
    }
  }

  loadOptions() {
    this.fin55010Service.queryGLS1010_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.VoucherTypeListOptions = response.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        })) ?? [];
      });
  }

  // ========= 匯出 =========
  onExportPDF() {
    if ((this.selectedItems?.length ?? 0) === 0) return this.messageService?.warnBubble?.('請至少選取一筆資料進行匯出。');
    const payload = {
      VouNoList: this.selectedItems.map(i => i.VouNo),
      PrintType: this.queryForm.controls.PrintType.value || 'A4R',
    };
    if (!payload) return;

    this.btnLoading = true;
    this.fin55010Service.exportFIN55010PDF(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', '傳票列印'),
        error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
      });
  }

  // ========= 本地工具 =========
  private handleFileExport(resp: any, ext: '.pdf' | '.xlsx', baseName: string) {
    const blob = resp?.body instanceof Blob ? resp.body : resp;
    const fileName = `${baseName}_${new Date().getTime()}${ext}`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}