import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11010Service } from '@service/api/ass/ass11010.service';
import { ASS11020Service } from '@service/api/ass/ass11020.service';
import { ASS11030Service } from '@service/api/ass/ass11030.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { ASS11030Data, ASS11030QueryRequest } from './ass11030.model';

// 3.1.1.3 資產列管品及耗材分類管理作業-小分類維護作業
@Component({
  selector: 'app-ass11030',
  templateUrl: './ass11030.component.html',
  styleUrl: './ass11030.component.scss',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextareaComponent,
    MenubarComponent,
    TableReportComponent,
  ],
})
export class ASS11030Component extends BasicQueryPageComponent<ASS11030Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    S_CLASS_ID: new FormControl<string | null>(null),   // 小分類代碼
    M_CLASS_ID: new FormControl<string | null>(null),   // 中分類代碼
    B_CLASS_ID: new FormControl<string | null>(null),   // 大分類代碼
    NOTES_KEYWORD: new FormControl<string | null>(null), // 說明
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<ASS11030Data[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);

  public readonly columns: ReportColumn[] = [
    { field: 'S_CLASS_ID', header: '小分類代碼' },
    { field: 'S_CLASS_NAME', header: '小分類名稱' },
    { field: 'M_CLASS_ID', header: '中分類代碼' },
    { field: 'B_CLASS_ID', header: '大分類代碼' },
  ];

  // 大分類代碼/名稱下拉選項
  public readonly bigClassOptions = signal<{ label: string; value: string }[]>([]);
  // 中分類代碼/名稱下拉選項
  public readonly midClassOptions = signal<{ label: string; value: string }[]>([]);
  // 小分類代碼/名稱下拉選項
  public readonly smallClassOptions = signal<{ label: string; value: string }[]>([]);

  constructor(
    public readonly service: ASS11030Service,
    private readonly ass11010Service: ASS11010Service,
    private readonly ass11020Service: ASS11020Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11030', '/ass/ass11030cru', this.queryForm, this.onSubmit.bind(this));
    this.logger.debug(`ASS11030 init:`, [this.queryForm]);
    this.loadBigClassOptions();
    this.loadMidClassOptions();
    this.loadSmallClassOptions();
  }

  /**
   * 載入大分類下拉選項
   */
  private loadBigClassOptions(): void {
    this.ass11010Service.queryASS11010({}).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.QueryData.map(item => ({
          label: `${item.CLASS_ID} - ${item.CLASS_NAME}`,
          value: item.CLASS_ID,
        }));
        this.bigClassOptions.set(options);
      },
    });
  }

  /**
   * 載入中分類下拉選項
   */
  private loadMidClassOptions(): void {
    this.ass11020Service.queryASS11020({}).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.QueryData.map(item => ({
          label: `${item.M_CLASS_ID} - ${item.M_CLASS_NAME}`,
          value: item.M_CLASS_ID,
        }));
        this.midClassOptions.set(options);
      },
    });
  }

  /**
   * 載入小分類下拉選項
   */
  private loadSmallClassOptions(): void {
    this.service.queryASS11030({}).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.QueryData.map(item => ({
          label: `${item.S_CLASS_ID} - ${item.S_CLASS_NAME}`,
          value: item.S_CLASS_ID,
        }));
        this.smallClassOptions.set(options);
      },
    });
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = this.queryForm.getRawValue();
      const payload = Object.fromEntries(Object.entries(raw).filter(([, v]) =>
        v !== null && v !== undefined && v !== ''
      )) as ASS11030QueryRequest;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.logger.debug(`onSubmit:`, [payload]);
      this.service.queryASS11030(payload).pipe(
        finalize(() => {
          this.tableLoading.set(false);
          this.loading = false;
        }),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.tableData.set(res.Data.QueryData);
          this.totalRecords.set(res.Data.TotalCount || 0);
        },
      });
    });
  }
}
