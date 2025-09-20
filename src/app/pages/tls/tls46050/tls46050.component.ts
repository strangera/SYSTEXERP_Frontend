import { ValidationService } from '@shared/service/validation.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { AsyncPipe } from '@angular/common';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { Tls46050Service } from '@service/api/tls/tls46050.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';

// 2.4.6.5  TM監控報表
@Component({
  selector: 'app-tls46050',
  templateUrl: './tls46050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    ButtonComponent,
    TranslateModule,
    DropdownRangeComponent,
    AsyncPipe,
    TableReportComponent,
    MultiSelectComponent
  ]
})
export class TLS46050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ECR_No_Start: [], // start serial number
    ECR_No_End: [], // end serial Text
    IDONTKNOW: [], // DropDown
    ECR_GrpNo: [], // DropDown
  }, { validators: this.validation.textRangeValidator('ECR_No_Start', 'ECR_No_End') });
  totalRecords = 0;
  historyRequestBody: any;
  ECR_NoOptions = this.dropdown.queryPos1002();
  ECR_GrpNoOptions = this.dropdown.queryPos1002Grm();
  data: any[] = [];
  columns: ReportColumn[] = [
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'ECR_Name', header: '收銀機名稱' },
    { field: '', header: 'POS環境變數檔' },
    { field: '', header: 'TOUCH功能按鈕開/關設定檔' },
    { field: '', header: 'POS版本' },
  ];
  constructor(
    private readonly dropdown: DropdownApiService,
    private readonly validation: ValidationService,
    public readonly tls46050Service: Tls46050Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS46050', '/tls/tls46050cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    // this.handleSubmit(frm, () => {
    //   this.tls46050Service.queryTLS57050(frm.getRawValue()).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
    //     this.data = res.data;
    //     this.totalRecords = res.totalRecords;
    //     this.historyRequestBody = frm.getRawValue();
    //   });
    // });
  }
}
