import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { FIN25010Service, QueryAddFIN25010Response } from '../../../service/api/fin/fin25010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-fin25010-cru',
  templateUrl: './fin25010-cru.component.html',
  styleUrl: './fin25010-cru.component.scss',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarComponent,
    DropdownComponent,
    TranslateModule,
    DropdownRangeComponent,
    TableComponent,
  ]
})
export class FIN25010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ACP_ExpectPayDate: [new Date(), Validators.required], // 收/付款日
    ven_no_b: [null], // 廠客代號(起)
    ven_no_e: [null], // 廠客代號(迄)
    ACP_No: [null, Validators.maxLength(14)], // 應付帳款ID
    Voucher_Kind: [null], // 傳票型態
    VEN_PayType: [null], // 付款方式
    ...createPaginationConfig([{ field: 'ven_no', order: 1 }]),
  });

  // 廠客代號選項
  venNoOptions: any[] = [];
  // 傳票型態選項
  voucherKindOptions: any[] = [
    { label: 'AS - 贊助金傳票', value: 'AS' },
    { label: 'AT - 電匯EDI傳票', value: 'AT' },
    { label: 'BT - 銀行資金調撥傳票', value: 'BT' },
    { label: 'CA - 零用金拋轉傳票', value: 'CA' },
    { label: 'CH - 票據兌現傳票', value: 'CH' },
    { label: 'CM - 支票沖轉傳票', value: 'CM' },
    { label: 'CR - 退票沖轉票據傳票', value: 'CR' },
    { label: 'CT - 開票傳票', value: 'CT' },
    { label: 'CW - 撤票沖轉票據傳票', value: 'CW' },
    { label: 'DB - 存出保證金傳票收回拋轉', value: 'DB' }
  ];
  // 付款方式選項
  venPayTypeOptions = [
    { label: '電匯', value: '1' },
    { label: '現金', value: '3' },
  ];

  // table 設定
  data: QueryAddFIN25010Response[] = [];
  selectedItems: QueryAddFIN25010Response[] = [];
  totalRecords = 0;
  columns: Column[] = [
    { field: 'ven_no', header: '廠客代號' },
    { field: 'ven_name', header: '廠客名稱' },
    { field: 'IN_TYPE', header: '資料來源別', format: (value: string) => value === '1' ? '應付' : value === '2' ? '應收' : value === '3' ? '保留款' : value },
    { field: 'ACP_Amt', header: '付款金額', format: formatAmount, isSubTotal: true },
    { field: 'acp_no', header: '應收/付ID' },
    { field: 'acp_DATE', header: '立帳日期', format: formatDate },
    { field: 'PTA_Date', header: '預計收/付款日', format: formatDate },
    { field: 'NoteDesc', header: '備註' },
    { field: 'ACCNO', header: '會計科目' },
    { field: 'ACP_STATUS', header: '狀態', format: (value: string) => value === '0' ? '作廢' : value === '2' ? '建立' : value },
    { field: 'ORG_ID', header: '組織代號' },
  ];

  constructor(
    private fin25010Service: FIN25010Service,
    private dropDownListService: DropDownListService,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN25010', this.dataForm);
    this.loadDropdownOptions();
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      this.fin25010Service.queryAddFIN25010(form.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
        });
    });
  }

  // 載入下拉選項
  protected loadDropdownOptions(): void {
    // 載入廠客代號選項
    this.dropDownListService
      .queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.venNoOptions = res.Data.map((x: any) => ({
          label: `${x.VEN_No} - ${x.Name}`,
          value: x.VEN_No
        }));
      });
  }

  onGenerate() {
    const aps3009Items = this.selectedItems.map(item => ({
      ID: item.ID,
      RMT_TYPE: item.RMT_TYPE,
      VEN_No: item.ven_no,
      APAR_No: item.acp_no,
      ACP_YYYYMM: item.ACP_YYYYMM,
      acp_termno: Number(item.ACP_TERMNO),
      ACP_Amt: Number(item.ACP_Amt),
      PTA_Date: this.datePipe.transform(item.PTA_Date, 'yyyy-MM-dd') || '',
      NoteDesc: item.NoteDesc,
      IN_TYPE: item.IN_TYPE,
      Remit_Status: item.Remit_Status
    }));

    const request = {
      D_Date: new Date().toISOString().split('T')[0],  // 建立日期
      APS3009: aps3009Items
    };

    this.fin25010Service.insertFIN25010(request)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(() => {
        this.messageService.successBubble('新增成功');
        this.onSubmit(this.dataForm);
      });
  }
}
