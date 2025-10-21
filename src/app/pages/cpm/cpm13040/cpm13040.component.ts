import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, formatAmount } from '@shared/componentkit/table/table.model';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { ButtonModule } from 'primeng/button';
import { untilDestroyed } from '@ngneat/until-destroy';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-cpm13040',
  templateUrl: './cpm13040.component.html',
  styleUrl: './cpm13040.component.scss',
  standalone: true,
  imports: [
    DropdownComponent,
    ButtonModule,
    CalendarRangeQuickComponent,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberRangeComponent,
    TranslateModule,
    InputNumberComponent,
    CustomFooterTableComponent,
    TableComponent
  ]
})
export class CPM13040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_EDATE: [new Date(), [Validators.required]],
    TXN_BDATE: [new Date(), [Validators.required]],
    end: [''],
    org_id: [''],
    TLT_No: [''],
    ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }]),
  });
  totalRecords = 0;
  data: any[] = [];
  footerData: any = {};
  btnLoading = false;
  btnLoading2 = false;
  end_Options: any[] = [];
  org_id_Options: any[] = [];
  TLT_No_Options: { No: string, Name: string, label: string }[] = [];

  headerColumns: Column[] = [
    { field: 'Card_Type', header: '卡別', visible: true },
    { field: 'Total_Time', header: '時數', visible: true, format: formatAmount },
    { field: 'Card_Count', header: '卡數', visible: true, format: formatAmount },
  ];

  columns: Column[] = [
    { field: 'TXN_Date', header: '日期', visible: true },
    { field: 'Card_Type', header: '卡別', visible: true },
    { field: 'Card_No', header: '聯名卡號', visible: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'TLT_Name', header: '專櫃名稱', visible: true },
    { field: 'Invoice_No', header: '發票號碼', visible: true },
    { field: 'TXN_TotSaleAmt', header: '刷卡總金額', visible: true, format: formatAmount },
  ];

  constructor(
    private readonly dropDownListService: DropDownListService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('CPM13040', '/CPM/CPM13040CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.org_id_Options = (res.Data || []).map(item => ({
          ...item,
          label: `${item.No} ${item.Name}`,
          value: item.No
        }));
      }); this.dropDownListService.queryTLTTALENT_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
        this.TLT_No_Options = res.Data.map(item => ({
          ...item, label: `${item.No} - ${item.Name}`
        }));
      });

  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

  }

}
