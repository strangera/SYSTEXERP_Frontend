import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { NavigationExtras, Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { ValidationService } from '../../../shared/service/validation.service';
//
import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS5000Service } from '../../../service/API/TLS0000/tls5000.service';

// 新增：定義數據接口
interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_LRemark: string | null;
  CRT_USR_No: string | "";
  CRT_USR_Name: string | "";
}

// 2.5.1.2 中分類維護作業 CRU
@Component({
  selector: 'app-tls51020-cru',
  templateUrl: './tls51020-cru.component.html',
  styleUrl: './tls51020-cru.component.scss'
})
export class TLS51020CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit {

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [0], // ID
    mCode: [, [Validators.required, Validators.maxLength(3), this.validationService.numberValidator]], // Input serial number
    mName: ['', [Validators.required, Validators.maxLength(32)]], // Input Text
    bigCategory: [, [Validators.required]], // DropDown
    editortext: [,], // editor text
  });
  showConfirm: boolean = false;

  // ----------------------------------------------------------------
  bigCategoryOptions: any[] = [];

  constructor(
    private validationService: ValidationService,
    private apiService: TLS5000Service,
    private bigCategoryCodeService: BigCategoryCodeService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('25002', this.dataForm);
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => {
      this.bigCategoryOptions = data;
    });
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
    this.router.navigate(['/TLS5000/TLS51020']);
  }
}
