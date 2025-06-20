import { Component } from '@angular/core';
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
  selector: 'app-tls21040',
  templateUrl: './tls21040.component.html',
  styleUrls: ['./tls21040.component.scss'],
})
export class TLS21040Component {
  ProgNo: string = '220004';
  // 權限
  funInfo?: FunsrightInfo;



  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    bank: [],
    cardType: [],
    cardCategory: [],
    bin: [],
  });

  // 表格資料
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'bankCode', header: '銀行代碼', visible: true },
    { field: 'bankName', header: '銀行名稱', visible: true },
    { field: 'cardType', header: '卡種', visible: true },
    { field: 'cardCategory', header: '卡別', visible: true },
    { field: 'ntRetrieve', header: '第NT聯取聯', visible: true },
    { field: 'retrieve', header: '取NT聯', visible: true },
    { field: 'cardIdentifier', header: '卡種識別碼', visible: true },
  ];

  // 下拉選單選項
  cardTypeOptions: any[] = [];
  cardCategoryOptions: any[] = [];
  bankOptions: any[] = [
    { value: 1, label: '中國信託' },
    { value: 2, label: '玉山銀行' },
    { value: 3, label: '星展銀行' },
  ];
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private cardTypeService: CardTypeService,
    private cardCategoryService: CardCategoryService
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
      // 提交邏輯
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
    this.router.navigate(['TLS2000/TLS21040MOD']);
  }

  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
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
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
