import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CPM12030Data, Cpm12030Service } from '@service/api/cpm/cpm12030.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
@Component({
  selector: 'app-cpm12030-cru',
  templateUrl: './cpm12030-cru.component.html',
  standalone: true,
  imports: [InputTextareaComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, ButtonComponent, NgIf, TranslateModule]
})
export class CPM12030CRUComponent extends BasicCruPageComponent<CPM12030Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ID: [0],
    KIND_ID: [null, [Validators.required, Validators.maxLength(10)]], // 子類別編號
    KIND_SubID: [null, [Validators.required, Validators.maxLength(40)]], // 責任單位名稱類別名稱
    KIND_SubName: [null, [Validators.required]], // 客戶意見主類別
    remark: [null], // 備註
  });
  KIND_IDOptions = [
    { value: 'T001', label: '意見反映' },
    { value: 'T002', label: '廣告業務' },
    { value: 'T003', label: '活動、場地洽談' },
    { value: 'T004', label: '承租店櫃' },
    { value: 'T005', label: '合作提案' },
  ];

  constructor(
    private readonly cpm12030Service: Cpm12030Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM12030', this.dataForm);
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const params = {
        ...frm.getRawValue()
      }
      const $request = this.isFormCreateable ? this.cpm12030Service.createCPM12030(params) : this.cpm12030Service.updateCPM12030(params);
      $request.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.messageService.successBubble(response.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
        } else {
          this.onCancel();
        }
      })
    })
  }
}
