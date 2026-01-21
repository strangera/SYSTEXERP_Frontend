import { DatePipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { FIN13030Data, FIN13030GetZeroTaxGUIRequest, FIN13030GetZeroTaxGUIResponse, FIN13030InsertRequest, FIN13030Service, FIN13030UpdateRequest } from '../../../service/api/fin/fin13030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';

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
    INV_GUITrack: [''], // 發票字軌
    INV_GUINo: ['', [Validators.required, Validators.maxLength(10)]], // 發票號碼
    INV_GUIDate: ['', Validators.required], // 發票日期
    INV_YM: ['', Validators.required], // 資料所屬年月
    INV_DeclareYM: ['', Validators.required], // 申報年月
    INV_Name: ['', [Validators.maxLength(60)]], // 買受人名稱
    GoodsOrServicesName: ['', Validators.maxLength(100)], // 貨物或勞務名稱
    GoodsQty: [1, [this.validationService.numberValidator]], // 貨物或勞務數量
    ExportMethod: ['', Validators.required], // 外銷方式
    INV_PassType: [null as string | null, Validators.required], // 通關方式註記
    INV_DocName: ['', [Validators.maxLength(20)]], // 證明文件名稱
    INV_DocNo: ['', [Validators.maxLength(10)]], // 證明文件號碼
    NonCustomsExportAmt: [null as number | null, [this.validationService.numberValidator]], // 非經海關出口金額
    INV_ExportType: [''], // 出口報單類別
    INV_ExportNo: ['', [Validators.maxLength(10)]], // 出口報單號碼
    CustomsExportAmt: [null as number | null, [this.validationService.numberValidator]], // 經海關出口金額
    ExportDate: ['', Validators.required], // 輸出或結匯日期
    INV_Remark: ['', Validators.maxLength(100)], // 備註
  });

  zeroTaxGUIData!: FIN13030GetZeroTaxGUIResponse;

  // 外銷方式選項
  exportMethodOptions = getSYS1000Options('ExportMethod');
  // 出口報單類別選項
  exportTypeOptions = getSYS1000Options('INV_ExportType');
  // 通關方式註記選項
  invPassTypeOptions = [
    { label: '1.適用零稅率非經海關出口應附證明文件之銷項', value: '1' },
    { label: '2.適用零稅率經海關出口免附證明文件之銷項', value: '2' }
  ];

  constructor(
    private fin13030Service: FIN13030Service,
    private validationService: ValidationService,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13030', this.dataForm);
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
        INV_PassType: '1', // 預設通關方式註記為 1
      });
      // 根據預設值設置金額欄位
      this.handlePassTypeChange('1');
    }
    else if (this.crudstatus === CRUDStatus.Edit) {
      this.getZeroTaxGUIData(this.dataForm);
    }
    this.setUnEditableFields();
    this.setupPassTypeListener();
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
    this.dataForm.get('INV_GUITrack')?.disable();
    this.dataForm.get('INV_GUINo')?.disable();
    this.dataForm.get('INV_GUIDate')?.disable();
    this.dataForm.get('INV_YM')?.disable();
    this.dataForm.get('INV_DeclareYM')?.disable();
  }

  /**
   * 設置通關方式註記的監聽器
   */
  private setupPassTypeListener(): void {
    this.dataForm.get('INV_PassType')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(value => {
        this.handlePassTypeChange(value);
      });
  }

  /**
   * 處理通關方式註記變更
   * @param passType 通關方式註記值 ('1' 或 '2')
   */
  private handlePassTypeChange(passType: string | null): void {
    const invAmt = this.zeroTaxGUIData?.INV_Amt || 0;

    if (passType === '1') {
      // 選擇 1：預設帶入「非經海關出口金額」，「經海關出口金額」disable 並金額變成 0
      this.dataForm.patchValue({
        NonCustomsExportAmt: invAmt,
        CustomsExportAmt: 0
      });
      this.dataForm.get('NonCustomsExportAmt')?.enable();
      this.dataForm.get('CustomsExportAmt')?.disable();
    } else if (passType === '2') {
      // 選擇 2：預設帶入「經海關出口金額」，「非經海關出口金額」disable 並金額變成 0
      this.dataForm.patchValue({
        NonCustomsExportAmt: 0,
        CustomsExportAmt: invAmt
      });
      this.dataForm.get('NonCustomsExportAmt')?.disable();
      this.dataForm.get('CustomsExportAmt')?.enable();
    }
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