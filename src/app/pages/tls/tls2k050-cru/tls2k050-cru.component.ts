import { Component, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
//---------------------------------

// 2.2.19.5 餘代卡換卡作業 CRU
@Component({
    selector: 'app-tls2k050-cru',
    templateUrl: './tls2k050-cru.component.html',
    styleUrl: './tls2k050-cru.component.scss',
    standalone: true,
    imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, CalendarComponent, InputTextComponent, EditorTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS2K050CRUComponent {
  ProgNo: string = '220101';
  // 權限
  // ----------------------------------------------------------------
  funInfo?: FunsrightInfo;
  addPermission = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  editPermission = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    oldCardID: [, [Validators.required, this.validationService.numberValidator]], // Input serial number
    changeCardDate: [], // 單選日期限制 (datetime yyyy/mm/dd)
    status: ['', [Validators.maxLength(14)]], // Input Text
    payout: [, [this.validationService.numberValidator]], // Input number
    nonPayout: [, [this.validationService.numberValidator]], // Input number
    releaseCardDate: [], // 單選日期限制 (datetime yyyy/mm/dd)
    newCardID: [, [Validators.required, this.validationService.numberValidator]], // Input serial number
    changeInfo: [,], // editor text
  });
  // ----------------------------------------------------------------
  crudstatus: CRUDStatus = CRUDStatus.Read;
  formTitle: string = '';
  showConfirm: boolean = false;
  submitted = false;

  // ----------------------------------------------------------------

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
  ) {
  }

  ngOnInit(): void {
    //
    // ----------------------------------------------------------------
    // this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------

    // ----------------------------------------------------------------
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
  // ----------------------------------------------------------------
  get isFormEditable(): boolean {
    return (this.crudstatus === CRUDStatus.Create && this.canAdd()) || (this.crudstatus === CRUDStatus.Edit && this.canEdit());
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble('新增成功');
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble('更新成功');
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset();  // 重置表單
  }

  onCancel() {
    this.router.navigate(['/TLS2000/TLS2K050']);
  }

}
