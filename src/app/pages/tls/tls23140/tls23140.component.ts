import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
@Component({
  selector: 'app-tls23140',
  templateUrl: './tls23140.component.html',
  styleUrls: ['./tls23140.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    InputTextComponent,
    ButtonComponent,
    TranslateModule,
  ],
})
export class TLS23140Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  totalRecords = 0;
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    transactionDateStart: [this.yesterday, [Validators.required]],
    transactionDateEnd: [this.yesterday, [Validators.required]],
    transactionMachine: [''],
    counterNumber: [''],
    voucherAmount: [''],
    transactionSerialNumber: [''],
    ECR_No: [[]],
    TLT_No: [[]],
    ...createPaginationConfig([{ field: 'transactionDate', order: 1 }]),
  });

  columns: any[] = [
    { field: 'transactionDate', header: '交易日期', visible: true },
    { field: 'transactionMachineNumber', header: '交易機號', visible: true },
    { field: 'franchiseNumber', header: '專櫃編號', visible: true },
    { field: 'franchiseName', header: '櫃位名稱', visible: true },
    { field: 'recruitmentNumber', header: '招募編號', visible: true },
    { field: 'transactionSerialNumber', header: '交易序號', visible: true },
    {
      field: 'voucherAmount',
      header: '有價券金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
  ];

  ECRNoOptions: any[] = [];
  CounterOptions: any[] = []; // 專櫃選項

  constructor(
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23140', '', this.queryForm);

    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }
}
