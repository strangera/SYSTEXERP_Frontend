import { Component, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
import { NavigationExtras, Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { ValidationService } from '../../../shared/service/validation.service';
//

// 2.5.1.5 商品單位設定  CRU
@Component({
  selector: 'app-tls51050-cru',
  templateUrl: './tls51050-cru.component.html',
  styleUrl: './tls51050-cru.component.scss'
})
export class TLS51050CRUComponent {
  ProgNo: string = '250005';
  // 權限
  // ----------------------------------------------------------------
  funInfo: FunsrightInfo = {};
  addPermission = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  editPermission = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    unitProperty: [1, []], // 條件篩選, radioButton
    editortext: [, ], // editor text
  });
  // ----------------------------------------------------------------
  crudstatus: CRUDStatus = CRUDStatus.Read;
  formTitle: string = '';
  showConfirm: boolean = false;
  submitted = false;

  // ----------------------------------------------------------------
  unitPropertyOptions: any[] = [
    { value: 1, label: '基本單位' },
    { value: 2, label: '包裝單位' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    ) {
  }

  ngOnInit(): void {
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
    return this.funInfo.permissions?.includes(PermissionsInfo.add) as boolean;
  }

  canEdit(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.edit) as boolean;
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
    this.router.navigate(['/TLS5000/TLS51050']);
  }
}
