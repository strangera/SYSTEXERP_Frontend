import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { ECRNoService } from '@service/basic/ECRNo.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { finalize } from 'rxjs';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { Tls46030Service } from '@service/api/tls/tls46030.service';

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
  ECR_FLD_IDOptions: any[] = [];

  dataForm = this.formBuilder.nonNullable.group({
    ECR_SchNo: [{ value: '自動編號', disabled: true }],          // 排程編號
    ECR_SchDate: [null, Validators.required],        // 設定啟用日期(起)
    ECR_SchStatus: [[], Validators.required],      // 排程狀態
    ECR_No: ['', Validators.required],             // 收銀機編號
    ECR_SchFinTime: [{ value: null, disabled: true }], // 排程作業完成時間
    ECR_FLD_ID: ['', Validators.required],
    ECR_FLD_OrgVal: [{ value: null, disabled: true }], // 原機台內容
    ECR_FLD_NewVal: ['']                           // 新機台內容
  });


  // ----------------------------------------------------------------
  ECRNoOptions: any[] = [];
  ECR_SchStatus_Options: any[] = [
    { value: 'A', label: '啟用' }, // 預設值為A
    { value: 'C', label: '取消' },
    { value: 'F', label: '執行完畢' }
  ];
  LocOptions: IDropdownItem[] = [];
  ECR_TmplNo_Option: IDropdownItem[] = [];

  constructor(
    private ECRNoService: ECRNoService,
    private translate: TranslateService,
    private dropDownListService: DropDownListService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
    private tls46030Service: Tls46030Service

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS46030', this.dataForm);
    // 收銀機號下拉
    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
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
        this.NewValDropdownOptions = [];
      } else if (val === 'ECR_IP') {
        this.selectedType = 'input';
        this.NewValDropdownOptions = [];
      } else {
        this.selectedType = 'dropdown';
        this.loadNewValOptions(val);
      }
    });

  }

  // 動態載入「新機台內容」下拉選項
  private loadNewValOptions(field: string) {
    switch (field) {
      case 'ECR_Type':
        this.NewValDropdownOptions = [
          { label: '集中機台(統收)', value: '1' },
          { label: '專櫃機台(自收)', value: '2' },
          { label: '離線機台', value: '5' },
          { label: '它社機台', value: '7' },
        ];
        break;
      case 'ECR_TLT_No':

        this.counterNameService.getCounters().subscribe((res) => {
          this.NewValDropdownOptions =
            res?.map((x: any) => ({
              label: `${x.value} - ${x.label}`, // 下拉顯示
              value: x.value,                   // 存值
            })) || [];
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
              this.NewValDropdownOptions = res?.Data?.map((x: any) => ({
                label: x.LOCATION_No,   // 顯示
                value: x.LOCATION_No    // 存值
              })) || [];
            },
            error: (err) => {
              console.error('查詢 TLS11010 失敗', err);
              this.NewValDropdownOptions = [];
            }
          });
        break;
      }
      case 'ECR_SAL_Type':
        this.NewValDropdownOptions = [
          { label: '商場收銀機台', value: '' },
          { label: '停車場機台', value: 'PKNG' },
          { label: '會員APP', value: 'APP' },
          { label: '環友票券系統', value: 'CPN' },
        ];
        break;

      case 'ECR_IP':
        this.selectedType = 'input';
        this.NewValDropdownOptions = [];
        break;

      case 'SYS_SrvNo':
        this.NewValDropdownOptions = [
          { label: '主機A', value: 'A' },
          { label: '主機B', value: 'B' }
        ];
        break;
      case 'ECR_TmplNo':
        this.dropDownListService.queryPOS1002TML_DropDownList().subscribe(res => {
          if (res?.Data) {
            this.NewValDropdownOptions = res.Data.map((item: any) => ({
              label: `${item.No} - ${item.Name}`,
              value: item.No
            }));
          } else {
            this.NewValDropdownOptions = [];
          }
        });
        break;

      default:
        this.NewValDropdownOptions = [];
    }
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();

      // 組合後端需要的 payload
      const payload = {
        ECR_No: raw.ECR_No || '',
        ECR_SchStatus: raw.ECR_SchStatus || '',
        ECR_SchDate: raw.ECR_SchDate ? new Date(raw.ECR_SchDate).toISOString() : new Date().toISOString(),
        ECR_FLD_ID: raw.ECR_FLD_ID || '',
        ECR_FLD_OrgVal: raw.ECR_FLD_OrgVal || '',
        ECR_FLD_NewVal: raw.ECR_FLD_NewVal || ''
      };

      // 判斷是否為更新 (依照資料是否有 ECR_SchNo)
      const isUpdate = raw.ECR_SchNo && raw.ECR_SchNo !== '自動編號';

      if (isUpdate) {
        this.tls46030Service.updateTLS46040({ ...payload, ECR_SchNo: raw.ECR_SchNo }).subscribe({
          next: (res) => {
            this.messageService.successBubble('更新成功');
            console.log('更新成功:', res);
          },
          error: (err) => {
            this.messageService.errorBubble('更新失敗');
            console.error('更新失敗:', err);
          }
        });
      } else {
        this.tls46030Service.insertTLS46040(payload).subscribe({
          next: (res) => {
            this.messageService.successBubble('新增成功');
            console.log('新增成功:', res);
          },
          error: (err) => {
            this.messageService.errorBubble('新增失敗');
            console.error('新增失敗:', err);
          }
        });
      }
    });
  }

}


