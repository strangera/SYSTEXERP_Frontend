import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';


@Component({
    selector: 'app-tls22050',
    templateUrl: './tls22050.component.html',
    standalone: true,
    imports: [
        MenubarComponent,
        AccordionModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarComponent,
        CalendarRangeComponent,
        DropdownModule,
        ButtonComponent,
        TableComponent,
        TranslateModule,
    ],
})
export class TLS22050Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    status1: ['all'],
    status2: ['ALL'],
    salesDate: [new Date()],
    startdate: [new Date()],
    enddate: [new Date()],
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  statusOptions = [
    { label: '全部', value: 'all' },
    { label: '一般', value: 'ordinary' },
    { label: '停管', value: 'stop' }
  ];
  status2Options = [
  { label: '全部', value: 'ALL' },
  { label: '連線', value: 'Y' },
  { label: '離線', value: 'N' },
];

  salesMinDate: Date | null = null;
  salesMaxDate: Date | null = null;
  columns: any[] = [
  { field: 'PAY_NO', header: '付款別', visible: true },
  { field: 'ECR_NO', header: '收銀機號', visible: true },
  { field: 'TXN_NO', header: '交易序號', visible: true },
  { field: 'SYS_AMT', header: '系統金額', visible: true },
  { field: 'ACT_AMT', header: '實收金額', visible: true },
  { field: 'DIFF_AMT', header: '帳差', visible: true },
  { field: 'ORDER_NO', header: '訂單編號', visible: true },
];


  constructor(

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22050', '/TLS/TLS22050cru', this.queryForm, (form) => this.onSubmit(form));
    // 初始化權限
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.queryForm.get('salesDate')?.valueChanges.subscribe((val) => {
      if (val) {
        const selected = new Date(val);
        const year = selected.getFullYear();
        const month = selected.getMonth();

        this.salesMinDate = new Date(year, month, 1);
        this.salesMaxDate = new Date(year, month + 1, 0);

        // 可選：重設原來的區間
        this.queryForm.patchValue({
          startdate: this.salesMinDate,
          enddate: this.salesMaxDate,
        });
      }
    });
  }

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  //   onSubmitQuery(frm: FormGroup) {
  //     // 查詢邏輯
  //     this.onSubmit(frm);
  //   }

  //   onClearForm() {
  //     this.queryForm.reset();  // 重置表單
  //   }

  //   onCreate() {
  //     if (this.canAdd()) {
  //       let extras: NavigationExtras = {
  //         state: {
  //           crudstatus: CRUDStatus.Create,
  //           queryform: this.queryForm,
  //         },
  //         skipLocationChange: true
  //       };

  //       //console.log("extra", extras);
  //       this.router.navigate(['/TLS2000/TLS2A050CRU'], extras);
  //     }
  //   }

  //   onEdit(data: any) {
  //     if (this.canEdit()) {
  //       let extras: NavigationExtras = {
  //         state: {
  //           crudstatus: CRUDStatus.Edit,
  //           rowdata: data,
  //           queryform: this.queryForm,
  //         },
  //         skipLocationChange: true
  //       };

  //       this.router.navigate(['/TLS2000/TLS2A050CRU'], extras);
  //     }
  //   }

  //   onDetail(data: any) {
  //     let extras: NavigationExtras = {
  //       state: {
  //         crudstatus: CRUDStatus.Read,
  //         rowdata: data,
  //         queryform: this.queryForm,
  //       },
  //       skipLocationChange: true
  //     };

  //     this.router.navigate(['/TLS2000/TLS2A050CRU'], extras);
  //   }
}
