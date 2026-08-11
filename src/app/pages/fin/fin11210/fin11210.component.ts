import { NgStyle } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { ExecSpFuncService } from '@service/utility/execSpFunc.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { Button, ButtonDirective } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { concatMap, finalize, from } from 'rxjs';
import {
  FIN11210Data,
  FIN11210Service,
  QueryFIN11210Request
} from '../../../service/api/fin/fin11210.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

@Component({
  selector: 'app-fin11210',
  templateUrl: './fin11210.component.html',
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
    MultiSelectComponent,
    Button,
    ButtonDirective,
    NgStyle,
    TooltipModule
  ]
})
export class FIN11210Component extends BasicQueryPageComponent<FIN11210Data> implements OnInit {
  queryForm = this.formBuilder.group({
    ECR_No: [null as string[] | null],
    ARG_No: [null as string[] | null],
    ARG_Desc: [null as string | null],
    pageSize: new FormControl<number>(30),
    pageIndex: new FormControl<number>(1)
  });

  readonly tableData = signal<FIN11210Data[]>([]);
  readonly totalRecords = signal(0);
  readonly tableLoading = signal(false);
  lastQueryBody?: QueryFIN11210Request;

  selectedItems: FIN11210Data[] = [];
  btnLoading = false;

  ECR_No_Options: any[] = [];
  ARG_No_Options: any[] = [];

  columns: ReportColumn[] = [
    { field: 'ID', header: '序號' },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'ARG_No', header: '參數代號' },
    { field: 'ARG_Data', header: '參數內容' },
    { field: 'ARG_Desc', header: '參數說明' },
    { field: 'CRT_Date', header: '建立日期', format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員' },
    { field: 'CRT_USR_Name', header: '建立人員名稱' },
    { field: 'UPD_Date', header: '變更日期', format: formatDate },
    { field: 'UPD_USR_No', header: '變更人員' },
    { field: 'UPD_USR_Name', header: '變更人員名稱' }
  ];

  constructor(
    private fin11210Service: FIN11210Service,
    private dropDownListService: DropDownListService,
    private execSpFuncService: ExecSpFuncService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11210', 'fin/fin11210cru', this.queryForm, this.onSubmit.bind(this));
    this.loadOptions();
  }

  queryFunction = (body: any) => {
    const raw = this.queryForm.getRawValue();
    const pageSize = body.pageSize ?? body.PageSize ?? 30;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? 1;
    const payload: QueryFIN11210Request = {
      ECR_No: toStringArray(raw.ECR_No),
      ARG_No: toStringArray(raw.ARG_No),
      ARG_Desc: raw.ARG_Desc ?? undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: body.SortBy
    };
    const cleanPayload = removeEmptyValues(payload) as QueryFIN11210Request;
    return this.fin11210Service.queryFIN11210(cleanPayload);
  };

  onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = this.queryForm.getRawValue();
      this.lastQueryBody = {
        ECR_No: toStringArray(raw.ECR_No),
        ARG_No: toStringArray(raw.ARG_No),
        ARG_Desc: raw.ARG_Desc ?? undefined,
        PageSize: raw.pageSize ?? 30,
        PageIndex: raw.pageIndex ?? 1
      } as QueryFIN11210Request;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.queryFunction(this.lastQueryBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        )
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.tableData.set(res.Data ?? []);
            this.totalRecords.set(res.TotalCount ?? 0);
          }
        });
    });
  }

  onDelete(data: FIN11210Data | FIN11210Data[]): void {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) return;
    this.messageService.confirm({
      header: `是否確認刪除 ${items.length} 筆資料？`,
      accept: () => {
        const idList = items.map(item => item.ID);
        this.fin11210Service
          .deleteFIN11210({ idList })
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this.messageService.successBubble('刪除成功');
            this.onSubmit();
            this.selectedItems = [];
          });
      }
    });
  }

  isRowSelectable = (_row: FIN11210Data): boolean => true;

  loadOptions() {
    // 取得收銀機號下拉選單資料（顯示格式 {No}-{Name}，API 仍只傳 No）
    this.dropDownListService.queryPOS1002_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        const data = response.Data ?? [];
        this.ECR_No_Options = data.map((item: { No?: string; Name?: string }) => ({
          No: item.No ?? '',
          Name: `${item.No ?? ''}-${item.Name ?? ''}`
        }));
      });
    // 取得參數代號下拉選單資料
    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'ARG_NO' })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.ARG_No_Options = response.Data
          .map(item => ({
            No: item.No,
            Name: `${item.No} - ${item.Name}`
          }));
      });
  }
  // 下傳（逐筆依序呼叫，spCrtFileCode 一次只吃一組鍵值，比照 tls13010-v2 的多筆下傳寫法）
  onUpload() {
    const storeNo = this.authService.currentUserValue?.SYS_StoreNo;
    const itemsToUpload = this.selectedItems;
    if (itemsToUpload.length === 0) return;

    this.btnLoading = true;
    const failedItems: string[] = [];

    from(itemsToUpload)
      .pipe(
        concatMap(item =>
          this.execSpFuncService.ExecSpFunc({
            SYS_StoreNo: storeNo || '',
            EXP_StoreNo: storeNo || '',
            EXP_Type: 'POS1009',
            EXP_DocNo: `${storeNo};${item.ECR_No};${item.ARG_No}`,
            EXP_DataFlag: 'S2P',
            EXP_Desc: ''
          })
        ),
        finalize(() => (this.btnLoading = false)),
        untilDestroyed(this)
      )
      .subscribe({
        next: response => {
          if (!response.Success) {
            failedItems.push(`錯誤代碼：${response.ErrCode}，錯誤訊息：${response.ErrMsg}`);
          }
        },
        complete: () => {
          if (failedItems.length === 0) {
            this.messageService.successBubble('下傳成功');
          } else {
            this.messageService.errorBubble(`下傳完成，${failedItems.length} 筆失敗：${failedItems.join('；')}`);
          }
          this.selectedItems = [];
        }
      });
  }
}

function toStringArray(value: unknown): string[] | undefined {
  if (value == null) return undefined;
  if (Array.isArray(value)) {
    const flat = value.flat().filter((x): x is string => typeof x === 'string');
    return flat.length ? flat : undefined;
  }
  return undefined;
}
