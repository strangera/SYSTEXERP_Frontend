import { formatDate, NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@others/component/table/table.component';
import { Tls12070Service } from '@service/api/tls/tls12070.service';
import { PanelModule } from 'primeng/panel';
import { transformOptionsForExport } from 'src/app/others/componentextends/basic-print/basic-print-data.component';
import { Column, formatDate as tableFormatDate } from '../../../others/component/table/table.model';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { Customer_interview } from '../tls12070/tls12070.component';


interface WillingDetail {
  id: number; // 主鍵ID
  VEN_Name: string; // 廠商名稱
  contact_Date: string; // 訪談日期
  contact_USR_Name: string; // 接洽人員
  contact_record: string; // 洽談重點
  contact_remarks: string; // 備註
  willing_level: string; // 意願等級
}

@Component({
  selector: 'app-tls12070-cru',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    NgIf,
    TableComponent,
    TranslateModule
  ],
  templateUrl: './tls12070-cru.component.html'
})
// 2.1.2.7 專櫃訪談紀錄追蹤表 CRU
export class Tls12070CRUComponent extends BasicCruPageComponent<any>
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [null], // 主鍵ID，新增時為null，編輯時為存在的ID
    // Customer_interview
    contact_USR_No: [''], // 訪談人員代號
    contact_USR_Name: [''], // 訪談人員姓名
    VEN_Name: [''], // 廠商名稱
    contact_Date: [''], // 訪談日期
    willing_level: [''], // 意願等級(SYS1000.T116)
    contact_record: [''], // 洽談重點及交換資料紀錄
    contact_remarks: [''], // 備註
  });
  willing_options = [
    { label: '?/未確認', value: 'N' },
    { label: 'A/交涉中(基本合意)', value: 'A' },
    { label: 'B/交涉中(反應良好)', value: 'B' },
    { label: 'C/交涉中(反應不好)', value: 'C' },
    { label: 'D/保留', value: 'D' },
    { label: 'F/無意進駐', value: 'F' }
  ]; // 意願等級下拉選單資料
  //
  willing_data: WillingDetail[] = [];
  willing_columns: Column[] = [ //意願報表欄位
    { field: 'contact_USR_Name', header: '接洽人員', visible: true },
    { field: 'VEN_Name', header: '廠商名稱', visible: true },
    { field: 'contact_Date', header: '訪談時間', visible: true, format: tableFormatDate },
    { field: 'contact_record', header: '洽談重點', visible: true },
    { field: 'contact_remarks', header: '備註', visible: true },
    {
      field: 'willing_level', header: '意願等級', visible: true,
      format: (value: string) =>
        this.willing_options.find((option) => option.value === value)?.label ||
        value,
      exportFormat: transformOptionsForExport(this.willing_options)
    },
  ];

  totalRecords = 0;// 分頁和排序參數 // 排序需要

  selectedItems: Customer_interview[] = [];// 多選項目

  //查詢頁查詢條件
  queryConditions!: any;
  // ----------------------------------------------------------------
  constructor(
    private readonly tls12070Service: Tls12070Service,
  ) {
    super(); // 呼叫父類建構子
  }

ngOnInit(): void {
  this.initializePage('TLS12070', this.dataForm);

  const state =
    this.router.lastSuccessfulNavigation?.extras.state;

  this.queryConditions =
    state?.['queryConditions'] ?? {};

  console.log('rowdata:', this.rowdata);
  console.log('queryConditions:', this.queryConditions);

  const contact_USR_No =
    this.dataForm.get('contact_USR_No')?.value;

  if (contact_USR_No) {
    console.log(
      '取得 contact_USR_No:',
      contact_USR_No
    );

    this.loadDetail(contact_USR_No);
  }
}

loadDetail(contact_USR_No: string) {
  const request = {
    contact_USR_No: contact_USR_No,

    contact_Date_Start:
      this.queryConditions?.contact_Date_Start ?? null,

    contact_Date_End:
      this.queryConditions?.contact_Date_End ?? null,
  };

  console.log('意願明細 Request:', request);

  this.tls12070Service
    .queryTLS12070_Detail(request)
    .pipe(untilDestroyed(this))
    .subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.willing_data =
            response.Data || [];

          console.log(
            '意願明細 Result',
            response.Data
          );

          this.totalRecords =
            response.TotalCount ||
            response.Data.length;
        } else {
          console.error(
            'API error:',
            response.Status,
            response.Message
          );
        }

        this.loading = false;
        this.messageService.unblockUi();
      },

      error: (err: string) => {
        console.error(
          'API error:',
          err
        );

        this.loading = false;
        this.messageService.unblockUi();
      },
    });
}

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    const formValue = frm.getRawValue();
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('insert', formValue);
          // this.tls51080Service.insertTLS51080(formValue).subscribe(() => {
          //   this.messageService.successBubble('新增成功');
          //   // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
          //   this.dataForm.reset(); // 重置表單
          // });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update', formValue);
          // this.tls51080Service.updateTLS51080(formValue).subscribe(() => {
          //   // this.messageService.successBubble('更新成功');
          //   this.onCancel(); // 儲存後，會返回列表
          // });
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }
}
