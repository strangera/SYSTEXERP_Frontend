import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS41010Service } from '@service/api/tls/tls41010.service';
import { QueryTLS46030Response, Tls46030Service } from '@service/api/tls/tls46030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { PanelModule } from 'primeng/panel';
import { finalize, Observable } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { TLS41010Data } from '../tls41010/tls41010.model';
@Component({
  selector: 'app-tls46030-cru',
  templateUrl: './tls46030-cru.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    PanelModule,
    DropdownComponent,
    CalendarComponent,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    TranslateModule,
    InputTextComponent,
    AsyncPipe
  ]
})
export class TLS46030CRUComponent extends BasicCruPageComponent<QueryTLS46030Response> implements OnInit {
  private readonly dropDown = inject(DropdownApiService);
  private readonly tls46030Service = inject(Tls46030Service);
  private readonly tls41010Service = inject(TLS41010Service);
  dataForm = this.formBuilder.nonNullable.group({
    ECR_SchNo: [{ value: '自動編號', disabled: true }],
    ECR_SchDate: [null, [Validators.required]],
    ECR_SchStatus: ['A' as 'A' | 'C' | 'F', [Validators.required]],
    ECR_No: [null, [Validators.required]],
    ECR_SchFinTime: [{ value: null as Date | null, disabled: true }],
    ECR_FLD_ID: [null as string | null, [Validators.required]],
    ECR_FLD_OrgVal: [{ value: null as string | null, disabled: true }],
    ECR_FLD_NewVal: [null, [Validators.required]],
  });
  NewValDropdownOptions: { label: string; value: string }[] = [];
  dropdownCache: Record<string, Option[] | null> = {};
  ECRNoOptions = this.dropDown.queryPos1002();
  ECR_FLD_IDOptions = getSYS1000Options('ECR_FLD_ID');
  ECR_SchStatus_Options = getSYS1000Options('ECR_SchStatus');
  private readonly fieldTypeMap: Record<string, 'calendar' | 'dropdown' | 'input'> = {
    'ECR_CloseDate': 'calendar',
    'ECR_IP': 'input',
  };
  private cachedEcrData: TLS41010Data | null = null;
  constructor() { super(); }

