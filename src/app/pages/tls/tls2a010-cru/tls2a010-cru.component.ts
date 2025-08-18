import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Column } from '../../../shared/componentkit/table/table.model';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { PanelModule } from 'primeng/panel';
import { TLS2A010Data } from '../tls2a010/tls2a010.model';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { TableComponent } from '@shared/componentkit/table/table.component';


@Component({
  selector: 'app-tls2a010-cru',
  templateUrl: './tls2a010-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    AccordionModule,
    TranslateModule,
    ReactiveFormsModule,
    TableComponent,
    TooltipModule,
    NgIf,

  ],
})

export class TLS2A010CRUComponent extends BasicCruPageComponent<TLS2A010Data> implements OnInit {
  columns: Column[] = [
    { field: 'TXN_Date', header: '日期' },
    { field: 'ECR_No', header: '收銀機代號' },
    { field: 'TXN_No', header: '交易序號' },
    { field: 'TLT_NO', header: '專櫃編號' },
    { field: 'tlt_name', header: '專櫃名稱' },
    { field: 'TXN_GUINo', header: '發票號碼' },
    { field: 'CRD_No', header: '付款卡號' },
    { field: 'TXN_PayAmt', header: '付款金額' },

    {
      field: 'check_status',
      header: '審核狀態',
      type: 'dropdown',
      options: [
        { label: '已撥回', value: 1 },
        { label: '信用卡缺單', value: 2 },
        { label: '信用卡未簽', value: 3 },
        { label: '其他異常', value: 4 }
      ],
      optionLabel: 'label',
      optionValue: 'value'
    },
    {
      field: 'Remark',
      header: '備註',
      type: 'input',
      validate: [
        (value: any) => {
          // 若為空值就直接通過
          if (value === null || value === undefined || value === '') {
            return { isValid: true, errorMessage: [] };
          }

          const isValid = value.toString().length <= 10;
          return {
            isValid,
            errorMessage: ['最多只能輸入 10 個字', '備註']
          };
        }
      ]

    }

  ];
  // addButtons = [
  //   {
  //     label: '缺單審核',
  //     icon: 'pi pi-exclamation-triangle',
  //     action: (rowData: any) => this.onEdit(rowData),
  //     disabled: (rowData: any) => rowData.isMissing !== 'Y'
  //   }
  // ];
  totalRecords = 0;
  data: any[] = [];
  dataForm!: FormGroup;
  rowEditDisableFn = () => false;

  onEdit(rowData: any): void {
    // Implement the logic for editing the row data here
    console.log('Editing row:', rowData);
  }


  constructor(private fb: FormBuilder) {
    super();
    this.dataForm = this.fb.group({});
  }
  ngOnInit(): void {
    this.initializePage('TLS2A010', this.dataForm);


    this.totalRecords = this.data.length;
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      //  next: (res) => {
      //     this.messageService.successBubble(res.Message);
      //     if (this.isFormCreateable) {
      //       this.dataForm.reset();
      //     } else if (this.isFormEditable) {
      //       this.onCancel();
      //     }
      //   },
      setTimeout(() => {
        this.loading = false;
        this.messageService.successBubble('提交成功');
        this.onCancel();
      }, 1000);
    });
  }
  onFieldChange(event: any) {
    console.log('欄位變更:', event);
  }

}

