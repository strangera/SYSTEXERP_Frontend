import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize, take } from 'rxjs';
// 引入剛開好的強型態 TLS51010 Service 及其介面
import { QueryTLS51010Request, QueryTLS51010Response, Tls51010Service } from 'src/app/service/api/tls/tls51010.service';
import { TableReportComponent } from 'src/app/shared/components/table-report/table-report.component';
import { ReportColumn } from 'src/app/shared/components/table-report/table-report.model';

@Component({
  selector: 'app-tls51010',
  templateUrl: './tls51010.component.html',
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
    AsyncPipe
  ],
})
export class TLS51010Component extends BasicQueryPageComponent<QueryTLS51010Response> implements OnInit {
  private readonly validationService = inject(ValidationService);
  private readonly tls51010Service = inject(Tls51010Service);

  // 1. 定義嚴格型態的表單（不使用外部配置方法，直接內置宣告分頁）
  readonly queryForm = this.formBuilder.nonNullable.group({
    CAT_LNo: ['', [Validators.maxLength(2), this.validationService.numberValidator]],
    CAT_LName: ['', [Validators.maxLength(32)]],
    pageSize: [100],
    pageIndex: [1],
    SortBy: [[{ field: 'CAT_LNo', order: 1 }]],
  });

  // 2. 策略查詢函數封裝（使用箭頭函式完美避開 this 陷阱，供子元件連動）
  readonly query = (payload: QueryTLS51010Request) => this.tls51010Service.queryTLS51010(payload);

  // 3. UI 狀態全面 Signal 化
  readonly data = signal<QueryTLS51010Response[]>([]);
  readonly selectedItems = signal<QueryTLS51010Response[]>([]);
  readonly totalRecords = signal(0);
  readonly lastQueryBody = signal<QueryTLS51010Request | null>(null);

  // 元件配置資料
  readonly columns: ReportColumn[] = [
    { field: 'CAT_LNo', header: '大分類代碼', visible: true },
    { field: 'CAT_LName', header: '大分類名稱', visible: true },
    { field: 'CAT_LRemark', header: '備註', visible: true, type: 'html' },
  ];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51010', '/TLS/TLS51010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  // 提交查詢：處理表單並呼叫查詢 API
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const formValue = frm.getRawValue() as QueryTLS51010Request;

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

  // 刪除項目
  onDelete(itemsToDelete: QueryTLS51010Response[]): void {
    // 採用最愛的極簡平坦化寫法
    const idList = itemsToDelete.flatMap(item => item?.id ?? []);
    if (idList.length === 0) {
      this.messageService.warnBubble('未找到有效的刪除項目');
      return;
    }

    this.messageService.confirm({
      message: '是否確認刪除所選大分類資料?',
      header: '確認刪除',
      accept: () => {
        this.loading = true;
        this.tls51010Service.deleteTLS51010({ idList })
          .pipe(
            take(1),
            finalize(() => this.loading = false)
          )
          .subscribe((response) => {
            this.messageService.successBubble(response.Message || '刪除成功');
            this.selectedItems.set([]); // 清空多選狀態
            this.onSubmit(this.queryForm); // 重新查詢更新畫面
          });
      }
    });
  }

  isRowSelectable(rowData: QueryTLS51010Response): boolean {
    return rowData.CanDel;
  }
}
