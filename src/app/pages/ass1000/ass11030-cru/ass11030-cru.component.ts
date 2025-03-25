import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
//
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { ValidationService } from '../../../shared/service/validation.service';

//3.1.1.3 小分類維護作業 CRU
@Component({
  selector: 'app-ass11030-cru',
  templateUrl: './ass11030-cru.component.html',
  styleUrl: './ass11030-cru.component.scss'
})
export class ASS11030CRUComponent extends BasicCrupageComponent implements OnInit{
  //
  bigCategoryCodeOptions: any[]=[
    { value: 'A', label: 'A/裝潢工程' },
    { value: 'B', label: 'B/其他工程' },
    { value: 'C', label: 'C/電腦及電子零件產品' },
    { value: 'D', label: 'D/電力及照明系統' },
    { value: 'E', label: 'E/家電家具設備' },
    { value: 'F', label: 'F/機消空電水零配件' },
    { value: 'G', label: 'G/辦公及營運庶務' },
    { value: 'H', label: 'K/印刷品(非廣告行銷)' },
  ];

  midCategoryCodeOptions: any[]=[
    { value: 23, label: '室內裝潢工程' },
    { value: 24, label: '室內裝潢備品' },
    { value: 21, label: '弱電系統' },
    { value: 22, label: '房屋和建築設備' },
    { value: 23, label: '停車場設備' },
    { value: 24, label: '其他工程' },
    { value: 25, label: '機電消防工程' },
    { value: 22, label: '電子產品及零件' },
  ];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    smlCategoryCode: [, [Validators.required, Validators.maxLength(2)]], // 小分類代碼
    smlCategoryName: ['', [Validators.required, Validators.maxLength(32)]], // 小分類名稱
    midCategoryCode: [], // 中分類代碼
    midCategoryName: ['', [Validators.maxLength(40)]], // 中分類名稱
    bigCategoryCode: [, [Validators.required]], // 大分類代碼
    bigCategoryName: ['', [Validators.maxLength(40)]], // 大分類名稱
    illustrate: [, ], // 說明
  });
  //
  // ----------------------------------------------------------------
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
    this.ProgNo = '310003';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
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
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
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
  }
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onSubmit(frm: FormGroup){
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid){
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
    this.onSubmit(frm);
  }

  onCancel() {
    this.router.navigate(['/ASS1000/ASS11030']);
  }
}
