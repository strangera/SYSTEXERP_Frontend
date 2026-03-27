import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
// import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

import { ASS16090Data, ASS16090Request } from '@service/api/ass/ass16090.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateDuplicate, validateMaxLength, validateMaxNumber } from '@shared/componentkit/table-edit/validate-field.model';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
// Services

@Component({
  selector: 'app-ass16090-cru',
  templateUrl: './ass16090-cru.component.html',
  styleUrl: './ass16090-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    NgFor,
    NgIf,
    InputTextComponent,
    ButtonComponent,
    TranslateModule,
    InputTextareaComponent,
    TableEditComponent
  ]
})
export class ASS16090CRUComponent extends BasicCruPageComponent<ASS16090Data> implements OnInit {
  data: ASS16090Request[] = [];
  oriData: ASS16090Request[] = []; // 用於儲存原始資料以便重置
  selectedRows: ASS16090Request[] = [];
  deleteRows: ASS16090Request[] = [];
  columns: EditColumn[] = [
    { field: 'itemCode', header: '品項編號', type: 'dropdown', validate: [validateDuplicate, validateMaxLength(10)] },
    { field: 'unit', header: '單位', type: 'input', maxLength: 8, validate: [validateMaxLength(100)] },
    { field: 'scrapQty', header: '報廢數量', type: 'inputNumber', maxLength: 8, validate: [validateMaxNumber(99999999)] },
    { field: 'remark', header: '說明', type: 'autoComplete' },
  ];

  // 控制
  isEditMode = true; // 修改頁

  ngOnInit(): void {
    // 網站導覽設定
    this.ProgNo = '310048';
    this.initializePage('ASS16090', this.dataForm);

    // 下拉選單--------------------------------------------------------
    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        // this.accordionTabCss = 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.isEditMode = false; // 新增頁

        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        // this.accordionTabCss = 'edit-accordionTab';
        this.crudstatus = CRUDStatus.Edit;
        this.isEditMode = true; // 修改頁

        // 測試用假資料
        this.data = [
          {
            id: 1,
            itemCode: '001',
            unit: '台',
            scrapQty: '10',
            remark: '測試用假資料',
          },
        ]

        this.Edit(state.rowdata);
        break;
      // 讀檔
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.isEditMode = false;

        // 測試用假資料
        this.data = [
          {
            id: 1,
            itemCode: '001',
            unit: '台',
            scrapQty: '10',
            remark: '測試用假資料',
          },
        ]

        this.Read(state.rowdata);
        break;
    }

    // console.log(this.accordionTabCss);

    this.oriData = JSON.parse(JSON.stringify(this.data)); // 儲存原始資料的副本
  }

  //動態新增----------------------------------------------------------
  createItem(): FormGroup {
    return this.formBuilder.group({

      itemCodeOptions: [],
      unit: [],
      returnQty: [],
      desc: [],
    });
  }

  //非動態新增 ----------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    warehouse: [],
    applicantCode: [],
    departmentCode: [],
    applicationDate: [],
    retExp: [],
    // ----------------------------------------------------------------
    items: this.formBuilder.array([this.createItem()]),
  });
  // Dropdown options
  warehouse = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];
  applicantCode = [];
  departmentCode = [];
  itemCodeOptions = [
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
    private translate: TranslateService,
  ) {
    super(); // 呼叫父類建構子
  }

  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }
  // ----------------------------------------------------------------

  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.errorBubble(
        this.translate.instant('form_error_message')
      );
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(
            this.translate.instant('success_message')
          );
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(
            this.translate.instant('updated-successfully')
          );
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  } //CRU

  // onCancel() {
  //   this.router.navigate(['ASS1000/ASS16090']);
  // }

  resetTable() {
    this.data = JSON.parse(JSON.stringify(this.oriData)); // 重置為原始資料的副本
    this.selectedRows = [];
  }

  // 刪除資料的方法
  onDelete(rows: ASS16090Request[]) {
    // 將畫面資料中刪除這些 row
    this.data = this.data.filter(item => !rows.includes(item));
    // 將有 id 的項目（表示是資料庫已存在的）加進 deleteRows，避免重複
    rows.filter(item => item.id !== undefined && !this.deleteRows.some(d => d.id === item.id)).forEach(item => this.deleteRows.push(item));
    // 清空選取列
    this.selectedRows = [];
  }
}
