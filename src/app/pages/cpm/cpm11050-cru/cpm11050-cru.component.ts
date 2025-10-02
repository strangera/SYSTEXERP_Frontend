import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CPM11050Data, InsertCPM11050Request, UpdateCPM11050Request, CPM11050Service } from '../../../service/api/cpm/cpm11050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgIf } from '@angular/common';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cpm11050-cru',
  templateUrl: './cpm11050-cru.component.html',
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
export class CPM11050CRUComponent extends BasicCruPageComponent<CPM11050Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    SYS_Code: ['', [Validators.required, Validators.maxLength(60)]],   // 物品類別代碼
    SYS_Name: ['', [Validators.required, Validators.maxLength(60)]]    // 物品類別名稱
  });

  constructor(
    private cpm11050Service: CPM11050Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11050', this.dataForm);
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
        const insertRequest: InsertCPM11050Request = {
          SYS_Code: formValue.SYS_Code || '',
          SYS_Name: formValue.SYS_Name || ''
        }
        this.cpm11050Service.insertCPM11050(insertRequest)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(() => {
            this.messageService.successBubble('新增成功');
            this.dataForm.reset(); // 重置表單
          });
      }
      // 修改
      else if (this.crudstatus === CRUDStatus.Edit) {
        const updateRequest: UpdateCPM11050Request = {
          ID: this.rowdata?.ID!,
          SYS_Name: formValue.SYS_Name || ''
        }
        this.cpm11050Service.updateCPM11050(updateRequest)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(() => {
            this.messageService.successBubble('修改成功');
            this.onCancel();  // 返回查詢頁
          });
      }
    });
  }
}