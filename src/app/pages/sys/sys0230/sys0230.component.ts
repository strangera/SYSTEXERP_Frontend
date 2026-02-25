import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { Sys0210Service } from '../../../service/api/sys/sys0210.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { tblRole } from '../../../shared/models/sys/sysb000.model';
@Component({
  selector: 'app-sys0230',
  templateUrl: './sys0230.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
  ],
})

export class SYS0230Component extends BasicQueryPageComponent<tblRole>
  implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    Role_No: ['', [Validators.maxLength(10), this.validationService.alphanumericValidator]], // 角色代號
    Role_Name: ['', [Validators.maxLength(30)]], // 角色名稱
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'Role_No', order: 1 }]],
  });

  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: tblRole[] = [];
  columns: ReportColumn[] = [
    { field: 'Role_No', header: '角色代號', visible: true },
    { field: 'Role_Name', header: '角色名稱', visible: true },
    { field: 'Description', header: '角色註記', visible: true },
  ];
  lastQueryBody: any;
  // 多選項目
  selectedItems: tblRole[] = [];

  // 選項
  roleCodeOptions: any[] = [];

  constructor(
    public readonly sys0210Service: Sys0210Service,
    private readonly validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0230', 'SYS/SYS0230cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.sys0210Service.queryRole(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        if (response.Data) {
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.lastQueryBody = frm.value;
        } else {
          this.data = [];
          this.totalRecords = 0;
        }
      });
    });
  }
}
