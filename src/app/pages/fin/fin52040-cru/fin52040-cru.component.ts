import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption } from '../../../shared/models/sys/sysb000.model';
import { Tls51080Service } from '../../../service/api/tls/tls51080.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';

/** GLS1016 對象別設定檔 */
export interface GLS1016 {
  CompNo: string, // VARCHAR(06)      Not null, /*公司代號*/
  RefCode: string, // VARCHAR(20)     not null, /*對象別代碼*/
  RefName: string, // VARCHAR(30)     not null, /*對象別名稱*/
  SubRefName: string, // VARCHAR(30)      null, /*代送商名稱*/

  //---可能也會需要下面這些---
  CRT_Date?: Date,
  CRT_USR_No?: string,
  CRT_USR_Name?: string,
  UPD_Date?: Date,
  UPD_USR_No?: string,
  UPD_USR_Name?: string,
}


@Component({
    selector: 'app-fin52040-cru',
    templateUrl: './fin52040-cru.component.html',
    styleUrl: './fin52040-cru.component.scss',
    standalone: true,
    imports: [
      MenubarComponent,
      ButtonComponent,
      PanelModule,
      FormsModule,
      ReactiveFormsModule,
      InputTextComponent,
      DropdownComponent,
      DialogComponent,
      NgIf, 
      TranslateModule,
      TableComponent
    ]
})
// 對象及對帳維護作業 CRU
export class FIN52040CRUComponent extends BasicCruPageComponent<GLS1016> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    CompNo: ['', [Validators.required, Validators.maxLength(6)]], //  公司代號
    // RefCode: ['', [Validators.required, Validators.maxLength(20)]], // 對象別代碼
    RefCode: [{ value: '自動帶入', disabled: true }, [Validators.required]], // 對象別代碼 (不可重複)
    RefName: ['', [Validators.required, Validators.maxLength(30)]], // 對象別名稱 (可編輯)
    SubRefName: ['', [Validators.maxLength(30)]], // 代送商名稱

    CRT_USR_Name: [{ value: '自動帶入', disabled: true }], //  建立人員姓名
    UPD_USR_Name: [{ value: '自動帶入', disabled: true }], //  變更人員姓名
  });
  //
  GLS1001_Options: apiOption[] = [
    {No: 'Comp1', Name: '公司代號1'},
    {No: 'Comp2', Name: '公司代號2'},
    {No: 'Comp3', Name: '公司代號3'}
  ];

  // ---------------------- Dialog ----------------------
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    RefCode: ['', [Validators.maxLength(20)]], // 廠商編號
    RefName: ['', [Validators.maxLength(30)]], // 廠商名稱
    ...createPaginationConfig([{ field: 'RefCode', order: 1 }]),
  });
  totalRecords = 0;
  dialogData: any[] = [];
  selectedItemsDialog: any[] = [];
  dialogColumns: Column[] = [
    { field: 'id', header: '序號' },
    { field: 'RefCode', header: '廠商編號' },
    { field: 'brand', header: '品牌' },
    { field: 'RefName', header: '廠商名稱' },
    { field: 'uni', header: '統一標號' },
    { field: 'shortName', header: '簡稱' },
  ];
  dialogLoading = false;
  // ----------------------------------------------------------------
  constructor(
    private tls51080Service: Tls51080Service,
    private validationService: ValidationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN52040', this.dataForm);
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

  // 廠商表格
  openDialog(): void {
  this.dialogVisible = true;
}

  onQuery(frm: FormGroup) {
    this.dialogLoading = true;
    // 模擬 API
    const mockData = [
      { id:'1', RefCode: 'C001', brand: '品牌1', RefName: '廠商一', uni: '統一標號1', shortName: '簡稱1' },
      { id:'2', RefCode: 'C002', brand: '品牌2', RefName: '廠商二', uni: '統一標號2', shortName: '簡稱2' },
      { id:'3', RefCode: 'C003', brand: '品牌3', RefName: '廠商三', uni: '統一標號3', shortName: '簡稱3' },
    ];
    this.dialogData = mockData;
    this.totalRecords = mockData.length;
    this.dialogLoading = false;
  }

  saveDialog() {
    this.dialogVisible = false;
    if (this.selectedItemsDialog.length > 0) {
      const selected = this.selectedItemsDialog[0]; // 單選
      this.dataForm.patchValue({
        RefCode: selected.uni,
        RefName: selected.RefName
      });
    }
    this.selectedItemsDialog = [];
  }
}
