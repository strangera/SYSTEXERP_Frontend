import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
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
    NgIf
  ],
})
export class CPM11070CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    A1: [{ value: '系統自動產生', disabled: true }],
    S1: [null as Date | null, [Validators.required,]],
    E1: [null as Date | null],
    S2: [null as Date | null],
    E2: [null as Date | null],
    S3: [null as Date | null],
    E3: [null as Date | null],
    S4: [null as Date | null],
    E4: [null as Date | null],
    S5: [null as Date | null],
    E5: [null as Date | null],
    S6: [null],
    E6: [null],
    Type1: [''],
    Type2: [''],
    Type3: [''],
    Type4: ['', [Validators.maxLength(400)]],
    SPACE1: [''],
    PLE1: ['', [Validators.maxLength(20)]],
    SPACE2: ['', [Validators.maxLength(20)]],
    SPACE3: [''],
    SPACE4: ['', [Validators.maxLength(100)]],
    USER1: ['', [Validators.maxLength(20)]],
    USER2: ['', [Validators.maxLength(10)]],
    USER3: ['', [Validators.maxLength(20)]],
    USER4: ['', [Validators.maxLength(20)]],
    USER5: [''],
    PHONE: ['', [Validators.maxLength(10)]],
    MOBILE: ['', [Validators.maxLength(10)]],
    ID_NUMBER: ['', [Validators.maxLength(20)]],
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
  ) {
    super();
  }


  ngOnInit(): void {
    this.initializePage('CPM11070', this.dataForm);
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
