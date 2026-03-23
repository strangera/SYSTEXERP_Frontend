import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52030Service } from '@service/api/fin/fin52030.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { apiOption } from '@shared/models/sys/sysb000.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize, tap } from 'rxjs';
import { FIN52030Data, FIN52030Payload } from './fin52030.model';

@Component({
  selector: 'app-fin52030',
  templateUrl: './fin52030.component.html',
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
    TableComponent,
  ],
})
export class FIN52030Component extends BasicQueryPageComponent<FIN52030Data> implements OnInit {
  public readonly queryForm = this.formBuilder.group({
    TempNo: new FormControl<string | void>(void 0),
    VouType: new FormControl<'1' | '2' | '3' | void>(void 0),
    TempName: new FormControl<string | void>(void 0),
    CRT_USR_No: new FormControl<string | void>(void 0),
    UPD_USR_No: new FormControl<string | void>(void 0),
    ...createPaginationConfig([{ field: 'id', order: 1 }])
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<FIN52030Data[]>([]);
  public readonly totalRecords = signal<number>(0);

  public tblUserOptions: apiOption[] = []; // 人員 下拉選單

  public readonly columns: (Omit<Column, 'field'> & { field: keyof FIN52030Data; })[] = [
    { field: 'TempNo', header: '常用傳票代碼' },
    { field: 'TempName', header: '常用傳票名稱' },
    { field: 'VouType', header: '傳票類型', format: v => this.service.vouTypeOptions().find(option => option.value === v)?.label ?? v },
    { field: 'DetailCount', header: '明細筆數' },
    { field: 'CRT_USR_Name', header: '建立人員' },
    { field: 'UPD_USR_Name', header: '修改人員' },
  ];

  public readonly tableLoading = signal<boolean>(!1);

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading()
  }, { allowSignalWrites: true });

  constructor(
    public readonly service: FIN52030Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN52030', '/FIN/FIN52030CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.getAccNoOptions();
    this.loadOptions();
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = { ...this.queryForm.getRawValue() } as FIN52030Payload;
      const payload = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
        v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0)
      )) as unknown as FIN52030Payload;

      this.tableLoading.set(!0);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.logger.debug(`onSubmit:`, [payload]);
      this.service.loadFIN52030(payload).pipe(
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.tableData.set(res.Data);
          this.totalRecords.set(res.TotalCount || 0);
        },
      });
    });
  }

  public onDelete(selected: FIN52030Data[]): void {
    this.logger.debug(`onDelete:`, [selected]);
    this.messageService.confirm({
      header: '刪除確認',
      message: '確定要刪除選取的資料嗎？',
      accept: () => {
        const ids = selected.map(item => item.id);
        this.tableLoading.set(!0);
        this.service.deleteFIN52030Data(ids).pipe(
          tap(res => {
            if (res.Status === '0000') this.messageService.successBubble('刪除成功');
            else this.messageService.errorBubble(`刪除失敗: ${res.Message}`);
          }),
          finalize(() => {
            this.tableLoading.set(!1);
            this.onSubmit();
          }),
        ).subscribe();
      },
    });
  }

  // 讀取下拉選單
  loadOptions(): void {
    this.service.queryTBLUSER_DropDownList({}).pipe(untilDestroyed(this)).subscribe(res => {
      this.tblUserOptions = res.Data.map((item: { No: string; Name: string; Label: string }) => ({
        No: item.No,
        Name: item.Name,
        Label: item.No + '_' + item.Name
      }));
    });
  }
}
