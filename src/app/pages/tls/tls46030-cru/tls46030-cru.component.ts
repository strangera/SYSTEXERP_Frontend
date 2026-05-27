import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QueryTLS46030Response, Tls46030Service } from '@service/api/tls/tls46030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
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
  private readonly dropDownListService = inject(DropDownListService);
  private readonly tls46030Service = inject(Tls46030Service);
  dataForm = this.formBuilder.nonNullable.group({
    ECR_SchNo: [{ value: '自動編號', disabled: true }],
    ECR_SchDate: [null, Validators.required],
    ECR_SchStatus: ['' as 'A' | 'C' | 'F', Validators.required],
    ECR_No: [null, Validators.required],
    ECR_SchFinTime: [{ value: null, disabled: true }],
    ECR_FLD_ID: [null as string | null, Validators.required],
    ECR_FLD_OrgVal: [{ value: null, disabled: true }],
    ECR_FLD_NewVal: [{ value: null as string | null, disabled: true }]
  });
  selectedType: 'calendar' | 'dropdown' | 'input' = 'dropdown';
  NewValDropdownOptions: { label: string; value: string }[] = [];
  private dropdownCache: Record<string, { label: string; value: string }[]> = {};
  ECRNoOptions = this.dropDown.queryPos1002();
  ECR_FLD_IDOptions = getSYS1000Options('ECR_FLD_ID');
  ECR_SchStatus_Options = getSYS1000Options('ECR_SchStatus');
  ECR_SchStatus_SelectOptions = this.ECR_SchStatus_Options;
  constructor() { super(); }

  ngOnInit(): void {
    this.initializePage('TLS46030', this.dataForm);
    this.preloadDropdowns();
    // 後端回傳的異動作業完成時間，格式化為 yyyy/MM/dd HH:mm:ss 顯示
    if (this.rowdata?.ECR_SchFinTime) {
      this.dataForm.get('ECR_SchFinTime')?.setValue(this.rowdata.ECR_SchFinTime as any);
    }
    if (!this.isFormCreateable) {
      // - 若後端狀態為 F，保留全部選項以顯示中文，但鎖住欄位
      // - 其他狀態只允許選 A、C
      const currentStatus = this.rowdata?.ECR_SchStatus as 'A' | 'C' | 'F' | undefined;
      if (currentStatus === 'F') {
        this.ECR_SchStatus_SelectOptions = this.ECR_SchStatus_Options;
        this.dataForm.controls.ECR_SchStatus.disable();
      } else {
        this.ECR_SchStatus_SelectOptions = this.ECR_SchStatus_Options.filter(opt => opt.value !== 'F');
      }
    } else {
      // 新增畫面：預設啟用，只能選 A
      this.dataForm.controls.ECR_SchStatus.setValue('A');
      this.ECR_SchStatus_SelectOptions = this.ECR_SchStatus_Options.filter(opt => opt.value === 'A');
    }
    // normalize ECR_FLD_IDOptions values to string so selected label resolves correctly
    this.ECR_FLD_IDOptions = (this.ECR_FLD_IDOptions || []).map(o => ({ label: o.label, value: String(o.value) }));
    // 監聽異動類型
    this.dataForm.controls.ECR_FLD_ID.valueChanges.subscribe(val => {
      const newValCtrl = this.dataForm.controls.ECR_FLD_NewVal;

      // 一旦選擇異動類型，先清空並啟用輸入欄位
      newValCtrl.reset('');
      newValCtrl.enable();

      if (val === 'ECR_CloseDate') {
        this.selectedType = 'calendar';
        this.NewValDropdownOptions = [];

      } else if (val === 'ECR_IP') {
        this.selectedType = 'input';
        this.NewValDropdownOptions = [];

      } else if (val) {
        this.selectedType = 'dropdown';
        this.NewValDropdownOptions = this.dropdownCache[val] || [];
      } else {
        // 沒選擇時，還是保持禁用
        newValCtrl.disable();
      }
    });
    this.dataForm.controls.ECR_FLD_ID.updateValueAndValidity();
    if (this.rowdata && this.rowdata.ECR_FLD_ID !== undefined && this.rowdata.ECR_FLD_ID !== null) {
      this.dataForm.controls.ECR_FLD_ID.setValue(String(this.rowdata.ECR_FLD_ID));
    }
    this.dataForm.controls.ECR_FLD_NewVal.setValue(this.rowdata?.ECR_FLD_NewVal || null);
  }

  private preloadDropdowns() {
    this.dropdownCache['ECR_Type'] = getSYS1000Options('ECR_Type');
    this.dropdownCache['ECR_SAL_Type'] = getSYS1000Options('ECR_SAL_Type');
    this.dropdownCache['ECR_LocNo'] = getSYS1000Options('ECR_LocNo');
    this.dropDownListService.queryPOS10015_DropDownList().subscribe(res => {
      this.dropdownCache['SYS_SrvNo'] = res.Data.map(item => ({ label: `${item.No}-${item.Name}`, value: item.No })) || [];
    });
    this.dropDownListService.queryPOS2001_DropDownList().subscribe(res => {
      this.dropdownCache['ECR_TLT_No'] = res.Data.map(item => ({ label: item.No + '-' + item.Name, value: item.No })) || [];
      // 如果目前已選擇該異動類型，更新可用下拉選項（處理 preload 完成晚於 valueChanges 的情況）
      if (this.dataForm?.controls?.ECR_FLD_ID?.value === 'ECR_TLT_No') {
        this.NewValDropdownOptions = this.dropdownCache['ECR_TLT_No'] || [];
        this.selectedType = 'dropdown';
        const newValCtrl = this.dataForm.controls.ECR_FLD_NewVal;
        newValCtrl.enable();
        const rawVal = this.rowdata?.ECR_FLD_NewVal ?? '';
        newValCtrl.setValue(rawVal);
      }
    });
    this.dropDownListService.queryPOS1002TML_DropDownList().subscribe(res => {
      this.dropdownCache['ECR_TmplNo'] = res.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No })) || [];
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      // 判斷日期型別欄位
      let newVal = raw.ECR_FLD_NewVal || '';
      if (raw.ECR_FLD_ID === 'ECR_CloseDate' && newVal) {
        newVal = new Date(newVal).toISOString();
      }
      const payload = {
        ID: this.isFormCreateable ? undefined : this.rowdata?.ID,
        ECR_No: raw.ECR_No || '',
        ECR_SchNo: raw.ECR_SchNo || '',
        ECR_SchStatus: raw.ECR_SchStatus || '',
        ECR_SchDate: raw.ECR_SchDate ? new Date(raw.ECR_SchDate).toISOString() : new Date().toISOString(),
        ECR_FLD_ID: raw.ECR_FLD_ID || '',
        ECR_SchFinTime: raw.ECR_SchFinTime,
        ECR_FLD_OrgVal: raw.ECR_FLD_OrgVal || '',
        ECR_FLD_NewVal: newVal
      };
      if (this.isFormEditable && this.rowdata) {
        this.tls46030Service.updateTLS46030(payload).pipe(finalize(() => (this.loading = false))).subscribe((res) => {
          this.messageService.successBubble(res?.Message || '更新成功');
          this.onCancel();
        });
      } else {
        this.tls46030Service.insertTLS46030(payload).pipe(finalize(() => (this.loading = false))).subscribe((res) => {
          this.messageService.successBubble(res?.Message || '新增成功');
          this.onCancel();
        });
      }
    });
  }
}
