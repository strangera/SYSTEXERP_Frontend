import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule, } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

// Component Kit
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

// Services
import { TLS2C040Data, TLS2C040Service } from '../../../service/api/tls/tls2c040.service';
import { SubpoenaTypeService } from '../../../service/basic/subpoena-type.service';
import { SubpoenaStatusService } from '../../../service/basic/subpoena-status.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls2c040',
  templateUrl: './tls2c040.component.html',
  styleUrl: './tls2c040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    CalendarRangeComponent,
    InputTextComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS2C040Component extends BasicQueryPageComponent<TLS2C040Data> {
  queryForm = this.formBuilder.group({
    subpoenaType: [null], // 傳票總類
    startdate: [null], // 傳票開始日期
    enddate: [null],   // 傳票結束日期
    subpoenaStatus: [null], // 傳票狀態
    serialnumber: [null], // 結帳單號
    ...createPaginationConfig([{ field: 'UID', order: 1 }]),
  });

  data: TLS2C040Data[] = [];
  totalRecords = 0;
  selectedItems: TLS2C040Data[] = [];

  // 下拉選單資料
  subpoenaTypeOptions: any[] = [];
  subpoenaStatusOptions: any[] = [];

  columns = [
    { field: 'contactPerson', header: '應收(付)明細暫存資料', visible: true },
    { field: 'contactDate', header: '傳票編號', visible: true },
    { field: 'UID', header: '傳票種類', visible: true },
    { field: 'industryType', header: '傳票日期', visible: true },
    { field: 'category', header: '傳票狀態', visible: true },
    { field: 'version', header: '傳票摘要', visible: true },
    { field: 'rentNumber', header: '結帳單號', visible: true },
  ];

  constructor(
    private subpoenaTypeService: SubpoenaTypeService,
    private subpoenaStatusService: SubpoenaStatusService,
    private tls2c040Service: TLS2C040Service,
    public validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2C040', '/tls/tls2c040cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(this.queryForm, () => {
      this.tls2c040Service.queryTLS2C040(frm.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(res => {
          this.data = res.Data;
          this.totalRecords = res.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        });
    });
  }

  loadOptions(): void {
    this.subpoenaTypeService.getSystemTypes().subscribe(data => {
      this.subpoenaTypeOptions = data;
    });

    this.subpoenaStatusService.getSystemTypes().subscribe(data => {
      this.subpoenaStatusOptions = data;
    });
  }
}
