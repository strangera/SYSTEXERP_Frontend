import { Component } from '@angular/core';
import { FIN13030Data, FIN13030GetZeroTaxGUIRequest, FIN13030GetZeroTaxGUIResponse, FIN13030InsertRequest, FIN13030Service, FIN13030UpdateRequest } from '../../../service/api/fin/fin13030.service';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropdownOption } from '../../../shared/models/api/base-api.interface';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { DatePipe, NgIf } from '@angular/common';
import { ValidationService } from '../../../shared/service/validation.service';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-fin13030-cru',
  templateUrl: './fin13030-cru.component.html',
  styleUrl: './fin13030-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarComponent,
    InputNumberComponent,
    DropdownComponent,
    NgIf
  ],
})
export class FIN13030CRUComponent extends BasicCruPageComponent<FIN13030Data> {
  dataForm = this.formBuilder.group({
    ID: [0], // 主鍵ID 隱藏欄位
    INV_GUINo: ['', [Validators.required, Validators.maxLength(10)]], // 發票號碼
    INV_GUIDate: ['', Validators.required], // 發票日期
    INV_YM: ['', Validators.required], // 資料所屬年月
    INV_DeclareYM: ['', Validators.required], // 申報年月
    INV_Name: ['', [Validators.required, Validators.maxLength(60)]], // 買受人名稱
    GoodsOrServicesName: ['', Validators.maxLength(100)], // 貨物或勞務名稱
    GoodsQty: [0, [this.validationService.numberValidator]], // 貨物或勞務數量
    ExportMethod: ['', Validators.required], // 外銷方式
    INV_PassType: ['', Validators.required], // 通關方式註記
    INV_DocName: ['', [Validators.maxLength(20)]], // 證明文件名稱
    INV_DocNo: ['', [Validators.maxLength(10)]], // 證明文件號碼
    NonCustomsExportAmt: [0, [this.validationService.numberValidator]], // 非經海關出口金額
    INV_ExportType: [''], // 出口報單類別
    INV_ExportNo: ['', [Validators.maxLength(10)]], // 出口報單號碼
    CustomsExportAmt: [0, [this.validationService.numberValidator]], // 經海關出口金額
    ExportDate: ['', Validators.required], // 輸出或結匯日期
    INV_Remark: ['', Validators.maxLength(100)], // 備註
  });

  zeroTaxGUIData!: FIN13030GetZeroTaxGUIResponse;

  exportMethodOptions: DropdownOption[] = [];
  exportTypeOptions: DropdownOption[] = [];
  invPassTypeOptions: DropdownOption[] = [];

  constructor(
    private fin13030Service: FIN13030Service,
    private validationService: ValidationService,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13030', this.dataForm);
    this.loadOptions();
    // 帶入零稅率發票資料
    if (this.crudstatus === CRUDStatus.Create) {
      const state = this.router.lastSuccessfulNavigation?.extras.state;
      this.zeroTaxGUIData = state?.['rowdata'];
      // 帶入表單預設值
      this.dataForm.patchValue({
        INV_GUINo: this.zeroTaxGUIData.INV_GUINo,
        INV_GUIDate: this.zeroTaxGUIData.INV_GUIDate,
        INV_YM: this.zeroTaxGUIData.INV_YM,
        INV_DeclareYM: this.zeroTaxGUIData.INV_DeclareYM,
      });
    }
    else if (this.crudstatus === CRUDStatus.Edit) {
      this.getZeroTaxGUIData(this.dataForm);
    }
    this.setUnEditableFields();
    console.log('zeroTaxGUIData:', this.zeroTaxGUIData);
  }

  loadOptions() {
    this.exportMethodOptions = this.fin13030Service.getExportMethodOptions();
    this.exportTypeOptions = this.fin13030Service.getINV_ExportTypeOptions();
    this.invPassTypeOptions = this.fin13030Service.getINV_PassTypeOptions();
  }

