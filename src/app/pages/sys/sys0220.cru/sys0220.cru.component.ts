import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-sys0220-cru',
  templateUrl: './sys0220.cru.component.html',
  styleUrls: ['./sys0220.cru.component.scss'],
})
// 使用者之角色設定維護 CRU
export class SYS0220CRUComponent extends BasicCrupageComponent implements OnInit {
  nodes: TreeNode[] = [
    { "key": "1", "label": "test(001)" },
    { "key": "2", "label": "權限表單(100001)" },
    { "key": "3", "label": "經營企劃部(101100)" },
    { "key": "4", "label": "資材(101101)" },
    { "key": "5", "label": "資材臨時(101102)" },
    { "key": "6", "label": "經營企劃部(101103)" },
    { "key": "7", "label": "財務部主管(104001)" },
    { "key": "8", "label": "財務部人員(104002)" },
    { "key": "9", "label": "人資-1(105201)" },
    { "key": "10", "label": "人資-2(105202)" },
    { "key": "11", "label": "財務部(AC)" },
    { "key": "12", "label": "財務部-財務team(AC1)" },
    { "key": "13", "label": "財務部-財務team(AC2)" },
    { "key": "14", "label": "財務部-財務TEAM(AC3)" },
    { "key": "15", "label": "財務部-會計T-A(ACA)" },
    { "key": "16", "label": "財務部-會計T-B(ACB)" },
    { "key": "17", "label": "財務部-會計T-C(ACC)" },
    { "key": "18", "label": "臨時資材(ACCT1)" },
    { "key": "19", "label": "財務助專(ACCnew)" },
    { "key": "20", "label": "廠商專用(AC_User)" },
    { "key": "21", "label": "基本權限(ALL)" },
    { "key": "22", "label": "APP廠商(APPMIS)" },
    { "key": "23", "label": "經營企劃部(BI)" },
    { "key": "24", "label": "經營企劃部(BIA)" },
    { "key": "25", "label": "經營企劃(BIB)" },
    { "key": "26", "label": "南流營運人員(BU)" },
    { "key": "27", "label": "南流營運人員(BU1)" },
    { "key": "28", "label": "營運TEAM(BUA)" },
    { "key": "29", "label": "營運TEAM襄理(BUB)" },
    { "key": "30", "label": "類副理(BUBB)" },
    { "key": "31", "label": "預算-1(BUDGET-1)" },
    { "key": "32", "label": "預算二階(BUDGET-2)" },
    { "key": "33", "label": "預算-財務(BUDGET-AC1)" },
    { "key": "34", "label": "電商財務(ECACC)" },
    { "key": "35", "label": "EC四階(ECD)" },
    { "key": "36", "label": "EC自營高階(ECMY1)" },
    { "key": "37", "label": "HR(HR)" },
    { "key": "38", "label": "HR-3(HR-3)" },
    { "key": "39", "label": "系統管理者(IT)" },
    { "key": "40", "label": "行銷部長(MKA)" },
    { "key": "41", "label": "行銷APP(MKAPP)" },
    { "key": "42", "label": "行銷經理(MKB)" },
    { "key": "43", "label": "行銷專員(MKC)" },
    { "key": "44", "label": "行銷檔期(MKDA)" },
    { "key": "45", "label": "客服最高(MKSA)" },
    { "key": "46", "label": "客服專員(MKSB)" },
    { "key": "47", "label": "現場客服(MKSC)" },
    { "key": "48", "label": "計時客服(MKSD)" },
    { "key": "49", "label": "贈品管理-報表-禮品贈送(MSK)" },
    { "key": "50", "label": "自營(MY)" },
    { "key": "51", "label": "POS財(POS網管)" },
    { "key": "52", "label": "系統最高權限角色(SUPER)" },
    { "key": "53", "label": "機電(TSE)" },
    { "key": "54", "label": "內裝主管(TSI)" },
    { "key": "55", "label": "內裝(TSI1)" },
    { "key": "56", "label": "人資高(人資1)" },
    { "key": "57", "label": "人資中階(人資2)" },
    { "key": "58", "label": "基本高階(基本1)" },
    { "key": "59", "label": "基本中階(基本2)" },
    { "key": "60", "label": "專櫃高階(專櫃一)" },
    { "key": "61", "label": "專櫃低階(專櫃二)" },
    { "key": "62", "label": "招商高階(招商)" },
    { "key": "63", "label": "招商低階(招商二)" },
    { "key": "64", "label": "營運(營運)" },
    { "key": "65", "label": "禮券高階(禮券)" },
    { "key": "66", "label": "禮券低階(禮券二)" },
    { "key": "67", "label": "總帳高階(總帳一)" },
    { "key": "68", "label": "總帳低階(總帳三)" },
    { "key": "69", "label": "總帳中階(總帳二)" },
    { "key": "70", "label": "能源1(能源)" },
    { "key": "71", "label": "自營(財-自營)" },
    { "key": "72", "label": "財務T(財務T)" },
    { "key": "73", "label": "財-資材高階(資材一)" },
    { "key": "74", "label": "財-資材低階(資材二)" }
  ];

