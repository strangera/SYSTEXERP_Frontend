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
import { PanelModule } from 'primeng/panel';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';

//5.1.2.5 顧客意見管理作業 CRU
@Component({
  selector: 'app-cpm12050-cru',
  templateUrl: './cpm12050-cru.component.html',
  styleUrl: './cpm12050-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, InputTextComponent, DropdownComponent, CalendarComponent, EditorTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class CPM12050CRUComponent extends BasicCrupageComponent implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    opinionCode: [, [Validators.required]], // 客戶意見編號
    customerName: ['', [Validators.maxLength(20)]], // 顧客姓名
    handlingSituation: [], // 處理情況
    gender: [], // 性別
    opinionCategory: [, [Validators.required]], // 客戶意見類別
    opinionSource: [[] as number[], [Validators.required]], // 客戶意見來源別
    subOpinionSource: [[] as number[], [Validators.required]], // 客戶意見子類別
    //
    contactAddress: ['', [Validators.maxLength(100)]], // 聯絡住址
    contactPhone: [, [Validators.maxLength(30)]], // 聯絡電話
    cellPhone: [, [Validators.maxLength(10)]], // 行動電話
    email: ['', [Validators.maxLength(100)]], // 電子信箱
    pieces: [, [Validators.maxLength(20)]], // 件號
    //
    emailContent: [, [Validators.required]], // 顧客意見內容
    //
    responsibleUnit: [, [Validators.required]], // 責任單位
    builder: ['', [Validators.required, Validators.maxLength(10)]], // 建檔人員
    receiveDate: [, [Validators.required]], // 接件日期
    notifyDate: [], // 通知相關單位處理日期
    object: ['', [Validators.maxLength(10)]], // 對象
    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  handlingOptions: any[] = [
    { value: 1, label: '已建單' },
    { value: 2, label: '已派單' },
    { value: 3, label: '處理中' },
    { value: 4, label: '結案' },
  ];

  genderOptions: any[] = [
    { value: 1, label: '男' },
    { value: 2, label: '女' },
  ];

  opinionCategoryOptions: any[] = [
    { value: 1, label: '意見反映' },
    { value: 2, label: '廣告業務' },
    { value: 3, label: '活動、場地洽談' },
    { value: 4, label: '承租店櫃' },
    { value: 5, label: '合作提案' },
  ];

  opinionSourceOptions: any[] = [
    { value: 1, label: '現場' },
    { value: 2, label: '來電' },
    { value: 3, label: 'E-mail' },
    { value: 4, label: '社群網站' },
    { value: 5, label: '郵寄信函' },
  ];

  responsibleUnitOptions: any[] = [
    { value: 1, label: 'X001/營運部' },
    { value: 2, label: 'X002/行銷部' },
    { value: 3, label: 'X003/管理部' },
    { value: 4, label: 'X004/經企部' },
    { value: 5, label: 'X005/財務部' },
  ];

  //
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
    this.ProgNo = '510012';
    //

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
    this.router.navigate(['/CPM1000/CPM12050']);
  }
}
