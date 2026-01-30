import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CPM12030Data, CPM12030Request, Cpm12030Service } from '@service/api/cpm/cpm12030.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDateTime, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-cpm12030',
  templateUrl: './cpm12030.component.html',
  standalone: true,
  imports: [AsyncPipe, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, TranslateModule]
})
export class CPM12030Component extends BasicQueryPageComponent<CPM12030Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    KIND_SubID: [null],  // 子類別代碼
    KIND_SubName: [null, [Validators.maxLength(40)]],// 子類別名稱
    KIND_ID: [null], // 主類別
    pageSize: [30],
    pageIndex: [1],
  });
  data: CPM12030Data[] = [];
  selectedRows: CPM12030Data[] = [];
  totalRecords = 0;
  lastQuery: CPM12030Request | null = null;
  columns: ReportColumn[] = [
    { field: 'KIND_ID', header: '主類別編號' },
    { field: 'KIND_Name', header: '主類別名稱' },
    { field: 'KIND_SubID', header: '子類別編號' },
    { field: 'KIND_SubName', header: '子類別名稱' },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員編號', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員名稱', visible: false },
  ];
  KIND_IDOptions$ = this.dropdown.queryCss1002();
  // 子類別選單 (連動 KIND_ID)
  KIND_SubIDOptions$ = this.dropdown.queryCss1003({ KIND_ID: null });

  constructor(
    public readonly cpm12030Service: Cpm12030Service,
    private readonly dropdown: DropdownApiService,
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
  onDelete(selectedItems: CPM12030Data[]) {
    this.messageService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料?`,
      accept: () => {
        const IDs = selectedItems.map(item => item.ID);
        this.cpm12030Service.deleteCPM12030({ IDs }).pipe(untilDestroyed(this)).subscribe(() => {
          this.messageService.successBubble('刪除成功');
          this.onSubmit(this.queryForm);
        });
      }
    });
  }
}
