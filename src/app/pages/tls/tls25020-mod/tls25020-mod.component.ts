import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// 權限相關
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// 共用服務
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ViolationCategoryService } from '../../../service/basic/violation-category.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';

const now = new Date();

@Component({
  selector: 'app-tls25020-mod',

  templateUrl: './tls25020-mod.component.html',
  styleUrl: './tls25020-mod.component.scss'
})
export class TLS25020ModComponent {

  ProgNo: string = '220033';

  // 權限變數
  funInfo?: FunsrightInfo;
  addPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.add,
  };
  queryPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.query,
  };
  editPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.edit,
  };

  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    violationCategoryId: [1],  // 違規類別編號
    violationNumber: [],  // 違規編號
    violationContent: [],  // 違規內容
    amount: [],  // 金額起始
    amountEditable: [],  // 金額是否可修改
  });

  // 下拉選單選項
  violationCategoryOptions: any[] = [];
  whetherOptions: any[] = [];

  // 表格資料
  data: any[] = [
    { 'violationCategoryCode': '1', 'violationCode': '衛生管理', 'isdelete': true, 'violationContent': '未處理垃圾', 'amount': '200 	', 'isAmountEditable': '是' }
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'violationCategoryCode', header: '違規類別編號', visible: true },
    { field: 'violationCode', header: '違規編號', visible: true },
    { field: 'violationContent', header: '違規內容', visible: true },
    { field: 'amount', header: '金額', visible: true },
    { field: 'isAmountEditable', header: '金額是否可修改', visible: true },
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private violationCategoryService: ViolationCategoryService,  // 違規類別編號 service
    private whetherService: WhetherService,  // 金額是否可修改 service
  ) { }


  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 從 sessionStorage 讀取並填充表單
    const violationCategoryData = sessionStorage.getItem('violationCategoryData');
    if (violationCategoryData) {
      const data = JSON.parse(violationCategoryData);
      this.queryForm.controls['violationCategoryId'].setValue(data.violationCategoryId);
      this.queryForm.controls['violationNumber'].setValue(data.violationNumber);
      this.queryForm.controls['violationContent'].setValue(data.violationContent);
      this.queryForm.controls['amount'].setValue(data.amountStart);
      this.queryForm.controls['amountEditable'].setValue(data.amountEditable);
    }

    // 加載選項
    this.loadViolationCategoryOptions();
    this.loadWhetherOptions();
  }

  // 加載違規類別選項
  loadViolationCategoryOptions(): void {
    const violationCategoryOptions = sessionStorage.getItem('violationCategoryOptions');

    if (violationCategoryOptions) {
      this.violationCategoryOptions = JSON.parse(violationCategoryOptions);
    } else {
      this.violationCategoryService.getViolationCategories().subscribe((data) => {
        this.violationCategoryOptions = data;
        sessionStorage.setItem('violationCategoryOptions', JSON.stringify(this.violationCategoryOptions));
      });
    }
  }

  // 加載是否選項
  loadWhetherOptions(): void {
    const whetherOptions = sessionStorage.getItem('whetherOptions');

    if (whetherOptions) {
      this.whetherOptions = JSON.parse(whetherOptions);
    } else {
      this.whetherService.getWhetherOptions().subscribe((data) => {
        this.whetherOptions = data;
        sessionStorage.setItem('whetherOptions', JSON.stringify(this.whetherOptions));
      });
    }
  }





  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
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
    this.router.navigate(['TLS2000/TLS25020']);
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Create',
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS25020CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Edit',
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: 'Read',
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
