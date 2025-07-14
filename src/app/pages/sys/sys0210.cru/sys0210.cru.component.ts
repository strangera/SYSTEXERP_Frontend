import { Sys0210Service } from './../../../service/api/sys/sys0210.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Permissions
// Shared
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { tblUser } from '../../../shared/models/sys/sysb000.module';
// 4-2-2-1角色基本資料維護

// 角色基本資料維護 CRU
@Component({
  selector: 'app-sys0210-cru',
  templateUrl: './sys0210.cru.component.html',
  styleUrls: ['./sys0210.cru.component.scss'],
})
export class SYS0210CRUComponent
  extends BasicCruPageComponent<tblUser>
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.group({
    id: [], // ID
    Role_No: ['', [Validators.required, Validators.maxLength(10)]], // 角色代號
    Role_Name: ['', [Validators.required, Validators.maxLength(30)]], // 角色名稱
    Description: ['', [Validators.maxLength(50)]], // 角色註記
  });

  // ----------------------------------------------------------------
  constructor(
    private sys0210Service: Sys0210Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0210', this.dataForm);
  }

  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.sys0210Service.createRole(frm.value).subscribe(() => {
              this.messageService.successBubble('新增成功');
              this.onCancel(); // 新增成功後返回查詢頁面
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            console.log('frm.value', frm.value);
            this.sys0210Service.updateRole(frm.value).subscribe(() => {
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
}
