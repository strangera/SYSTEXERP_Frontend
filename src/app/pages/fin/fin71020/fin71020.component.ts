import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN71020Service } from '@service/api/fin/fin71020.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { createPaginationConfig } from '@others/component/table/table.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN71020Data } from './fin71020.model';

@Component({
  selector: 'app-fin71020',
  templateUrl: './fin71020.component.html',
  standalone: !0,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputNumberRangeComponent,
    InputTextareaComponent,
    MenubarComponent,
    TableReportComponent,
  ]
})
export class FIN71020Component extends BasicQueryPageComponent<FIN71020Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    Keep_UsrNo: this.formBuilder.control<string | void>(void 0),
    Keep_QuotaAmt_S: this.formBuilder.control<number | void>(void 0),
    Keep_QuotaAmt_E: this.formBuilder.control<number | void>(void 0),
    Keep_Remark: this.formBuilder.control<string | void>(void 0),
    Keep_Orgid: this.formBuilder.control<string | void>(void 0),
    ...createPaginationConfig([{ field: 'Keep_UsrNo', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<FIN71020Data[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(!1);
  public lastQueryBody: Record<string, unknown> | null = null;

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading()
      || this.service.usrLoading()
      || this.service.orgLoading();
  });

  public readonly columns: ReportColumn[] = [
    { field: 'Keep_UsrNo', header: '保管人代碼' },
    { field: 'Keep_UsrName', header: '保管人名稱' },
    { field: 'Keep_QuotaAmt', header: '零用金額度' },
    { field: 'Keep_Remark', header: '說明' },
  ];

  // 保管人下拉選單（顯示 代碼 - 名稱）
  public readonly usrNoDisplayOptions = computed(() =>
    this.service.usrNoOptions().map(opt => ({
      ...opt,
      displayLabel: `${opt.Keep_UsrNo} - ${opt.Keep_UsrName}`,
    }))
  );

  // 保管單位下拉選單（顯示 代碼 - 名稱）
  public readonly orgIdDisplayOptions = computed(() =>
    this.service.orgIdOptions().map(opt => ({
      ...opt,
      displayLabel: `${opt.Org_No} - ${opt.Org_Name}`,
    }))
  );

  constructor(
    public readonly service: FIN71020Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN71020', '/FIN/FIN71020CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.getKeepUsrNo();
    this.service.getKeepOrgId();

    this.logger.debug(`init:`, []);
  }

  public onDelete(data: FIN71020Data | FIN71020Data[]): void {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) return;

    this.messageService.confirm({
      header: '刪除確認',
      message: `是否確認刪除 ${items.length} 筆資料？`,
      accept: () => {
        const ids = items.map(item => item.ID);
        this.tableLoading.set(!0);
        this.service.deleteFIN71020({ IDs: ids }).pipe(
          finalize(() => this.tableLoading.set(!1)),
        ).subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.messageService.successBubble('刪除成功');
            this.onSubmit();
          },
        });
      },
    });
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = this.queryForm.getRawValue();
      const payload = Object.fromEntries(
        Object.entries(raw).filter(([, v]) => v !== null && v !== undefined && v !== '')
      );

      this.tableLoading.set(!0);
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.logger.debug(`submit:`, [payload]);
      this.service.loadFIN71020(payload).pipe(
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.tableData.set(res.Data || []);
          this.totalRecords.set(res.TotalCount || 0);
          this.lastQueryBody = payload;
        },
      });
    });
  }
}
