import { Component, computed, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN54035Service } from '@service/api/fin/fin54035.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { FIN54035Data } from './fin54035.model';

@Component({
  selector: 'app-fin54035',
  templateUrl: './fin54035.component.html',
  styleUrl: './fin54035.component.scss',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    MenubarComponent,
  ]
})
export class FIN54035Component extends BasicQueryPageComponent<FIN54035Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
  });
  public readonly qf = computed(() => this.queryForm.controls);

  // // Upload files
  // fileType: string = '';
  // uploadUrl: string = 'https://www.primefaces.org/cdn/api/upload.php';
  // queryForm = this.formBuilder.group({
  //   startserialticket: [],
  //   endserialticket: [],
  //   Subpoenatype: [],
  //   SSubpoenadate: [],
  //   ESubpoenadate: [],
  //   Subpoenastatus: [],
  //   Subpoenasummary: [],
  //   builder: [],
  //   Residualvalueyears: [],
  //   Depreciation: [],
  //   accountsummary: [],
  //   Subpoenatype2: [],
  //   Postingmethod: [],
  //   yearmm: [],
  //   buildnumber: [],
  //   confirmationnumber: [],
  //   postingnumber: [],
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
  // Postingmethod: any[] = [
  //   { value: 1, label: '依明細勾選' },
  //   { value: 2, label: '依過帳年月' },
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
  //   { value: 1101, label: '現金收入傳票' },
  //   { value: 110101, label: '現金支出傳票' },
  //   { value: 110102, label: '轉帳傳票' },
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

  constructor(
    public readonly service: FIN54035Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN54035', '/FIN/FIN54035CRU', this.queryForm, this.onSubmit.bind(this));
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const payload = {
        // Populate the payload with the necessary data
      };

      this.service.loadFIN54035(payload).subscribe();
    });
  }
  //   this.ProgNo = '150022';
  //   // Initialize dropdown options

  //   this.userCodeService
  //     .getUserCode()
  //     .subscribe((data) => (this.usercode = data));
  //   this.IfdisplayService.getOptions().subscribe(
  //     (data) => (this.displayOptions2 = data)
  //   );
  //   this.AnalysisdateCService.getOptions().subscribe(
  //     (data) => (this.AnalysisdateCOptions = data)
  //   );
  //   this.vendorService.getVendors().subscribe((data) => {
  //     this.vendorOptions = data;
  //   });
  //   this.flippingstateService.getOptions().subscribe((data) => {
  //     this.FlippingstateOptions = data;
  //   });
  //   this.organizationNumberService
  //     .getOrganizationNumbers()
  //     .subscribe((data) => {
  //       this.departmentOptions = data;
  //     });
  //   // this.accountingaccountService.getOptions().subscribe((data) => {
  //   //   this.accountingaccountOptions = data;
  //   // });
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
