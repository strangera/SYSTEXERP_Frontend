import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ASS11100Service } from '../../../service/api/ass/ass11100.service';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { ASS11100Data } from '../ass11100/ass11100.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

//3.1.1.10 倉別設定作業 CRU
@UntilDestroy()
@Component({
  selector: 'app-ass11100-cru',
  templateUrl: './ass11100-cru.component.html',
  styleUrl: './ass11100-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    NgIf,
    TranslateModule
  ]
})
export class ASS11100CRUComponent extends BasicCruPageComponent<ASS11100Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [],
    WH_ID: ['', [Validators.required, Validators.maxLength(10)]], // 倉別，必填，最長10個字
    WH_NAME: ['', [Validators.required, Validators.maxLength(50)]], // 倉別名稱，必填，最長50個字
    ATT_ORG_ID: [null as string | null, [Validators.required]], // 部門代號，必填
    NOTES: ['', [Validators.maxLength(100)]], // 備註，非必填，最長100個字
  });

  organizationOptions: Array<{ label: string; value: string }> = [];

  constructor(
    private ass11100Service: ASS11100Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11100', this.dataForm);
    this.loadOrganizationOptions();
  }

  // 載入部門下拉選單
  loadOrganizationOptions(): void {
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response) => {
          if (response.Status === '0000' && response.Data) {
            this.organizationOptions = response.Data.map(item => ({
              label: `${item.No || ''}-${item.Name || ''}`,
              value: item.No || ''
            }));
          }
        },
        error: (err) => {
          console.error('載入部門下拉選單失敗:', err);
        }
      });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            const formValue = frm.getRawValue();
            this.ass11100Service.insertASS11100(formValue).subscribe({
              next: (response) => {
                if (response.Status === '0000') {
                  this.messageService.successBubble('新增成功');
                  this.dataForm.reset(); // 重置表單
                  this.submitted = false;
                } else {
                  this.messageService.errorBubble(response.Message || '新增失敗');
                }
                this.loading = false;
                this.messageService.unblockUi();
              },
              error: (err) => {
                console.error('新增失敗:', err);
                this.loading = false;
                this.messageService.unblockUi();
              }
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            const formValue = frm.getRawValue();
            this.ass11100Service.updateASS11100(formValue).subscribe({
              next: (response) => {
                if (response.Status === '0000') {
                  this.messageService.successBubble('更新成功');
                  this.onCancel(); // 儲存後，會返回列表
                } else {
                  this.loading = false;
                  this.messageService.unblockUi();
                }
              },
              error: (err) => {
                console.error('更新失敗:', err);
                this.loading = false;
                this.messageService.unblockUi();
              }
            });
          }
          break;
      }
    });
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }
}
