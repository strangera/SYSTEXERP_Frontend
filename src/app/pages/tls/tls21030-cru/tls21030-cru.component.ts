import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-tls21030-cru',
    templateUrl: './tls21030-cru.component.html',
    standalone: true,
    imports: [
        MenubarComponent,
        ButtonComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownComponent,
        EditorTextComponent,
        TableComponent,
        NgIf,
        TranslateModule,
    ],
})
export class TLS21030CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.group({
    settlementMethod: [null, Validators.required],       // 結帳方式
    accountingPeriod: [null, Validators.required],       // 帳次
    useOwnerInvoice: [null, Validators.required],        // 是否使用業主發票
    description1: [],           // 說明1
    description2: [],           // 說明2
    description3: [],           // 說明3
  });
  // 下拉選單選項
  settlementMethodOptions = [
    { value: 1, label: '十日結' },
    { value: 2, label: '半月結' },
    { value: 3, label: '月結' },
  ];
  accountingPeriodOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
  ];
  useOwnerInvoiceOptions = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];
  data: any[] = [];
  selectedRows: any[] = [];
  columns: Column[] = [
    { field: '', header: '專櫃編號', visible: true },
    { field: '', header: '專櫃名稱', visible: true },
  ];
  constructor(
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS21030', this.dataForm);
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}
