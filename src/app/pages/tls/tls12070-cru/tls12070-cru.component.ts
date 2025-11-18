import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { Customer_interview, Willing_data } from '../tls12070/tls12070.component';

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
    contact_USR_Name: [''], // 訪談人員姓名
    VEN_Name: [''], // 廠商名稱
    contact_Date: [''], // 訪談日期
    willing_level: [''], // 意願等級(SYS1000.T116)
    contact_record: [''], // 洽談重點及交換資料紀錄
    contact_remarks: [''], // 備註
  });
  //
  willing_data: Willing_data[] = [];
  willing_columns: Column[] = [ //意願報表欄位
    { field: 'contact_USR_Name', header: '接洽人員', visible: true },
    { field: 'VEN_Name', header: '廠商名稱', visible: true },
    { field: 'contact_Time', header: '訪談時間', visible: true },
    { field: 'willing_level', header: '意願等級', visible: true },
    { field: 'contact_record', header: '洽談重點', visible: true },
    { field: 'contact_remarks', header: '備註', visible: true },
  ];

  selectedItems: Customer_interview[] = [];// 多選項目
  // ----------------------------------------------------------------
  constructor(
    private readonly dropDownListService: DropDownListService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS12070', this.dataForm);
    console.log('讀取資料', this.dataForm.value);

    // 進來就用id讀取資料
    const readID = this.dataForm.get('id')?.value
    if (readID) {
      console.log('取得id', readID);
    }
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
