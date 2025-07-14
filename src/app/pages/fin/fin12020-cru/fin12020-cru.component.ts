import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FIN12020Data } from '../../../service/api/fin/fin12020.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { DropdownOption } from '../../tls/tls13010/tls13010.dropdown';
import { Column } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-fin12020-cru',
    templateUrl: './fin12020-cru.component.html',
    styleUrl: './fin12020-cru.component.scss',
    standalone: true,
    imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, NgIf]
})
export class FIN12020CRUComponent extends BasicCruPageComponent<FIN12020Data> {

  dataForm = this.formBuilder.group({
    invoice_month: ['', [Validators.required]], // 發票年月
    prefix: ['', [Validators.required, Validators.maxLength(2)]], // 字軌
    invoice_no_start: ['', [Validators.required, Validators.maxLength(8)]], // 發票號碼(起)
    invoice_no_end: ['', [Validators.required, Validators.maxLength(8)]], // 發票號碼(迄)
    next_invoice_no: ['', [Validators.maxLength(8)]], // NEXT發票配號號碼
    usage_type: ['', [Validators.required]], // 使用別
    invoice_status: ['', [Validators.required]], // 使用狀態
    ...createPaginationConfig([{ field: 'invoice_month', order: -1 }]), // 分頁和排序參數
  });

  // 表格欄位配置
  columns: Column[] = [
    { field: 'invoice_month', header: '發票年月', visible: true },
    { field: 'prefix', header: '字軌', visible: true },
    { field: 'invoice_no_start', header: '發票號碼(起)', visible: true },
    { field: 'invoice_no_end', header: '發票號碼(迄)', visible: true },
    { field: 'next_invoice_no', header: 'NEXT發票配號號碼', visible: true },
    { field: 'usage_type', header: '使用別', visible: true },
    { field: 'invoice_status', header: '使用狀態', visible: true }
  ];

  // 下拉選單 options
  usageTypeOptions: DropdownOption[] = [];
  invoiceStatusOptions: DropdownOption[] = [];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN12020', this.dataForm);
    if (this.isFormReadable) {
      this.dataForm.disable();
    }
    this.loadOptions(); // 載入下拉選單選項
  }

  loadOptions() {
    // 使用別選項
    this.usageTypeOptions = [
      { label: '一般', value: '01' },
      { label: '特殊', value: '02' },
      { label: '退貨', value: '03' }
    ];

    // 使用狀態選項
    this.invoiceStatusOptions = [
      { label: '未使用', value: '0' },
      { label: '使用中', value: '1' },
      { label: '已用完', value: '2' },
      { label: '已作廢', value: '3' }
    ];
  }

  onSubmit(frm: FormGroup): void {
    this.messageService.blockUi();
    this.submitted = true;

    if (frm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    const formValue = frm.getRawValue();

    if (this.isFormCreateable) {
      // 新增模式 - 這裡應該呼叫對應的 service
      console.log('新增發票配號資料:', formValue);
      this.messageService.successBubble('新增成功');
      this.messageService.unblockUi();
      this.submitted = false;
    } else if (this.isFormEditable) {
      // 修改模式 - 這裡應該呼叫對應的 service
      console.log('修改發票配號資料:', formValue);
      this.messageService.successBubble('修改成功');
      this.messageService.unblockUi();
      this.submitted = false;
    } else {
      this.messageService.unblockUi();
      this.submitted = false;
    }
  }
}