import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { debounceTime, finalize, take } from 'rxjs';
// 引入剛剛為你新開的 TLS51030 Service
import { QueryTLS51030Request, QueryTLS51030Response, Tls51030Service } from 'src/app/service/api/tls/tls51030.service';
import { DropdownApiService } from 'src/app/service/utility/dropdown-api.service';
import { TableReportComponent } from 'src/app/shared/components/table-report/table-report.component';
import { ReportColumn } from 'src/app/shared/components/table-report/table-report.model';

@Component({
  selector: 'app-tls51030',
  templateUrl: './tls51030.component.html',
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
export class TLS51030Component extends BasicQueryPageComponent<QueryTLS51030Response> implements OnInit {
  private readonly validationService = inject(ValidationService);
  private readonly dropDown = inject(DropdownApiService);
  private readonly tls51030Service = inject(Tls51030Service);

  // 1. 定義嚴格型態的表單（不使用外部 import 配置，直接內置宣告分頁）
  readonly queryForm = this.formBuilder.nonNullable.group({
    CAT_SNo: ['', [Validators.maxLength(3), this.validationService.numberValidator]],
    CAT_SName: ['', [Validators.maxLength(32)]],
    CAT_LNo: [[] as string[]],
    CAT_MNo: [[] as string[][]],
    pageSize: [100],
    pageIndex: [1],
    SortBy: [[{ field: 'CAT_SNo', order: 1 }]],
  });

  // 2. 策略查詢函數封裝（使用箭頭函式完美避開 this 陷阱，供子元件連動）
  readonly query = (payload: QueryTLS51030Request) => this.tls51030Service.queryTLS51030(payload);

  // 3. UI 狀態全面 Signal 化
  readonly data = signal<QueryTLS51030Response[]>([]);
  readonly selectedItems = signal<QueryTLS51030Response[]>([]);
  readonly totalRecords = signal(0);
  readonly lastQueryBody = signal<QueryTLS51030Request | null>(null);

  // 元件配置資料
  readonly columns: ReportColumn[] = [
    { field: 'CAT_SNo', header: '小分類代碼', visible: true },
    { field: 'CAT_SName', header: '小分類名稱', visible: true },
    { field: 'CAT_MNo', header: '中分類代碼', visible: true },
    { field: 'CAT_MName', header: '中分類名稱', visible: true },
    { field: 'CAT_LNo', header: '大分類代碼', visible: true },
    { field: 'CAT_LName', header: '大分類名稱', visible: true },
    { field: 'CAT_SRemark', header: '說明', visible: true }
  ];

  // 下拉選單資料來源
  bigCategoryOptions: { value: string, label: string }[] = [];
  middleCategoryOptions: { label: string, items: { value: string[], label: string }[] }[] = [];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51030', '/TLS/TLS51030cru', this.queryForm, (form) => this.onSubmit(form));

    // 載入大分類代碼
    this.dropDown.queryPos2003().pipe(take(1)).subscribe((response) => {
      this.bigCategoryOptions = response || [];

      // 檢查是否需要還原載入中分類
      const currentCatLNo = this.queryForm.controls.CAT_LNo.value;
      if (currentCatLNo?.length > 0) {
        this.loadMiddleCategoriesByMultipleCatLNo(currentCatLNo);
      }
    });

    // 監聽大分類變化，連動變更中分類下拉選單
    this.queryForm.controls.CAT_LNo.valueChanges
      .pipe(debounceTime(300))
      .subscribe((catLNoArray) => {
        if (catLNoArray?.length > 0) {
          this.loadMiddleCategoriesByMultipleCatLNo(catLNoArray);
        } else {
          this.middleCategoryOptions = [];
        }
      });

    // 查詢條件還原機制
    this.handleQueryRestore(this.queryForm, 'TLS51030', (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const formValue = frm.getRawValue() as QueryTLS51030Request;

      // 處理多選陣列為空時，設為 null 的傳遞需求
      if (formValue.CAT_LNo?.length === 0) formValue.CAT_LNo = undefined;
      if (formValue.CAT_MNo?.length === 0) formValue.CAT_MNo = undefined;

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

  onDelete(itemsToDelete: QueryTLS51030Response[]): void {
    // 採用我們最愛的極簡平坦化寫法
    const idList = itemsToDelete.flatMap(item => item?.id ?? []);
    if (idList.length === 0) {
      this.messageService.warnBubble('未找到有效的刪除項目');
      return;
    }

    this.messageService.confirm({
      message: '是否確認刪除所選小分類資料?',
      header: '確認刪除',
      accept: () => {
        this.loading = true;
        this.tls51030Service.deleteTLS51030({ idList })
          .pipe(
            take(1),
            finalize(() => this.loading = false)
          )
          .subscribe((response) => {
            this.messageService.successBubble(response.Message || '刪除成功');
            this.selectedItems.set([]); // 清空多選
            this.onSubmit(this.queryForm); // 重新查詢更新畫面
          });
      }
    });
  }

  isRowSelectable(rowData: QueryTLS51030Response): boolean {
    return rowData.CanDel;
  }

  private loadMiddleCategoriesByMultipleCatLNo(catLNoArray: string[]): void {
    // 依據大分類動態查詢對應的中分類 (帶入查詢 Body)
    this.dropDown.queryPos20031({ CAT_LNo: catLNoArray })
      .pipe(take(1))
      .subscribe((response) => {
        if (!response) return;

        const groupedOptions: Record<string, { value: string[], label: string }[]> = {};

        response.forEach(item => {
          let catLNo = item.CAT_LNo;
          if (!catLNo && item.No) catLNo = item.No.substring(0, 3);
          if (!catLNo) catLNo = catLNoArray.find(selected => item.No.startsWith(selected)) || catLNoArray[0];

          if (!groupedOptions[catLNo]) {
            groupedOptions[catLNo] = [];
          }

          const middleCategoryCode = item.No;
          const middleCategoryName = item.Name;
          const fullDisplayLabel = `${middleCategoryCode}-${middleCategoryName}`;
          const arrayValue = [catLNo, middleCategoryCode];

          groupedOptions[catLNo].push({
            value: arrayValue,
            label: fullDisplayLabel
          });
        });

        // 封裝為 PrimeNG Tree Group 下拉格式
        this.middleCategoryOptions = catLNoArray
          .filter(catLNo => groupedOptions[catLNo]?.length > 0)
          .map(catLNo => {
            const bigCategoryOption = this.bigCategoryOptions.find(opt => opt.value === catLNo);
            const bigCategoryName = bigCategoryOption ? bigCategoryOption.label.split(' - ')[1] || bigCategoryOption.label : catLNo;

            return {
              label: `${catLNo}-${bigCategoryName}`,
              items: groupedOptions[catLNo].sort((a, b) => a.label.localeCompare(b.label))
            };
          });

        // 選項清洗過濾邏輯
        const currentCatMNo = this.queryForm.controls.CAT_MNo.value;
        if (currentCatMNo?.length > 0) {
          const allValidOptions = this.middleCategoryOptions.flatMap(group => group.items.map(item => item.value));
          const validCatMNo = currentCatMNo.filter(value =>
            allValidOptions.some(validOption => Array.isArray(validOption) && Array.isArray(value) && validOption[0] === value[0] && validOption[1] === value[1])
          );

          if (validCatMNo.length !== currentCatMNo.length) {
            this.queryForm.controls.CAT_MNo.setValue(validCatMNo);
            const removedCount = currentCatMNo.length - validCatMNo.length;
            if (removedCount > 0) {
              this.messageService.warnBubble(`有 ${removedCount} 個中分類選項因大分類變更而被移除`);
            }
          }
        }
      });
  }
}
