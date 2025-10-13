import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TLS51130Service } from '../../../service/api/tls/tls51130.service';
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { SortMeta } from 'primeng/api';

@Component({
  selector: 'app-tls51130',
  templateUrl: './tls51130.component.html',
  styleUrls: ['./tls51130.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS51130Component extends BasicQueryPageComponent<any> {
  selectedItems: any[] = [];
  private lastQueryKey = '';

  queryForm = this.formBuilder.group({
    LOGO_No: [''],
    CAT_LNo: [''],
    ...createPaginationConfig([{ field: 'LOGO_No', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;
  CAT_LOptions: any[] = [];
  LOGOOptions: any[] = [];

  columns: any[] = [
    { field: 'LOGO_No', header: '品牌', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
    { field: 'CAT_LDisplay', header: '大分類編號/名稱', visible: true },
    { field: 'CAT_MDisplay', header: '中分類編號/名稱', visible: true },
    { field: 'CAT_SDisplay', header: '小分類編號/名稱', visible: true },
    { field: 'PLU_OrderPrcRate', header: '進貨折數', visible: true },
    { field: 'DISC_Remark', header: '備註', visible: true },
  ];

  constructor(
    private TLS51130Service: TLS51130Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51130', '/tls/tls51130cru', this.queryForm);

    // 小工具：把 code/name 合併成 "code/name"
    const combine = (code?: any, name?: any) => {
      const a = (code ?? '').toString().trim();
      const b = (name ?? '').toString().trim();
      return a && b ? `${a}-${b}` : (a || b || '');
    };

    // 大分類下拉：用 no-name
    this.dropDownListService.queryPOS2003_DropDownList().subscribe((res) => {
      const nestedData = res?.Data || [];
      this.CAT_LOptions = nestedData.map((item) => ({
        label: combine(item.No, item.Name),
        value: (item.No ?? '').toString().trim(),
      }));
    });

    // 品牌下拉：改成 no-name
    this.dropDownListService.queryPLULOGO_HOS_No_DropDownList().subscribe((res: any) => {
      const nestedData = res?.Data || [];
      this.LOGOOptions = nestedData.map((item: { Name: string; No: string }) => ({
        label: combine(item.No, item.Name),
        value: (item.No ?? '').toString().trim(),
      }));
    });
  }

  /** 將前端顯示用欄位→後端實體欄位，避免 SQL 排序丟不存在的欄位 */
  private normalizeSort(sortBy: SortMeta[] | undefined): SortMeta[] {
    const map: Record<string, string[]> = {
      CAT_LDisplay: ['CAT_LNo', 'CAT_LName'],
      CAT_MDisplay: ['CAT_MNo', 'CAT_MName'],
      CAT_SDisplay: ['CAT_SNo', 'CAT_SName'],
    };
    const src = Array.isArray(sortBy) ? sortBy : [];
    const result: SortMeta[] = [];
    for (const s of src) {
      const targets = map[s.field] ?? [s.field];
      for (const f of targets) {
        result.push({ field: f, order: s.order });
      }
    }
    return result;
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    const formValue: any = { ...form.value };

    // 去除空字串並轉為 null
    Object.keys(formValue).forEach((key) => {
      if (typeof formValue[key] === 'string') {
        formValue[key] = formValue[key].trim() || null;
      }
    });

    // ✅ 排序欄位轉換成後端實體欄位
    formValue.SortBy = this.normalizeSort(formValue.SortBy);

    this.loading = true;
    this.messageService.blockUi();

    this.TLS51130Service.queryTLS51130(formValue).subscribe({
      next: (res: any) => {
        if (res.Status === '0000') {
          const combine = (code?: any, name?: any) => {
            const a = (code ?? '').toString().trim();
            const b = (name ?? '').toString().trim();
            return a && b ? `${a}/${b}` : a || b || '';
          };

          const raw = res.Data || [];
          this.data = raw.map((r: any) => ({
            id: r.id,
            ...r,
            CAT_LDisplay: combine(r.CAT_LNo, r.CAT_LName),
            CAT_MDisplay: combine(r.CAT_MNo, r.CAT_MName),
            CAT_SDisplay: combine(r.CAT_SNo, r.CAT_SName),
          }));

          this.totalRecords = res.TotalCount || this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, { ...form.value });
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
  }

  onDelete(selectedItems: any[]): void {
    if (!selectedItems || !selectedItems.length) return;
    if (!window.confirm('是否確定刪除選取項目？')) return;

    const idList = selectedItems.map((item) => item.id);
    this.TLS51130Service.deleteTLS51130(idList).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.onSubmit(this.queryForm);
      },
      error: () => {
        this.messageService.errorBubble('刪除失敗');
      },
    });
  }

  /** 由 Table lazy 事件觸發查詢（含去重複） */
  onLazy(event: LazyLoadEvent) {
    this.onLazyLoadData(event, this.queryForm);
    const v: any = this.queryForm.value;
    const normalizedSort = this.normalizeSort(v.SortBy);

    const key = JSON.stringify({
      pageIndex: v.pageIndex,
      pageSize: v.pageSize,
      SortBy: normalizedSort,
      LOGO_No: v.LOGO_No ?? null,
      CAT_LNo: v.CAT_LNo ?? null,
    });

    if (key === this.lastQueryKey) return;
    this.lastQueryKey = key;

    this.onSubmit(this.queryForm);
  }
}
