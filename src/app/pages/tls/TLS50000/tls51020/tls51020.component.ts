import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize, take } from 'rxjs';
import { QueryTLS51020Request, QueryTLS51020Response, Tls51020Service } from 'src/app/service/api/tls/tls51020.service';
import { DropdownApiService } from 'src/app/service/utility/dropdown-api.service';
import { TableReportComponent } from 'src/app/shared/componentkit/table-report/table-report.component';
import { ReportColumn } from 'src/app/shared/componentkit/table-report/table-report.model';

@Component({
  selector: 'app-tls51020',
  templateUrl: './tls51020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    TableReportComponent,
    TranslateModule,
    AsyncPipe
  ]
})
export class TLS51020Component extends BasicQueryPageComponent<QueryTLS51020Response> implements OnInit {
  private readonly validationService = inject(ValidationService);
  private readonly dropDown = inject(DropdownApiService);
  private readonly tls51020Service = inject(Tls51020Service);

  // 定義嚴格型態的表單
  readonly queryForm = this.formBuilder.nonNullable.group({
    CAT_MNo: ['', [Validators.maxLength(3), this.validationService.numberValidator]],
    CAT_MName: ['', [Validators.maxLength(32)]],
    CAT_LNo: [[] as string[]],
    pageSize: [100],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'CAT_MNo', order: 1 }]],
  });
  readonly query = (payload: QueryTLS51020Request) => this.tls51020Service.queryTLS51020(payload);
  readonly data = signal<QueryTLS51020Response[]>([]);
  readonly selectedItems = signal<QueryTLS51020Response[]>([]);
  readonly totalRecords = signal(0);
  readonly lastQueryBody = signal<QueryTLS51020Request | null>(null);

  readonly columns: ReportColumn[] = [
    { field: 'CAT_MNo', header: '中分類代碼', visible: true },
    { field: 'CAT_MName', header: '中分類名稱', visible: true },
    { field: 'CAT_LNo', header: '大分類代碼', visible: true },
    { field: 'CAT_LName', header: '大分類名稱', visible: true },
    { field: 'CAT_MRemark', header: '備註', visible: true },
  ];

  // 下拉選單數據流
  readonly bigCategoryOptions$ = this.dropDown.queryPos2003();

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51020', '/TLS/TLS51020cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue() as QueryTLS51020Request;
      this.query(formValue)
        .pipe(
          take(1),
          finalize(() => this.loading = false)
        )
        .subscribe((response) => {
          this.data.set(response.Data || []);
          this.totalRecords.set(response.TotalCount || 0);
          this.lastQueryBody.set(formValue);
          this.queryStateService.setQueryState(this.ProgNo, formValue);
        });
    });
  }

  onDelete(itemsToDelete: QueryTLS51020Response[]): void {
    const idList = itemsToDelete.flatMap(item => item?.id ?? []);
    if (idList.length === 0) {
      this.messageService.warnBubble('未找到有效的刪除項目');
      return;
    }

    this.messageService.confirm({
      message: '是否確認刪除所選中分類資料?',
      header: '確認刪除',
      accept: () => {
        this.loading = true;
        this.tls51020Service.deleteTLS51020({ idList })
          .pipe(
            take(1),
            finalize(() => this.loading = false)
          )
          .subscribe((response) => {
            this.messageService.successBubble(response.Message || '刪除成功');
            this.selectedItems.set([]); // 清空多選狀態
            this.onSubmit(this.queryForm); // 重新查詢
          });
      }
    });
  }

  isRowSelectable(rowData: QueryTLS51020Response): boolean {
    return rowData.CanDel;
  }
}
