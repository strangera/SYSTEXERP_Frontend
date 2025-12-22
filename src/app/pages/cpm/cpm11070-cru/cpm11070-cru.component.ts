import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CPM11070DetailData, CPM11070Service } from '@service/api/cpm/cpm11070.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-cpm11070-cru',
  templateUrl: './cpm11070-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarRangeComponent,
    DropdownComponent,
    TranslateModule,
    RadiobuttonComponent,
    InputTextareaComponent,
    PanelModule,
    NgIf,
    CalendarComponent
  ],
})
export class CPM11070CRUComponent extends BasicCruPageComponent<CPM11070DetailData> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    SEQ_ID: [{ value: '系統自動產生', disabled: true }],
    REC_DATE: [null as Date | null, [Validators.required,]],
    LOST_DATE: [null as Date | null],
    OFF_DATE: [null as Date | null],
    MSG_DATE: [null as Date | null],
    RECEIVE_DATE: [null as Date | null],
    Identity_KIND: [''],
    LOCATION: [''],
    SEQ_TYPE: [''],
    SEX: [''],
    GOODS: [''],
    BROADCAST_DATE: ['', [Validators.maxLength(400)]],
    BROADCAST_YN: [''],
    KEY_USER: ['', [Validators.maxLength(20)]],
    OTHER_GOODS: ['', [Validators.maxLength(20)]],
    REGISTRANT: ['', [Validators.maxLength(10)]],
    TEL: ['', [Validators.maxLength(10)]],
    MOBILE_PHONE: ['', [Validators.maxLength(10)]],
    ADDRESS: ['', [Validators.maxLength(100)]],
    RECAPTION_NAME: ['', [Validators.maxLength(10)]],
    RECAPTION_PHONE: ['', [Validators.maxLength(10)]],
    PROCESSING_USER: ['', [Validators.maxLength(20)]],
  });
  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
  Type1Options: any[] = [
    { No: 'L', Name: '遺失' },
    { No: 'F', Name: '拾獲' },
  ];
  Type3Options: any[] = [
    { Name: '登錄', No: '1' },
    { Name: '已通知', No: '3' },
    { Name: '領回', No: '4' },
    { Name: '轉出', No: '6' },
  ];
  Type2Options = getSYS1000Options('LOST_GOODS_TYPE');
  SPACE3Options: any[] = [ //是否廣播
    { label: '已廣播', value: 'Y' },
    { label: '不廣播', value: 'N' },
  ];
  SPACE1Options = getSYS1000Options('LOCATION');
  USER5Options: any[] = [
    { Name: '遊客', No: '1' },
    { Name: '員工', No: '2' },
  ];
  USER6Options: any[] = [
    { Name: '男性', No: '1' },
    { Name: '女性', No: '2' },
  ];
  columns: any[] = [
    { field: 'VouNo', header: '物品類別', visible: true },
    { field: 'VouDate', header: '物品敘述', visible: true },
    { field: 'VouStatus', header: '登錄編號', visible: true },
    { field: 'Remark', header: '登錄日期', visible: true },
    { field: 'Remark', header: '通知日期', visible: true },
    { field: 'Remark', header: '領回日期', visible: true },
    { field: 'Remark', header: '轉出日期', visible: true },
    { field: 'Voucher_Name', header: '失物類別', visible: true },
    { field: 'Voucher_Name', header: '失物狀態', visible: true },
    { field: 'DetailCount', header: '地點', visible: true },
    { field: 'VoucherType', header: '服務人員', visible: true },
    { field: 'AccAmt', header: '遺失者/拾獲者姓名', visible: true },
    { field: 'AccAmt', header: '電話(夜)', visible: true },
    { field: 'AccAmt', header: '電話(日)', visible: true },

  ];
  constructor(
    // private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService,
    private readonly cpm11070Service: CPM11070Service,
  ) {
    super();
  }


  ngOnInit(): void {
    this.initializePage('CPM11070', this.dataForm);

    // 若是從列表以 編輯/檢視 進入，依 SeqId 撈取明細
    const seqId = (this.rowdata as any)?.SeqId ?? (this.rowdata as any)?.SEQ_ID;
    if (seqId) {
      this.cpm11070Service.queryCPM11070Detail({ SeqId: seqId }).subscribe(res => {
        if (res.Status !== '0000' || !res.Data) {
          this.messageService.errorBubble(res.Message || '載入明細失敗');
          return;
        }

        const d = res.Data;

        // 將明細資料帶入表單，日期欄位轉成 Date 物件
        this.dataForm.patchValue({
          SEQ_ID: d.SEQ_ID,
          REC_DATE: d.REC_DATE ? new Date(d.REC_DATE) : null,
          LOST_DATE: d.LOST_DATE ? new Date(d.LOST_DATE) : null,
          OFF_DATE: d.OFF_DATE ? new Date(d.OFF_DATE) : null,
          MSG_DATE: d.MSG_DATE ? new Date(d.MSG_DATE) : null,
          RECEIVE_DATE: d.RECEIVE_DATE ? new Date(d.RECEIVE_DATE) : null,
          Identity_KIND: d.Identity_KIND,
          LOCATION: d.LOCATION,
          SEQ_TYPE: d.SEQ_TYPE,
          SEX: d.SEX,
          GOODS: d.GOODS,
          BROADCAST_DATE: d.BROADCAST_DATE,
          BROADCAST_YN: d.BROADCAST_YN,
          KEY_USER: d.KEY_USER,
          OTHER_GOODS: d.OTHER_GOODS,
          REGISTRANT: d.REGISTRANT,
          TEL: d.TEL,
          MOBILE_PHONE: d.MOBILE_PHONE,
          ADDRESS: d.ADDRESS,
          RECAPTION_NAME: d.RECAPTION_NAME,
          RECAPTION_PHONE: d.RECAPTION_PHONE,
          PROCESSING_USER: d.PROCESSING_USER,
        });
      });
    }
  }

  onMarkReceived(): void {
    console.log('CPM11070CRU 已領回 clicked');
  }

  onRebroadcast(): void {
    console.log('CPM11070CRU 重新廣播 clicked');
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {


      // this.fin54025Service
      //   .queryFIN54025(payload)
      //   .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      //   .subscribe({
      //     next: (res) => {
      //       if (res.Status === '0000') {
      //         this.data = res.Data || [];
      //         this.totalRecords = res.TotalCount || this.data.length;
      //       } else {
      //         this.messageService.errorBubble(res.Message || '查詢失敗');
      //       }
      //     },
      //   });
    });
  }

}
