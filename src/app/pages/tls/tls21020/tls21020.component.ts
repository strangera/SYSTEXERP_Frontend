import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// 權限相關
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// 共用服務
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { VoucherTypeService } from '../../../service/basic/voucher-type.service';


@Component({
  selector: 'app-tls21020',
  templateUrl: './tls21020.component.html',
  styleUrls: ['./tls21020.component.scss'],
})
export class TLS21020Component {
  ProgNo: string = '220002';
  // 權限相關資訊
  funInfo?: FunsrightInfo;




  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    voucherType: [],  // 控制名稱
  });

  // 表格數據
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [

    { field: 'itemName', header: '項目名稱', visible: true },
    { field: 'accountingSubject', header: '會計科目', visible: true },
    { field: 'organizationCode', header: '組織代碼', visible: true },
    { field: 'invoiceNote', header: '傳票備註', visible: true },
    { field: 'contractAffiliatedOrg', header: '是否依合約拆立組織', visible: true },
    { field: 'relatedPartyDept', header: '區分關係人會科', visible: true },
    { field: 'creditor', header: '應收廠商', visible: true },
    { field: 'paymentDays', header: '付款天數', visible: true }
  ];


  // 下拉選單選項
  voucherTypeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private voucherTypeService: VoucherTypeService, // 使用 VoucherTypeService
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 使用 getVoucherTypes 獲取數據
    this.voucherTypeService.getSystemTypes().subscribe(
      (data) => {
        this.voucherTypeOptions = data;
      },

    );
  }

  // 檢查是否有查詢權限
  canQuery(): boolean {
    return true;
  }

  // 檢查是否有新增權限
  canAdd(): boolean {
    return true;
  }

  // 檢查是否有編輯權限
  canEdit(): boolean {
    return true;
  }

  // 提交表單
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

  // 查詢按鈕點擊事件
  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
    this.router.navigate(['TLS2000/TLS21020CRU']);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單

  }

  // 新增按鈕點擊事件
  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  // 編輯按鈕點擊事件
  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  // 查看詳細信息按鈕點擊事件
  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
