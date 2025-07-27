import { WhetherService } from './../../../service/basic/whether.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { TLS22020Service } from '../../../service/api/tls/tls22020.service';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';

@Component({
  templateUrl: './tls22020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    MultiSelectComponent,
    DropdownModule,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    DropdownRangeComponent
  ],
})

export class TLS22020Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    ECR_No: [null],
    TXN_Date: [null, [Validators.required]],
    ECR_No_Start: [null],
    ECR_No_End: [null],
    status1: [null],
  });
  // 表格資料
  data: any[] = [];
  ECRNoOptions: any[] = [];
  columns: any[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'pay_NoDataList', header: '明細', visible: true},
    { field: 'pay_NoDataList', header: 'Z表' , visible: true},
    { field: 'pay_NoDataList', header: '差額' , visible: true},
  ];


  // 下拉選單選項
  whetherOptions: any[] = [];
  totalRecords = 0;
  statusOptions = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' }
  ];

  constructor(

    private validationService: ValidationService,
    private whetherService: WhetherService,
    private ECRNoService: ECRNoService,

    private tls22020Service: TLS22020Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22020', '/TLS/TLS22020cru', this.queryForm, (form) => this.onSubmit(form));
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;
    });
    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });
  }

  onSubmit(form: FormGroup): void {
    console.log('表單提交:', form.value);
    this.handleSubmit(form, () => {
      console.log('送出查詢參數:', form.value);
      this.tls22020Service.queryTLS22020(form.value).subscribe({
        next: (res) => {
          this.data = res.Data ?? [];
          this.totalRecords = res.TotalCount;
          this.loading = false;
          this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
        },
        error: (err) => {
          console.error('TLS22020 查詢失敗', err);
          this.loading = false;
        }
      });
    });
  }
}



