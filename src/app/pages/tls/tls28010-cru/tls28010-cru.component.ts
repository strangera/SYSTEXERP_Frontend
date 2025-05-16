import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
import { CashierCodeService } from '../../../service/basic/cashier-code.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
@Component({
  selector: 'app-tls28010-cru',
  templateUrl: './tls28010-cru.component.html',
  styleUrl: './tls28010-cru.component.scss',
})
export class TLS28010CRUComponent extends BasicCrupageComponent implements OnInit {
  // ProgNo: string = '220044';
  // // 權限
  // funInfo?: FunsrightInfo;
  // addPermission: HasPermissionsValue = {
  //   progNo: this.ProgNo,
  //   permission: PermissionsInfo.add,
  // };
  // queryPermission: HasPermissionsValue = {
  //   progNo: this.ProgNo,
  //   permission: PermissionsInfo.query,
  // };
  // editPermission: HasPermissionsValue = {
  //   progNo: this.ProgNo,
  //   permission: PermissionsInfo.edit,
  // };
  // 查詢表單
  loading: boolean = false;
  // submitted: boolean = false;
  dataForm = this.formBuilder.group({
    bank: [],
    cardType: [],
    cardCategory: [],
    bin: [],
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });

  // 表格資料
  data: any[] = [
    {
      seq: 1,
      isNew: '是',
      aboveNew: '否',
      bankCode: '001',
      bankName: '台灣銀行',
      cardType: '信用卡',
      nthTransaction: 5,
      takeN: 2,
      cardSeriesCode: '1234',
    },
    {
      seq: 2,
      isNew: '否',
      aboveNew: '是',
      bankCode: '002',
      bankName: '兆豐銀行',
      cardType: '金融卡',
      nthTransaction: 3,
      takeN: 1,
      cardSeriesCode: '5678',
    },
    // 其他資料
  ];

  filteredData: any[] = [...this.data];

  columns: any[] = [
    { field: 'seq', header: '序號', visible: true },
    { field: 'isNew', header: '是否新搭', visible: true },
    { field: 'aboveNew', header: '以上新搭', visible: true },
    { field: 'bankCode', header: '銀行代碼', visible: true },
    { field: 'bankName', header: '銀行名稱', visible: true },
    { field: 'cardType', header: '卡別', visible: true },
    { field: 'nthTransaction', header: '第N筆銷貨', visible: true },
    { field: 'takeN', header: '取N筆', visible: true },
    { field: 'cardSeriesCode', header: '卡鏈號碼', visible: true },
  ];
  // 下拉選單選項
  cardTypeOptions: any[] = [];
  cardCategoryOptions: any[] = [];
  cashierCodeOptions: any[] = [];
  // formTitle: string = '';
  // showConfirm: boolean = false;
  // crudstatus: CRUDStatus = CRUDStatus.Read;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private cardTypeService: CardTypeService,
    private cardCategoryService: CardCategoryService,
    private cashierCodeService: CashierCodeService
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '220044';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.cardTypeService.getCardType().subscribe((data) => {
      this.cardTypeOptions = data;
    });

    this.cashierCodeService.getCashierCodes().subscribe((data) => {
      this.cashierCodeOptions = data;
    });

    this.cardCategoryService.getCardCategory().subscribe((data) => {
      this.cardCategoryOptions = data;
    });
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
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

  // canAdd(): boolean {
  //   return true;
  // }

  // canEdit(): boolean {
  //   return true;
  // }

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
    this.dataForm.reset();  // 重置表單
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
      this.router.navigate(['TLS2000/TLS28010'], extras);
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
  // get isFormEditable(): boolean {
  //   return (
  //     (this.crudstatus === CRUDStatus.Create && this.canAdd()) ||
  //     (this.crudstatus === CRUDStatus.Edit && this.canEdit())
  //   );
  // }
  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }
  onCancel() {
    this.router.navigate(['TLS2000/TLS21040']);
  }
  // 初始化CRU表單
  cruForm = this.formBuilder.group({
    items: this.formBuilder.array([this.createItem()]), // 項目列表
  });

  //
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  //
  createItem(): FormGroup {
    return this.formBuilder.group({
      cashierCodeOptions: [],
      countercode: [{ value: '自動帶入', disabled: true }],
      countername: [{ value: '自動帶入', disabled: true }],
      contractEnddate: [{ value: '自動帶入', disabled: true }],
      endcode: [],
      startcode: [],
    });
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }


}
