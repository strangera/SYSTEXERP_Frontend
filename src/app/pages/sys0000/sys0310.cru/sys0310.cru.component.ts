import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { RoleDataPermissions } from '../../../models/SYS0000/RoleDataPermissions';
import { Store, StoreM } from '../../../models/SYS0000/StoreM';
import { KeyValue } from '@angular/common';
import { TreeNode } from 'primeng/api';

interface RowData {
  subsystemItem: string;
  operationName?: string;
  checked: boolean;
  operationChecked: boolean;
  functionButtons: Record<string, boolean>;
  remark: string; // 新增的備註屬性
}

// 4.2.3.1 角色系統權限設定 CRU
@Component({
  selector: 'app-sys0310.cru',
  templateUrl: './sys0310.cru.component.html',
  styleUrls: ['./sys0310.cru.component.scss'],
})
// 角色系統權限設定 CRU
export class SYS0310CRUComponent extends BasicCrupageComponent implements OnInit {
  // ----------------------------------------------------------------
  sourceProducts: Store[] = [{
      id: 1,
      cName: 'agnès b.',
      area: 'A1館',
      floor: '1F',
    },{
      id: 2,
      cName: 'GAP',
      area: 'A1館',
      floor: '1F',
    },{
      id: 3,
      cName: 'HEARTS ON FIRE',
      area: 'A1館',
      floor: '1F',
    },];
  targetProducts: Store[] = [];

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

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    roleCode: [], // 角色代碼
    roleName: [], // 角色名稱
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
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '420006';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      rowdata: any;
    };

    this.formTitle = 'edit-conditions';
    this.accordionTabCss = 'edit-accordionTab';
    this.crudstatus = CRUDStatus.Edit;
    this.showConfirm = this.canEdit();
    // ----------------------------------------------------------------
    this.cdr.markForCheck();
  }

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
    this.router.navigate(['/SYS0000/SYS0310']);
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

  // ----------------------------------------------------------------
  rows: RowData[] = [
    { subsystemItem: '基本資料維護', operationName: '扣款項目維護作業', checked: false, operationChecked: false, functionButtons: { 刪除: false, 查詢: false, 確定修改: false }, remark: '' },
    { subsystemItem: '基本資料維護', operationName: '專櫃位置資料維護', checked: false, operationChecked: false, functionButtons: { 刪除: false, 查詢: false, 確定修改: false }, remark: '' },
    { subsystemItem: '商場招商管理', operationName: '潛在客戶資料維護', checked: false, operationChecked: false, functionButtons: { 刪除: false, 查詢: false, 確定修改: false }, remark: '' },
    { subsystemItem: '商場招商管理', operationName: '專櫃訪談記錄維護', checked: false, operationChecked: false, functionButtons: { 刪除: false, 查詢: false, 確定修改: false }, remark: '' },
  ];

  // 計算子系統項目的 rowspan 值
  getRowspan(subsystemItem: string): number {
    return this.rows.filter(row => row.subsystemItem === subsystemItem).length;
  }

  // 檢查是否應顯示子系統項目欄位（只在第一次出現時顯示）
  shouldShowSubsystemItem(row: RowData, index: number): boolean {
    return index === this.rows.findIndex(r => r.subsystemItem === row.subsystemItem);
  }

  // 當子系統項目被勾選時，自動勾選後面的所有項目
  onSubsystemCheckboxChange(subsystemItem: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.rows.forEach(row => {
      if (row.subsystemItem === subsystemItem) {
        row.checked = isChecked;
        row.operationChecked = isChecked;
        Object.keys(row.functionButtons).forEach(key => {
          row.functionButtons[key] = isChecked;
        });
      }
    });
  }

  // 當作業名稱被勾選時，自動勾選所有功能按鈕
  onOperationCheckboxChange(row: RowData, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    row.operationChecked = isChecked;
    Object.keys(row.functionButtons).forEach(key => {
      row.functionButtons[key] = isChecked;
    });

    this.checkSubsystemItem(row.subsystemItem);
  }

  // 檢查子系統項目是否應勾選
  checkSubsystemItem(subsystemItem: string): void {
    const relatedRows = this.rows.filter(row => row.subsystemItem === subsystemItem);
    const allOperationsChecked = relatedRows.every(row => row.operationChecked);
    const allButtonsChecked = relatedRows.every(row => Object.values(row.functionButtons).every(val => val === true));

    // 當所有作業名稱和功能按鈕都被勾選時，自動勾選子系統項目
    if (allOperationsChecked && allButtonsChecked) {
      relatedRows.forEach(row => row.checked = true);
    } else {
      relatedRows.forEach(row => row.checked = false);
    }
  }

  // 設置功能按鈕值
  setButtonValue(row: RowData, key: unknown, value: boolean): void {
    row.functionButtons[key as string] = value;
    this.checkAllButtonsSelected(row);
    this.checkSubsystemItem(row.subsystemItem);
  }

  // 檢查所有功能按鈕是否勾選
  checkAllButtonsSelected(row: RowData): void {
    const allChecked = Object.values(row.functionButtons).every(val => val === true);
    row.operationChecked = allChecked;
  }

  trackByKey(index: number, item: KeyValue<unknown, unknown>): string {
    return String(item.key);
  }

  getButtonValue(row: RowData, key: unknown): boolean {
    return row.functionButtons[key as string];
  }
}