  selectedNodes: TreeNode[] = [];
  // 表單初始化
  dataForm = this.formBuilder.nonNullable.group({
    userId: [''], // 使用者編號
    userName: [''], // 使用者名稱
    items: this.formBuilder.array([this.createItem()]), // 動態新增的角色項目
  });

  columns: any[] = [
    { field: 'roleCode', header: '角色代碼', visible: true },
    { field: 'roleName', header: '角色名稱', visible: true },
    { field: 'roleDescription', header: '角色說明', visible: true },
  ];

  rowDatas: any[] = [
    { "roleCode": "001", "roleName": "test", "roleDescription": "" },
    { "roleCode": "100001", "roleName": "權限表單", "roleDescription": "權限表單列印" },
    { "roleCode": "101100", "roleName": "經營企劃部", "roleDescription": "經營企劃最高權限" },
    { "roleCode": "101101", "roleName": "資材", "roleDescription": "資材基本資料" },
    { "roleCode": "101102", "roleName": "資材臨時", "roleDescription": "資材一般" },
    { "roleCode": "101103", "roleName": "經營企劃部", "roleDescription": "經營企劃一般" },
    { "roleCode": "104001", "roleName": "財務部主管", "roleDescription": "財務最高權限" },
    { "roleCode": "104002", "roleName": "財務部人員", "roleDescription": "財務暫時" },
    { "roleCode": "105201", "roleName": "人資-1", "roleDescription": "人資最高權限" },
    { "roleCode": "105202", "roleName": "人資-2", "roleDescription": "人資部分權限" },
    { "roleCode": "AC", "roleName": "財務部", "roleDescription": "部長" },
    { "roleCode": "AC1", "roleName": "財務部-財務team", "roleDescription": "一階" },
    { "roleCode": "AC2", "roleName": "財務部-財務team", "roleDescription": "財務二階" },
    { "roleCode": "AC3", "roleName": "財務部-財務TEAM", "roleDescription": "三階" },
    { "roleCode": "ACA", "roleName": "財務部-會計T-A", "roleDescription": "一階" },
    { "roleCode": "ACB", "roleName": "財務部-會計T-B", "roleDescription": "二階" },
    { "roleCode": "ACC", "roleName": "財務部-會計T-C", "roleDescription": "三階 陳怡君 徐悅伶 洪哲祥" },
    { "roleCode": "ACCT1", "roleName": "臨時資材", "roleDescription": "柳 陳 林 胡" },
    { "roleCode": "ACCnew", "roleName": "財務助專", "roleDescription": "233,234" },
    { "roleCode": "AC_User", "roleName": "廠商專用", "roleDescription": "廠商專用權限管理者" },
    { "roleCode": "ALL", "roleName": "基本權限", "roleDescription": "全體員工" },
    { "roleCode": "APPMIS", "roleName": "APP廠商", "roleDescription": "APP廠商" },
    { "roleCode": "BI", "roleName": "經營企劃部", "roleDescription": "最高" },
    { "roleCode": "BIA", "roleName": "經營企劃部", "roleDescription": "team" },
    { "roleCode": "BIB", "roleName": "經營企劃", "roleDescription": "一般職員" },
    { "roleCode": "BU", "roleName": "南流營運人員", "roleDescription": "最高權限" },
    { "roleCode": "BU1", "roleName": "南流營運人員", "roleDescription": "一般" },
    { "roleCode": "BUA", "roleName": "營運TEAM", "roleDescription": "TEAM經理" },
    { "roleCode": "BUB", "roleName": "營運TEAM襄理", "roleDescription": "襄理" },
    { "roleCode": "BUBB", "roleName": "類副理", "roleDescription": "" },
    { "roleCode": "BUDGET-1", "roleName": "預算-1", "roleDescription": "預算主管" },
    { "roleCode": "BUDGET-2", "roleName": "預算二階", "roleDescription": "team階&幕僚" },
    { "roleCode": "BUDGET-AC1", "roleName": "預算-財務", "roleDescription": "預算-財務一階" },
    { "roleCode": "ECACC", "roleName": "電商財務", "roleDescription": "劉、江" },
    { "roleCode": "ECD", "roleName": "EC四階", "roleDescription": "EC基本權限" },
    { "roleCode": "ECMY1", "roleName": "EC自營高階", "roleDescription": "ECMY最高權限" },
    { "roleCode": "HR", "roleName": "HR", "roleDescription": "" },
    { "roleCode": "HR-3", "roleName": "HR-3", "roleDescription": "" },
    { "roleCode": "IT", "roleName": "系統管理者", "roleDescription": "系統管理者" },
    { "roleCode": "MKA", "roleName": "行銷部長", "roleDescription": "行銷最高主管" },
    { "roleCode": "MKAPP", "roleName": "行銷APP", "roleDescription": "行銷使用APP人員" },
    { "roleCode": "MKB", "roleName": "行銷經理", "roleDescription": "行銷次要主管" },
    { "roleCode": "MKC", "roleName": "行銷專員", "roleDescription": "行銷一般" },
    { "roleCode": "MKDA", "roleName": "行銷檔期", "roleDescription": "業績分析" },
    { "roleCode": "MKSA", "roleName": "客服最高", "roleDescription": "客服主管" },
    { "roleCode": "MKSB", "roleName": "客服專員", "roleDescription": "中階" },
    { "roleCode": "MKSC", "roleName": "現場客服", "roleDescription": "外場客服" },
    { "roleCode": "MKSD", "roleName": "計時客服", "roleDescription": "外場兌換" },
    { "roleCode": "MSK", "roleName": "贈品管理-報表-禮品贈送", "roleDescription": "若珊, 翊琦, 見歡" },
    { "roleCode": "MY", "roleName": "自營", "roleDescription": "自營" },
    { "roleCode": "POS網管", "roleName": "POS財", "roleDescription": "瑩，真，欣，佳" },
    { "roleCode": "SUPER", "roleName": "系統最高權限角色", "roleDescription": "系統最高權限角色" },
    { "roleCode": "TSE", "roleName": "機電", "roleDescription": "機電主管" },
    { "roleCode": "TSI", "roleName": "內裝主管", "roleDescription": "內裝主管" },
    { "roleCode": "TSI1", "roleName": "內裝", "roleDescription": "內裝一般" },
    { "roleCode": "人資1", "roleName": "人資高", "roleDescription": "瑩，慧" },
    { "roleCode": "人資2", "roleName": "人資中階", "roleDescription": "新增" },
    { "roleCode": "基本1", "roleName": "基本高階", "roleDescription": "霜" },
    { "roleCode": "基本2", "roleName": "基本中階", "roleDescription": "盈，華" },
    { "roleCode": "專櫃一", "roleName": "專櫃高階", "roleDescription": "霜，慧，欣，子，恩，佳" },
    { "roleCode": "專櫃二", "roleName": "專櫃低階", "roleDescription": "曉，宛，雅，品" },
    { "roleCode": "招商", "roleName": "招商高階", "roleDescription": "霜，縈" },
    { "roleCode": "招商二", "roleName": "招商低階", "roleDescription": "子，恩，曉，婉，雅，品" },
    { "roleCode": "營運", "roleName": "營運", "roleDescription": "分析、贈品查詢" },
    { "roleCode": "禮券", "roleName": "禮券高階", "roleDescription": "瑩霜 佳盈" },
    { "roleCode": "禮券二", "roleName": "禮券低階", "roleDescription": "智，詩，日，書" },
    { "roleCode": "總帳一", "roleName": "總帳高階", "roleDescription": "慧，華，欣，子，恩，佳" },
    { "roleCode": "總帳三", "roleName": "總帳低階", "roleDescription": "雯，詩，星，書" },
    { "roleCode": "總帳二", "roleName": "總帳中階", "roleDescription": "玲，曉，雅，品，倫" },
    { "roleCode": "能源", "roleName": "能源1", "roleDescription": "真，書" },
    { "roleCode": "財-自營", "roleName": "自營", "roleDescription": "霜,羚" },
    { "roleCode": "財務T", "roleName": "財務T", "roleDescription": "財務T" },
    { "roleCode": "資材一", "roleName": "財-資材高階", "roleDescription": "霜,真" },
    { "roleCode": "資材二", "roleName": "財-資材低階", "roleDescription": "邑,裴" }
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    super(); // 呼叫父類的建構子
  }

