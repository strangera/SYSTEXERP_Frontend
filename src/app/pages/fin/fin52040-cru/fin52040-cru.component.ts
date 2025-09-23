import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption } from '../../../shared/models/sys/sysb000.model';
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
import { DropdownTableComponent } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { FIN52040Service } from '@service/api/fin/fin52040.service';
import { untilDestroyed } from '@ngneat/until-destroy';

/** GLS1016 對象別設定檔 */
export interface GLS1016 {
  CompNo: string, // VARCHAR(06)      Not null, /*公司代號*/
  RefCode: string, // VARCHAR(20)     not null, /*對象別代碼*/
  RefName: string, // VARCHAR(30)     not null, /*對象別名稱*/
  UniformNo: string, // VARCHAR(30)      null, /*統一編號*/

  //---可能也會需要下面這些---
  // CRT_Date?: Date,
  // CRT_USR_No?: string,
  // CRT_USR_Name?: string,
  // UPD_Date?: Date,
  // UPD_USR_No?: string,
  // UPD_USR_Name?: string,
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
    // CompNo: ['', [Validators.required, Validators.maxLength(6)]], //  公司代號

    RefCode: ['', [Validators.required, Validators.maxLength(30)]], // 對象別代碼 (不可重複)
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
    // { field: 'brand', header: '品牌' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'VEN_Uniform', header: '統一標號' },
    { field: 'VEN_ShortName', header: '簡稱' },
  ];
  dialogLoading = false;
  // ----------------------------------------------------------------
  constructor(
    private fin52040Service: FIN52040Service,
    private validationService: ValidationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN52040', this.dataForm);
    this.loadOptions();
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
      VEN_Uniform: frm.get('VEN_Uniform')?.value
    }
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('insert', formValue);
          // this.fin52040Service.insertFIN52040(formValue).subscribe(() => {
          //   this.messageService.successBubble('新增成功');
          //   // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
          //   this.dataForm.reset(); // 重置表單
          // });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update', formValue);
          // this.fin52040Service.updateFIN52040(formValue).subscribe(() => {
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

  // 廠商編號
    opLoading = false;
    opForm = this.formBuilder.group({
      VEN_Uniform: ['', [Validators.maxLength(20)]], // 統一標號
      VEN_Name: ['', [Validators.maxLength(60)]], // 廠商名稱
      ...createPaginationConfig([{ field: 'VEN_No', order: 1 }]), // 分頁和排序參數
    });
    suggestions: any[] = [];
    fieldsConfig: any[] = [
      { field: 'VEN_No', header: '廠商編號', mainDataField: true },
    ];
    opData: any[] = [];// overlayPanel 裡面的table
    opColumns: Column[] = [
      { field: 'VEN_No', header: '廠商編號' },
      // { field: 'brand', header: '品牌' },
      { field: 'VEN_Name', header: '廠商名稱' },
      { field: 'VEN_Uniform', header: '統一標號' },
      { field: 'VEN_ShortName', header: '簡稱' },
    ];
    opTotalRecords = 0;

    onAutoCompleteInputChange(event: any) {
      this.fin52040Service.queryVendorList({}).pipe(untilDestroyed(this)).subscribe((results) => {
        this.suggestions = [...results.Data.map((item: { VEN_No: string; VEN_Name: string; VEN_ShortName: string; VEN_Uniform: string; }) => ({
          ...item,
          label: item.VEN_No + ' - ' + item.VEN_Name + ' - ' + item.VEN_ShortName + ' - ' + item.VEN_Uniform,
        }))];

        console.log('廠商編號 autoComplete', this.suggestions);
      });
    }
    onformValueChanged(event: any) {
      this.opLoading = true;

      this.opTotalRecords = this.opData.length;
      this.opLoading = false;
      this.fin52040Service.queryVendorList({}).pipe(untilDestroyed(this)).subscribe((results) => {
        // 把 API 的欄位轉成 RefCode / RefName / UniformNo
        this.opData = results.Data.map((item: any) => ({
          ...item,
          RefCode: item.VEN_No,       // 對象別代碼
          RefName: item.VEN_Name,     // 對象別名稱
          UniformNo: item.VEN_Uniform // 統一編號
        }));
        this.opTotalRecords = results.TotalCount;
        this.opLoading = false;
      });
    }
    onSelect(event: any) {
      console.log('選取的廠商資料', event);

      this.dataForm.patchValue({
        RefCode: event.VEN_No,
        RefName: event.VEN_Name,
        UniformNo: event.VEN_Uniform
      });

      console.log('after patchValue', this.dataForm.value);
    }

    // 讀取下拉選單
      loadOptions() {
        // 讀取人員下拉選單
        this.fin52040Service.queryTBLUSER_DropDownList({}).pipe(untilDestroyed(this)).subscribe(res => {
          this.tblUserOptions = res.Data.map((item: { No: string; Name: string; Label: string }) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '_' + item.Name
          }));
          console.log('人員 下拉選單', this.tblUserOptions);
        });

        // 讀取統一編號清單
        this.fin52040Service.queryVendorList({}).pipe(untilDestroyed(this)).subscribe(res => {
          this.tblUserOptions = res.Data.map((item: { No: string; Name: string; Label: string }) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '_' + item.Name
          }));
          console.log('統一編號 清單', this.tblUserOptions);
        });

      }
}
