import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TDS1008Data } from '../fin11040/fin11040.model';
import { Fin11040Service } from '../../../service/api/fin/fin11040.service';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgIf } from '@angular/common';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { SystemOptionsService } from '@service/system/sys1000.service';
//1.1.1.4 發票格式代號維護 CRU
@Component({
  selector: 'app-fin11040-cru',
  templateUrl: './fin11040-cru.component.html',
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
    CalendarComponent,
    TranslateModule,
  ],
})
export class FIN11040CRUComponent extends BasicCruPageComponent<TDS1008Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ID: [{ value: 0, disabled: true }],
    INV_ItemNo: ['', [Validators.required, Validators.maxLength(2), this.validationService.alphanumericValidator]], // 品項代號
    INV_ItemName: ['', [Validators.required, Validators.maxLength(30)]], // 品項名稱
    INV_UsageType: [null, [Validators.required]], // 使用別
    CRT_Date: [{ value: null, disabled: true }],       // 建立日期
    CRT_USR_No: [{ value: '', disabled: true }],       // 建立人員
    CRT_USR_Name: [{ value: '', disabled: true }],     // 建立人員姓名
    UPD_Date: [{ value: null, disabled: true }],       // 變更日期
    UPD_USR_No: [{ value: '', disabled: true }],       // 變更人員
    UPD_USR_Name: [{ value: '', disabled: true }],     // 變更人員姓名
  });
  INV_UsageTypeOptions = SystemOptionsService.getOptions('T205');
  constructor(
    private fin11040Service: Fin11040Service,
    private validationService: ValidationService
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN11040', this.dataForm);
    if (!this.isFormCreateable) {
      this.dataForm.get('INV_ItemNo')?.disable();
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      if (this.isFormCreateable) {
        const payload = this.buildInsertBody(frm);
        this.fin11040Service.insertFIN11040(payload)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe({
            next: (res) => {
              this.dataForm.reset();
              console.log(res);
              this.messageService.successBubble(res.Message);
            }
          });
      } else if (this.isFormEditable) {
        const payload = this.buildUpdateBody(frm);
        this.fin11040Service.updateFIN11040(payload)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe({
            next: (res) => {
              this.onCancel();
              console.log(res);
              this.messageService.successBubble(res.Message);
            }
          });
      }
    });
  }

  buildInsertBody(frm: FormGroup): {
    insertFIN11040Detail: {
      INV_ItemNo: string;
      INV_ItemName: string;
      INV_UsageType: string;
    }[]
  } {
    return {
      insertFIN11040Detail: [
        {
          INV_ItemNo: frm.get('INV_ItemNo')?.value,
          INV_ItemName: frm.get('INV_ItemName')?.value,
          INV_UsageType: frm.get('INV_UsageType')?.value,
        }
      ]
    };
  }
  buildUpdateBody(frm: FormGroup): {
    ID: number;
    INV_ItemNo: string;
    INV_ItemName: string;
    INV_UsageType: string;
  } {
    return {
      ID: frm.get('ID')?.value,
      INV_ItemNo: frm.get('INV_ItemNo')?.value,
      INV_ItemName: frm.get('INV_ItemName')?.value,
      INV_UsageType: frm.get('INV_UsageType')?.value,
    };
  }
}