  onSubmit(form: FormGroup): void {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            const rb: FIN13030InsertRequest = {
              INV_GUINo: formValue.INV_GUINo,
              INV_YM: this.datePipe.transform(formValue.INV_YM, 'yyyyMM') ?? '',
              INV_DeclareYM: this.datePipe.transform(formValue.INV_DeclareYM, 'yyyyMM') ?? '',
              INV_Name: formValue.INV_Name,
              GoodsOrServicesName: formValue.GoodsOrServicesName,
              GoodsQty: formValue.GoodsQty,
              ExportMethod: formValue.ExportMethod,
              INV_DocName: formValue.INV_DocName,
              INV_DocNo: formValue.INV_DocNo,
              NonCustomsExportAmt: formValue.NonCustomsExportAmt,
              INV_ExportType: formValue.INV_ExportType,
              INV_ExportNo: formValue.INV_ExportNo,
              CustomsExportAmt: formValue.CustomsExportAmt,
              ExportDate: formValue.ExportDate,
              INV_Remark: formValue.INV_Remark,
              INV_PassType: formValue.INV_PassType,
              // 從 zeroTaxGUIData 取得的欄位
              INV_GUITrack: this.zeroTaxGUIData.INV_GUITrack,
              INV_GUIType: this.zeroTaxGUIData.INV_GUIType,
              INV_ZeroTax: this.zeroTaxGUIData.INV_ZeroTax,
              INV_SeqNo: this.zeroTaxGUIData.INV_SeqNo
            };
            this.fin13030Service.insertFIN13030(rb)
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe(() => {
                this.messageService.successBubble('新增成功');
                this.dataForm.reset();
              });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            const rb: FIN13030UpdateRequest = {
              ID: formValue.ID,
              INV_GUINo: formValue.INV_GUINo,
              INV_YM: this.datePipe.transform(formValue.INV_YM, 'yyyyMM') ?? '',
              INV_DeclareYM: this.datePipe.transform(formValue.INV_DeclareYM, 'yyyyMM') ?? '',
              INV_Name: formValue.INV_Name,
              GoodsOrServicesName: formValue.GoodsOrServicesName,
              GoodsQty: formValue.GoodsQty,
              ExportMethod: formValue.ExportMethod,
              INV_DocName: formValue.INV_DocName,
              INV_DocNo: formValue.INV_DocNo,
              NonCustomsExportAmt: formValue.NonCustomsExportAmt,
              INV_ExportType: formValue.INV_ExportType,
              INV_ExportNo: formValue.INV_ExportNo,
              CustomsExportAmt: formValue.CustomsExportAmt,
              ExportDate: formValue.ExportDate,
              INV_Remark: formValue.INV_Remark,
              INV_PassType: formValue.INV_PassType,
              // 從 zeroTaxGUIData 取得的欄位
              INV_GUITrack: this.zeroTaxGUIData.INV_GUITrack,
              INV_GUIType: this.zeroTaxGUIData.INV_GUIType,
              INV_ZeroTax: this.zeroTaxGUIData.INV_ZeroTax,
              INV_SeqNo: this.zeroTaxGUIData.INV_SeqNo
            };

            this.fin13030Service.updateFIN13030(rb)
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

  private setUnEditableFields(): void {
    this.dataForm.get('INV_GUINo')?.disable();
    this.dataForm.get('INV_GUIDate')?.disable();
    this.dataForm.get('INV_YM')?.disable();
    this.dataForm.get('INV_DeclareYM')?.disable();
  }

  getZeroTaxGUIData(form: FormGroup): void {
    const rb: FIN13030GetZeroTaxGUIRequest = {
      INV_GUINo_B: form.value.INV_GUINo,
      INV_GUINo_E: form.value.INV_GUINo,
      INV_GUIDate_B: form.value.INV_GUIDate,
      INV_GUIDate_E: form.value.INV_GUIDate,
      INV_YM_B: form.value.INV_YM,
      INV_YM_E: form.value.INV_YM,
      INV_DeclareYM_B: form.value.INV_DeclareYM,
      INV_DeclareYM_E: form.value.INV_DeclareYM
    };

    this.fin13030Service.queryFIN13030_GetZeroTaxGUI(rb).subscribe(response => {
      this.zeroTaxGUIData = response.Data[0];
    });
  }
}