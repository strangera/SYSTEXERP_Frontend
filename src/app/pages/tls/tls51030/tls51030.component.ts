import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS5000Service } from '../../../service/api/tls/tls5000.service';
import { debounceTime } from 'rxjs';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { Tls51020DropDownService } from '../../../service/api/tls/tls51020-dropdown.service';
import { Tls51010DropDownListService } from '../../../service/api/tls/tls51010-dropdown.service';

interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName?: string;
  CAT_MNo: string;
  CAT_MName?: string;
  CAT_SNo: string;
  CAT_SName: string;
  CAT_SRemark: string | null;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  CAT_LDisplay?: string;
  CAT_MDisplay?: string;
  CanDel: boolean; // 是否可以刪除
}
@Component({
  selector: 'app-tls51030',
  templateUrl: './tls51030.component.html',
  styleUrls: ['./tls51030.component.scss']
})
export class TLS51030Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    CAT_SNo: ['', [Validators.maxLength(3), this.validationService.numberValidator]],
    CAT_SName: ['', [Validators.maxLength(32)]],
    CAT_LNo: [[] as string[]],
    CAT_MNo: [[] as string[]],
    ...createPaginationConfig([{ field: 'CAT_SNo', order: 1 }]), // 分頁和排序參數
  });

  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];
  columns: Column[] = [
    { field: 'CAT_SNo', header: '小分類代碼', visible: true },
    { field: 'CAT_SName', header: '小分類名稱', visible: true },
    { field: 'CAT_MNo', header: '中分類代碼', visible: true },
    { field: 'CAT_MName', header: '中分類名稱', visible: true },
    { field: 'CAT_LNo', header: '大分類代碼', visible: true },
    { field: 'CAT_LName', header: '大分類名稱', visible: true },
    { field: 'CAT_SRemark', header: '說明', visible: true }
  ];

  totalRecords = 0;
  selectedItems: CategoryItem[] = [];
  bigCategoryOptions: { value: string, label: string }[] = [];
  middleCategoryOptions: { value: string, label: string }[] = [];

  constructor(
    private validationService: ValidationService,
    private bigCategoryCodeService: Tls51010DropDownListService,
    private middleCategoryCodeService: Tls51020DropDownService,
    private apiService: TLS5000Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51030', '/TLS/TLS51030cru', this.queryForm, (form) => this.onSubmit(form));

    // 載入大分類代碼
    this.bigCategoryCodeService.getSystemTypes().subscribe({
      next: (response) => {
        this.bigCategoryOptions = response;

        // 🔧 修正：大分類載入完成後，檢查是否需要載入中分類
        const currentCatLNo = this.queryForm.controls.CAT_LNo.value;
        if (currentCatLNo && Array.isArray(currentCatLNo) && currentCatLNo.length > 0) {
          this.loadMiddleCategoriesByMultipleCatLNo(currentCatLNo);
        }
      },
      error: (error) => {
        console.error('獲取大分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入大分類代碼，請稍後重試');
      }
    });

    // 監聽 CAT_LNo 變化，動態載入中分類代碼（支援多選陣列）
    this.queryForm.controls.CAT_LNo.valueChanges.pipe(debounceTime(300)).subscribe(catLNoArray => {
      if (catLNoArray && Array.isArray(catLNoArray) && catLNoArray.length > 0) {
        // 使用多選方法載入所有相關的中分類
        this.loadMiddleCategoriesByMultipleCatLNo(catLNoArray);
      } else {
        // 清空中分類選項，但不清空已選擇的值（讓用戶手動清除）
        this.middleCategoryOptions = [];
        // ❌ 不要自動清空用戶選擇的值
        // this.queryForm.controls.CAT_MNo.setValue([]);
      }
    });

    // 🆕 新增：查詢條件恢復機制（像 SYSB920 一樣）
    this.handleQueryRestore(this.queryForm, 'TLS51030', (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      // 處理多選參數
      const queryParams = { ...frm.value };

      // 處理大分類代碼多選陣列
      if (queryParams.CAT_LNo && Array.isArray(queryParams.CAT_LNo)) {
        if (queryParams.CAT_LNo.length === 0) {
          queryParams.CAT_LNo = null; // 或 delete queryParams.CAT_LNo;
        }
      }

      // 處理中分類代碼多選陣列
      if (queryParams.CAT_MNo && Array.isArray(queryParams.CAT_MNo)) {
        if (queryParams.CAT_MNo.length === 0) {
          queryParams.CAT_MNo = null; // 或 delete queryParams.CAT_MNo;
        }
      }

      console.log('查詢參數:', queryParams); // 除錯用

      this.apiService.queryTLS51030(queryParams).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data.map((item: CategoryItem) => {
              const catLDisplay = this.getCategoryDisplayName(item.CAT_LNo, this.bigCategoryOptions);
              const catMDisplay = item.CAT_MName ? `${item.CAT_MNo} - ${item.CAT_MName}` : item.CAT_MNo;
              return {
                ...item,
                CAT_LDisplay: catLDisplay,
                CAT_MDisplay: catMDisplay
              };
            });
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
            if (this.data.length === 0) {
              console.log('查詢結果為空');
              this.messageService.infoBubble('查詢結果為空');
            }
          } else {
            console.error('API error:', response.Status, response.Message, response.Error);
            this.messageService.errorBubble(`查詢失敗: ${response.Message || '未知錯誤'}`);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err) => {
          console.error('API error:', err.status, err.message, err.error);
          this.messageService.errorBubble(`查詢失敗: ${err.message || '請檢查網路連線或聯繫管理員'}`);
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }

  private getCategoryDisplayName(code: string, options: { value: string, label: string }[]): string {
    const option = options.find(opt => opt.value === code);
    return option ? option.label : code;
  }

  onDelete(data: CategoryItem | CategoryItem[]): void {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) return;

    const idList = items
      .filter(item => item && item.id != null)
      .map(item => item.id);

    if (idList.length === 0) {
      this.messageService.warnBubble('未找到有效的刪除項目');
      return;
    }

    this.apiService.deleteTLS51030({ idList }).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.messageService.successBubble('選中項目刪除成功');
        } else {
          console.error('API error:', response.Status, response.Message);
          this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
        }
      },
      error: (err: string) => {
        console.error('API error:', err);
        this.messageService.errorBubble('刪除失敗');
      },
      complete: () => {
        this.onSubmit(this.queryForm); // 刷新資料
      },
    });

    this.selectedItems = [];
  }

  isRowSelectable(rowData: CategoryItem): boolean {
    return rowData.CanDel
  }

  private loadMiddleCategoriesByMultipleCatLNo(catLNoArray: string[]): void {
    this.middleCategoryCodeService.getSystemTypesByMultipleCatLNo(catLNoArray).subscribe({
      next: (response) => {
        this.middleCategoryOptions = response;

        // 🔧 修正：更智能地處理已選擇的中分類
        const currentCatMNo = this.queryForm.controls.CAT_MNo.value;
        if (currentCatMNo && Array.isArray(currentCatMNo) && currentCatMNo.length > 0) {
          // 只保留仍然有效的選項，但不會自動清空
          const validCatMNo = currentCatMNo.filter(value =>
            response.find(opt => opt.value === value)
          );

          // 只有在有無效項目時才更新
          if (validCatMNo.length !== currentCatMNo.length) {
            this.queryForm.controls.CAT_MNo.setValue(validCatMNo);

            // 如果有被移除的項目，給用戶提示
            const removedCount = currentCatMNo.length - validCatMNo.length;
            if (removedCount > 0) {
              this.messageService.warnBubble(`有 ${removedCount} 個中分類選項因大分類變更而被移除`);
            }
          }
        }
      }
    });
  }
}
