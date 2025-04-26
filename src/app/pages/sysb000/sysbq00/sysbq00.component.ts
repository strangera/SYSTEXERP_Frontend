import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { SystemTypeDetailService } from '../../../service/basic/system-type-detail.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

@Component({
  selector: 'app-sysbq00',
  templateUrl: './sysbq00.component.html',
  styleUrl: './sysbq00.component.scss'
})
// 簽核權限設定維護
export class SYSBQ00Component extends BasicQpageComponent implements OnInit {
  // 查詢
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    signatureFieldName: ['', [Validators.maxLength(2)]], // 簽核欄名稱
    status: ['', [Validators.maxLength(2)]], // 狀態
    systemType: [1], // 系統別
    jobCode: [1], // 作業代碼
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    { isdelete: true, systemType: 'SYSA000', jobCode: 'SYSA310', signatureFieldName: '廠商名稱', status: '啟用', order: 1, column: 1, showLoginUser: '否' },
    { isdelete: true, systemType: 'SYSA000', jobCode: 'SYSA310', signatureFieldName: '業主:南紡夢時代', status: '啟用', order: 6, column: 1, showLoginUser: '否' },
    { isdelete: true, systemType: 'SYSA000', jobCode: 'SYSA310', signatureFieldName: '經辦', status: '啟用', order: 25, column: 13, showLoginUser: '否' },
    { isdelete: true, systemType: 'SYSA000', jobCode: 'SYSA310', signatureFieldName: 'Team主管', status: '啟用', order: 35, column: 13, showLoginUser: '否' },
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'systemType', header: '系統別', visible: true },
    { field: 'jobCode', header: '作業代碼', visible: true },
    { field: 'signatureFieldName', header: '簽核欄名稱', visible: true },
    { field: 'status', header: '狀態', visible: true },
    { field: 'order', header: '排序', visible: true },
    { field: 'column', header: '行別', visible: true },
    { field: 'showLoginUser', header: '是否顯示登入者姓名', visible: true },
    //
  ];
  // ----------------------------------------------------------------
  systemTypeOptions: any[] = [];
  jobTypeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private systemTypeDetailService: SystemTypeDetailService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '410012';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    this.systemTypeDetailService.getSystemTypes().subscribe(data => {
      this.systemTypeOptions = data;
      this.jobTypeOptions = data;
    });
  }

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

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true
      };

      //console.log("extra", extras);
      this.router.navigate(['/SYSB000/SYSBQ00CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true
      };

      this.router.navigate(['/SYSB000/SYSBQ00CRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true
    };

    this.router.navigate(['/SYSB000/SYSBQ00CRU'], extras);
  }
}
