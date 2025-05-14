import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ValidationService } from '../../../shared/service/validation.service';
import { DeductionCategoryService } from '../../../service/basic/deduction-category.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS11020Service } from '../../../service/API/tls/tls11020.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls11020',
  templateUrl: './tls11020.component.html',
  styleUrls: ['./tls11020.component.scss'],
})
export class TLS11020Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    CAP_Item: ['', [Validators.maxLength(3)]],
    CAP_Name: ['', [Validators.maxLength(40)]],
    CAP_Type: [[] as string[]],
    CAP_Remark: ['', [Validators.maxLength(160)]],
    ...createPaginationConfig([{ field: 'CAP_Item', order: 1 }]), // 分頁與排序
  });

  totalRecords = 0;
  data: any[] = [];
  columns: any[] = [
    { field: 'CAP_Item', header: '扣款代碼', visible: true },
    { field: 'CAP_Type', header: '扣款類型', visible: true },
    { field: 'CAP_Name', header: '扣款名稱', visible: true },
    { field: 'AccNo', header: '會計科目', visible: true },
    { field: 'GUI_FLAG', header: '是否開立發票', visible: true },
    { field: 'CAP_TaxType', header: '課稅別', visible: true },
    { field: 'IsCommonlyUsed', header: '是否常用', visible: true },
    { field: 'Print_Area', header: '扣款項目合約列印區分', visible: true },
    { field: 'CAP_Remark', header: '備註', visible: true },
  ];
  selectedItems: any[] = [];
  deductionCategoryOptions: any[] = [];

  constructor(
    private validationService: ValidationService,
    private deductionCategoryService: DeductionCategoryService,
    private tls11020Service: TLS11020Service,
  ) {
    super();
  }

  ngOnInit(): void {
   this.initializePage('TLS11020', 'TLS/TLS11020CRU', this.queryForm, (f) => this.onSubmit(f));
    this.deductionCategoryService.getDeductionCategories().subscribe((data) => {
      this.deductionCategoryOptions = data;
      
    });
  }

  onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    this.loading = true;
    this.messageService.blockUi();

    const formValue = { ...form.value };

    // 將空字串轉為 null（配合後端 char? 欄位處理）
    if (formValue.CAP_Item === '') formValue.CAP_Item = null;
    if (formValue.CAP_Name === '') formValue.CAP_Name = null;
    if (formValue.CAP_Remark === '') formValue.CAP_Remark = null;

    // ✅ 補上固定分頁與排序欄位（或視情況動態指定）
    formValue.PageSize = 10;
    formValue.PageIndex = 1;
    formValue.OrderBy = '';
    formValue.Offset = 0;
    formValue.SortBy = [{ field: 'CAP_Item', order: 1 }];

    console.log('🔍 查詢條件 request payload:', formValue);

    this.tls11020Service.queryTLS11020(formValue).subscribe({
      next: (res) => {
        if (res.Status === '0000') {
          this.data = res?.Data || [];
          this.totalRecords = res?.TotalCount || this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, formValue);
          this.messageService.successBubble('查詢成功');
        } else {
          this.messageService.errorBubble('查詢失敗');
        }
      },
      error: () => {
        this.messageService.errorBubble('查詢錯誤');
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  });
}


  onDelete(selectedItems: any[]) {
    if (!selectedItems.length) return;
    const confirm = window.confirm('是否確定刪除選取項目？');
    if (!confirm) return;

    const idList = selectedItems.map((item) => item.id);

    this.tls11020Service.deleteTLS11020(idList).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.onSubmit(this.queryForm);
      },
      error: () => {
        this.messageService.errorBubble('刪除失敗');
      },
    });
  }
}
