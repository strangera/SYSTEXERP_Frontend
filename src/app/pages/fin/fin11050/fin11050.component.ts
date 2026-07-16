import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN11050Data, FIN11050QueryRequest, Fin11050Service } from '../../../service/api/fin/fin11050.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { ReportColumn } from '../../../shared/components/table-report/table-report.model';
import { createPaginationConfig } from '../../../others/component/table/table.model';

@Component({
  selector: 'app-fin11050',
  templateUrl: './fin11050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TableReportComponent,
    TranslateModule,
  ]
})
export class FIN11050Component extends BasicQueryPageComponent<FIN11050Data> implements OnInit {
  queryForm = this.formBuilder.group({
    INV_GUIType: ['', [Validators.maxLength(2)]],        // 發票格式代號
    INV_GUIName: ['', [Validators.maxLength(100)]],      // 發票格式名稱
    ...createPaginationConfig([{ field: 'INV_GUIType', order: 1 }]) // 分頁和排序參數
  });

  readonly tableData = signal<FIN11050Data[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: FIN11050QueryRequest;

  selectedItems: FIN11050Data[] = [];

  readonly columns: ReportColumn[] = [
    { field: 'id', header: '序號', visible: false },
    { field: 'INV_GUIType', header: '發票格式代號', visible: true, format: (value) => value },
    { field: 'INV_GUIName', header: '發票格式名稱', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: false },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: false },
    { field: 'UPD_Date', header: '更新日期', visible: false },
    { field: 'UPD_USR_No', header: '更新人員編號', visible: false },
    { field: 'UPD_USR_Name', header: '更新人員名稱', visible: false },
    { field: 'mid', header: '關聯ID', visible: false }
  ];

  constructor(
    private readonly fin11050Service: Fin11050Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11050', 'fin/fin11050cru', this.queryForm, () => this.onSubmit());
  }

  queryFunction = (body: any) => {
    const raw = this.queryForm.getRawValue();
    const pageSize = body?.pageSize ?? body?.PageSize ?? raw?.pageSize ?? 30;
    const pageIndex = body?.pageIndex ?? body?.PageIndex ?? raw?.pageIndex ?? 1;
    const payload: FIN11050QueryRequest = {
      INV_GUIType: raw.INV_GUIType || undefined,
      INV_GUIName: raw.INV_GUIName || undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: body?.SortBy ?? raw?.SortBy,
    };
    const clean = removeEmptyValues(payload) as FIN11050QueryRequest;
    return this.fin11050Service.queryFIN11050(clean);
  };

  onSubmit(): void {
    const frm = this.queryForm;
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      this.lastQueryBody = {
        INV_GUIType: raw.INV_GUIType || undefined,
        INV_GUIName: raw.INV_GUIName || undefined,
        PageSize: raw.pageSize ?? 30,
        PageIndex: raw.pageIndex ?? 1,
        SortBy: raw.SortBy,
      } as FIN11050QueryRequest;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.queryFunction(this.lastQueryBody).pipe(
        untilDestroyed(this),
        finalize(() => {
          this.tableLoading.set(false);
          this.loading = false;
        })
      ).subscribe({
        next: response => {
          if (response.Status === '0000') {
            this.tableData.set(response.Data || []);
            this.totalRecords.set(response.TotalCount ?? 0);
          } else {
            this.messageService.errorBubble(`查詢失敗: ${response.Message}`);
          }
        }
      });
    });
  }

  isRowSelectable = (_rowData: FIN11050Data): boolean => true;

  onDelete(selectedItems: FIN11050Data[]) {
    this.messageService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        const INV_GUITypeList = selectedItems.map(item => item.INV_GUIType);
        this.fin11050Service.deleteFIN11050({ INV_GUITypeList })
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this.messageService.successBubble('刪除成功');
            this.selectedItems = [];
            this.onSubmit();
          });
      }
    });
  }
}
