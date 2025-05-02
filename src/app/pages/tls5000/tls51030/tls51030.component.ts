import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS5000Service } from '../../../service/API/TLS0000/tls5000.service';
import { debounceTime } from 'rxjs';
import { TableLazyLoadEvent } from 'primeng/table';
import { SortMeta } from 'primeng/api';
import { MidCategoryCodeService } from '../../../service/basic/mid-category-code.service';
import { Column } from '../../../shared/componentkit/table/table.model';

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

const storageKey = 'TLS51030';

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
    pageSize: [10],
    pageIndex: [0],
    SortBy: [[{ field: 'CAT_SNo', order: 1 }] as SortMeta[]],
  });

  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];
  columns: Column[] = [
    { field: 'CAT_SNo', header: '小分類代碼', visible: true },
    { field: 'CAT_SName', header: '小分類名稱', visible: true },
    { field: 'CAT_MDisplay', header: '中分類代碼 / 名稱', visible: true },
    { field: 'CAT_LDisplay', header: '大分類代碼 / 名稱', visible: true },
    { field: 'CAT_SRemark', header: '說明', visible: true }
  ];

  totalRecords: number = 0;
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
    this.initializePage('250003', '/TLS5000/TLS51030CRU');
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
            // 恢復 CAT_MNo（如果有）
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

    // 恢復查詢狀態並自動查詢
    this.handleQueryRestore(this.queryForm, storageKey, (form) => {
      // 確保中分類選項載入後再查詢
      const catLNo = form.value.CAT_LNo;
      if (catLNo) {
        this.middleCategoryCodeService.getSystemTypesByCatLNo(catLNo).subscribe({
          next: (response) => {
            this.middleCategoryOptions = response;
            this.onSubmit(form); // 在中分類載入後執行查詢
          },
          error: (error) => {
            console.error('恢復中分類代碼失敗:', error);
            this.messageService.errorBubble('無法恢復中分類代碼，查詢已取消');
          }
        });
      } else {
        this.onSubmit(form); // 無 CAT_LNo 時直接查詢
      }
    });
  }

  onSubmit(frm: FormGroup): void {
    console.log('Form value:', JSON.stringify(frm.value, null, 2));
    this.handleSubmit(frm, () => {
      this.apiService.queryTLS51030(frm.value).subscribe({
        next: (response: any) => {
          console.log('API response:', JSON.stringify(response, null, 2));
          if (response.Status === '0000') {
            this.data = (response.Data || []).map((item: CategoryItem) => ({
              ...item,
              CAT_LDisplay: this.getCategoryDisplayName(item.CAT_LNo, this.bigCategoryOptions),
              CAT_MDisplay: this.getCategoryDisplayName(item.CAT_MNo, this.middleCategoryOptions)
            }));
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(storageKey, frm.value);
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
        error: (err: any) => {
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

  onSubmitQuery(frm: FormGroup): void {
    console.log('onSubmitQuery triggered');
    this.onSubmit(frm);
  }

  onClearForm(): void {
    this.queryForm.reset();
    this.data = [];
    this.filteredData = [];
    this.totalRecords = 0;
    this.middleCategoryOptions = [];
    this.queryStateService.clearQueryState(storageKey);
  }

  onDelete(data: CategoryItem | CategoryItem[]): void {
    console.log('Delete data:', JSON.stringify(data, null, 2));

    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      console.error('No items to delete');
      this.messageService.errorBubble('無法刪除：沒有選中的項目');
      return;
    }

    // 收集有效 ID
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
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    this.apiService.deleteTLS51030(requestBody).subscribe({
      next: (response: any) => {
        console.log('API response:', JSON.stringify(response, null, 2));
        if (response.Status === '0000') {
          this.messageService.successBubble(`成功刪除 ${idList.length} 個項目`);
          this.onSubmit(this.queryForm); // 刷新資料
        } else {
          console.error('API error:', response.Status, response.Message, response.Error);
          this.messageService.errorBubble(`刪除失敗: ${response.Message || '未知錯誤'}`);
        }
      },
      error: (err: any) => {
        console.error('API error:', err.status, err.message, err.error);
        this.messageService.errorBubble('刪除失敗，請檢查網路連線或聯繫管理員');
      },
      complete: () => {
        this.selectedItems = []; // 清空選中項目
      }
    });
  }

  loadData(event: TableLazyLoadEvent) {
    const form = this.queryForm.value;
    if (this.totalRecords === 0) { return; }
    form.pageSize = event.rows && event.rows > 0 ? event.rows : 10;
    form.pageIndex = (event.first ?? 0) / form.pageSize + 1;
    form.SortBy = event.multiSortMeta ?? [{ field: 'CAT_SNo', order: 1 }];
    this.onSubmit(this.queryForm);
  }
}
