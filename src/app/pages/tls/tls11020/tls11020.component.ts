import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ValidationService } from '../../../shared/service/validation.service';
import { DeductionCategoryService } from '../../../service/basic/deduction-category.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-tls11020',
  templateUrl: './tls11020.component.html',
  styleUrls: ['./tls11020.component.scss'],
})
export class TLS11020Component extends BasicQueryPageComponent<any> {
queryForm = this.formBuilder.group({
  CAP_Item: ['', [this.validationService.numberValidator, Validators.maxLength(3)]],
  CAP_Name: ['', [Validators.maxLength(40)]],
  CAP_Type: [[] as string[]], // 多選類別
  CAP_Remark: ['', [Validators.maxLength(160)]],
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

  deductionCategoryOptions: any[] = [];

  constructor(
    private validationService: ValidationService,
    private deductionCategoryService: DeductionCategoryService,
    private http: HttpClient,
  ) {
    super();
  }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.deductionCategoryService.getDeductionCategories().subscribe((data) => {
      this.deductionCategoryOptions = data;
      this.initializePage('TLS11020', 'TLS/TLS11020CRU');
    });
    this.onLazyLoad({
  first: 0,
  rows: 10,
  multiSortMeta: [{ field: 'CAP_Item', order: 1 }],
});
  }

  onSubmitQuery(frm: FormGroup) {
    this.submitted = true;
    if (frm.invalid) return;
    this.loading = true;
    this.messageService.blockUi();
  
    const formValue = frm.value;
const payload = {
  PageSize: 10,
  PageIndex: 1,
  OrderBy: '',
  Offset: 0,
  SortBy: [{ field: 'CAP_Item', order: 1 }],
  CAP_Item: formValue.CAP_Item,
  CAP_Type: formValue.CAP_Type,
  CAP_Name: formValue.CAP_Name,
  CAP_Remark: formValue.CAP_Remark,
};

  
    this.http
      .post<any>(
        `${environment.ApiUrl}/TLS0000/TLS1000/queryTLS11020`,
        payload,
      )
      .subscribe({
        next: (res) => {
          this.data = res.Data;
          this.messageService.successBubble('查詢成功');
        },
        error: () => this.messageService.errorBubble('查詢失敗'),
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
  }
  onClearForm() {
    this.queryForm.reset();
  }

  onSubmit(frm: FormGroup) {
    this.onSubmitQuery(frm);
  }
  editRow(rowdata: any) {
  this.router.navigate(['/TLS', 'TLS11020CRU'], {
    state: {
      crudstatus: 'Edit',
      rowdata: rowdata,
      fromRoute: this.router.url, // 儲存前一個頁面，供返回用
    },
  });
}

onLazyLoad(event: any) {
  const { first, rows, sortField, sortOrder, multiSortMeta } = event;
  const pageIndex = Math.floor((first ?? 0) / (rows ?? 10)) + 1;

  const formValue = this.queryForm.value;
  const payload = {
    PageSize: rows ?? 10,                        // ✅ 預設 PageSize = 10
    PageIndex: pageIndex ?? 1,                   // ✅ 預設 PageIndex = 1
    OrderBy: sortField ?? '',
    Offset: first ?? 0,                          // ✅ 預設 Offset = 0
    SortBy: multiSortMeta ?? [{ field: 'CAP_Item', order: 1 }],
    CAP_Item: formValue.CAP_Item,
    CAP_Type: formValue.CAP_Type,
    CAP_Name: formValue.CAP_Name,
    CAP_Remark: formValue.CAP_Remark,
  };

  this.loading = true;
  this.messageService.blockUi();

  this.http.post<any>(`${environment.ApiUrl}/TLS0000/TLS1000/queryTLS11020`, payload).subscribe({
    next: (res) => {
      this.data = res.Data;
      this.totalRecords = res.TotalCount ?? res.Data.length;
      this.messageService.successBubble('查詢成功');
    },
    error: () => this.messageService.errorBubble('查詢失敗'),
    complete: () => {
      this.loading = false;
      this.messageService.unblockUi();
    },
  });
}


}
