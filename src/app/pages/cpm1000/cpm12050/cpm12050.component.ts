import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
//

//5.1.2.5 顧客意見管理作業
@Component({
  selector: 'app-cpm12050',
  templateUrl: './cpm12050.component.html',
  styleUrl: './cpm12050.component.scss'
})
export class CPM12050Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    opinionCode: [], // 客戶意見編號
    customerName: ['', [Validators.maxLength(20)]], // 顧客姓名
    handlingSituation: [[] as number[]], // 處理情況
    gender: [[] as number[]], // 性別
    opinionCategory: [[] as number[]], // 客戶意見類別
    opinionSource: [[] as number[]], // 客戶意見來源別
    //
    contactAddress: ['', [Validators.maxLength(100)]], // 聯絡住址
    contactPhone: [, [Validators.maxLength(30)]], // 聯絡電話
    cellPhone: [, [Validators.maxLength(30)]], // 行動電話
    email: ['', [Validators.maxLength(100)]], // 電子信箱
    pieces: [, [Validators.maxLength(20)]], // 件號
    //
    emailContent: [, ], // 顧客意見內容
    //
    responsibleUnit: [], // 責任單位
    builder: ['', [Validators.maxLength(10)]], // 建檔人員
    receiveDateFrom: [], // 接件日期
    receiveDateTo: [], // 接件日期
    notifyDateFrom: [], // 通知相關單位處理日期
    notifyDateTo: [], // 通知相關單位處理日期
    object: ['', [Validators.maxLength(20)]], // 對象
  });
  // 下拉資料多個呈現
  // ----------------------------------------------------------------
  roles: any[] = [
    { id: 1, roleCode: 'ADMIN', roleName: 'Administrator' },
    { id: 2, roleCode: 'USER', roleName: 'User' },
    { id: 3, roleCode: 'GUEST', roleName: 'Guest' },
  ];
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    { 'isdelete': false, 'opinionCode': 20190709001, 'id': '', 'emailContent': '內容1', 'receiveDate': '2019/07/09 12:40',
      'builder': 'Call 小明', 'responsibleUnit': '營運部', 'handlingSituation': '結案', 'object': 'B1 湯姆熊',
    },
    { 'isdelete': false, 'opinionCode': 20190709002, 'id': '', 'emailContent': '內容2', 'receiveDate': '2019/07/09 12:40',
      'builder': 'Call 小明', 'responsibleUnit': '營運部', 'handlingSituation': '結案', 'object': 'B1 湯姆熊',
    },
    { 'isdelete': true, 'opinionCode': 20190709003, 'id': '', 'emailContent': '內容3', 'receiveDate': '2019/07/09 12:40',
      'builder': 'Call 小明', 'responsibleUnit': '營運部', 'handlingSituation': '處理中', 'object': '美食街三明治',
    },
    // 其他資料
  ];
  columns: any[]= [
    { field: 'opinionCode', header: '客戶意見編號', visible: true },
    { field: 'id', header: '件號', visible: true },
    { field: 'emailContent', header: '顧客意見內容', visible: true },

    { field: 'receiveDate', header: '接件日期', visible: true },
    { field: 'builder', header: '建檔人員', visible: true },
    { field: 'responsibleUnit', header: '責任單位', visible: true },
    { field: 'handlingSituation', header: '處理情況', visible: true },

    { field: 'object', header: '對象', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  opinionCodeOptions: any[] = [
    { value: 1, label: '20141230001/陳小姐' },
    { value: 2, label: '20141230002/李小姐' },
    { value: 3, label: '20141230003/' },
    { value: 4, label: '20141230004/' },
    { value: 5, label: '20141230005/' },
  ];

  handlingOptions: any[] = [
    { value: 1, label: '已建單' },
    { value: 2, label: '已派單' },
    { value: 3, label: '處理中' },
    { value: 4, label: '結案' },
  ];

  genderOptions: any[] = [
    { value: 1, label: '男' },
    { value: 2, label: '女' },
  ];

  opinionCategoryOptions: any[] = [
    { value: 1, label: '意見反映' },
    { value: 2, label: '廣告業務' },
    { value: 3, label: '活動、場地洽談' },
    { value: 4, label: '承租店櫃' },
    { value: 5, label: '合作提案' },
  ];

  opinionSourceOptions: any[] = [
    { value: 1, label: '現場' },
    { value: 2, label: '來電' },
    { value: 3, label: 'E-mail' },
    { value: 4, label: '社群網站' },
    { value: 5, label: '郵寄信函' },
  ];

  responsibleUnitOptions: any[] = [
    { value: 1, label: 'X001/營運部' },
    { value: 2, label: 'X002/行銷部' },
    { value: 3, label: 'X003/管理部' },
    { value: 4, label: 'X004/經企部' },
    { value: 5, label: 'X005/財務部' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '510012';
    this.cruPage = '/CPM1000/CPM12050CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
  // ----------------------------------------------------------------
  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(this.router, CRUDStatus.Create, null, this.cruPage);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(this.router, CRUDStatus.Edit, data, this.cruPage);
    }
  }

  onDetail(data: any) {
    this.navigateWithState(this.router, CRUDStatus.Read, data, this.cruPage);
  }
  // 高權限查詢
  onSupremeAuthority() {
    this.navigateWithState(this.router, CRUDStatus.Read, '/CPM1000/CPM12050HQ');
  }
}
