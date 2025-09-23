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
  GLS1001_Options: apiOption[] = [
    {No: 'Comp1', Name: '公司代號1'},
    {No: 'Comp2', Name: '公司代號2'},
    {No: 'Comp3', Name: '公司代號3'}
  ];

  // ---------------------- Dialog ----------------------
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    UniformNo: ['', [Validators.maxLength(20)]], // 統一編號
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
    { field: 'UniformNo', header: '統一標號' },
    { field: 'shortName', header: '簡稱' },
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
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (!this.dataForm.getRawValue().RefCode) {
      this.messageService.errorBubble('對象別代碼不可為空');
      return;
    }

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }
    
    // 送出前檢查 RefCode(對象別代碼) 不可重複
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

  // 廠商編號
    opLoading = false;
    opForm = this.formBuilder.group({
      UniformNo: ['', [Validators.maxLength(20)]], // 統一標號
      RefName: ['', [Validators.maxLength(60)]], // 廠商名稱
      ...createPaginationConfig([{ field: 'RefCode', order: 1 }]), // 分頁和排序參數
    });
    suggestions: any[] = [];
    fieldsConfig: any[] = [
      { field: 'RefCode', header: '廠商編號', mainDataField: true },
    ];
    opData: any[] = [];// overlayPanel 裡面的table
    opColumns: Column[] = [
      { field: 'id', header: '序號' },
      { field: 'RefCode', header: '廠商編號' },
      { field: 'brand', header: '品牌' },
      { field: 'RefName', header: '廠商名稱' },
      { field: 'uni', header: '統一標號' },
      { field: 'shortName', header: '簡稱' },
    ];
    opTotalRecords = 0;

    onAutoCompleteInputChange(event: any) {
      const body = {
        ...event,
        VEN_No: '',
        LOGO_No: '',
        queryNo: event.PLU_MagNo || '',
        pageSize: 30,
        pageIndex: 1,
        SortBy: [{ field: 'PLU_MagNo', order: 1 }],
      }

      this.suggestions = [
      {
        id: 'M001',
        RefCode: '測試對象一',
        brand: 'MAG001',
        RefName: '商品A',
        UniformNo: '471000000001',
        shortName: 'ORG001',
      },
      {
        id: 'M002',
        RefCode: '測試對象二',
        brand: 'MAG002',
        RefName: '商品B',
        UniformNo: '471000000002',
        shortName: 'ORG002',
      },
      {
        id: 'M003',
        RefCode: '測試對象三',
        brand: 'MAG003',
        RefName: '商品C',
        UniformNo: '471000000003',
        shortName: 'ORG003',
      }
    ];
    
      // this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      //   this.suggestions = [...results.Data.map(item => ({
      //     ...item,
      //     label: item.PLU_MagNo + ' - ' + item.PLU_Name + ' - ' + item.PLU_No + ' - ' + item.PLU_OrgPLUNo,
      //   }))];
      // });
    }
    onformValueChanged(event: any) {
      this.opLoading = true;
      const body = {
        queryNo: event.queryNo || '',
        PLU_Name: event.PLU_Name || '',
        VEN_No: '',
        LOGO_No: '',
      };

      // overlayPanel 裡面的 table 測試資料
    this.opData = [
      {
        id: '1',
        RefCode: '代碼1',
        RefName: '對象一',
        brand: '品牌1',
        uni: '統編1',
        shortName: '簡稱1',
      },
      {
        id: '2',
        RefCode: '代碼2',
        RefName: '對象二',
        brand: '品牌2',
        uni: '統編2',
        shortName: '簡稱2',
      },
      {
        id: '3',
        RefCode: '代碼3',
        RefName: '對象三',
        brand: '品牌3',
        uni: '統編3',
        shortName: '簡稱3',
      }
    ];
    this.opTotalRecords = this.opData.length;
    this.opLoading = false;
      // this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      //   this.opData = [...results.Data]; // 更新data資料
      //   this.opTotalRecords = results.TotalCount;
      //   this.opLoading = false;
      // });
    }
}
