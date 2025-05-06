// TLS11020Component.ts
import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ValidationService } from '../../../shared/service/validation.service';
import { DeductionCategoryService } from '../../../service/basic/deduction-category.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

@Component({
  selector: 'app-tls11020',
  templateUrl: './tls11020.component.html',
  styleUrls: ['./tls11020.component.scss'],
})
export class TLS11020Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    deductionItemNumber: [
      [this.validationService.numberValidator, Validators.maxLength(3)],
    ],
    deductionItemName: ['', [Validators.maxLength(40)]],
    deductionCategory: [[] as string[]],
    remark: ['', [Validators.maxLength(160)]],
  });

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
  }

  onSubmitQuery(frm: FormGroup) {
    this.submitted = true;
    if (frm.invalid) return;
    this.loading = true;
    this.messageService.blockUi();

    const formValue = frm.value;
    const payload = {
      CAP_Item: formValue.deductionItemNumber,
      CAP_Type: null,
      CAP_Name: formValue.deductionItemName,
      AccNo: null,
      GUI_FLAG: null,
      CAP_TaxType: null,
      IsCommonlyUsed: null,
      Print_Area: null,
      PageIndex: 1,
      PageSize: 10,
      SortBy: [{ field: 'CAP_Item', order: 1 }],
    };

    this.http
      .post<any>(
        'https://localhost:7271/TLS0000/TLS1000/queryTLS11020',
        payload,
      )
      .subscribe({
        next: (res) => {
          this.data = res.Data; // <- 修正這裡，原本是 res.data
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
}
