import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { FIN11050Data, FIN11050InsertRequest, FIN11050UpdateRequest, Fin11050Service } from '../../../service/api/fin/fin11050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-fin11050-cru',
  templateUrl: './fin11050-cru.component.html',
  styleUrl: './fin11050-cru.component.scss',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
  ]
})
export class FIN11050CRUComponent extends BasicCruPageComponent<FIN11050Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [0], // 主鍵
    mid: [0], // 關聯ID
    INV_GUIType: ['', [Validators.required, Validators.maxLength(2)]], // 格式代號
    INV_GUIName: ['', [Validators.required, Validators.maxLength(100)]], // 格式名稱
    CRT_Date: [''], // 建立日期
    CRT_USR_No: [''], // 建立人員編號
    CRT_USR_Name: [''], // 建立人員名稱
    UPD_Date: [''], // 更新日期
    UPD_USR_No: [''], // 更新人員編號
    UPD_USR_Name: [''], // 更新人員名稱
  });

  constructor(private fin11050Service: Fin11050Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11050', this.dataForm);
    this.setReadOnlyFields();
  }

  onSubmit(form: FormGroup): void {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            const rb: FIN11050InsertRequest = {
              INV_GUIType: formValue.INV_GUIType,
              INV_GUIName: formValue.INV_GUIName,
            };
            this.fin11050Service.insertFIN11050(rb)
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe(() => {
                this.messageService.successBubble('新增成功');
                this.dataForm.reset();
              });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            const rb: FIN11050UpdateRequest = {
              id: formValue.id,
              INV_GUIType: formValue.INV_GUIType,
              INV_GUIName: formValue.INV_GUIName,
            };
            this.fin11050Service.updateFIN11050(rb)
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe(() => {
                this.messageService.successBubble('更新成功');
                this.onCancel();
              });
          }
          break;
      }
    });
  }

  setReadOnlyFields() {
    // 編輯時「格式代號」不可異動
    if (this.crudstatus === 'Edit') {
      this.dataForm.get('INV_GUIType')?.disable();
    }
  }
}