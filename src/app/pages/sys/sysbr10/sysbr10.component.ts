import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { transformOptionsForExport } from '@shared/componentextends/basic-print/basic-print-data.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AddButton, formatDateTime, formatYN, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { Column } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs/operators';
import { QuerySYSBR10Request, QuerySYSBR10Response, SYSBR10Service } from '../../../service/api/sys/sysbr10.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

@Component({
  selector: 'app-sysbr10',
  templateUrl: './sysbr10.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    RadiobuttonYNComponent,
    InputTextComponent,
    TableReportComponent,
    TranslateModule,
    AsyncPipe,
  ],
  // 效能優化：改用 OnPush 變更偵測策略
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SYSBR10Component extends BasicQueryPageComponent<QuerySYSBR10Response> implements OnInit {
  // 使用 inject 簡化注入
  public readonly sysbr10Service = inject(SYSBR10Service);
  private readonly dropdown = inject(DropdownApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  // 使用 Signal 管理狀態 (Angular 18 推薦)
  data = signal<QuerySYSBR10Response[]>([]);
  totalRecords = signal(0);
  selectedItems = signal<QuerySYSBR10Response[]>([]);

  lastQueryBody: QuerySYSBR10Request | null = null;

  queryForm = this.formBuilder.group({
    Pub_StartDate_Start: [null],
    Pub_StartDate_End: [null],
    Pub_EndDate_Start: [null],
    Pub_EndDate_End: [null],
    User_No: [null],
    Org_ID: [null],
    Pub_Type: [null],
    pub_enable: [null],
    Pub_Event: [],
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'id', order: 1 }]],
  });

  // 選項資料流
  User_NoOptions$ = this.dropdown.queryTblUser();
  Org_IDOptions$ = this.dropdown.querySys3100();
  Pub_TypeOptions = getSYS1000Options('T115');
  YNOptions = getSYS1000Options('YES_NO');

  columns: ReportColumn[] = [
    { field: 'Pub_StartDate', header: '起始時間', format: formatDateTime },
    { field: 'Pub_EndDate', header: '結束時間', format: formatDateTime },
    { field: 'pub_enable', header: '是否啟用', format: formatYN, exportFormat: transformOptionsForExport(this.YNOptions) },
    { field: 'Pub_Type', header: '公告類別', format: (v) => getSYS1000('T115', v), exportFormat: transformOptionsForExport(getSYS1000Options('T115')) },
    { field: 'Pub_Event', header: '公告事項' },
  ];

  detailcolumns: Column[] = [
    { field: 'User_No', header: '使用者編號' },
    { field: 'User_Name', header: '使用者名稱' },
    { field: 'Org_ID', header: '組織代碼' },
    { field: 'Org_Name', header: '組織名稱' },
    { field: 'Role_No', header: '角色代號' },
    { field: 'Role_Name', header: '角色名稱' },
  ];

  addButton: AddButton[] = [
    {
      label: '停用',
      icon: 'pi pi-ban text-red-500',
      disabled: (rowData: QuerySYSBR10Response) => rowData.pub_enable === 'N',
      action: (rowData: QuerySYSBR10Response) => this.updateStatus(rowData, 'N'),
    },
    {
      label: '啟用',
      icon: 'pi pi-check text-green-500',
      disabled: (rowData: QuerySYSBR10Response) => rowData.pub_enable === 'Y',
      action: (rowData: QuerySYSBR10Response) => this.updateStatus(rowData, 'Y'),
    },
  ];

  ngOnInit(): void {
    this.initializePage('SYSBR10', '/sys/sysbr10cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      this.sysbr10Service.querySYSBR10(form.value)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.markForCheck(); // OnPush 需要手動標記檢查
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(res => {
          this.lastQueryBody = form.value;
          this.data.set(res.Data || []);
          this.totalRecords.set(res.TotalCount || 0);
          this.queryStateService.setQueryState(this.ProgNo, form.value);
        });
    });
  }

  expansionLoadFn = (row: QuerySYSBR10Response) => {
    return this.sysbr10Service.querySYSBR10Detail({ pos5101_id: row.id });
  }

  onDelete(selectedItems: QuerySYSBR10Response[]): void {
    if (!selectedItems.length) return;
    this.messageService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料?`,
      accept: () => {
        this.loading = true;
        const idList = selectedItems.map((item) => item.id);
        this.sysbr10Service.deleteSYSBR10({ idList })
          .pipe(
            finalize(() => {
              this.loading = false;
              this.cdr.markForCheck();
            }),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe(res => {
            this.messageService.successBubble(res.Message || '刪除成功');
            this.selectedItems.set([]);
            this.onSubmit(this.queryForm);
          });
      }
    });
  }

  updateStatus(row: QuerySYSBR10Response, targetStatus: 'Y' | 'N'): void {
    const isEnabling = targetStatus === 'Y';
    this.messageService.confirm({
      header: isEnabling ? '確認啟用' : '確認停用',
      message: `是否改為【${isEnabling ? '啟用' : '不啟用'}】？`,
      icon: isEnabling ? 'pi pi-question-circle' : 'pi pi-exclamation-triangle',
      acceptLabel: '是',
      rejectLabel: '否',
      accept: () => {
        this.loading = true;
        this.sysbr10Service.updateSYSBR10PubEable({ id: row.id, pub_enable: targetStatus })
          .pipe(
            finalize(() => {
              this.loading = false;
              this.cdr.markForCheck();
            }),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe((res) => {
            this.messageService.successBubble(res.Message || `${isEnabling ? '啟用' : '停用'}成功`);
            this.onSubmit(this.queryForm);
            this.selectedItems.set([]);
          });
      },
    });
  }

  isRowSelectable = (rowData: QuerySYSBR10Response): boolean => rowData.pub_enable !== 'Y';
  editDisabled = (rowData: QuerySYSBR10Response): boolean => rowData.pub_enable === 'Y';
}
