import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
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
import { ValidationService } from '../../../shared/service/validation.service';
import { TreeNode } from 'primeng/api';

// 4.2.3.2 使用者系統權限設定 CRU
@Component({
  selector: 'app-sys0320.cru',
  templateUrl: './sys0320.cru.component.html',
  styleUrls: ['./sys0320.cru.component.scss'],
})
// 使用者系統權限設定 CRU
export class SYS0320CRUComponent extends BasicCrupageComponent implements OnInit {
  // ----------------------------------------------------------------
  sourceProducts: any[] = [{
    id: 1,
    cName: 'agnès b.',
    area: 'A1館',
    floor: '1F',
  }, {
    id: 2,
    cName: 'GAP',
    area: 'A1館',
    floor: '1F',
  }, {
    id: 3,
    cName: 'HEARTS ON FIRE',
    area: 'A1館',
    floor: '1F',
  },];
  targetProducts: any[] = [];

  // ----------------------------------------------------------------
  selectedFiles: TreeNode[] = [];
  PrivilegeBehaviorlist = [
    {
      "key": "0",
      "label": "人資財會模組",
      "icon": "pi pi-book",
      "data": "人資財會模組 Folder",
      "children": [
        {
          "key": "0-0",
          "label": "發票暨媒體申報系統",
          "icon": "pi pi-home",
          "data": "發票暨媒體申報系統",
          "children": [
            {
              "key": "0-0-0",
              "label": "營業人申報設定",
              "icon": "pi pi-bookmark",
              "data": "營業人申報設定",
              "children": [
                { "key": "0-0-0-0", "label": "查詢", "icon": "pi pi-search", "data": "查詢" },
                { "key": "0-0-0-1", "label": "新增", "icon": "pi pi-plus", "data": "新增" },
                { "key": "0-0-0-2", "label": "修改", "icon": "pi pi-file-edit", "data": "修改" },
                { "key": "0-0-0-3", "label": "刪除", "icon": "pi pi-trash", "data": "刪除" }
              ]
            },
            {
              "key": "0-0-1",
              "label": "發票基本資料維護",
              "icon": "pi pi-bookmark",
              "data": "發票基本資料維護",
              "children": [
                { "key": "0-0-1-0", "label": "新增", "icon": "pi pi-plus", "data": "新增" },
                { "key": "0-0-1-1", "label": "修改", "icon": "pi pi-file-edit", "data": "修改" },
                { "key": "0-0-1-2", "label": "刪除", "icon": "pi pi-trash", "data": "刪除" }
              ]
            },
            {
              "key": "0-0-2",
              "label": "銷項品項資料設定",
              "icon": "pi pi-bookmark",
              "data": "銷項品項資料設定",
              "children": [
                { "key": "0-0-2-0", "label": "新增", "icon": "pi pi-plus", "data": "新增" },
                { "key": "0-0-2-1", "label": "修改", "icon": "pi pi-file-edit", "data": "修改" },
                { "key": "0-0-2-2", "label": "刪除", "icon": "pi pi-trash", "data": "刪除" }
              ]
            }
          ]
        },
        {
          "key": "0-1",
          "label": "應付帳款系統",
          "icon": "pi pi-home",
          "data": "應付帳款系統 Folder",
          "children": [
            {
              "key": "0-1-0",
              "label": "公司銀行資料維護",
              "icon": "pi pi-bookmark",
              "data": "公司銀行資料維護",
              "children": [
                { "key": "0-1-0-0", "label": "新增", "icon": "pi pi-plus", "data": "新增" },
                { "key": "0-1-0-1", "label": "修改", "icon": "pi pi-file-edit", "data": "修改" },
                { "key": "0-1-0-2", "label": "刪除", "icon": "pi pi-trash", "data": "刪除" }
              ]
            },
            {
              "key": "0-1-1",
              "label": "費率對照維護",
              "icon": "pi pi-bookmark",
              "data": "費率對照維護",
              "children": [
                { "key": "0-1-1-0", "label": "新增", "icon": "pi pi-plus", "data": "新增" },
                { "key": "0-1-1-1", "label": "修改", "icon": "pi pi-file-edit", "data": "修改" },
                { "key": "0-1-1-2", "label": "刪除", "icon": "pi pi-trash", "data": "刪除" }
              ]
            },
            {
              "key": "0-1-2",
              "label": "廠客資料維護",
              "icon": "pi pi-bookmark",
              "data": "廠客資料維護",
              "children": [
                { "key": "0-1-2-0", "label": "新增", "icon": "pi pi-plus", "data": "新增" },
                { "key": "0-1-2-1", "label": "修改", "icon": "pi pi-file-edit", "data": "修改" },
                { "key": "0-1-2-2", "label": "刪除", "icon": "pi pi-trash", "data": "刪除" }
              ]
            }
          ]
        },
        {
          "key": "0-2",
          "label": "應收帳款系統",
          "icon": "pi pi-home",
          "data": "應收帳款系統 Folder",
          "children": [
            {
              "key": "0-2-0",
              "label": "收款項目對照會計科目維護",
              "icon": "pi pi-bookmark",
              "data": "收款項目對照會計科目維護",
              "children": [
                { "key": "0-2-0-0", "label": "新增", "icon": "pi pi-plus", "data": "新增" },
                { "key": "0-2-0-1", "label": "修改", "icon": "pi pi-file-edit", "data": "修改" },
                { "key": "0-2-0-2", "label": "刪除", "icon": "pi pi-trash", "data": "刪除" }
              ]
            },
            {
              "key": "0-2-1",
              "label": "應收調整科目設定維護",
              "icon": "pi pi-bookmark",
              "data": "應收調整科目設定維護",
              "children": [
                { "key": "0-2-1-0", "label": "新增", "icon": "pi pi-plus", "data": "新增" },
                { "key": "0-2-1-1", "label": "修改", "icon": "pi pi-file-edit", "data": "修改" },
                { "key": "0-2-1-2", "label": "刪除", "icon": "pi pi-trash", "data": "刪除" }
              ]
            }
          ]
        }
      ]
    },
    {
      "key": "1",
      "label": "商場管理模組",
      "icon": "pi pi-book",
      "data": "商場管理模組 Folder",
      "children": [
        {
          "key": "1-0",
          "label": "招商暨合約系統",
          "icon": "pi pi-home",
          "data": "招商暨合約系統",
          "children": [
            {
              "key": "1-0-0",
              "label": "專櫃位置資料維護",
              "icon": "pi pi-bookmark",
              "data": "專櫃位置資料維護",
              "children": [
                { "key": "1-0-0-0", "label": "新增", "icon": "pi pi-plus", "data": "新增" },
                { "key": "1-0-0-1", "label": "修改", "icon": "pi pi-file-edit", "data": "修改" },
                { "key": "1-0-0-2", "label": "刪除", "icon": "pi pi-trash", "data": "刪除" }
              ]
            },
            {
              "key": "1-0-1",
              "label": "扣款項目維護作業",
              "icon": "pi pi-bookmark",
              "data": "扣款項目維護作業",
              "children": [
                { "key": "1-0-1-0", "label": "新增", "icon": "pi pi-plus", "data": "新增" },
                { "key": "1-0-1-1", "label": "修改", "icon": "pi pi-file-edit", "data": "修改" },
                { "key": "1-0-1-2", "label": "刪除", "icon": "pi pi-trash", "data": "刪除" }
              ]
            }
          ]
        },
        {
          "key": "1-1",
          "label": "專櫃營運管理",
          "icon": "pi pi-home",
          "data": "專櫃營運管理",
          "children": [
            {
              "key": "1-1-0",
              "label": "傳票項目之會計科目設定作業",
              "icon": "pi pi-bookmark",
              "data": "傳票項目之會計科目設定作業",
              "children": [
                { "key": "1-1-0-0", "label": "新增", "icon": "pi pi-plus", "data": "新增" },
                { "key": "1-1-0-1", "label": "修改", "icon": "pi pi-file-edit", "data": "修改" },
                { "key": "1-1-0-2", "label": "刪除", "icon": "pi pi-trash", "data": "刪除" }
              ]
            }
          ]
        }
      ]
    }
  ];

  dataForm = this.formBuilder.nonNullable.group({
    userCode: [], // 使用者代碼
    userName: [], // 使用者名稱
    searchCriteria: [], // 查詢條件
    items: this.formBuilder.array([this.createItem()]), // 動態表單項目
  });

  Role: any[] = [
    { value: 1, label: '全部' },
    { value: 2, label: '公司人員' },
    { value: 3, label: '專櫃人員' },
    { value: 4, label: '其他' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '420007';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      rowdata: any;
    };

    this.formTitle = 'edit-conditions';
    this.accordionTabCss = 'edit-accordionTab';
    this.crudstatus = CRUDStatus.Edit;
    this.showConfirm = this.canEdit();
  }
  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      mainSystemCode: [], // 主系統代碼
      mainSystemName: [], // 主系統名稱
    });
  }

  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onReset() {
    // 重新設定的邏輯
    console.log('重新設定');
  }

  onBack() {
    this.router.navigate(['/SYS0000/SYS0320']);
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
          this.messageService.successBubble(
            this.translate.instant('success_message')
          );
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {

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

    this.onSubmit(frm);
  }

  onCancel() {
    this.router.navigate(['SYS0000/SYS0230']);
  }
}
