import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DeleteFIN61020Request, Fin61020Service, QueryFIN61020Request, QueryFIN61020Response } from '@service/api/fin/fin61020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
@Component({
  selector: 'app-fin61020',
  templateUrl: './fin61020.component.html',
  standalone: true,
  imports: [AsyncPipe, DropdownComponent, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, TranslateModule]
})
export class FIN61020Component extends BasicQueryPageComponent<QueryFIN61020Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    Sales_Id: [null, [Validators.maxLength(4)]],
    User_no: [null, [Validators.maxLength(16)]],
    User_Name: [null, [Validators.maxLength(20)]],
    ORG_ID: [null],
    pageSize: [30],
    pageIndex: [1],
  });
  totalRecords = 0;
  data: QueryFIN61020Response[] = [];
  selectedItems: QueryFIN61020Response[] = [];
  lastQuery: QueryFIN61020Request | null = null;
  columns: ReportColumn[] = [
    { field: 'Sales_Id', header: '業務員代號', visible: true },
    { field: 'User_no', header: '員工編號', visible: true },
    { field: 'User_Name', header: '員工姓名', visible: true },
    { field: 'ORG_ID', header: '組織代號', visible: true }
  ];
  orgOptions = this.dropdown.querySys3100();
  constructor(
    public readonly fin61020Service: Fin61020Service,
    private readonly dropdown: DropdownApiService
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('FIN61020', '/fin/fin61020cru', this.queryForm, (frm) => this.onSubmit(frm));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin61020Service.queryFIN61020(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.lastQuery = frm.value;
        this.totalRecords = response.TotalCount || 0;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  // 假設您在 .ts 檔案的頂部已經引入了相關的類型
  // import { QueryFIN61020Response, DeleteFIN61020Request } from './fin61020.service';

  onDelete(selectedRows: QueryFIN61020Response[]) {
    // 檢查是否有選中的項目
    if (!selectedRows || selectedRows.length === 0) {
      // 這裡可以選擇顯示一個警告訊息給使用者
      // 例如：this.messageService.add({severity: 'warn', summary: '警告', detail: '請選擇至少一筆資料進行刪除。'});
      return;
    }

    this.messageService.confirm({
      header: '刪除確認',
      message: `您確定要刪除選中的 ${selectedRows.length} 筆業務員資料嗎?`,
      accept: () => {
        const ids: number[] = selectedRows.map(row => row.ID);
        const deleteRequest: DeleteFIN61020Request = {
          IDs: ids
        };
        this.loading = true;
        this.fin61020Service.deleteFIN61020(deleteRequest).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
          this.messageService.successBubble(response.Message);
          this.onSubmit(this.queryForm);
          this.selectedItems = [];
        });
      }
    });
  }
}
