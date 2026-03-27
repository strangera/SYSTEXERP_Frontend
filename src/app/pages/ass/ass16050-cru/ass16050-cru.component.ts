import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
// import { AuthService } from '../../../service/system/auth.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
// import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { ASS16050Data, ASS16050Request } from '@service/api/ass/ass16050.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateDuplicate, validateMaxLength, validateMaxNumber } from '@shared/componentkit/table-edit/validate-field.model';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';



@Component({
  selector: 'app-ass16050-cru',
  templateUrl: './ass16050-cru.component.html',
  styleUrls: ['./ass16050-cru.component.scss'],
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, NgFor, NgIf, TranslateModule, TableEditComponent,]
})
export class ASS16050CRUComponent extends BasicCruPageComponent<ASS16050Data> implements OnInit {
  accordionTabCss = '';
  data: ASS16050Request[] = [];
  selectedRows: ASS16050Request[] = [];
  deleteRows: ASS16050Request[] = [];
  columns: EditColumn[] = [
    { field: 'itemCode', header: '品項編碼', type: 'dropdown', disabled: () => true, validate: [validateDuplicate, validateMaxLength(10)] },
    { field: 'itemName', header: '品項名稱', type: 'dropdown', disabled: () => true, validate: [validateDuplicate, validateMaxLength(100)] },
    { field: 'applyQty', header: '申請數量', type: 'inputNumber', disabled: () => true, maxLength: 8, validate: [validateMaxNumber(99999999)] },
    { field: 'issuedQty', header: '已發數量', type: 'inputNumber', disabled: () => true, validate: [validateMaxNumber(99999999)] },
  ];

  // 表單定義
  dataForm = this.formBuilder.nonNullable.group({
    issueNo: [{ value: '', disabled: true }], // 領用單號
    departmentCode: [{ value: '', disabled: true }], // 部門代號
    applicantCode: [{ value: '', disabled: true }], // 申請人代號
    applicationDate: [{ value: '', disabled: true }], // 申請日期
    shippingDate: [{ value: '', disabled: true }], // 發料日期
    receiptStatus: [{ value: '', disabled: true }], // 驗收單狀態
    detailCount: [{ value: '', disabled: true }], // 明細筆數
  });

  // 下拉選項
  departmentCode = []; // 部門代號選項
  Kurabe = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];
  Itemnumber = [
    { value: 1, label: '3A24210000001' },
    { value: 2, label: '3A24210000002' },
    { value: 3, label: '3A24210000003' },
    { value: 4, label: '3A24210000004' },
    { value: 5, label: '3A24210000005' },
    { value: 6, label: '3A24210000006' },
    { value: 7, label: '3A24210000007' },
    { value: 8, label: '3A24210000008' },
    { value: 9, label: '3A24210000009' },
    { value: 10, label: '3A24210000010' },
  ];

  // ----------------------------------------------------------------
  constructor(
    // private router: Router,
    // private formBuilder: FormBuilder,
    // private messageService: NotificationService,
    // private authService: AuthService,
    private translate: TranslateService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化程式
    this.ProgNo = '310044';
    this.initializePage('ASS16050', this.dataForm);

    // 初始化使用者權限
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      // rowdata: any,
    };

    // 根據狀態決定表單邏輯
    switch (state.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.accordionTabCss = 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;

        break;
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss = 'edit-accordionTab';
        this.crudstatus = CRUDStatus.Edit;

        // this.Edit(state.rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        // this.Read(state.rowdata);
        break;
    }

    // 測試用假資料
    this.data = [
      {
        id: 1,
        itemCode: '3A24210000001',
        itemName: '筆記型電腦',
        applyQty: '10',
        issuedQty: '5',
      },
    ]
  }

  // 編輯狀態下的讀取方法
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  // 讀檔狀態下的讀取方法
  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // 表單提交邏輯
  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.errorBubble(this.translate.instant('form_error_message'));
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  // 最終表單提交
  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  resetTable() {
    this.data = [];
    this.selectedRows = [];
  }

  // 刪除資料的方法
  onDelete(rows: ASS16050Request[]) {
    // 將畫面資料中刪除這些 row
    this.data = this.data.filter(item => !rows.includes(item));
    // 將有 id 的項目（表示是資料庫已存在的）加進 deleteRows，避免重複
    rows.filter(item => item.id !== undefined && !this.deleteRows.some(d => d.id === item.id)).forEach(item => this.deleteRows.push(item));
    // 清空選取列
    this.selectedRows = [];
  }

  // 取消操作
  // onCancel() {
  //   this.router.navigate(['ASS1000/ASS16050']);
  // }
}
