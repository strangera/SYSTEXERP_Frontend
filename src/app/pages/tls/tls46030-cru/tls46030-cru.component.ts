import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
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
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { Tls46030Service } from '@service/api/tls/tls46030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { apiOption } from '../../../shared/models/sys/sysb000.model';
import { finalize } from 'rxjs';


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
    ECR_SchStatus: ['' as 'A' | 'C' | 'F', Validators.required],
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
  TLTTALENT_Option: apiOption[] = []; //專櫃編號
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
    // 判斷是新增 or 編輯
    const isUpdate = !!this.rowdata?.ECR_SchNo;

    if (isUpdate) {
      // 編輯畫面：只允許 A、C
      this.ECR_SchStatus_Options = this.ECR_SchStatus_Options.filter(opt => opt.value !== 'F');
    } else {
      // 新增畫面：預設啟用，只能選 A
      this.dataForm.controls.ECR_SchStatus.setValue('A');
      this.ECR_SchStatus_Options = this.ECR_SchStatus_Options.filter(opt => opt.value === 'A');
    }
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
    // ECR_SAL_Type
    this.dropdownCache['ECR_SAL_Type'] = getSYS1000Options('ECR_SAL_Type');

    // ECR_TLT_No 改串 queryPOS2001_DropDownList
    this.dropDownListService.queryPOS2001_DropDownList().subscribe(res => {
      this.dropdownCache['ECR_TLT_No'] =
        res?.Data?.map((item: any) => ({
          label: item.No + '-' + item.Name,
          value: item.No
        })) || [];
    });
    // ECR_LocNo
    this.dropdownCache['ECR_LocNo'] = getSYS1000Options('ECR_LocNo');

    // SYS_SrvNo 串接 POS10015 下拉
    this.dropDownListService.queryPOS10015_DropDownList().subscribe(res => {
      this.dropdownCache['SYS_SrvNo'] =
        res?.Data?.map((item: any) => ({
          label: item.Name,
          value: item.No
        })) || [];
    });

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

      // 共用欄位
      const basePayload = {
        ECR_No: raw.ECR_No || '',
        ECR_SchStatus: raw.ECR_SchStatus || '',
        ECR_SchDate: raw.ECR_SchDate
          ? new Date(raw.ECR_SchDate).toISOString()
          : new Date().toISOString(),
        ECR_FLD_ID: raw.ECR_FLD_ID || '',
        ECR_FLD_NewVal: newVal
      };

      const isUpdate = raw.ECR_SchNo && raw.ECR_SchNo !== '自動編號';

      if (isUpdate) {
        const updatePayload = {
          ...basePayload,
          ID: this.rowdata?.ID,
          ECR_SchNo: raw.ECR_SchNo
        };

        this.tls46030Service.updateTLS46030(updatePayload)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res) => {
              if (res.Status === '0000') {
                this.messageService.successBubble('更新成功');
              }
              console.log('更新結果:', res);
            }
          });
      } else {
        const insertPayload = {
          ECR_No: raw.ECR_No || '',
          ECR_SchStatus: raw.ECR_SchStatus || '',
          ECR_SchDate: raw.ECR_SchDate
            ? new Date(raw.ECR_SchDate).toISOString()
            : new Date().toISOString(),
          ECR_SchFinTime: null,
          ECR_FLD_ID: raw.ECR_FLD_ID || '',
          ECR_FLD_OrgVal: raw.ECR_FLD_OrgVal || '',
          ECR_FLD_NewVal: newVal
        };

        this.tls46030Service.insertTLS46030(insertPayload)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res) => {
              if (res.Status === '0000') {
                this.messageService.successBubble('新增成功');
              }
              console.log('新增結果:', res);
            },
            error: () => {
              this.loading = false;
            }
          });

      }
    });
  }
}
