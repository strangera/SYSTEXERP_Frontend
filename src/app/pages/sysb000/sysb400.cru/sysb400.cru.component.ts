import { Sysb400Service } from './../../../service/sysb/sysb400.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Shared
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { TranslateService } from '@ngx-translate/core';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ValidationService } from '../../../shared/service/validation.service';

interface Organization {
  org_id: number; // 組織代碼
  org_name: string; // 組織名稱
  level_id: string; // 階層代碼
  level_name: string; // 階層名稱
  p_level_id: string; // 上層組織代碼
  stop_flag: boolean; // 是否停用
  CRT_Date: Date;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: Date;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

@Component({
  selector: 'app-sysb400.cru',
  templateUrl: './sysb400.cru.component.html',
  styleUrl: './sysb400.cru.component.scss',
})
// 組織碼設定作業 CRU
export class SYSB400CRUComponent
  extends BasicCruPageComponent<Organization>
  implements OnInit
{
  // // ----------------------------------------------------------------
  // dataForm = this.formBuilder.nonNullable.group({
  //   // SYS3100 + SYS3000
  //   org_id: ['', [Validators.required, Validators.maxLength(20)]], // 組織代碼
  //   org_name: ['', [Validators.required, Validators.maxLength(40)]], // 組織名稱
  //   p_org_id: ['', [Validators.required, Validators.maxLength(20)]], // 上層組織代碼
  //   level_id: ['', [Validators.required, Validators.maxLength(2)]], // 組織階層代碼
  //   p_level_id: ['', [Validators.required, Validators.maxLength(2)]], // 上層組織代碼
  //   stop_flag: ['N', [Validators.required, Validators.maxLength(1)]], // 是否停用
  // });
  // //
  // upgroup_Options: any[] = [
  //   { value: 0, label: '全公司' },
  //   { value: 1, label: '室/部' },
  //   { value: 2, label: 'Team' },
  //   { value: 3, label: '樓/組' },
  // ];

  // whetherOptions: any[] = [
  //   { value: 'Y', label: '是' },
  //   { value: 'N', label: '否' },
  // ];
  // // ----------------------------------------------------------------
  // constructor(
  //   private translate: TranslateService,
  //   private sysb400Service: Sysb400Service,
  // ) {
  //   super(); // 呼叫父類建構子
  // }
  // ngOnInit(): void {
  //   this.initializePage('410004', this.dataForm);
  // }

  // onSubmit(frm: FormGroup) {
  //   // 修改：使用父類的 handleSubmit 方法
  //   console.log('hello');
  //   this.handleSubmit(frm, () => {
  //     switch (this.crudstatus) {
  //       case CRUDStatus.Create:
  //         if (this.canAdd()) {
  //           console.log('Create.value', frm.value);
  //           // this.sysb400Service.insertSYSB400(frm.value).subscribe((response: any) => {
  //           //   this.messageService.successBubble('新增成功');
  //           //   this.onCancel(); // 新增成功後返回查詢頁面
  //           // });
  //         }
  //         break;
  //       case CRUDStatus.Edit:
  //         if (this.canEdit()) {
  //           console.log('Edit.value', frm.value);
  //           // this.sysb400Service.updateSYSB400(frm.value).subscribe((response: any) => {
  //           //   this.messageService.successBubble('更新成功');
  //           //   this.onCancel(); // 更新成功後返回查詢頁面
  //           // });
  //         }
  //         break;
  //     }
  //   });
  // }

  // // 修改：submitForm 調用父類 handleSubmit
  // submitForm(frm: FormGroup) {
  //   this.onSubmit(frm);
  // }

  // onClearForm() {
  //   this.dataForm.reset(); // 重置表單
  // }

  // onCancel() {
  //   this.router.navigate(['/SYSB000/SYSB400']);
  // }

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [, [Validators.required]], //id
    level_id: ['', [Validators.required, Validators.maxLength(2)]], // 組織階層代碼
    org_id: ['', [Validators.required, Validators.maxLength(20)]], // 組織代碼
    org_name: ['', [Validators.required, Validators.maxLength(40)]], // 組織名稱
    p_org_id: ['', [Validators.maxLength(20)]], // 上層組織代碼

    p_level_id: ['', [Validators.maxLength(2)]], // 上層組織代碼
    stop_flag: ['N', [Validators.required, Validators.maxLength(1)]], // 是否停用
  });
  showConfirm = false;

  // ----------------------------------------------------------------

  constructor(
    private validationService: ValidationService,
    private sysb400Service: Sysb400Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('410004', this.dataForm);
  }

  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // 待實現：調用 API 進行新增
            // this.sysb400Service
            //   .insertSYSB400(frm.value)
            //   .subscribe((response: any) => {
            //     this.messageService.successBubble('新增成功');
            //     this.onCancel(); // 新增成功後返回查詢頁面
            //   });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // 待實現：調用 API 進行更新
            console.log('update', frm.value);
            // this.sysb400Service
            //   .updateSYSB400(frm.value)
            //   .subscribe((response: any) => {
            //     this.messageService.successBubble('更新成功');
            //     this.onCancel(); // 更新成功後返回查詢頁面
            //   });
          }
          break;
      }
    });
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }

  onCancel() {
    this.router.navigate(['/SYSB000/SYSB400']);
  }
}
