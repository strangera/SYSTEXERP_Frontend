import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropDownListService, IDropdownItem } from './../../../service/utility/dropDownList.service';
@Component({
  selector: 'app-tls46040-cru',
  templateUrl: './tls46040-cru.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    PanelModule,
    DropdownComponent,
    CalendarComponent,
    FormsModule,
    MultiSelectComponent,
    ReactiveFormsModule,
    ButtonComponent,
    TranslateModule,
    InputTextComponent
  ]
})
export class TLS46040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  selectedType: 'calendar' | 'dropdown' | 'input' = 'dropdown';
  orgValDropdownOptions: { label: string; value: string }[] = [];
  ECR_FLD_IDOptions: any[] = [];

  dataForm = this.formBuilder.nonNullable.group({
    ECR_SchNo: ['', Validators.required],          // 排程編號
    ECR_SchDate: ['', Validators.required],        // 設定啟用日期(起)
    ECR_SchStatus: [[], Validators.required],      // 排程狀態
    ECR_No: [[], Validators.required],             // 收銀機編號
    ECR_SchFinTime: [{ value: null, disabled: true }], // 排程作業完成時間
    ECR_FLD_ID: ['', Validators.required],
    ECR_FLD_NewVal: [{ value: null, disabled: true }], // 原機台內容
    ECR_FLD_OrgVal: ['']                           // 新機台內容
  });

  // ----------------------------------------------------------------
  ECRNoOptions: any[] = [];
  ECR_SchStatus_Options: any[] = [
    { value: 'A', label: '啟用' }, // 預設值為A
    { value: 'C', label: '取消' },
  ];
  LocOptions: IDropdownItem[] = [];
  ECR_TmplNo_Option: IDropdownItem[] = [];

  constructor(
    private readonly dropdownApiService: DropdownApiService,
    private dropDownListService: DropDownListService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS46040', this.dataForm);
    // 收銀機號下拉
    this.dropdownApiService.queryPos1002().subscribe((data) => {
      this.ECRNoOptions = (data ?? []).map((x: any) => ({ value: x.value, label: x.label }));
    });

    // 串 SYS1000 下拉選單 (異動類型)
    const params = { SYS_Type: 'ECR_FLD_ID' };
    this.dropDownListService.querySYS1000_DropDownList(params).subscribe(res => {
      if (res && res.Data) {
        this.ECR_FLD_IDOptions = res.Data.map(item => ({
          label: item.Name,
          value: item.No
        }));
      }
    });

    this.dataForm.controls.ECR_FLD_ID.valueChanges.subscribe(val => {
      console.log('選擇的異動類型:', val);

      if (val === 'ECR_CloseDate') {
        this.selectedType = 'calendar';
        this.orgValDropdownOptions = [];
      } else if (val === 'ECR_IP') {
        this.selectedType = 'input';
        this.orgValDropdownOptions = [];
      } else {
        this.selectedType = 'dropdown';
        this.loadOrgValOptions(val);
      }
    });

  }

  // 動態載入「新機台內容」下拉選項
  private loadOrgValOptions(field: string) {
    switch (field) {
      case 'ECR_Type':
        this.orgValDropdownOptions = [
          { label: '集中機台(統收)', value: '1' },
          { label: '專櫃機台(自收)', value: '2' },
          { label: '離線機台', value: '5' },
          { label: '它社機台', value: '7' },
        ];
        break;
      case 'ECR_TLT_No':

        this.dropdownApiService.queryTltTalent().subscribe((res) => {
          this.orgValDropdownOptions =
            (res ?? []).map((x: any) => ({
              label: `${x.No} - ${x.Name}`,
              value: x.No,
            }));
        });
        break;
      case 'ECR_LocNo': {
        const payload = {
          ECR_LocNo: '',   // 這裡如果需要查全部，可以先給空字串
          PageSize: 50,    // 一次抓 50 筆，可依需求調整
          PageIndex: 1
        };

        this.loading = true;
        this.tls11010Service.queryData(payload)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: (res) => {
              console.log('查詢 TLS11010 成功', res.Data);

              // 對應到下拉要顯示 LOCATION_No
              this.orgValDropdownOptions = res?.Data?.map((x: any) => ({
                label: x.LOCATION_No,   // 顯示
                value: x.LOCATION_No    // 存值
              })) || [];
            },
            error: (err) => {
              console.error('查詢 TLS11010 失敗', err);
              this.orgValDropdownOptions = [];
            }
          });
        break;
      }
      case 'ECR_SAL_Type':
        this.orgValDropdownOptions = [
          { label: '商場收銀機台', value: '' },
          { label: '停車場機台', value: 'PKNG' },
          { label: '會員APP', value: 'APP' },
          { label: '環友票券系統', value: 'CPN' },
        ];
        break;

      case 'ECR_IP':
        this.selectedType = 'input';
        this.orgValDropdownOptions = [];
        break;

      case 'SYS_SrvNo':
        this.orgValDropdownOptions = [
          { label: '主機A', value: 'A' },
          { label: '主機B', value: 'B' }
        ];
        break;
      case 'ECR_TmplNo':
        this.dropDownListService.queryPOS1002TML_DropDownList().subscribe(res => {
          if (res?.Data) {
            this.orgValDropdownOptions = res.Data.map((item: any) => ({
              label: `${item.No} - ${item.Name}`,
              value: item.No
            }));
          } else {
            this.orgValDropdownOptions = [];
          }
        });
        break;

      default:
        this.orgValDropdownOptions = [];
    }
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => { });
  }
}
