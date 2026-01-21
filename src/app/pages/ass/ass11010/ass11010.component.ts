import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11010Service } from '@service/api/ass/ass11010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { ASS11010Data, ASS11010QueryRequest } from './ass11010.model';

// 3.1.1.1 資產列管品及耗材分類管理作業-大分類維護作業
@Component({
  selector: 'app-ass11010',
  templateUrl: './ass11010.component.html',
  styleUrl: './ass11010.component.scss',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    MenubarComponent,
    TableComponent,
  ],
})
export class ASS11010Component extends BasicQueryPageComponent<ASS11010Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    CLASS_ID: new FormControl<string | null>(null),   // 大分類代碼
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<ASS11010Data[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);

  // 大分類代碼/名稱下拉選項
  public readonly bigClassOptions = signal<{ label: string; value: string }[]>([]);

  public readonly columns: (Omit<Column, 'field'> & { field: keyof ASS11010Data })[] = [
    { field: 'CLASS_ID', header: '大分類代碼' },
    { field: 'CLASS_NAME', header: '大分類名稱' },
  ];

  constructor(
    public readonly service: ASS11010Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11010', '/ASS/ASS11010CRU', this.queryForm, this.onSubmit.bind(this));
    this.logger.debug(`ASS11010 init:`, [this.queryForm]);
    this.loadBigClassOptions();
  }

  /**
   * 載入大分類下拉選項
   */
  private loadBigClassOptions(): void {
    this.service.queryASS11010({}).subscribe({
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

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = this.queryForm.getRawValue();
      const payload = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
        v !== null && v !== undefined && v !== ''
      )) as ASS11010QueryRequest;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.logger.debug(`onSubmit:`, [payload]);
      this.service.queryASS11010(payload).pipe(
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
