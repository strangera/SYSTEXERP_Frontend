import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS5000Service } from '../../../service/api/tls/tls5000.service';
import { debounceTime } from 'rxjs';
import { MidCategoryCodeService } from '../../../service/basic/mid-category-code.service';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

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
    CAT_LNo: [''],
    CAT_MNo: [''],
    ...createPaginationConfig([{ field: 'CAT_SNo', order: 1 }]), // 分頁和排序參數
  });

  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];
  columns: Column[] = [
    { field: 'CAT_SNo', header: '小分類代碼', visible: true },
    { field: 'CAT_SName', header: '小分類名稱', visible: true },
    { field: 'CAT_MDisplay', header: '中分類代碼 / 名稱', visible: true, sortField: 'CAT_MNo' },
    { field: 'CAT_LDisplay', header: '大分類代碼 / 名稱', visible: true, sortField: 'CAT_LNo' },
    { field: 'CAT_SRemark', header: '說明', visible: true }
  ];

  totalRecords = 0;
  selectedItems: CategoryItem[] = [];
  bigCategoryOptions: { value: string, label: string }[] = [];
  middleCategoryOptions: { value: string, label: string }[] = [];

  constructor(
    private validationService: ValidationService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private middleCategoryCodeService: MidCategoryCodeService,
    private apiService: TLS5000Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51030', '/TLS/TLS51030CRU', this.queryForm, (form) => this.onSubmit(form));
    // 載入大分類代碼
    this.bigCategoryCodeService.getSystemTypes().subscribe({
      next: (response) => {
        this.bigCategoryOptions = response;
      },
      error: (error) => {
        console.error('獲取大分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入大分類代碼，請稍後重試');
      }
    });

    // 監聽 CAT_LNo 變化，動態載入中分類代碼
    this.queryForm.controls.CAT_LNo.valueChanges.pipe(debounceTime(300)).subscribe(catLNo => {
      if (catLNo) {
        this.middleCategoryCodeService.getSystemTypesByCatLNo(catLNo).subscribe({
          next: (response) => {
            this.middleCategoryOptions = response;
            const currentCatMNo = this.queryForm.controls.CAT_MNo.value;
            if (currentCatMNo && !response.find(opt => opt.value === currentCatMNo)) {
              this.queryForm.controls.CAT_MNo.setValue('');
            }
          },
          error: (error) => {
            console.error('獲取中分類代碼失敗:', error);
            this.messageService.errorBubble('無法載入中分類代碼，請稍後重試');
            this.middleCategoryOptions = [];
            this.queryForm.controls.CAT_MNo.setValue('');
          }
        });
      } else {
        this.middleCategoryOptions = [];
        this.queryForm.controls.CAT_MNo.setValue('');
      }
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.apiService.queryTLS51030(frm.value).subscribe({
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
            this.totalRecords = response.TotalCount || response.Data.length; // 排序需要;
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
    if (items.length === 0) {
      console.error('No items to delete');
      this.messageService.errorBubble('無法刪除：沒有選中的項目');
      return;
    }

    const idList = items
      .filter(item => item && item.id != null && item.id !== undefined)
      .map(item => item.id);

    if (idList.length === 0) {
      console.error('No valid IDs to delete');
      this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
      return;
    }

    const requestBody = {
      idList: idList
    };

    this.apiService.deleteTLS51030(requestBody).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.messageService.successBubble(`成功刪除 ${idList.length} 個項目`);
          this.onSubmit(this.queryForm);
        } else {
          console.error('API error:', response.Status, response.Message, response.Error);
          this.messageService.errorBubble(`刪除失敗: ${response.Message || '未知錯誤'}`);
        }
      },
      error: (err) => {
        console.error('API error:', err.status, err.message, err.error);
        this.messageService.errorBubble('刪除失敗，請檢查網路連線或聯繫管理員');
      },
      complete: () => {
        this.selectedItems = [];
      }
    });
  }
}
