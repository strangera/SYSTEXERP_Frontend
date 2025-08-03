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
    selector: 'app-tls2a050',
    templateUrl: './tls2a050.component.html',
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
export class TLS2A050Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    status1: [''],
    status2: [''],
    salesDate: [null as Date | null],
    startdate: [null as Date | null],
    enddate: [null as Date | null],
  });

  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  statusOptions = [
    { label: '全部', value: 'all' },
    { label: '一般', value: 'ordinary' },
    { label: '停管', value: 'stop' }
  ];
  salesMinDate: Date | null = null;
  salesMaxDate: Date | null = null;
  columns: any[] = [
    { field: 'contactPerson', header: '系統筆數', visible: true },
    { field: 'contactDate', header: '實收筆數', visible: true },
    { field: 'UID', header: '系統金額', visible: true },
    { field: 'industryType', header: '實收金額', visible: true },
    { field: 'category', header: '帳差(實收-系統)', visible: true },
    // 其他欄位
  ];

  constructor(

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2A050', '/TLS/TLS2A050cru', this.queryForm, (form) => this.onSubmit(form));
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

}
