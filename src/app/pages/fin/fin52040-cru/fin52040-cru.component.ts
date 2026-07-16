import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52040Service } from '@service/api/fin/fin52040.service';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownTableComponent } from '@shared/components/dropdown-table/dropdown-table.component';
import { TableComponent } from '@others/component/table/table.component';
import { Column, createPaginationConfig } from '@others/component/table/table.model';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { apiOption } from '../../../shared/models/sys/sysb000.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

/** GLS1016 對象別設定檔 */
export interface GLS1016 {
  CompNo: string, // VARCHAR(06)      Not null, /*公司代號*/
  RefCode: string, // VARCHAR(20)     not null, /*對象別代碼*/
  RefName: string, // VARCHAR(30)     not null, /*對象別名稱*/
  UniformNo: string, // VARCHAR(30)      null,  /*統一編號*/
}

@Component({
  selector: 'app-fin52040-cru',
  templateUrl: './fin52040-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    DropdownTableComponent,
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
    // SA補充: 
    // 目前是以RefCode 對象別代碼為pk, 不用改, 但要麻煩您增加卡控, 統一編號必需是唯一值即可

    RefCode: ['', [Validators.required, Validators.maxLength(30)]], // 對象別代碼 (不可重複) 改為預設帶入統一編號
    RefName: ['', [Validators.required, Validators.maxLength(30)]], // 對象別名稱 (可編輯)
    UniformNo: ['', [Validators.maxLength(10)]], // 統一編號

    CRT_USR_No: [{ value: null, disabled: true }], //  建立人員姓名 (下拉)
    UPD_USR_No: [{ value: null, disabled: true }], //  變更人員姓名 (下拉)
  });
  //
  tblUserOptions: apiOption[] = []; // 人員下拉選單


  // ---------------------- Dialog ----------------------
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    VEN_Name: ['', [Validators.maxLength(30)]], // 廠商名稱
    VEN_Uniform: ['', [Validators.maxLength(20)]], // 統一編號
    ...createPaginationConfig([{ field: 'RefCode', order: 1 }]),
  });
  totalRecords = 0;
  dialogData: any[] = [];
  selectedItemsDialog: any[] = [];
  dialogColumns: Column[] = [
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'VEN_Uniform', header: '統一標號' },
    { field: 'VEN_ShortName', header: '簡稱' },
  ];
  dialogLoading = false;
  // ----------------------------------------------------------------
  constructor(
    private fin52040Service: FIN52040Service
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN52040', this.dataForm);
    this.loadOptions();

    console.log('Receive', this.dataForm.value);

    if (this.crudstatus == CRUDStatus.Edit) {
      // 編輯模式避免更改主鍵
      this.dataForm.get('RefCode')?.disable();
      this.dataForm.get('UniformNo')?.disable();
    }
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    // 送出前檢查 RefCode(對象別代碼) 不可重複
    const formValue = {
      RefCode: frm.get('RefCode')?.value,
      RefName: frm.get('RefName')?.value,
      UniformNo: frm.get('UniformNo')?.value
    }
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('insert', formValue);
          this.fin52040Service.insertFIN52040(formValue).subscribe(() => {
            this.messageService.successBubble('新增成功');
            // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
            this.dataForm.reset(); // 重置表單
          });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update', formValue);
          this.fin52040Service.updateFIN52040(formValue).subscribe(() => {
            // this.messageService.successBubble('更新成功');
            this.onCancel(); // 儲存後，會返回列表
          });
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

  // 廠商編號
  opLoading = false;
  opForm = this.formBuilder.group({
    VEN_No: ['', [Validators.maxLength(20)]], // 廠商編號
    VEN_Name: ['', [Validators.maxLength(60)]], // 廠商名稱
    ...createPaginationConfig([{ field: 'VEN_No', order: 1 }]), // 分頁和排序參數
  });
  suggestions: any[] = [];
  fieldsConfig: any[] = [
    { field: 'UniformNo', header: '統一編號', mainDataField: true },
  ];
  opData: any[] = [];// overlayPanel 裡面的table
  rawOpData: any = [];// 原始資料

  opColumns: Column[] = [
    { field: 'VEN_No', header: '廠商編號' },
    // { field: 'brand', header: '品牌' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'VEN_Uniform', header: '統一標號' },
    { field: 'VEN_ShortName', header: '簡稱' },
  ];

  onAutoCompleteInputChange(event: any) {
    const searchText = this.dataForm.get('UniformNo')?.value?.toString().trim() || '';
    if (searchText) {
      this.opData = this.rawOpData.filter((item: any) =>
        (item.VEN_Uniform && item.VEN_Uniform.includes(searchText)) ||
        (item.VEN_Name && item.VEN_Name.includes(searchText))
      );
    } else {
      this.opData = [...this.rawOpData];
    }
  }

  onformValueChanged(event: any) {
    console.log('變更表單為', event);
    this.opData = this.rawOpData.filter((item: any) => {
      return (!event.VEN_No || item.VEN_No.includes(event.VEN_No)) &&
        (!event.VEN_Name || item.VEN_Name.includes(event.VEN_Name));
    });
  }
  onSelect(event: any) {
    console.log('選取的廠商資料', event);
    this.dataForm.patchValue({
      RefCode: event.VEN_Uniform, // 將統一編號帶入給 RefCode
      RefName: event.VEN_Name,
      UniformNo: event.VEN_Uniform
    });

    console.log('帶入廠商資料', this.dataForm.value);
  }

  // 讀取下拉選單
  loadOptions() {
    this.fin52040Service.queryVendorList({}).pipe(untilDestroyed(this)).subscribe((results) => {
      this.rawOpData = results.Data.map((item: any) => ({
        ...item,
        RefCode: item.VEN_No,       // 對象別代碼
        RefName: item.VEN_Name,     // 對象別名稱
        UniformNo: item.VEN_Uniform, // 統一編號

        DisplayName: `${item.VEN_Uniform || ''}-${item.VEN_Name || ''}`, // 顯示名稱: 統一編號+廠商名稱
      }));
    });
  }
}
