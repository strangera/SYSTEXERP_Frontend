import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormArray, FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { KeyValue } from '@angular/common';
import { RowCheckData } from '../../../shared/models/rowData';
import { TreeNode } from 'primeng/api';

interface Column {
  field: string;
  header: string;
}
// 4-2-2-2 角色之使用者設定維護
@Component({
  selector: 'app-sys0230.cru',
  templateUrl: './sys0230.cru.component.html',
  styleUrl: './sys0230.cru.component.scss',
})
// 角色之使用者設定維護 CRU
export class SYS0230CRUComponent extends BasicCrupageComponent implements OnInit {

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    Role: [],
    search: [],
    // ----------------------------------------------------------------
    items: this.formBuilder.array([this.createItem()]),
  });
  Role: any[] = [
    { value: 1, label: '全部' },
    { value: 2, label: '公司人員' },
    { value: 3, label: '專櫃人員' },
    { value: 4, label: '其他' },

  ];
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '420003';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.accordionTabCss = 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss = 'edit-accordionTab';
        this.crudstatus = CRUDStatus.Edit;
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      // 讀檔
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }

    console.log(this.accordionTabCss);
  }

  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }
  // ----------------------------------------------------------------
  createItem(): FormGroup {
    return this.formBuilder.group({
      departmentCode: [], //
      departmentName: [], //
      userCount: [], //

    });
  }
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  onReset() {
    // 重新設定的邏輯
    console.log('重新設定');
  }

  onBack() {
    this.router.navigate(['/SYS0000/SYS0230']);
  }
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
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

  onCancel() {
    this.router.navigate(['SYS0000/SYS0230']);
  }
  // demo
  // ----------------------------------------------------------------
  files: TreeNode[] = [
    {
      key: '0',
      data: {
        name: '全公司',
        code: '100000',
        count: '0(3)'
      },
      children: [
        {
          key: '0-0',
          data: {
            name: '阮湘晴',
            code: '	0900000001',
          },
        },
        {
          key: '0-1',
          data: {
            name: 'sandy',
            code: 'sandy',

          }
        },
        {
          key: '0-2',
          data: {
            name: '李律民',
            code: 'turn000001',

          }
        }
      ]
    },
    {
      key: '1',
      data: {
        name: '行政服務部',
        code: '107000',
        count: '0(2)'
      },
      children: [
        {
          key: '1-0',
          data: {
            name: '林東賢',
            code: '2014000138',
          }
        },
        {
          key: '1-1',
          data: {
            name: '	陳秋莉',
            code: '	2015000184',
          }
        }
      ]
    },
  ];

  selectionKeys = {}; /* {
    '0-0': {
        partialChecked: false,
        checked: true
    }
  };*/

  cols: Column[] = [
    { field: 'name', header: '部門名稱' },
    { field: 'code', header: '代碼' },
    { field: 'count', header: '使用者數目(部門總人數)' }
  ];
}
