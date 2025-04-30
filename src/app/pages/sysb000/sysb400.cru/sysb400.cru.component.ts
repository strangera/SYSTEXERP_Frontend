import { option, Sys300m } from './../sysb300m/sysb300m';
import { Sysb300Service } from './../../../service/sysb/sysb300.service';
import { Sysb400Service } from './../../../service/sysb/sysb400.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Shared
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
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
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [, [Validators.required]], //id

    org_id: ['', [Validators.required, Validators.maxLength(20)]], // 組織代碼
    org_name: ['', [Validators.required, Validators.maxLength(40)]], // 組織名稱
    p_org_id: ['', [Validators.required, Validators.maxLength(20)]], // 上層組織代碼
    level_id: ['', [Validators.required, Validators.maxLength(2)]], // 組織階層代碼
    level_name: ['', [Validators.required, Validators.maxLength(40)]], // 組織階層名稱
    p_level_id: ['', [Validators.required, Validators.maxLength(2)]], // 上層組織階層代碼
    p_level_name: ['', [Validators.required, Validators.maxLength(40)]], // 上層組織階層名稱
    stop_flag: ['N', [Validators.required, Validators.maxLength(1)]], // 是否停用
  });
  showConfirm = false;

  upgroup_Options: option[] = [];
  whetherOptions: option[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  // ----------------------------------------------------------------

  constructor(
    private validationService: ValidationService,
    private sysb400Service: Sysb400Service,
    private sysb300Service: Sysb300Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('410004', this.dataForm);
    this.loadOptions();
  }

  loadOptions() {
    const query = {
      level_id: '',
      org_id: '',
      org_name: '',
    };

    console.log('查詢條件', query);
    this.sysb300Service.querySYSB300(query).subscribe((response) => {
      this.upgroup_Options = response.Data.map((item: Sys300m) => ({
        label: item.level_id,
        value: item.level_name,
      }));
      console.log('300 options查詢結果', this.upgroup_Options);
    });
  }

  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            const body = {
              org_id: this.dataForm.controls.org_id.value,
              org_name: this.dataForm.controls.org_name.value,
              p_org_id: this.dataForm.controls.p_org_id.value,
              level_id: this.dataForm.controls.level_id.value,
              p_level_id: this.dataForm.controls.p_level_id.value,
              stop_flag: this.dataForm.controls.stop_flag.value,
            };
            console.log('insert', body);
            this.sysb400Service.insertSYSB400(body).subscribe(() => {
              this.messageService.successBubble('新增成功');
              this.onCancel(); // 新增成功後返回查詢頁面
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            const body = {
              id: this.dataForm.controls.id.value,
              // org_id: this.dataForm.controls.org_id.value,
              org_name: this.dataForm.controls.org_name.value,
              p_org_id: this.dataForm.controls.p_org_id.value,
              level_id: this.dataForm.controls.level_id.value,
              p_level_id: this.dataForm.controls.p_level_id.value,
              stop_flag: this.dataForm.controls.stop_flag.value,
            };
            console.log('update', body);
            this.sysb400Service.updateSYSB400(body).subscribe(() => {
              this.messageService.successBubble('更新成功');
              this.onCancel(); // 更新成功後返回查詢頁面
            });
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
