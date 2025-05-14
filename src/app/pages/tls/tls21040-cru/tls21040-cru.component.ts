import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { CardCategoryService } from '../../../service/basic/card-category.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';

@Component({
  selector: 'app-tls21040-cru',
  templateUrl: './tls21040-cru.component.html',
  styleUrls: ['./tls21040-cru.component.scss']
})
export class TLS21040CRUComponent {

  ProgNo: string = '220004';
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

  // 初始化CRU表單
  cruForm = this.formBuilder.group({
    items: this.formBuilder.array([this.createItem()]), // 項目列表
  });

  // 下拉選單選項
  cardTypeOptions: any[] = [];
  cardCategoryOptions: any[] = [];
  bankcode: any[] = [
    { value: '001', label: '001' },
    { value: '002', label: '002' },
    { value: '003', label: '003' },
  ];

  formTitle: string = '';
  showConfirm: boolean = false;
  crudstatus: CRUDStatus = CRUDStatus.Read;

  constructor(
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

  // Handle bank code selection to automatically set bank name
  onBankCodeChange(event: any, index: number): void {
    const selectedBankCode = event.target.value;
    let bankName = '';

    // 根據選擇的銀行代碼設置相應的銀行名稱
    if (selectedBankCode === '001') {
      bankName = '中國信託';
    } else if (selectedBankCode === '002') {
      bankName = '台灣銀行';
    } else if (selectedBankCode === '003') {
      bankName = '星展銀行';
    }

    // 設置銀行名稱
    this.getFormControl(index, 'bankname').setValue(bankName);
  }

  get items(): FormArray {
    return this.cruForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      bankcode: [],
      bankname: [{ value: '', disabled: true }], // Bank name field is disabled
      cardTypeOptions: [],
      cardCategoryOptions: [],
      fromN: [],
      N: [],
      cardIDcode: [],
    });
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onRemoveItem(index: number) {
    this.items.removeAt(index);
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

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }

  onClearForm() {
    this.cruForm.reset();  // 重置表單
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }
}
