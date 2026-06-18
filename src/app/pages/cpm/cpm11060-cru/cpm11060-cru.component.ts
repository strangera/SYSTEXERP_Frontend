import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { CPM11060Data, CPM11060Service, InsertCPM11060Request, UpdateCPM11060Request } from '../../../service/api/cpm/cpm11060.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-cpm11060-cru',
  templateUrl: './cpm11060-cru.component.html',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TranslateModule
  ]
})
export class CPM11060CRUComponent extends BasicCruPageComponent<CPM11060Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    SYS_Code: ['', [Validators.required, Validators.maxLength(60)]],   // 遺拾物品地點代碼
    SYS_Name: ['', [Validators.required, Validators.maxLength(60)]]    // 遺拾物品地點名稱
  });

  constructor(
    private cpm11060Service: CPM11060Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11060', this.dataForm);
    if (this.crudstatus === CRUDStatus.Edit) {
      // 編輯時 SYS_Code 不可編輯
      this.dataForm.get('SYS_Code')?.disable();
    }
  }

  onSubmit(form: FormGroup): void {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      // 新增
      if (this.crudstatus === CRUDStatus.Create) {
        const insertRequest: InsertCPM11060Request = {
          SYS_Code: formValue.SYS_Code || '',
          SYS_Name: formValue.SYS_Name || ''
        }
        this.cpm11060Service.insertCPM11060(insertRequest)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(() => {
            this.messageService.successBubble('新增成功');
            this.dataForm.reset(); // 重置表單
          });
      }
      // 修改
      else if (this.crudstatus === CRUDStatus.Edit) {
        const updateRequest: UpdateCPM11060Request = {
          ID: this.rowdata?.ID!,
          SYS_Name: formValue.SYS_Name || ''
        }
        this.cpm11060Service.updateCPM11060(updateRequest)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(() => {
            this.messageService.successBubble('修改成功');
            this.onCancel();  // 返回查詢頁
          });
      }
    });
  }
}