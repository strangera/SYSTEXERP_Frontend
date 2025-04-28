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
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';

const now = new Date();

@Component({
  selector: 'app-tls25020',
  templateUrl: './tls25020.component.html',
  styleUrls: ['./tls25020.component.scss']
})
export class TLS25020Component {

  ProgNo: string = '220033';

  // 權限變數
  funInfo: FunsrightInfo = {};
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
    violationCategoryId: [],  // 違規類別編號
    violationNumber: [],  // 違規編號
    violationContent: [],  // 違規內容
    amountStart: [],  // 金額起始
    amountEnd: [],  // 金額結束
    amountEditable: [],  // 金額是否可修改
  });

  // 下拉選單選項
  violationCategoryOptions: any[] = [];
  whetherOptions: any[] = [];

  // 表格資料
  data: any[] = [
    { 'violationCategoryCode': '安全管理', 'violationCode': '1', 'isdelete': true, 'violationContent': '未處理垃圾', 'amount': '200 	', 'isAmountEditable': '是' }
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

    this.violationCategoryService.getViolationCategories().subscribe((data) => {
      this.violationCategoryOptions = data;
    });

    this.whetherService.getWhetherOptions().subscribe((data) => {
      this.whetherOptions = data;
    });
  }

  canQuery(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.query) as boolean;
  }

  canAdd(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.add) as boolean;
  }

  canEdit(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.edit) as boolean;
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
      const violationData = {
        violationCategoryId: data.violationCategoryCode,
        violationNumber: data.violationCode,
        violationContent: data.violationContent,
        amountStart: data.amount || '',
        amountEditable: data.isAmountEditable === '是',
      };
      sessionStorage.setItem('violationCategoryData', JSON.stringify(violationData));

      // 儲存下拉選項到 sessionStorage
      sessionStorage.setItem('violationCategoryOptions', JSON.stringify(this.violationCategoryOptions));
      sessionStorage.setItem('whetherOptions', JSON.stringify(this.whetherOptions));

      const extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS25020MOD'], extras);
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