  ngOnInit(): void {
    // 初始化程式
    this.ProgNo = '420005';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 根據 CRUD 狀態來設置不同的邏輯
    this.formTitle = 'edit-conditions';
    this.accordionTabCss = 'edit-accordionTab';
    this.crudstatus = CRUDStatus.Edit;
    this.showConfirm = this.canEdit();
  }

  // 取得動態新增的項目
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  // 取得動態項目的表單控制
  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  // 創建動態表單項目
  createItem(): FormGroup {
    return this.formBuilder.group({
      roleCode: [''], // 角色代碼
      roleName: [''], // 角色名稱
      roleDescription: [''], // 角色說明
    });
  }

  // 動態移除項目
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  // 操作按鈕的方法
  onSearch() {
    // 開始查詢的邏輯
    console.log('開始查詢');
  }

  onReset() {
    // 重新設定的邏輯
    console.log('重新設定');
  }

  onBack() {
    this.router.navigate(['/SYS0000/SYS0220']);
  }

  // 編輯邏輯
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  // 讀取邏輯
  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // 動態新增項目
  onAddItem(): void {
    this.items.push(this.createItem());
  }

  // 提交邏輯
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
          // 假設有保存邏輯
          // this.storeService.addRecord(frm.value).subscribe((response: any) => {
          this.messageService.successBubble(
            this.translate.instant('success_message')
          );
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // 假設有更新邏輯
          // this.storeService.updateRecord(frm.value).subscribe((response: any) => {
          this.messageService.successBubble(
            this.translate.instant('updated-successfully')
          );
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  // 最終提交表單
  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  // 取消按鈕邏輯
  onCancel() {
    this.router.navigate(['SYS0000/SYS0220']);
  }
}
