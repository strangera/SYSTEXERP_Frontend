import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {  TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { ECRNoService } from '@service/basic/ECRNo.service';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { finalize } from 'rxjs';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { Tls46030Service } from '@service/api/tls/tls46030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';

export function formatDateYMD(value: any): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value; // 如果不是有效日期，直接回傳原值
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

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
    InputTextComponent
  ]
})
export class TLS46030CRUComponent extends BasicCruPageComponent<any> implements OnInit {

  selectedType: 'calendar' | 'dropdown' | 'input' = 'dropdown';
  NewValDropdownOptions: { label: string; value: string }[] = [];
  ECR_FLD_IDOptions = getSYS1000Options('ECR_FLD_ID');

  // 預載下拉快取
  private dropdownCache: Record<string, { label: string; value: string }[]> = {};

  dataForm = this.formBuilder.nonNullable.group({
    ECR_SchNo: [{ value: '自動編號', disabled: true }],
    ECR_SchDate: [null, Validators.required],
    ECR_SchStatus: [[], Validators.required],
    ECR_No: ['', Validators.required],
    ECR_SchFinTime: [{ value: null, disabled: true }],
    ECR_FLD_ID: ['', Validators.required],
    ECR_FLD_OrgVal: [{ value: null, disabled: true }],
    ECR_FLD_NewVal: [{ value: '', disabled: true }]
  });

  ECRNoOptions: any[] = [];
  ECR_SchStatus_Options: any[] = [
    { value: 'A', label: '啟用' },
    { value: 'C', label: '取消' },
    { value: 'F', label: '執行完畢' }
  ];

  constructor(
    private ECRNoService: ECRNoService,
    private dropDownListService: DropDownListService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
    private tls46030Service: Tls46030Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS46030', this.dataForm);

    // 收銀機號
    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });

    // 預先打所有下拉 API
    this.preloadDropdowns();

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
    this.dataForm.controls.ECR_FLD_NewVal.setValue(this.rowdata?.ECR_FLD_NewVal || '');
  }

  /** 預先載入下拉 */
  private preloadDropdowns() {
    // ECR_Type
    this.dropdownCache['ECR_Type'] = getSYS1000Options('ECR_Type');

    // ECR_TLT_No
    this.counterNameService.getCounters().subscribe(res => {
      this.dropdownCache['ECR_TLT_No'] =
        res?.map((x: any) => ({
          label: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });

    // ECR_LocNo
    const payload = { ECR_LocNo: '', PageSize: 50, PageIndex: 1 };
    this.loading = true;
    this.tls11010Service.queryData(payload)
      .pipe(finalize(() => this.loading = false))
      .subscribe(res => {
        this.dropdownCache['ECR_LocNo'] =
          res?.Data?.map((x: any) => ({
            label: x.LOCATION_No,
            value: x.LOCATION_No
          })) || [];
      });

    // ECR_SAL_Type
    this.dropdownCache['ECR_SAL_Type'] = [
      { label: '商場收銀機台', value: '' },
      { label: '停車場機台', value: 'PKNG' },
      { label: '會員APP', value: 'APP' },
      { label: '環友票券系統', value: 'CPN' }
    ];

    // SYS_SrvNo
    this.dropdownCache['SYS_SrvNo'] = [
      { label: '主機A', value: 'A' },
      { label: '主機B', value: 'B' }
    ];

    // ECR_TmplNo
    this.dropDownListService.queryPOS1002TML_DropDownList().subscribe(res => {
      this.dropdownCache['ECR_TmplNo'] =
        res?.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No
        })) || [];
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
        ECR_No: raw.ECR_No || '',
        ECR_SchStatus: raw.ECR_SchStatus || '',
        ECR_SchDate: raw.ECR_SchDate ? new Date(raw.ECR_SchDate).toISOString() : new Date().toISOString(),
        ECR_FLD_ID: raw.ECR_FLD_ID || '',
        ECR_FLD_OrgVal: raw.ECR_FLD_OrgVal || '',
        ECR_FLD_NewVal: newVal
      };

      const isUpdate = raw.ECR_SchNo && raw.ECR_SchNo !== '自動編號';

      if (isUpdate) {
        this.tls46030Service.updateTLS46030({ ...payload, ECR_SchNo: raw.ECR_SchNo }).subscribe({
          next: (res) => {
            this.messageService.successBubble('更新成功');
            console.log('更新成功:', res);
          }
        });
      } else {
        this.tls46030Service.insertTLS46030(payload).subscribe({
          next: (res) => {
            this.messageService.successBubble('新增成功');
            console.log('新增成功:', res);
          }
        });
      }
    });
  }
}
