import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownOption } from '../../../shared/models/api/base-api.interface';
import { DatePipe, NgIf } from '@angular/common';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { finalize } from 'rxjs';
import { ValidationService } from '@shared/service/validation.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS53010Data, TLS53010Service } from '@service/api/tls/tls53010.service';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';

@Component({
  selector: 'app-tls53010-cru',
  templateUrl: './tls53010-cru.component.html',
  styleUrl: './tls53010-cru.component.scss',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    TranslateModule,
    InputTextareaComponent
  ]
})
export class TLS53010CRUComponent extends BasicCruPageComponent<TLS53010Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ID: [0], // 資料識別碼
    PST_No: [''], // 盤點單編號
    HOS_No: [''], // 倉別代碼
    LOGO_No: [''], // 品牌代碼
    PST_Date: [''], // 盤點基準日期
    PST_Status: ['0'], // 盤點單狀態，預設為草稿
    PST_Remark: [''], // 備註
  });

  // 下拉選單
  hosOptions: any[] = [];   // 倉別選項
  logoOptions: any[] = [];  // 品牌選項
  // 盤點單狀態選項 TODO: 待定義
  pstStatusOptions: any[] = [
    { value: '0', label: '未完成' },
    { value: '1', label: '已完成' },
    { value: '2', label: '已取消' }
  ];

  constructor(
    private tls53010Service: TLS53010Service,
    private datePipe: DatePipe,
    private validationService: ValidationService,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS53010', this.dataForm);
    this.loadOptions();
    this.setReadOnlyFields();

    if (this.crudstatus === 'Create') {
      // 新增時產生盤點單編號
      this.generatePSTNo();
    }
  }

  onSubmit(form: FormGroup): void {
    // const formValue = form.getRawValue();
    // this.handleSubmit(form, () => {
    //   switch (this.crudstatus) {
    //     case CRUDStatus.Create:
    //       if (this.canAdd()) {
    //         const rb: TLS53010InsertRequest = {
    //           PST_No: formValue.PST_No,
    //           HOS_No: formValue.HOS_No,
    //           LOGO_No: formValue.LOGO_No,
    //           PST_Date: this.datePipe.transform(formValue.PST_Date, 'yyyy-MM-dd') ?? '',
    //           PST_Status: formValue.PST_Status,
    //           PST_Remark: formValue.PST_Remark
    //         };
    //         this.tls53010Service.insertTLS53010(rb)
    //           .pipe(untilDestroyed(this), finalize(() => this.loading = false))
    //           .subscribe(() => {
    //             this.messageService.successBubble('新增成功');
    //             this.onCancel();
    //           });
    //       }
    //       break;
    //     case CRUDStatus.Edit:
    //       if (this.canEdit()) {
    //         const rb: TLS53010UpdateRequest = {
    //           ID: formValue.ID,
    //           PST_No: formValue.PST_No,
    //           HOS_No: formValue.HOS_No,
    //           LOGO_No: formValue.LOGO_No,
    //           PST_Date: this.datePipe.transform(formValue.PST_Date, 'yyyy-MM-dd') ?? '',
    //           PST_Status: formValue.PST_Status,
    //           PST_Remark: formValue.PST_Remark
    //         };
    //         this.tls53010Service.updateTLS53010(rb)
    //           .pipe(untilDestroyed(this), finalize(() => this.loading = false))
    //           .subscribe(() => {
    //             this.messageService.successBubble('更新成功');
    //             this.onCancel();
    //           });
    //       }
    //       break;
    //   }
    // });
  }

  loadOptions() {
    // 倉別選項
    this.dropDownListService.getPOS2034Options()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.hosOptions = response.Data.map(item => ({
          value: item.No,
          label: `${item.No}-${item.Name}`
        }));
      });

    // 品牌選項
    this.dropDownListService.queryPLULOGO_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.logoOptions = response.Data.map(item => ({
          value: item.No,
          label: `${item.No}-${item.Name}`
        }));
      });
  }

  setReadOnlyFields() {
    // 盤點單編號不能修改
    this.dataForm.get('PST_No')?.disable();
  }

  generatePSTNo() {
    // 產生盤點單編號
    this.dataForm.patchValue({ PST_No: '系統自動產生' });
  }
}