import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// Shared
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
//
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { Sysb500Service } from '../../../service/api/sys/sysb500.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { Sysb500m } from '../../../shared/models/sys/sysb000.model';

@Component({
  selector: 'app-sysb500.cru',
  templateUrl: './sysb500.cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    NgIf,
    TranslateModule,
  ],
})
// 區域基本資料維護作業 CRU
export class SYSB500CRUComponent
  extends BasicCruPageComponent<Sysb500m>
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [],
    area_no: ['', [Validators.required, Validators.maxLength(2), this.validationService.noChineseValidator]], // 區域別編號
    area_desc: ['', [Validators.required, Validators.maxLength(20)]], // 區域別名稱
  });
  // ----------------------------------------------------------------
  constructor(
    private sysb500Service: Sysb500Service,
    private validationService: ValidationService,
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
              // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
              this.dataForm.reset(); // 重置表單
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