  ngOnInit(): void {
    this.initializePage('TLS46030', this.dataForm);
    this.preloadDropdowns();
    if (this.rowdata?.ECR_SchFinTime) {
      this.dataForm.get('ECR_SchFinTime')?.setValue(this.rowdata.ECR_SchFinTime);
    }
    if (this.isFormCreateable || this.rowdata?.ECR_SchStatus === 'F') {
      this.dataForm.controls.ECR_SchStatus.disable();
      this.dataForm.controls.ECR_FLD_NewVal.disable();
    } else {
      this.ECR_SchStatus_Options = this.ECR_SchStatus_Options.filter(o => o.value !== 'F');
    }
    this.dataForm.controls.ECR_No.valueChanges.subscribe(() => this.handleEcrDataSync());
    this.dataForm.controls.ECR_FLD_ID.valueChanges.subscribe(() => this.handleEcrDataSync());
  }
  /**
 * 處理資料同步與欄位狀態邏輯
 */
  private handleEcrDataSync(): void {
    const ecrNo = this.dataForm.controls.ECR_No.value;
    const fieldId = this.dataForm.controls.ECR_FLD_ID.value;
    const status = this.dataForm.controls.ECR_SchStatus.value;

    // 處理欄位啟用與重置
    if (fieldId && status !== 'F') {
      this.dataForm.controls.ECR_FLD_NewVal.enable();
    } else {
      this.dataForm.controls.ECR_FLD_NewVal.disable();
      this.dataForm.controls.ECR_FLD_NewVal.reset();
    }

    // 處理 Original Value 查詢
    if (ecrNo && fieldId) {
      if (this.cachedEcrData?.ECR_No === ecrNo) {
        // 若已存有該 ECR 的資料，直接更新
        this.updateOrgVal(this.cachedEcrData, fieldId);
      } else {
        // 否則向 API 請求
        this.tls41010Service.queryTLS41010({ ECR_No: ecrNo }).subscribe(res => {
          if (res?.Data && res.Data.length > 0) {
            this.cachedEcrData = res.Data[0];
            this.updateOrgVal(this.cachedEcrData, fieldId);
          } else {
            this.cachedEcrData = null;
            this.dataForm.patchValue({ ECR_FLD_OrgVal: '' });
          }
        });
      }
    } else {
      // 若其中一個為空，則清空舊值
      this.dataForm.patchValue({ ECR_FLD_OrgVal: '' });
    }
  }
  /**
   * 根據資料更新 OrgVal
   */
  private updateOrgVal(ecrData: TLS41010Data, fieldId: string): void {
    const val = this.getECROriginalValue(ecrData, fieldId);
    console.log('即將寫入表單的值:', val);
    this.dataForm.patchValue({ ECR_FLD_OrgVal: val });
  }
  getECROriginalValue(ecrData: TLS41010Data, fieldId: string | null): string {
    switch (fieldId) {
      case 'ECR_Type':
        return ecrData.ECR_Type || '';
      case 'ECR_SAL_Type':
        return ecrData.ECR_SAL_Type || '';
      case 'ECR_LocNo':
        return ecrData.ECR_LocNo || '';
      case 'ECR_TLT_No':
        return ecrData.ECR_TLT_No || '';
      case 'SYS_SrvNo':
        return ecrData.SYS_SrvNo || '';
      case 'ECR_TmplNo':
        return ecrData.ECR_TmplNo || '';
      case 'ECR_CloseDate':
        return ecrData.ECR_CloseDate ? new Date(ecrData.ECR_CloseDate).toLocaleDateString() : '';
      case 'ECR_IP':
        return ecrData.ECR_IP || '';
      default:
        return '';
    }
  }
  get currentFieldType(): 'calendar' | 'dropdown' | 'input' {
    const val = this.dataForm.controls.ECR_FLD_ID.value;
    if (!val) return 'dropdown';
    return this.fieldTypeMap[val] || 'dropdown';
  }
  // 新值下拉選單選項
  private preloadDropdowns() {
    const configs = [
      { key: 'ECR_Type', src: getSYS1000Options('ECR_Type'), isAsync: false },
      { key: 'ECR_SAL_Type', src: getSYS1000Options('ECR_SAL_Type'), isAsync: false },
      { key: 'ECR_LocNo', src: this.dropDown.queryPos2002LocationMap(), isAsync: true },
      { key: 'ECR_TLT_No', src: this.dropDown.queryTltTalent(), isAsync: true },
      { key: 'SYS_SrvNo', src: this.dropDown.queryPos10015(), isAsync: true },
      { key: 'ECR_TmplNo', src: this.dropDown.queryPos1002Tml(), isAsync: true },
    ];
    configs.forEach(cfg => {
      if (cfg.isAsync) {
        (cfg.src as Observable<Option[]>).subscribe(res => this.dropdownCache[cfg.key] = res);
      } else {
        this.dropdownCache[cfg.key] = cfg.src as Option[];
      }
    });
  }
  get currentDropdownOptions(): Option[] {
    const fieldId = this.dataForm.get('ECR_FLD_ID')?.value;
    return fieldId ? this.dropdownCache[fieldId] || [] : [];
  }
  // 提交
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const payload = {
        ...raw,
        id: this.rowdata?.ID || undefined
      };
      const request$ = this.isFormCreateable ? this.tls46030Service.insertTLS46030(payload) : this.tls46030Service.updateTLS46030(payload);
      request$.pipe(finalize(() => (this.loading = false))).subscribe((res) => {
        const successMessage = this.isFormCreateable ? (res?.Message || '新增成功') : (res?.Message || '更新成功');
        this.messageService.successBubble(successMessage);
        this.onCancel();
      });
    });
  }
}
