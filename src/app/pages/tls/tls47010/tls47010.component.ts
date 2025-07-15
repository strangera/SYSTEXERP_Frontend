import { Component } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { FloorService } from '../../../service/basic/floor.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { DataTypeService } from '../../../service/basic/data-type.service';
import { TLS47010Service } from '../../../service/api/tls/tls47010.service'; // ✅ 你需要新增此 service
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { QueryYearMonthComponent } from '../../../shared/componentkit/query-year-month/query-year-month.component';

@Component({
  selector: 'app-tls47010',
  templateUrl: './tls47010.component.html',
  styleUrls: ['./tls47010.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
   
    MultiSelectComponent,
   
    TranslateModule,

    
  ],
})
export class TLS47010Component extends BasicQueryPageComponent<any> {
  ECRNoOptions: any[] = []; // 收銀機號下拉選單
  CounterOptions: any[] = []; // 專櫃選項
  registerIDOptions: any[] = [];
  dataTypeOptions: any[] = [];

  selectedItems: any[] = [];
  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'Line1', header: 'Line1', visible: true },
    { field: 'Line2', header: 'Line2', visible: true },
    { field: 'Line3', header: 'Line3', visible: true },
    { field: 'Line4', header: 'Line4', visible: true },
    { field: 'Line5', header: 'Line5', visible: true },
  ];

   queryForm = this.formBuilder.group({
    ECR_No: [],
    TLT_No:[],
    range_Start:[],
    range_End:[],
    YYYYMM:[],
    dataType: [[], Validators.required],
    ...createPaginationConfig([]),
  });

  constructor(
    private floorService: FloorService,
    private counterCodeService: CounterCodeService,
    private dataTypeService: DataTypeService,
    private counterNameService: CounterNameService,
    private ECRNoService: ECRNoService,
    private tls47010Service: TLS47010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'TLS47010',
      '/tls/tls47010cru',
      this.queryForm,
      this.onSubmit.bind(this),
    );

    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });

    this.floorService.getFloors().subscribe((res) => {
      this.registerIDOptions = res;
    });

    this.dataTypeService.getSystemTypes().subscribe((res) => {
      this.dataTypeOptions = res;
    });
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;

    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const payload = { ...form.value };
    this.loading = true;
    this.messageService.blockUi();

    this.tls47010Service.queryTLS47010(payload).subscribe({
      next: (res) => {
        this.data = res.Data || [];
        this.totalRecords = res.TotalCount || this.data.length;
        this.queryStateService.setQueryState(this.ProgNo, payload);
        this.messageService.successBubble('查詢成功');
      },
      error: () => {
        this.messageService.errorBubble('查詢錯誤');
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  onClearForm(): void {
    this.queryForm.reset();
  }
  onDownload(): void {
  if (!this.data || this.data.length === 0) {
    this.messageService.warnBubble('無資料可下傳');
    return;
  }

  const payload = {
    DEFTBL_List: this.data.map(d => d.DEFTBL_ID || d.id || ''), // ✅ 依據實際欄位替換
    POS1002_List: this.data.map(d => d.POS1002_ID || d.id || '') // ✅ 依據實際欄位替換
  };

  this.loading = true;
  this.messageService.blockUi();

  this.tls47010Service.insertTLS47010(payload).subscribe({
    next: (res) => {
      this.messageService.successBubble('下傳成功');
    },
    error: () => {
      this.messageService.errorBubble('下傳失敗');
    },
    complete: () => {
      this.loading = false;
      this.messageService.unblockUi();
    }
  });
}
}
