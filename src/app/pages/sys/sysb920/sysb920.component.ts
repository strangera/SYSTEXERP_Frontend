import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Sysb800DropdownService } from '../../../service/api/sys/sysb800-dropdown.service';
import { Sysb900DropdownService } from '../../../service/api/sys/sysb900-dropdown.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { Bas1000Service } from '../../../service/api/sys/bas1000.service';
import { TableLazyLoadEvent } from 'primeng/table';
import { SortMeta } from 'primeng/api';
import { IndustryTypeService } from '../../../service/basic/industry-type.service';
import { ProductCategoryService } from '../../../service/basic/product-category.service';
import { debounceTime } from 'rxjs';

// 資料模型：分類項目
interface CategoryItem {
  id: number;
  bus_type: string; //大分類代碼
  bus_type_name: string; //大分類名稱
  bus_class: string; //中分類(商品類別)代碼
  bus_class_name: string; //中分類(商品類別)名稱
  bus_sclass: string; //小分類代碼
  bus_sclass_name: string; //小分類名稱
  bus_sclass_desc: string; //備註
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

const storageKey = 'SYSB920';

@Component({
  selector: 'app-sysb920',
  templateUrl: './sysb920.component.html',
  styleUrl: './sysb920.component.scss'
})
// 小分類維護作業
export class SYSB920Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  optionsBig: { value: string, label: string }[] = [];
  optionsMid: { value: string, label: string }[] = [];
  queryForm = this.formBuilder.nonNullable.group({
    bus_sclass: ['', [Validators.maxLength(2)]], // 小分類
    bus_sclass_name: ['', [Validators.maxLength(40)]], // 小分類名稱
    bus_type: [[] as string[]], // 大分類代碼
    bus_class: [[] as string[]], // 中分類代碼
    bus_sclass_desc: ['', [Validators.maxLength(200)]], // 備註
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
  });

  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];
  columns: any[] = [
    { field: 'bus_sclass', header: '小分類代碼', visible: true },
    { field: 'bus_sclass_name', header: '小分類名稱', visible: true },
    { field: 'bus_type_name', header: '所屬大分類', visible: true },
    { field: 'bus_class_name', header: '中分類名稱', visible: true },
    { field: 'bus_sclass_desc', header: '備註', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  industryTypeOptions: any[] = [];
  productTypeOptions: any[] = [];
  totalRecords: number = 0;
  selectedItems: CategoryItem[] = [];

  constructor(
    private industryTypeService: IndustryTypeService,
    private productCategoryService: ProductCategoryService,
    private Sysb800DropdownService: Sysb800DropdownService,
    private Sysb900DropdownService: Sysb900DropdownService,
    private validationService: ValidationService,
    private apiService: Bas1000Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB920', '/SYS/SYSB920CRU');

    this.Sysb800DropdownService.getSystemTypes().subscribe({
      next: (response) => {
        this.optionsBig = response;
      },
      error: (error) => {
        console.error('獲取大分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入大分類代碼，請稍後重試');
      }
    });

    // 監聽 bus_type 變化，動態載入中分類代碼
    this.queryForm.controls.bus_type.valueChanges.pipe(debounceTime(300)).subscribe(busTypes => {
      if (busTypes && busTypes.length > 0) {
        this.Sysb900DropdownService.getSystemTypesByBustype(busTypes).subscribe({
          next: (response) => {
            this.optionsMid = response;
            // 如果當前的 bus_class 值不在新的 optionsMid 中，重置 bus_class
            const currentBusClasses = this.queryForm.controls.bus_class.value;
            if (currentBusClasses.length > 0) {
              const validBusClasses = currentBusClasses.filter(busClass =>
                response.find(opt => opt.value === busClass)
              );
              this.queryForm.controls.bus_class.setValue(validBusClasses);
            }
          },
          error: (error) => {
            console.error('獲取中分類代碼失敗:', error);
            this.messageService.errorBubble('無法載入中分類代碼，請稍後重試');
            this.optionsMid = [];
            this.queryForm.controls.bus_class.setValue([]);
          }
        });
      } else {
        this.optionsMid = [];
        this.queryForm.controls.bus_class.setValue([]);
      }
    });

    this.handleQueryRestore(this.queryForm, storageKey, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.apiService.querySYSB920(frm.value).subscribe({
        next: (response: any) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
            // 儲存查詢條件（成功查詢後）
            this.queryStateService.setQueryState(storageKey, frm.value);
            if (this.data.length === 0) {
              console.log('查詢結果為空');
            }
          } else {
            console.error('API error:', response.Status, response.Message);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
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

    console.log('Request body:', JSON.stringify(requestBody));
    this.apiService.deleteSYSB920(requestBody).subscribe({
      next: (response: any) => {
        console.log('API response:', response);
        if (response.Status === '0000') {
          this.messageService.successBubble(`成功刪除 ${idList.length} 個項目`);
          this.onSubmit(this.queryForm);
        } else {
          console.error('API error:', response.Status, response.Message);
          this.messageService.errorBubble(`刪除失敗: ${response.Message || '未知錯誤'}`);
        }
      },
      error: (err: any) => {
        console.error('API error:', err);
        this.messageService.errorBubble('刪除失敗，請檢查網路連線或聯繫管理員');
      },
      complete: () => {
        this.selectedItems = [];
      }
    });
  }
}
