/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { TLS11020Service } from '../../../service/api/tls/tls11020.service';
import { AccountingaccountService } from '../../../service/basic/queryGLS1005.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-tls11020',
  templateUrl: './tls11020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    TranslateModule,
    TableReportComponent,
  ],
})
export class TLS11020Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;

  lastQueryBody: any = null;
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  // 給 table-report 用：由它內部呼叫（lazy 分頁/排序用）
  queryTLS11020Fn = (body: any) => this.tls11020Service.queryTLS11020(body);
  /** 023 這筆不允許勾選、不允許編輯 */
private isBlockedRow = (row: any): boolean => String(row?.CAP_Item ?? '').trim() === '023';

/** 給 app-table-report 用：控制 checkbox 是否可勾 */
isRowSelectable = (row: any): boolean => !this.isBlockedRow(row);

/** 給 app-table-report 用：控制「編輯」按鈕 disabled */
editDisabled = (row: any): boolean => this.isBlockedRow(row);

// 如果你也想讓「查看/明細」一起鎖：
// detailDisabled = (row: any): boolean => this.isBlockedRow(row);


  // 下拉
  deductionCategoryOptions = [
    { value: 'A', label: 'A-一次扣款' },
    { value: 'B', label: 'B-每月扣款' },
    { value: 'C', label: 'C-平均分攤' },
    { value: 'D', label: 'D-比率分攤' },
    { value: 'E', label: 'E-活動扣款' },
    { value: 'Z', label: 'Z-其他扣款' },
  ];

  guiFlagOptions = [
    { label: '開立', value: 'Y' },
    { label: '不開立', value: 'N' },
  ];

  taxTypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
  ];

  isCommonlyUsedOptions = [
    { label: '常用', value: 'Y' },
    { label: '不常用', value: 'N' },
  ];

  accountOptions: any[] = [];

  queryForm = this.formBuilder.group({
    CAP_Item: ['', [Validators.maxLength(3)]],
    CAP_Name: ['', [Validators.maxLength(40)]],
    CAP_BaseRate: ['', [Validators.maxLength(5)]],
    CAP_Type: [[] as string[]],
    CAP_Remark: ['', [Validators.maxLength(160)]],
    ...createPaginationConfig([{ field: 'CAP_Item', order: 1 }]),
  });

  columns: any[] = [
    { field: 'CAP_Item', header: '扣款項目編號', visible: true },
    {
      field: 'CAP_Type',
      header: '扣款類別',
      visible: true,
      format: (value: any) =>
        this.getLabelFromOptions(value, this.deductionCategoryOptions),
      exportFormat: this.deductionCategoryOptions.map((o) => ({
        [o.value]: o.label,
      })),
    },
    { field: 'CAP_Name', header: '扣款項目名稱', visible: true },
    { field: 'AccNo', header: '會計科目代碼', visible: true },
    { field: 'AccCName', header: '會計科目名稱', visible: true },

    {
      field: 'GUI_FLAG',
      header: '是否開立發票',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.guiFlagOptions),
      exportFormat: this.guiFlagOptions.map((o) => ({ [o.value]: o.label })),
    },
    {
      field: 'CAP_TaxType',
      header: '課稅別',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.taxTypeOptions),
      exportFormat: this.taxTypeOptions.map((o) => ({ [o.value]: o.label })),
    },
    {
      field: 'IsCommonlyUsed',
      header: '是否常用',
      visible: true,
      format: (value: any) =>
        this.getLabelFromOptions(value, this.isCommonlyUsedOptions),
      exportFormat: this.isCommonlyUsedOptions.map((o) => ({
        [o.value]: o.label,
      })),
    },
    { field: 'Print_Area', header: '扣款項目合約列印區分', visible: true },
    { field: 'CAP_Remark', header: '備註', visible: true },
  ];

  constructor(
    private tls11020Service: TLS11020Service,
    private accountingaccountService: AccountingaccountService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'TLS11020',
      'tls/tls11020cru',
      this.queryForm,
      (f) => this.onSubmit(f)
    );

    // 會計科目下拉（若你 table 需要 exportFormat 對照）
    this.accountingaccountService.getOptions().subscribe((data) => {
      this.accountOptions = (data || []).map((x: any) => ({
        label: x.Name,
        formLabel: `${x.No} - ${x.Name}`,
        value: x.No,
      }));

      const mapAcc = this.accountOptions.map((o: any) => ({
        [String(o.value)]: String(o.label),
      }));

      // 如果你欄位是 AccNo / AccCName 之類，依你實際欄位調整
      this.columns = this.columns.map((c) =>
        c.field === 'AccNo' ? { ...c, exportFormat: mapAcc } : c
      );
    });
  }

  /** 給 API 用的 payload 轉換 */
  private buildApiPayload(formValue: any): any {
    const payload: any = { ...formValue };

    // 空字串 -> null
    if (payload.CAP_Item === '') payload.CAP_Item = null;
    if (payload.CAP_Name === '') payload.CAP_Name = null;
    if (payload.CAP_BaseRate === '') payload.CAP_BaseRate = null;
    if (payload.CAP_Remark === '') payload.CAP_Remark = null;

    // MultiSelect：統一轉成代碼陣列
    const toCodeArray = (arr: any[]): string[] =>
      (arr || [])
        .map((x: any) => {
          if (x == null) return '';
          if (typeof x === 'string' || typeof x === 'number') return String(x);
          if (typeof x === 'object' && 'value' in x) return String(x.value);
          return '';
        })
        .filter((v) => v !== '');

    if (Array.isArray(payload.CAP_Type)) {
      payload.CAP_Type = toCodeArray(payload.CAP_Type);
    }

    return payload;
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      this.loading = true;
      this.messageService.blockUi();

      const raw = form.getRawValue();
      const payload = this.buildApiPayload(raw);

      // 給 table-report 使用（保留最後一次查詢 body）
      this.lastQueryBody = { ...payload };

      this.tls11020Service.queryTLS11020(payload).subscribe({
        next: (res: any) => {
          if (res.Status === '0000') {
            this.data = res?.Data || [];
            this.totalRecords = res?.TotalCount || this.data.length;

            // ✅ 建議存「raw form」(還原 UI 更準)
            this.queryStateService.setQueryState(this.ProgNo, raw);
          }
        },
        error: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  /** Table lazy event：把頁碼/筆數/排序寫回 form，然後查詢 */
  override onLazyLoadData(event: any, form: FormGroup): void {
    const evPageIndex =
      Number.isFinite(event?.pageIndex)
        ? Number(event.pageIndex)
        : Number.isFinite(event?.first) && Number.isFinite(event?.rows)
          ? Math.floor(Number(event.first) / Number(event.rows)) + 1
          : undefined;

    const evPageSize =
      Number.isFinite(event?.pageSize)
        ? Number(event.pageSize)
        : Number.isFinite(event?.rows)
          ? Number(event.rows)
          : undefined;

    const nextSort = Array.isArray(event?.SortBy)
      ? event.SortBy
      : Array.isArray(event?.multiSortMeta)
        ? event.multiSortMeta
        : form.value?.SortBy ?? [];

    const currSortSig = JSON.stringify(form.value?.SortBy ?? []);
    const nextSortSig = JSON.stringify(nextSort ?? []);

    const nextPageIndex =
      currSortSig !== nextSortSig ? 1 : (evPageIndex ?? form.value?.pageIndex ?? 1);

    const nextPageSize = evPageSize ?? form.value?.pageSize ?? 30;

    form.patchValue(
      {
        pageIndex: nextPageIndex,
        pageSize: nextPageSize,
        SortBy: nextSort ?? [],
      },
      { emitEvent: false }
    );

    const sig = JSON.stringify({
      pageIndex: form.value?.pageIndex,
      pageSize: form.value?.pageSize,
      SortBy: form.value?.SortBy,
    });

    if (sig === this.lastQuerySig) return;
    this.lastQuerySig = sig;

    if (this.lazyTimer) clearTimeout(this.lazyTimer);
    this.lazyTimer = setTimeout(() => this.onSubmit(form), 0);
  }

  onDelete(selectedItems: any[]) {
    if (!selectedItems?.length) return;

    const confirm = window.confirm('是否確定刪除選取項目？');
    if (!confirm) return;

    const idList = selectedItems.map((item) => item.id);

    this.tls11020Service.deleteTLS11020(idList).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.onSubmit(this.queryForm);
      },
      error: () => this.messageService.errorBubble('刪除失敗'),
    });
  }


  override onEdit(row: any): void {
    if (!this.hasPermission('30')) return;
    this.navigateWithState(CRUDStatus.Edit, row);
  }

  override onDetail(row: any): void {
    if (!this.hasPermission('20')) return;
    this.navigateWithState(CRUDStatus.Read, row);
  }

  onClear(): void {
    const form = this.queryForm;

    const paging = {
      pageIndex: form.get('pageIndex')?.value ?? 1,
      pageSize: form.get('pageSize')?.value ?? 20,
      SortBy: form.get('SortBy')?.value ?? [{ field: 'CAP_Item', order: 1 }],
    };

    form.reset();

    form.get('CAP_Item')?.setValue('');
    form.get('CAP_Name')?.setValue('');
    form.get('CAP_BaseRate')?.setValue('');
    form.get('CAP_Remark')?.setValue('');
    (form.get('CAP_Type') as any)?.setValue([]);

    form.patchValue(paging, { emitEvent: false });

    this.submitted = false;
    form.markAsPristine();
    form.markAsUntouched();

    const cleared = form.getRawValue();
    this.queryStateService.setQueryState(this.ProgNo, cleared);
  }

  getLabelFromOptions(value: any, options: any[]): string {
    return options.find((opt) => String(opt.value) === String(value))?.label ?? String(value ?? '');
  }
}
