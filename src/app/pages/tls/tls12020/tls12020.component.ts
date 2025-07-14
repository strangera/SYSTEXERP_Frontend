import { WillingnessLevelService } from './../../../service/basic/willingness-level.service';
import { UserCodeService } from './../../../service/basic/user-code.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { ValidationService } from '../../../shared/service/validation.service';
import { LocationService } from '../../../service/basic/location.service';
import { VendorService } from '../../../service/basic/vendor.service';

// 2.1.2.2 專櫃訪談記錄維護
@Component({
  selector: 'app-tls12020',
  templateUrl: './tls12020.component.html',
  styleUrl: './tls12020.component.scss'
})
export class TLS12020Component {
  ProgNo: string = '210004';
  // 權限
  funInfo?: FunsrightInfo;

  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    positionNumber: [[] as number[]], // 位置編號
    vendorUID: [[] as number[]], // 廠商統一編號
    vendorCName: ['', [Validators.maxLength(60)]], // 廠商名稱(中文)
    vendorEName: ['', [Validators.maxLength(60)]], // 廠商名稱(英文)
    startdate: [], // 訪談日期
    enddate: [], // 訪談日期
    interviewer: [[] as number[]], // 訪談人員
    willingnessLevel: [[] as number[]], // 意願等級
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    // { location: '00000000', vendorUID: '123', vendorCName: '廠商1', vendorEName: 'vendor1',
    //   brandCName: '品牌1', industryCode: '大分類代號', contactPerson: '林先生', contactPersonPhone: '123',
    //   interviewDate: '2024-01-01', interviewDateTime: '11:20',interviewer: '訪談人員', willingnessLevel: 'a'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'location', header: '位置編號', visible: true },
    { field: 'vendorUID', header: '廠商統一編號', visible: true },
    { field: 'vendorCName', header: '廠商名稱(中文)', visible: true },
    { field: 'vendorEName', header: '廠商名稱(英文)', visible: true },
    { field: 'brandCName', header: '品牌', visible: true },
    { field: 'industryCode', header: '大分類代碼', visible: true },
    { field: 'contactPerson', header: '聯絡人', visible: true },
    { field: 'contactPersonPhone', header: '聯絡人電話', visible: true },
    { field: 'interviewDate', header: '訪談日期', visible: true },
    { field: 'interviewDateTime', header: '訪談時間', visible: true },
    { field: 'interviewer', header: '訪談人員', visible: true },
    { field: 'willingnessLevel', header: '意願等級', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  positionNumberOptions: any[] = [];
  vendorUIDOptions: any[] = [];
  interviewerOptions: any[] = [];
  willingnessLevelOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private locationService: LocationService,
    private vendorService: VendorService,
    private userCodeService: UserCodeService,
    private willingnessLevelService: WillingnessLevelService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.locationService.getLocations().subscribe(data => {
      this.positionNumberOptions = data;
    });
    //
    this.vendorService.getVendors().subscribe(data => {
      this.vendorUIDOptions = data;
    });
    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.interviewerOptions = data;
    });
    //
    this.willingnessLevelService.getSystemTypes().subscribe(data => {
      this.willingnessLevelOptions = data;
    });
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
      this.router.navigate(['/TLS1000/TLS12020CRU'], extras);
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

      this.router.navigate(['/TLS1000/TLS12020CRU'], extras);
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

    this.router.navigate(['/TLS1000/TLS12020CRU'], extras);
  }
}
