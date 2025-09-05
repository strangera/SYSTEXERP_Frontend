import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ValidationService } from '../../../shared/service/validation.service';
import { DeductionService } from '../../../service/basic/deduction.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS11020Service } from '../../../service/api/tls/tls11020.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { AccountingaccountService } from '../../../service/basic/accountingaccount.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { Table2Component } from '@shared/componentkit/table2/table2.component';

@Component({
    selector: 'app-tls11020',
    templateUrl: './tls11020.component.html',
    styleUrls: ['./tls11020.component.scss'],
    standalone: true,
    imports: [
        MenubarComponent,
        ButtonComponent,
        AccordionModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextComponent,
        MultiSelectComponent,
        // TableComponent,
        TranslateModule,
        Table2Component,
    ],
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
  
  selectedItems: any[] = [];
  deductionCategoryOptions: any[] = [];
  guiFlagOptions = [
    { label: '開立', value: 'Y' },
    { label: '不開立', value: 'N' },
  ];

  taxTypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
  ];

  isCommonlyUsedOptions = [
    { label: '常用', value: 'Y' },
    { label: '不常用', value: 'N' },
  ];
  accountOptions: any[] = [];
  constructor(
    private validationService: ValidationService,
    private deductionService: DeductionService,
    private tls11020Service: TLS11020Service,
    private accountingaccountService: AccountingaccountService

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS11020', 'tls/tls11020cru', this.queryForm, (f) => this.onSubmit(f));
   this.deductionService.getDeductionCategories().subscribe((data) => {
  this.deductionCategoryOptions = data;
  const map = data.map((o: any) => ({ [String(o.value)]: String(o.label) }));
  this.columns = this.columns.map(c =>
    c.field === 'CAP_Type' ? { ...c, exportFormat: map } : c
  );
});
    this.accountingaccountService.getOptions().subscribe((data) => {
  this.accountOptions = (data || []).map(x => ({
    label: x.Name,
    formLabel: `${x.No} - ${x.Name}`,
    value: x.No
  }));
  const mapAcc = this.accountOptions.map(o => ({ [String(o.value)]: String(o.label) }));
  this.columns = this.columns.map(c =>
    c.field === 'AccNo' && c.header === '會計科目名稱'
      ? { ...c, exportFormat: mapAcc }
      : c
  );
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


      console.log('🔍 查詢條件 request payload:', formValue);

      this.tls11020Service.queryTLS11020(formValue).subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.data = res?.Data || [];
            this.totalRecords = res?.TotalCount || this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, formValue);
            
          } else {
            this.messageService.errorBubble('查詢失敗');
          }
        },
        error: () => {
          
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
    console.log('📦 回傳資料 sample：', this.data?.[0]);
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
  getLabelFromOptions(value: any, options: any[]): string {
    return options.find(opt => opt.value === value)?.label ?? value;
  }
  columns: any[] = [
    { field: 'CAP_Item', header: '扣款項目編號', visible: true },
    {
      field: 'CAP_Type',
      header: '扣款類別',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.deductionCategoryOptions),
    },
    { field: 'CAP_Name', header: '扣款項目名稱', visible: true },
    { field: 'AccNo', header: '會計科目代碼', visible: true },
    {
      field: 'AccNo',
      header: '會計科目名稱',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.accountOptions),
    },
    {
      field: 'GUI_FLAG',
      header: '是否開立發票',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.guiFlagOptions),
       exportFormat: this.guiFlagOptions.map(o => ({ [o.value]: o.label })),
    },
    {
      field: 'CAP_TaxType',
      header: '課稅別',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.taxTypeOptions),
       exportFormat: this.taxTypeOptions.map(o => ({ [o.value]: o.label })),
    },
    {
      field: 'IsCommonlyUsed',
      header: '是否常用',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.isCommonlyUsedOptions),
      exportFormat: this.isCommonlyUsedOptions.map(o => ({ [o.value]: o.label })),
    },
    { field: 'Print_Area', header: '扣款項目合約列印區分', visible: true },
    { field: 'CAP_Remark', header: '備註', visible: true },
    
  ];


}
