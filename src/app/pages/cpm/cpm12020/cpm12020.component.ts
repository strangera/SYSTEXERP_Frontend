import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CPM12020Request, CPM12020Response, Cpm12020Service } from '@service/api/cpm/cpm12020.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-cpm12020',
  templateUrl: './cpm12020.component.html',
  standalone: true,
  imports: [AsyncPipe, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, TranslateModule]
})
export class CPM12020Component extends BasicQueryPageComponent<CPM12020Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ORG_ID: [null], // 組織代碼
    CLASS_CODE: [null, [Validators.maxLength(40)]], // 類別代碼
    CLASS_NAME: [null, [Validators.maxLength(40)]], // 責任單位名稱
    pageSize: [30],
    pageIndex: [1],
  });
  data: CPM12020Response[] = [];
  selectedRows: CPM12020Response[] = [];
  totalRecords = 0;
  lastQuery: CPM12020Request | null = null;
  columns: ReportColumn[] = [
    { field: 'ORG_ID', header: '組織代號' },
    { field: 'ORG_NAME', header: '組織名稱' },
    { field: 'CLASS_CODE', header: '類別代號' },
    { field: 'SYS_Name', header: '類別名稱' },
    { field: 'CLASS_NAME', header: '責任單位名稱' },
  ];
  CLASS_CODEOptions = getSYS1000Options('T211').map(item => ({ value: item.value, label: `${item.value} - ${item.label}` }));
  ORG_IDOptions$ = this.dropdown.querySys3100();
  constructor(
    public readonly cpm12020Service: Cpm12020Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('CPM12020', 'cpm/cpm12020cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.cpm12020Service.queryCPM12020(frm.getRawValue()).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQuery = frm.getRawValue();
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      })
    })
  }
  onDelete(selectedItems: CPM12020Response[]) {
    this.messageService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料?`,
      accept: () => {
        const idList = selectedItems.map(item => item.ID);
        this.cpm12020Service.deleteCPM12020({ idList }).pipe(untilDestroyed(this)).subscribe(() => {
          this.messageService.successBubble('刪除成功');
          this.onSubmit(this.queryForm);
        });
      }
    });
  }
}
