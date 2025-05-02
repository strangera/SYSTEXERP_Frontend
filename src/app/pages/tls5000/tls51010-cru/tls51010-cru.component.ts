import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { NavigationExtras, Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { TLS5000Service } from '../../../service/API/TLS0000/tls5000.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

// 新增：定義數據接口
interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_LRemark: string | null;
  CRT_USR_No: string | "";
  CRT_USR_Name: string | "";
}

// 2.5.1.1 大分類維護作業 CRU
@Component({
  selector: 'app-tls51010-cru',
  templateUrl: './tls51010-cru.component.html',
  styleUrl: './tls51010-cru.component.scss'
})
export class TLS51010CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit {
  // 移除：ProgNo 移到 initializePage 設置
  // ProgNo: string = '250001';

  // 移除：funInfo、addPermission 和 editPermission 由父類提供
  // funInfo?: FunsrightInfo;
  // addPermission = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  // editPermission = { progNo: this.ProgNo, permission: PermissionsInfo.edit };

  // 修改：將 dataForm 定義為非空，並與父類初始化兼容
  dataForm = this.formBuilder.nonNullable.group({
    id: [0], // ID
    CAT_LNo: ['', [Validators.required, Validators.maxLength(2), this.validationService.numberValidator]], // Input serial number
    CAT_LName: ['', [Validators.required, Validators.maxLength(32)]], // Input Text
    CAT_LRemark: [''], // editor text
    CRT_USR_No: [''],
    CRT_USR_Name: ['']
  });

  // 移除：crudstatus、formTitle、submitted 由父類提供
  // crudstatus: CRUDStatus = CRUDStatus.Create;
  // formTitle: string = '';
  // submitted = false;

  // 移除：showConfirm 不再需要，父類的 isFormEditable 和 isFormCreateable 控制表單行為
  // showConfirm: boolean = false;

  constructor(
    // 移除：父類已注入 Router、FormBuilder、NotificationService 和 AuthService
    private validationService: ValidationService,
    private apiService: TLS5000Service
  ) {
    // 新增：調用父類構造函數
    super();
  }

  ngOnInit(): void {
    // 新增：在 ngOnInit 中調用 initializePage 設置 ProgNo 和初始化表單
    this.initializePage('250001', this.dataForm);

    // 移除：父類 initializePage 已處理 funInfo 和狀態邏輯
    // this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // const state = this.router.lastSuccessfulNavigation?.extras.state as {
    //   crudstatus: CRUDStatus,
    //   rowdata: any,
    // };
    // console.log('CRUD Status:', this.crudstatus);
    // switch (state.crudstatus) {
    //   case CRUDStatus.Create:
    //     this.formTitle = '新增資料';
    //     this.showConfirm = this.canAdd();
    //     break;
    //   case CRUDStatus.Edit:
    //     console.log(state.rowdata);
    //     this.formTitle = '編輯資料';
    //     this.showConfirm = this.canEdit();
    //     this.Edit(state.rowdata);
    //     break;
    //   case CRUDStatus.Read:
    //     this.formTitle = '顯示資料';
    //     this.Read(state.rowdata);
    //     break;
    // }
  }

  // 移除：isFormEditable、canAdd 和 canEdit 由父類提供
  // get isFormEditable(): boolean {
  //   return (this.crudstatus === CRUDStatus.Create && this.canAdd()) || (this.crudstatus === CRUDStatus.Edit && this.canEdit());
  // }
  // canAdd(): boolean {
  //   return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.add) as boolean;
  // }
  // canEdit(): boolean {
  //   return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.edit) as boolean;
  // }

  // 移除：Edit 和 Read 方法由父類 initializePage 處理
  // Edit(rowdata: any) {
  //   this.dataForm.patchValue(rowdata);
  // }
  // Read(rowdata: any) {
  //   this.dataForm.patchValue(rowdata);
  //   this.dataForm.disable();
  // }

  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // 待實現：調用 API 進行新增
            this.apiService.insertTLS51010(frm.value).subscribe((response: any) => {
              this.messageService.successBubble('新增成功');
              this.onCancel(); // 新增成功後返回查詢頁面
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // 待實現：調用 API 進行更新
            this.apiService.updateTLS51010(frm.value).subscribe((response: any) => {
              this.messageService.successBubble('更新成功');
              this.onCancel(); // 更新成功後返回查詢頁面
            });
          }
          break;
      }
    });
  }

  // 修改：submitForm 調用父類 handleSubmit
  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }

  onCancel() {
    // 修改：保留分頁狀態
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      queryParams?: any;
      pageIndex?: number;
      pageSize?: number;
      totalRecords?: number;
      sortField?: string;
      sortOrder?: number;
    };
    let extras: NavigationExtras = {
      state: {
        queryParams: state?.queryParams,
        pageIndex: state?.pageIndex,
        pageSize: state?.pageSize,
        totalRecords: state?.totalRecords,
        sortField: state?.sortField,
        sortOrder: state?.sortOrder,
      },
    };
    this.router.navigate(['/TLS5000/TLS51010'], extras);
  }
}
