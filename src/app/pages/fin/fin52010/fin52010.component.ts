import { Component, computed, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52010Service } from '@service/api/fin/fin52010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { FIN52010Data } from './fin52010.model';

@Component({
  selector: 'app-fin52010',
  templateUrl: './fin52010.component.html',
  styleUrl: './fin52010.component.scss',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
  ],
})
export class FIN52010Component extends BasicQueryPageComponent<FIN52010Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({

  });
  private readonly qf = computed(() => this.queryForm.controls);

  public readonly filteredData = computed(() => {
    return this.service.FIN52010Data();
  });

  public readonly totalRecords = computed(() => this.filteredData().length);

  public readonly columns: Column[] = [

  ];


  // // Upload files
  // fileType: string = '';
  // uploadUrl: string = 'https://www.primefaces.org/cdn/api/upload.php';
  // queryForm = this.formBuilder.group({
  //   systemYear: [], // 系統年結年度
  //   accountingStartMonth: [], // 系統開帳年月
  //   accountingEndMonth: [], // 系統關帳年月
  //   defaultVoucherDate: [], // 傳票日期預設
  //   defaultOrganization: [, Validators.required], // 預設組織
  //   accumulatedProfitLossAccount: [], // 累積盈虧科目
  //   currentProfitLossAccount: [], // 本期損益科目
  //   cashAccount: [], // 現金科目
  //   accountsReceivableAccount: [], // 應收帳款科目
  //   accountsPayableAccount: [], // 應付帳款科目
  //   inputTaxAccount: [], // 進項稅額科目
  //   outputTaxAccount: [], // 銷項稅額科目
  //   postAndTelecomFeeAccount: [], // 郵電費科目
  //   discountRate: [], // 貼現日利率
  //   discountFeeRevenueAccount: [], // 貼現手續費收入科目
  //   discountOutputTaxAccount: [], // 貼現銷項稅額科目
  //   startdate: [], // 貼現銷項稅額科目起始日
  //   enddate: [], // 貼現銷項稅額科目結束日
  //   bankTransferFeeAccount: [], // 銀行匯款手續費科目
  //   advanceExpenseAccount: [], // 預支費用科目
  //   billTransferCondition: [], // 應付票據是否需領用才拋轉傳票
  // });


  // // Dropdown options

  // departmentOptions: any[] = [

  // ];

  // accountOptions: any[] = [
  //   { value: '1101', label: '1101_累積盈虧科目1' },
  //   { value: '1102', label: '1102_累積盈虧科目2' },
  //   { value: '1103', label: '1103_累積盈虧科目3' }
  // ];

  // accountingaccountOptions: any[] = [
  //   { value: 1, label: '是' },
  //   { value: 2, label: '否' }
  // ];

  // statusOptions: any[] = [
  //   { value: 1, label: '未拋轉' },
  //   { value: 2, label: '已拋轉' },
  //   { value: 3, label: '已退回' }
  // ];

  // unitOptions: any[] = [
  //   { value: 1, label: '元' },
  //   { value: 2, label: '千' },
  //   { value: 3, label: '萬' }
  // ];

  // typeOptions: any[] = [
  //   { value: 1, label: '統制' },
  //   { value: 2, label: '明細' }
  // ];

  // SubpoenatypeOptions: any[] = [
  //   { value: 1, label: 'EC暫估應付供應商貨款' },
  //   { value: 2, label: 'EC應收供應商扣款' },
  //   { value: 3, label: 'EC應付供應商貨款' },
  //   { value: 4, label: 'EC成本結轉' }
  // ];

  // SubpoenastatusOptions: any[] = [
  //   { value: 1, label: '作廢' },
  //   { value: 2, label: '建立' },
  //   { value: 3, label: '確認' },
  //   { value: 4, label: '過帳' },
  //   { value: 5, label: '刪除' }
  // ];

  // codeOptions: any[] = [
  //   { value: 1, label: '68919301_臺南紡織股份有限公司' },
  //   { value: 2, label: '73251209_統一企業股份有限公司' },
  //   { value: 3, label: '96978370_統正開發股份有限公司' }
  // ];

  // // Table data
  // data: any[] = [
  //   { name: 'John', age: 25, email: 'john@example.com' },
  //   { name: 'Jane', age: 30, email: 'jane@example.com' },
  //   // Other data
  // ];
  // filteredData: any[] = [...this.data];
  // columns: any[] = [
  //   { field: 'name', header: 'Name', visible: true },
  //   { field: 'age', header: 'Age', visible: true },
  //   { field: 'email', header: 'Email', visible: true },
  //   // Other columns
  // ];
  // // TypeScript Options
  // vendorOptions: any[] = [];
  // displayOptions2: any[] = [];
  // AnalysisdateCOptions: any[] = [];
  // FlippingstateOptions: any[] = [];





  constructor(
    public service: FIN52010Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN52010', '/FIN/FIN52010CRU', this.queryForm, this.onSubmit.bind(this));
    const store = this.queryStateService.getQueryState(this.ProgNo);
    if (store?.value) this.queryForm.setValue(store.value);

    this.logger.debug(`init:`, []);


    // this.loading = !0;
    // this.ProgNo = '150007';
    // // Initialize dropdown options
    // this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // this.IfdisplayService.getOptions().subscribe(
    //   (data) => (this.displayOptions2 = data)
    // );
    // this.AnalysisdateCService.getOptions().subscribe(
    //   (data) => (this.AnalysisdateCOptions = data)
    // );
    // this.vendorService.getVendors().subscribe((data) => {
    //   this.vendorOptions = data;
    // });
    // this.flippingstateService.getOptions().subscribe((data) => {
    //   this.FlippingstateOptions = data;
    // });
    // this.organizationNumberService
    //   .getOrganizationNumbers()
    //   .subscribe((data) => {
    //     this.departmentOptions = data;
    //   });
    // // this.accountingaccountService.getOptions().subscribe((data) => {
    // //   this.accountingaccountOptions = data;
    // // });
  }

  onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {

      this.loading = !1;
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.logger.debug(`onSubmit:`, []);
    });
  }
  //   console.log(frm.value);
  //   this.submitted = true;
  //   this.loading = true;
  //   this.notificationService.blockUi();

  //   if (frm.valid && this.canQuery()) {
  //     // Submit logic here
  //   }

  //   this.loading = false;
  //   this.notificationService.unblockUi();
  // }

  // onSubmitQuery(frm: FormGroup) {
  //   this.onSubmit(frm);
  // }

  // onCreate() {
  //   if (this.canAdd()) {
  //     let extras: NavigationExtras = {
  //       state: {
  //         crudstatus: CRUDStatus.Create,
  //         queryform: this.queryForm,
  //       },
  //       skipLocationChange: true,
  //     };
  //     this.router.navigate(['FIN3000/FIN34030CRU'], extras);
  //   }
  // }

  // onEdit(data: any) {
  //   if (this.canEdit()) {
  //     let extras: NavigationExtras = {
  //       state: {
  //         crudstatus: CRUDStatus.Edit,
  //         rowdata: data,
  //         queryform: this.queryForm,
  //       },
  //       skipLocationChange: true,
  //     };
  //     this.router.navigate(['/demoCRU'], extras);
  //   }
  // }

  // onDetail(data: any) {
  //   let extras: NavigationExtras = {
  //     state: {
  //       crudstatus: CRUDStatus.Read,
  //       rowdata: data,
  //       queryform: this.queryForm,
  //     },
  //     skipLocationChange: true,
  //   };
  //   this.router.navigate(['/demoCRU'], extras);
  // }
  // onClearForm() {
  //   this.queryForm.reset(); // 重置表單
  // }
}
