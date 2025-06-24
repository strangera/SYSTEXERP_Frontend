import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { CardCategoryService } from '../../../service/basic/card-category.service';


@Component({
  selector: 'app-tls21040-mod',
  templateUrl: './tls21040-mod.component.html',
  styleUrls: ['./tls21040-mod.component.scss'],
})
export class TLS21040ModComponent implements OnInit {
  ProgNo: string = '220004';

  // 權限
  funInfo?: FunsrightInfo;




  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    bankCode: [],        // 銀行代碼
    bankName: [],        // 銀行名稱
    cardType: [],        // 卡種
    cardCategory: [],    // 卡別
    startBin: [],        // 第幾碼開始
    binCount: [],        // 取幾碼
    cardIdentifier: [],  // 卡種識別碼
  });

  // 表格資料
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'bankCode', header: '銀行代碼', visible: true },
    { field: 'bankName', header: '銀行名稱', visible: true },
    { field: 'cardType', header: '卡種', visible: true },
    { field: 'cardCategory', header: '卡別', visible: true },
    { field: 'startBin', header: '第幾碼開始', visible: true },
    { field: 'binCount', header: '取幾碼', visible: true },
    { field: 'cardIdentifier', header: '卡種識別碼', visible: true },
  ];

  // 下拉選單選項
  cardTypeOptions: any[] = [];
  cardCategoryOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private cardTypeService: CardTypeService,
    private cardCategoryService: CardCategoryService,
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.cardTypeService.getCardType().subscribe((data) => {
      this.cardTypeOptions = data;
    });

    this.cardCategoryService.getCardCategory().subscribe((data) => {
      this.cardCategoryOptions = data;
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
      // 提交查詢邏輯
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
    this.router.navigate(['TLS2000/TLS21040']);
  }

  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm.value,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS21040CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm.value,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm.value,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
