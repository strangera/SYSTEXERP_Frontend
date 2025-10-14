import { Component, computed, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN53010Service } from '@service/api/fin/fin53010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-fin53010',
  templateUrl: './fin53010.component.html',
  styleUrl: './fin53010.component.scss',
  standalone: !0,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputNumberRangeComponent,
    InputTextComponent,
    MenubarComponent,
    RadiobuttonComponent,
    TableComponent,
  ],
})
export class FIN53010Component extends BasicQueryPageComponent<unknown> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    startSubpoenaNo: new FormControl<number | void>(void 0),
    endSubpoenaNo: new FormControl<number | void>(void 0),
    subpoenaType: new FormControl<'0' | '1' | '2' | void>(void 0),
    sSubpoenaDate: new FormControl<Date>(new Date()),
    eSubpoenaDate: new FormControl<Date>(new Date()),
    subpoenaStatus: new FormControl<'0' | '1' | '3' | void>(void 0),
    subpoenaSummary: new FormControl<string | void>(void 0),
    subpoenaType2: new FormControl<string | void>(void 0),
    creator: new FormControl<string | void>(void 0),
    modifier: new FormControl<string | void>(void 0),
    sBuildDate: new FormControl<Date>(new Date()),
    eBuildDate: new FormControl<Date>(new Date()),
    sModifyDate: new FormControl<Date>(new Date()),
    eModifyDate: new FormControl<Date>(new Date()),
    rocifrs: new FormControl<'0' | '1' | '2' | '3'>('1'),
    ...createPaginationConfig([{ field: 'id', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly filteredData = computed(() => {
    return this.service.FIN53010Data();
  });

  public readonly totalRecords = computed(() => this.filteredData().length);

  public readonly columns: Column[] = [
    { field: 'subpoenaNo', header: '傳票號碼' },
    { field: 'subpoenaType', header: '傳票種類' },
    { field: 'subpoenaDate', header: '傳票日期' },
    { field: 'subpoenaStatus', header: '傳票狀態' },
    { field: 'subpoenaSummary', header: '傳票摘要' },
    { field: 'subpoenaAmount', header: '傳票金額' },
    { field: 'detailCount', header: '明細筆數' },
  ];

  // // Upload files
  // fileType: string = '';
  // uploadUrl: string = 'https://www.primefaces.org/cdn/api/upload.php';
  // queryForm = this.formBuilder.group({
  //   startserialticket: [],
  //   endserialticket: [],
  //   Subpoenatype: [],
  //   SSubpoenadate: [day],
  //   ESubpoenadate: [day],
  //   Subpoenastatus: [],
  //   Subpoenasummary: [],
  //   builder: [],
  //   modifyer: [],
  //   Sbuilddate: [day],
  //   Ebuilddate: [day],
  //   Smodifydate: [day],
  //   Emodifydate: [day],
  //   Subpoenatype2: [],


  // });

  // // Dropdown options
  // Subpoenatype2: any[] = [
  //   { value: 1, label: '贊助金傳票' },
  //   { value: 2, label: '電匯EDI傳票' },
  //   { value: 3, label: '年結傳票' },
  //   { value: 4, label: '銀行資金調撥傳票' },
  //   { value: 5, label: '零用金拋轉傳票' },
  //   { value: 6, label: '票據兌現傳票' },
  //   { value: 7, label: '支票沖轉傳票' },
  //   { value: 8, label: '退票沖轉票據傳票' },
  //   { value: 9, label: '開票傳票' },
  //   { value: 10, label: '撤票沖轉票據傳票' },
  // ];

  // departmentOptions: any[] = [];
  // ifOptions: any[] = [
  //   { value: 1, label: '是' },
  //   { value: 2, label: '否' },
  // ];
  // detail: any[] = [
  //   { value: 1, label: '統制' },
  //   { value: 2, label: '明細' },
  // ];
  // Subpoenaformatl: any[] = [
  //   { value: 1, label: '無特定' },
  //   { value: 2, label: '應付票據' },
  //   { value: 3, label: '應收票據' },
  // ];
  // Subpoenatype: any[] = [
  //   { value: 1, label: '現金收入傳票' },
  //   { value: 2, label: '現金支出傳票' },
  //   { value: 3, label: '轉帳傳票' },
  // ];
  // borrowloanOptions: any[] = [
  //   { value: 1, label: '借' },
  //   { value: 2, label: '貸' },
  // ];

  // accountingaccountOptions: any[] = [
  //   { value: 1, label: '是' },
  //   { value: 2, label: '否' },
  // ];

  // statusOptions: any[] = [
  //   { value: 1, label: '未拋轉' },
  //   { value: 2, label: '已拋轉' },
  //   { value: 3, label: '已退回' },
  // ];

  // unitOptions: any[] = [
  //   { value: 1, label: '元' },
  //   { value: 2, label: '千' },
  //   { value: 3, label: '萬' },
  // ];

  // typeOptions: any[] = [
  //   { value: 1, label: '統制' },
  //   { value: 2, label: '明細' },
  // ];

  // SubpoenatypeOptions: any[] = [
  //   { value: 1, label: '現金收入傳票' },
  //   { value: 2, label: '現金支出傳票' },
  //   { value: 3, label: '轉帳傳票' },
  // ];

  // Subpoenastatus: any[] = [
  //   { value: 1, label: '作廢' },
  //   { value: 2, label: '建立' },
  //   { value: 3, label: '確認' },
  //   { value: 4, label: '過帳' },
  //   { value: 5, label: '刪除' },
  // ];

  // codeOptions: any[] = [
  //   { value: 1, label: '68919301_臺南紡織股份有限公司' },
  //   { value: 2, label: '73251209_統一企業股份有限公司' },
  //   { value: 3, label: '96978370_統正開發股份有限公司' },
  // ];

  // // Table data
  // data: any[] = [

  // ];
  // filteredData: any[] = [...this.data];
  // columns: any[] = [
  //   { field: 'invoiceNumber', header: '傳票號碼', visible: true },
  //   { field: 'invoiceType', header: '傳票種類', visible: true },
  //   { field: 'invoiceDate', header: '傳票日期', visible: true },
  //   { field: 'invoiceStatus', header: '傳票狀態', visible: true },
  //   { field: 'invoiceSummary', header: '傳票摘要', visible: true },
  //   { field: 'invoiceAmount', header: '傳票金額', visible: true },
  //   { field: 'detailCount', header: '明細筆數', visible: true }
  // ];

  constructor(
    public service: FIN53010Service,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN53010', '/FIN/FIN53010CRU', this.queryForm, this.onSubmit.bind(this));
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {

      this.submitted = !1;
      this.loading = !0;
    });
  }


  // vendorOptions: any[] = [];
  // displayOptions2: any[] = [];
  // AnalysisdateCOptions: any[] = [];
  // FlippingstateOptions: any[] = [];
  // usercode: any[] = [];
  // ngOnInit(): void {
  //   this.ProgNo = '150016';
  //   // Initialize dropdown options
  //   this.funInfo = this.authService.getUserPermissions(this.ProgNo);

  //   this.userCodeService
  //     .getUserCode()
  //     .subscribe((data) => (this.usercode = data));


  // }

  // onSubmit(frm: FormGroup) {
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
  //     this.router.navigate(['FIN5000/FIN53010CRU'], extras);
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
