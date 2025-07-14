import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Shared
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
//
import { TranslateService } from '@ngx-translate/core';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Sysb600Service } from '../../../service/api/sys/sysb600.service';
import { Sysb600m } from '../../../shared/models/sys/sysb000.module';

@Component({
  selector: 'app-sysb600.cru',
  templateUrl: './sysb600.cru.component.html',
  styleUrl: './sysb600.cru.component.scss',
})
// 樓層基本資料維護作業 CRU
export class SYSB600CRUComponent
  extends BasicCruPageComponent<Sysb600m>
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [],
    floor_no: ['', [Validators.required, Validators.maxLength(2)]], // 樓層編號
    floor_desc: ['', [Validators.required, Validators.maxLength(30)]], // 樓層名稱
  });
  //
  // ----------------------------------------------------------------
  constructor(
    private sysb600Service: Sysb600Service,
    private translate: TranslateService,
    //
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('SYSB600', this.dataForm);
  }
  // ----------------------------------------------------------------

  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.sysb600Service.insertSYSB600(frm.value).subscribe(() => {
              this.messageService.successBubble('新增成功');
              // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
              this.dataForm.reset(); // 重置表單
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.sysb600Service.updateSYSB600(frm.value).subscribe(() => {
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
