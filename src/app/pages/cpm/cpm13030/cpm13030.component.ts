import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, formatAmount, ColumnGroup } from '@shared/componentkit/table/table.model';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { ButtonModule } from 'primeng/button';
import { untilDestroyed } from '@ngneat/until-destroy';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';


//5.1.3.3  非業主POS停車費折抵補登作業
@Component({
  selector: 'app-cpm13030',
  templateUrl: './cpm13030.component.html',
  styleUrl: './cpm13030.component.scss',
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
    CustomFooterTableComponent

  ]
})
export class CPM13030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_EDATE: [new Date(), [Validators.required]],
    TXN_BDATE: [new Date(), [Validators.required]],
    ECR_Group: [''],
    org_id: [''],
    TLT_No: [''],
    TLT_NAME: [''],
    TXN_GUIBegNo: [''],
    TXN_TotSaleAmt: [''],
    displayMode: ['M'],
    ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }]),
  });
  totalRecords = 0;
  data: any[] = [];
  footerData: any = {};
  subTotalData: any[] = [];
  groupRowsBy = 'TXN_Date';
  historyRequestBody: any = null;
  btnLoading = false;
  btnLoading2 = false;
  columns: Column[] = [];
  columnGroup: ColumnGroup[] = [];
  displayModeOptions = [
    { value: 'M', label: '彙總' },
    { value: 'D', label: '明細' },
  ];
  org_id_Options: any[] = [];
  ECR_Group_Options: any[] = [];
  TLT_No_Options: { No: string, Name: string, label: string }[] = [];
  TLT_NAME_Options: { No: string, Name: string, label: string }[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('CPM13030', '/CPM/CPM13030CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.dropDownListService.queryTLTTALENT_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.TLT_No_Options = res.Data.map(item => ({
        ...item, label: `${item.No} - ${item.Name}`
      }));
    });
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.org_id_Options = (res.Data || []).map(item => ({
          ...item,
          label: `${item.No} ${item.Name}`,
          value: item.No
        }));
      });
    // 館別
    this.dropDownListService.querySYS3800_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.ECR_Group_Options = res.Data.map(x => ({
          label: x.Name,
          value: x.No,
          Name: x.Name,
          No: x.No
        }));
      });
  }
  updateTableColumns(showType: string): void {
    if (showType === 'D') {
      // ========== 明細 ==========
      this.columns = [
        { field: 'TXN_Date', header: '日期', visible: true },
        { field: 'PKG_disc_shop_name', header: '館別', visible: true },
        { field: 'PKG_entrance_uuid', header: '組織名稱', visible: true },
        { field: 'PKG_pricing_start_at', header: 'POS機號', visible: true },
        { field: 'PKG_pricing_end_at', header: '專櫃編號', visible: true },
        { field: 'PKG_license_plate_no', header: '發票號碼', visible: true },
        { field: 'PKG_disc_rule_name', header: '消費金額', visible: true },
        { field: 'POS_Amount', header: '金額', visible: true, groupField: 'POS連線', format: formatAmount },
        { field: 'POS_Amount', header: '時數', visible: true, groupField: 'POS連線', format: formatAmount },
        { field: 'POS_Count', header: '筆數', visible: true, groupField: 'POS連線', format: formatAmount },
        { field: 'FORCE_Amount', header: '金額', visible: true, groupField: '強制折抵', format: formatAmount },
        { field: 'FORCE_Amount', header: '時數', visible: true, groupField: '強制折抵', format: formatAmount },
        { field: 'FORCE_Count', header: '筆數', visible: true, groupField: '強制折抵', format: formatAmount },
        { field: 'SUM_Amount', header: '金額', visible: true, groupField: '小計', format: formatAmount },
        { field: 'SUM_Amount', header: '時數', visible: true, groupField: '小計', format: formatAmount },
        { field: 'SUM_Count', header: '筆數', visible: true, groupField: '小計', format: formatAmount },
      ];

      this.columnGroup = [
        { field: 'POS連線', header: 'POS連線' },
        { field: '強制折抵', header: '強制折抵' },
        { field: '小計', header: '小計' },
      ];

    } else {
      // ========== 彙總 ==========
      this.columns = [
        { field: 'TXN_Date', header: '日期', visible: true },
        { field: 'PKG_disc_shop_name', header: '館別', visible: true },
        { field: 'PKG_entrance_uuid', header: '組織名稱', visible: true },
        { field: 'PKG_pricing_start_at', header: 'POS機號', visible: true },
        { field: 'PKG_pricing_end_at', header: '專櫃編號', visible: true },
        { field: 'PKG_pricing_end_at', header: '位置編號', visible: true },
        { field: 'PKG_pricing_end_at', header: '櫃位名稱', visible: true },
        { field: 'POS_Amount', header: '金額', visible: true, groupField: 'POS連線', format: formatAmount },
        { field: 'POS_Amount', header: '時數', visible: true, groupField: 'POS連線', format: formatAmount },
        { field: 'POS_Count', header: '筆數', visible: true, groupField: 'POS連線', format: formatAmount },
        { field: 'FORCE_Amount', header: '金額', visible: true, groupField: '強制折抵', format: formatAmount },
        { field: 'FORCE_Amount', header: '時數', visible: true, groupField: '強制折抵', format: formatAmount },
        { field: 'FORCE_Count', header: '筆數', visible: true, groupField: '強制折抵', format: formatAmount },
        { field: 'SUM_Amount', header: '金額', visible: true, groupField: '小計', format: formatAmount },
        { field: 'SUM_Amount', header: '時數', visible: true, groupField: '小計', format: formatAmount },
        { field: 'SUM_Count', header: '筆數', visible: true, groupField: '小計', format: formatAmount },
      ];

      this.columnGroup = [
        { field: 'POS連線', header: 'POS連線' },
        { field: '強制折抵', header: '強制折抵' },
        { field: '小計', header: '小計' },
      ];
    }
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    this.loading = false;

  }

}
