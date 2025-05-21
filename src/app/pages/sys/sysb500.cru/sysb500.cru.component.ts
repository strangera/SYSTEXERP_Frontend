import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Shared
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
//
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Sysb500m } from '../../../shared/models/sys/sysb000.module';
import { Sysb500Service } from '../../../service/API/sys/sysb500.service';

@Component({
  selector: 'app-sysb500.cru',
  templateUrl: './sysb500.cru.component.html',
  styleUrl: './sysb500.cru.component.scss',
})
// 區域基本資料維護作業 CRU
export class SYSB500CRUComponent
  extends BasicCruPageComponent<Sysb500m>
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [],
    area_no: ['', [Validators.required, Validators.maxLength(2)]], // 區域別編號
    area_desc: ['', [Validators.required, Validators.maxLength(30)]], // 區域別名稱
  });
  // ----------------------------------------------------------------
  constructor(
    private sysb500Service: Sysb500Service,
    //
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('SYSB500', this.dataForm);
  }

  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.sysb500Service.insertSYSB500(frm.value).subscribe(() => {
              this.messageService.successBubble('新增成功');
              this.onCancel(); // 新增成功後返回查詢頁面
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.sysb500Service.updateSYSB500(frm.value).subscribe(() => {
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
