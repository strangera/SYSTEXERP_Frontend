import { Component, OnInit } from '@angular/core';
import { FIN12020Data, FIN12020QueryRequest, FIN12020Service } from '../../../service/api/fin/fin12020.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { ECRNoService } from '@service/basic/ECRNo.service';
import { MultiSelectComponent } from '@shared/componentkit';

@Component({
  selector: 'app-fin12020',
  templateUrl: './fin12020.component.html',
  styleUrl: './fin12020.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, InputTextComponent, InputTextRangeComponent, ButtonComponent, TableComponent, TranslateModule, MultiSelectComponent]
})
export class FIN12020Component extends BasicQueryPageComponent<FIN12020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    GUI_YYMM_start: ['', Validators.required], // 發票年月(起)
    GUI_YYMM_end: ['', Validators.required], // 發票年月(迄)
    GUI_TRACK: ['', [Validators.maxLength(2)]], // 字軌
    GUINo_start: ['', [Validators.maxLength(8)]], // 發票號碼(起)
    GUINo_end: ['', [Validators.maxLength(8)]], // 發票號碼(迄)
    GUIPaperList: [[]], // 發票類別清單 (多選)
    ECR_NOList: [[]], // 收銀機號清單 (多選)
    GUI_StatusList: [[]], // 發票狀態清單 (多選)
    SAL_TypeList: [[]], // 使用別清單 (多選)
  });

  totalRecords = 0;
  data: FIN12020Data[] = [];
  selectedItems: FIN12020Data[] = [];

  // TODO: 格式化設定
  columns: Column[] = [
    { field: 'GUI_YYMM', header: '發票年月', visible: true },
    { field: 'ECR_NO', header: '機號', visible: true },
    { field: 'GUI_TRACK', header: '字軌', visible: true },
    { field: 'GUI_SNOS', header: '起始號碼', visible: true },
    { field: 'GUI_ENOS', header: '發票號碼', visible: true },
    { field: 'TOT_NOS', header: '全部張數', visible: true },
    { field: 'USED_NOS', header: '已用張數', visible: true },
    { field: 'FREE_NOS', header: '未用張數', visible: true },
    { field: 'GUIPaper', header: '發票類別', visible: true },
    { field: 'SAL_Type', header: '使用別', visible: true },
    { field: 'CRT_Date', header: '建檔日期', visible: true },
    { field: 'CRT_USR_No', header: '建檔人員', visible: true },
  ];

  // 下拉選單 options
  invoiceTypeOptions: any[] = [];
  cashierNoOptions: any[] = [];
  invoiceStatusOptions: any[] = [];
  usageTypeOptions: any[] = [];

  constructor(private fin12020Service: FIN12020Service, private ecrNoService: ECRNoService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN12020', 'fin/fin12020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin12020Service.queryFIN12020(frm.value)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        });
    });
  }

  // TODO: 待確認
  loadOptions() {
    // 取得發票類別選項
    this.invoiceTypeOptions = [
      { label: '一般發票', value: '01' },
      { label: '特種發票', value: '02' },
      { label: '電子發票', value: '03' }
    ];

    // 取得收銀機號選項
    this.ecrNoService.getECRNo().subscribe((res) => {
      this.cashierNoOptions = res;
    });

    // 取得發票狀態選項
    this.invoiceStatusOptions = [
      { label: '未使用', value: '0' },
      { label: '已使用', value: '1' },
      { label: '已作廢', value: '2' }
    ];

    // 取得使用別選項
    this.usageTypeOptions = [
      { label: '一般', value: '01' },
      { label: '特殊', value: '02' }
    ];
  }
}