import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-cpm11050-lost',
    templateUrl: './cpm11050-lost.component.html',
    styleUrl: './cpm11050-lost.component.scss',
    standalone: true,
    imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, CalendarComponent, DropdownComponent, InputTextComponent, RadiobuttonComponent, EditorTextComponent, NgIf, TranslateModule]
})
// 5.1.1.5 遺失/拾獲管理作業 CRU - 新增遺失
export class Cpm11050LostComponent extends BasicCrupageComponent implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    recordCode: [, [Validators.maxLength(8)]], // 記錄編號
    // registerCode: [, [Validators.maxLength(9)]], // 登錄編號
    registerDate: [, [Validators.required]], // 登錄日期
    lostStatus: [], // 失物狀態
    lossDate: [, [Validators.required]], // 遺失日期
    location: ['', [Validators.maxLength(100)]], // 地點
    //
    transferDate: [], // 轉出日期
    register: ['', [Validators.required]], // 登錄者
    objectType: [, [Validators.required]], // 物品類別
    serviceStaff: ['', [Validators.required, Validators.maxLength(10)]], // 服務人員
    notificationDate: [], // 通知日期
    broadcastStatus: [2, []], // 是否廣播
    //
    objectDescription: [,], // 物品敘述
    //領回資訊
    receiverDate: [], //領回日期
    receiverName: [, [Validators.maxLength(20)]], // 領回者姓名
    receiverPhone: ['', [Validators.maxLength(100)]], // 領回人聯絡電話
    helperName: [, [Validators.maxLength(20)]], // 協助顧客領回處理人員
    //--
    //遺失者基本資料
    //--
    reporterName: ['', [Validators.required, Validators.maxLength(20)]], // 報失者/拾獲者姓名
    reporterIdentity: [], // 報失者/拾獲者身分別
    reporterGender: [, [Validators.required]], // 	報失者/拾獲者性別
    dayPhone: [, [Validators.maxLength(20)]], // 電話(日)
    nightPhone: [, [Validators.maxLength(20)]], // 電話(夜)
    cellphone: [, [Validators.maxLength(20)]], // 手機
    //
    idNumber: [, [Validators.maxLength(20)]], // 證件號碼
    address: ['', [Validators.maxLength(100)]], // 聯絡地址
    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  lostStatusOptions: any[] = [
    { value: 1, label: '拾獲' },
    { value: 2, label: '遺失' },
  ];
  objectTypeOptions: any[] = [
    { value: 1, label: '鑰匙' },
    { value: 2, label: '手機' },
    { value: 3, label: '皮包/包包' },
    { value: 4, label: '衣物' },
    { value: 5, label: '電子商品' },
  ];
  broadcastStatusOptions: any[] = [
    { value: 1, label: '已廣播' },
    { value: 2, label: '不廣播' },
  ];
  reporterOptions: any[] = [
    { value: 1, label: '遊客' },
    { value: 2, label: '員工' },
  ];
  genderOptions: any[] = [
    { value: 1, label: '男' },
    { value: 2, label: '女' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private validationService: ValidationService,
    //
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '510005';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.accordionTabCss = 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss = 'edit-accordionTab';
        this.crudstatus = CRUDStatus.Edit;
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      // 讀檔
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }

    console.log(this.accordionTabCss);
  }

  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }
  // ----------------------------------------------------------------
  createItem(): FormGroup {
    return this.formBuilder.group({
      // counterPosition: [], // 所屬服務台位置
      // allocateNumber: [, [this.validationService.numberValidator]], // 分配設備數量
    });
  }
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

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
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }//CRU

  onCancel() {
    this.router.navigate(['/CPM1000/CPM11050']);
  }
}
