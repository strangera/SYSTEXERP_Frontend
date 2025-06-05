
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
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
@Component({
  selector: 'app-tls29010-cru',
  templateUrl: './tls29010-cru.component.html',
  styleUrl: './tls29010-cru.component.scss'
})
export class TLS29010CRUComponent {

  ProgNo: string = '220049';
  // 權限
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
  dataForm = this.formBuilder.group({
    bank: [],
    cardType: [],
    cardCategory: [],
    bin: []
  });

  // 表格資料
  data: any[] = [
    {
      projectNumber: '001',
      projectName: '專櫃A',
      activity: '促銷活動',
      startDate: '2023-01-01',
      endDate: '2023-01-31',
      executionStartDate: '2023-01-01',
      executionEndDate: '2023-01-31'
    },
    {
      projectNumber: '002',
      projectName: '專櫃B',
      activity: '新品發布',
      startDate: '2023-02-01',
      endDate: '2023-02-28',
      executionStartDate: '2023-02-01',
      executionEndDate: '2023-02-28'
    },
    // 其他資料
  ];

  filteredData: any[] = [...this.data];

  columns: any[] = [
    { field: 'projectNumber', header: '專櫃編號', visible: true },
    { field: 'projectName', header: '專櫃名稱', visible: true },
    { field: 'activity', header: '活動', visible: true },
    { field: 'startDate', header: '開始起始日', visible: true },
    { field: 'endDate', header: '開始終止日', visible: true },
    { field: 'executionStartDate', header: '營運起始日', visible: true },
    { field: 'executionEndDate', header: '營運終止日', visible: true }
  ];

  // 下拉選單選項
  cardTypeOptions: any[] = [];
  cardCategoryOptions: any[] = [];
  formTitle: string = '';
  showConfirm: boolean = false;
  crudstatus: CRUDStatus = CRUDStatus.Read;
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
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };
    switch (state.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = '新增資料';
        this.showConfirm = this.canAdd();
        break;
      case CRUDStatus.Edit:
        console.log(state.rowdata);
        this.formTitle = '編輯資料';
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = '顯示資料';
        this.Read(state.rowdata);
        break;
    }
  }
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }
  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
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

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          dataForm: this.dataForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS29010'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          dataForm: this.dataForm,
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
        dataForm: this.dataForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
  get isFormEditable(): boolean {
    return (this.crudstatus === CRUDStatus.Create && this.canAdd()) || (this.crudstatus === CRUDStatus.Edit && this.canEdit());
  }
  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }
  onCancel() {
    this.router.navigate(['TLS2000/TLS21040']);
  }
}
