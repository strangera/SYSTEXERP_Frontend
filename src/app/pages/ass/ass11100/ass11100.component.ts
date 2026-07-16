import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { map } from 'rxjs/operators';
import { ASS11100Data, ASS11100QueryRequest } from './ass11100.model';

// 3.1.1.10 倉別設定作業
@Component({
  selector: 'app-ass11100',
  templateUrl: './ass11100.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableReportComponent,
  ],
})
export class ASS11100Component extends BasicQueryPageComponent<ASS11100Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    WH_ID: new FormControl<string | null>(null),        // 倉別
    WH_NAME: new FormControl<string | null>(null),      // 倉別名稱
    ATT_ORG_ID: new FormControl<string | null>(null),   // 部門代號
    NOTES: new FormControl<string | null>(null),        // 備註
    pageSize: new FormControl<number>(30),              // 每頁筆數
    pageIndex: new FormControl<number>(1),              // 頁碼
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<(ASS11100Data & { _pk: string })[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: ASS11100QueryRequest;

  public selectedItems: (ASS11100Data & { _pk: string })[] = [];
  public organizationOptions: Array<{ label: string; value: string }> = [];

  public readonly columns: ReportColumn[] = [
    { field: 'WH_ID', header: '倉別' },
    { field: 'WH_NAME', header: '倉別名稱' },
    { field: 'ATT_ORG_ID', header: '部門代號' },
    { field: 'NOTES', header: '備註' },
  ];

  constructor(
    public readonly service: ASS11100Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11100', 'ass/ass11100cru', this.queryForm, this.onSubmit.bind(this));
    this.loadOrganizationOptions();
  }

  /**
   * 載入部門下拉選單
   */
  private loadOrganizationOptions(): void {
    this.dropDownListService.querySYS3100_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.organizationOptions = res.Data.map(item => ({
          label: `${item.No || ''}-${item.Name || ''}`,
          value: item.No || ''
        }));
      },
    });
  }

  /**
   * 查詢函數（供 table-report 分頁查詢使用）
   */
  public queryFunction = (body: any) => {
    const rawFormValue = this.queryForm.getRawValue();
    // 支援大小寫（table-report loadMore 使用小寫）
    const pageSize = body.pageSize ?? body.PageSize ?? 30;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? 1;
    const payload: ASS11100QueryRequest = {
      WH_ID: rawFormValue.WH_ID || undefined,
      WH_NAME: rawFormValue.WH_NAME || undefined,
      ATT_ORG_ID: rawFormValue.ATT_ORG_ID || undefined,
      NOTES: rawFormValue.NOTES || undefined,
      PageSize: body.pageSize ?? 30,
      PageIndex: body.pageIndex ?? 1,
      SortBy: body.SortBy,
    };
    const cleanPayload = removeEmptyValues(payload) as ASS11100QueryRequest;
    return this.service.queryASS11100(cleanPayload).pipe(
      map((res) => ({
        ...res,
        Data: (res.Data || []).map((r) => ({
          ...r,
          _pk: `${r.WH_ID ?? ''}|${r.ATT_ORG_ID ?? ''}`,
        })),
      }))
    );
  };

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const rawFormValue = this.queryForm.getRawValue();
      this.lastQueryBody = {
        WH_ID: rawFormValue.WH_ID || undefined,
        WH_NAME: rawFormValue.WH_NAME || undefined,
        ATT_ORG_ID: rawFormValue.ATT_ORG_ID || undefined,
        NOTES: rawFormValue.NOTES || undefined,
        PageSize: rawFormValue.pageSize || 30,
        PageIndex: rawFormValue.pageIndex || 1,
      } as ASS11100QueryRequest;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, rawFormValue);
      this.queryFunction(this.lastQueryBody).pipe(
        finalize(() => {
          this.tableLoading.set(false);
          this.loading = false;
        }),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.tableData.set(res.Data);
          this.totalRecords.set(res.TotalCount || 0);
        },
      });
    });
  }

  /**
   * 刪除項目（以 WH_ID + ATT_ORG_ID 識別）
   */
  public onDelete(data: (ASS11100Data & { _pk?: string }) | (ASS11100Data & { _pk?: string })[]): void {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) return;

    const valid = items.filter(
      (row) => row && (row.WH_ID != null && row.WH_ID !== '') && (row.ATT_ORG_ID != null && row.ATT_ORG_ID !== '')
    );
    if (valid.length === 0) {
      this.messageService.warnBubble('未找到有效的刪除項目（需有倉別代號與所屬部門代號）');
      return;
    }

    this.messageService.confirm({
      header: `是否確認刪除 ${valid.length} 筆資料?`,
      accept: () => {
        const payload = {
          Items: valid.map((row) => ({
            WH_ID: row.WH_ID ?? null,
            ATT_ORG_ID: row.ATT_ORG_ID ?? null,
          })),
        };
        this.service.deleteASS11100(payload).subscribe({
          next: (res) => {
            if (res.Status !== '0000') {
              this.messageService.errorBubble(`刪除失敗: ${res.Message ?? '刪除失敗'}`);
            } else {
              this.messageService.successBubble('選中項目刪除成功');
            }
          },
          error: (err) => {
            console.error('API error:', err);
            this.messageService.errorBubble('刪除失敗');
          },
          complete: () => {
            this.onSubmit();
            this.selectedItems = [];
          },
        });
      },
    });
  }

  /**
   * 判斷行是否可選
   */
  public isRowSelectable(rowData: ASS11100Data): boolean {
    return true;
  }
}
