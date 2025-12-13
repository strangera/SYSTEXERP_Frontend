import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CPM12030Request, CPM12030Response, Cpm12030Service } from '@service/api/cpm/cpm12030.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

//5.1.2.3 顧客意見子類別維護
@Component({
  selector: 'app-cpm12030',
  templateUrl: './cpm12030.component.html',
  standalone: true,
  imports: [TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, TranslateModule]
})
export class CPM12030Component extends BasicQueryPageComponent<CPM12030Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    subCategoryCode: [null], // 子類別編號
    subCategoryName: [null, [Validators.maxLength(40)]], // 責任單位名稱類別名稱
    opinionCategory: [null], // 客戶意見主類別
    pageSize: [30],
    pageIndex: [1],
  });
  data: CPM12030Response[] = [];
  selectedRows: CPM12030Response[] = [];
  totalRecords = 0;
  lastQuery: CPM12030Request | null = null;
  columns: ReportColumn[] = [
    { field: 'opinionCategoryCode', header: '主類別編號' },
    { field: 'opinionCategoryName', header: '主類別名稱' },
    { field: 'subCategoryCode', header: '子類別編號' },
    { field: 'subCategoryName', header: '子類別名稱' },
  ];
  subCategoryCodeOptions = [];
  opinionCategoryOptions = [];

  constructor(
    public readonly cpm12030Service: Cpm12030Service
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('CPM12030', 'cpm/cpm12030cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.cpm12030Service.queryCPM12030(frm.getRawValue()).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQuery = frm.getRawValue();
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      })
    })
  }
  onDelete(selectedItems: CPM12030Response[]) {
    this.confirmationService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料?`,
      accept: () => {
        const idList = selectedItems.map(item => item.id);
        // this.cpm12030Service.deleteCPM12030({ idList }).pipe(untilDestroyed(this)).subscribe(() => {
        //     this.messageService.successBubble('刪除成功');
        //     this.onSubmit(this.queryForm);
        //   });
      }
    });
  }
}
