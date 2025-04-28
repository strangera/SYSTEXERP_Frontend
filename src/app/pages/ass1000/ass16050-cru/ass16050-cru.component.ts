import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';

@Component({
  selector: 'app-ass16050-cru',
  templateUrl: './ass16050-cru.component.html',
  styleUrls: ['./ass16050-cru.component.scss']
})
export class ASS16050CRUComponent extends BasicCrupageComponent implements OnInit {

  // 表單定義
  dataForm = this.formBuilder.nonNullable.group({
    Warehouse: ['', Validators.required], // 倉別
    Receiptnumber: [''], // 驗收單號
    ApplicantCode: [''], // 申請人編號
    ApplicationDate: [''], // 申請日期
    PurchaseOrderStatus: [''], // 採購單狀態
    DepartmentCode: [''], // 部門代號
    ShippingDate: [''], // 發料日期
    // 動態新增項目
    items: this.formBuilder.array([
      this.createItem() // 初始項目
    ]),
  });

  // 下拉選項
  Departmentcode: any[] = []; // 部門代號選項
  Kurabe: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];
  Itemnumber: any[] = [
    { value: 1, label: '3A24210000001' },
    { value: 2, label: '3A24210000002' },
    { value: 3, label: '3A24210000003' },
    { value: 4, label: '3A24210000004' },
    { value: 5, label: '3A24210000005' },
    { value: 6, label: '3A24210000006' },
    { value: 7, label: '3A24210000007' },
    { value: 8, label: '3A24210000008' },
    { value: 9, label: '3A24210000009' },
    { value: 10, label: '3A24210000010' },
  ];

  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化程式
    this.ProgNo = '310044';

    // 初始化使用者權限
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    // 根據狀態決定表單邏輯
    switch (state.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.accordionTabCss = 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss = 'edit-accordionTab';
        this.crudstatus = CRUDStatus.Edit;
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }
  }

  // 取得動態新增項目的表單組
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  // 動態取得每個項目的控制項
  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  // 創建一個新的動態項目
  createItem(): FormGroup {
    return this.formBuilder.group({
      ItemCode: [''], // 品項編碼
      Unit: [''], // 單位
      RequestedQuantity: [''], // 申請數量
      ExpectedQuantity: [''], // 應發數量
      ActualQuantity: [''], // 實發數量
      Description: [''], // 說明
    });
  }

  // 動態移除項目
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  // 編輯狀態下的讀取方法
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  // 讀檔狀態下的讀取方法
  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // 動態新增一個項目
  onAddItem(): void {
    this.items.push(this.createItem());
  }

  // 表單提交邏輯
  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.errorBubble(this.translate.instant('form_error_message'));
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  // 最終表單提交
  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  // 取消操作
  onCancel() {
    this.router.navigate(['ASS1000/ASS16050']);
  }
}
