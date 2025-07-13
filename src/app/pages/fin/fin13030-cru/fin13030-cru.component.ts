import { Component } from '@angular/core';
import { FIN13030Data, FIN13030Service } from '../../../service/api/fin/fin13030.service';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { DropdownOption } from '../../../shared/models/api/base-api.interface';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-fin13030-cru',
    templateUrl: './fin13030-cru.component.html',
    styleUrl: './fin13030-cru.component.scss',
    standalone: true,
    imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, CalendarComponent, InputNumberComponent, DropdownComponent, NgIf]
})
export class FIN13030CRUComponent extends BasicCruPageComponent<FIN13030Data> {
  dataForm = this.formBuilder.group({
    invNo: [''], // 發票號碼
    invDate: [''], // 發票日期
    invYm: [''], // 資料所屬年月
    declareYm: [''], // 申報年月
    buyerTaxNo: ['', [Validators.maxLength(10)]], // 買受人統一編號
    goodsName: ['', [Validators.maxLength(20)]], // 貨物或勞務名稱
    goodsQty: [''], // 貨物或勞務數量
    exportMethod: [''], // 外銷方式
    docNo: ['', [Validators.maxLength(10)]], // 證明文件號碼
    docName: ['', [Validators.maxLength(20)]], // 證明文件名稱
    exportNo: ['', [Validators.maxLength(10)]], // 出口報單號碼
    exportType: [''], // 出口報單類別
    nonCustomsAmt: [''], // 非經海關出口金額
    customsAmt: [''], // 經海關出口金額
    exportDate: [''], // 輸出或結匯日期
    remark: ['', [Validators.maxLength(100)]], // 備註
    ...createPaginationConfig([{ field: 'invNo', order: -1 }]), // 分頁和排序參數
  });
  exportMethodOptions: DropdownOption[] = [];
  exportTypeOptions: DropdownOption[] = [];

  constructor(private fin13030Service: FIN13030Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13030', this.dataForm);
    this.loadOptions();
    if (this.crudstatus === CRUDStatus.Edit) {
      this.setUnEditableFields();
    }
  }

  loadOptions() {
    // 載入外銷方式選項
    this.fin13030Service.getExportMethodOptions().subscribe(response => {
      this.exportMethodOptions = response.Data
    });

    // 載入出口報單類別選項
    this.fin13030Service.getExportTypeOptions().subscribe(response => {
      this.exportTypeOptions = response.Data
    });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.fin13030Service.insertFIN13030(form.getRawValue()).subscribe(() => {
              this.messageService.successBubble('新增成功');
              this.dataForm.reset();
            });
          }
          break;

        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.fin13030Service.updateFIN13030(form.getRawValue()).subscribe(() => {
              this.messageService.successBubble('更新成功');
              this.onCancel();
            });
          }
          break;
      }
    });
  }

  // 編輯模式下有些欄位不可修改
  private setUnEditableFields(): void {
    this.dataForm.get('invNo')?.disable();
    this.dataForm.get('invDate')?.disable();
  }
}
