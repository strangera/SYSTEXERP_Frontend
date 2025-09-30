import { Cpm12040Data, Cpm12040Service, QueryCpm12040Request } from './../../../service/api/cpm/cpm12040.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
// 基礎元件
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
// 擴充元件
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
// 模型
import { Column, createPaginationConfig, formatDateTime } from '@shared/componentkit/table/table.model';
// 服務
import { getSYS1000Options } from '@service/system/sys1000.service';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';

//5.1.2.4 顧客意見來源維護
@Component({
  selector: 'app-cpm12040',
  templateUrl: './cpm12040.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, TableComponent, TranslateModule]
})
export class CPM12040Component extends BasicQueryPageComponent<QueryCpm12040Request> implements OnInit {
  totalRecords = 0;

  // 查詢表單定義：包含 SYS_Code, SYS_Name 和分頁/排序欄位
  queryForm = this.formBuilder.nonNullable.group({
    SYS_Code: [null], // 意見來源代碼
    SYS_Name: [null, Validators.maxLength(60)], // 意見來源名稱
    ...createPaginationConfig([{ field: 'SYS_Code', order: 1 }])
  });

  SUGG_SOURCE = getSYS1000Options('SUGG_SOURCE');

  // 資料列表
  data: Cpm12040Data[] = [];

  // 表格欄位定義
  columns: Column[] = [
    { field: 'SYS_Code', header: '客戶意見來源代碼', visible: true },
    { field: 'SYS_Name', header: '客戶意見來源名稱', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員編號', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員名稱', visible: false },
  ];

  // 選中的列 (用於刪除)
  selectedRows: Cpm12040Data[] = [];

  constructor(
    private readonly cpm12040Service: Cpm12040Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('CPM12040', '/cpm/cpm12040cru', this.queryForm, (form) => this.onSubmit(form));
  }

  /** 提交查詢 */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 呼叫查詢服務
      this.cpm12040Service.queryCPM12040(frm.value).pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this)
      ).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  /** 刪除選中的資料 */
  onDelete(data: Cpm12040Data[]): void {
    const idList = data.map(item => item.ID);
    this.cpm12040Service.deleteCPM12040({ IDList: idList }).pipe(untilDestroyed(this)).subscribe(res => {
      this.messageService.successBubble(res.Message);
      this.selectedRows = []; // 清空選取
      this.onSubmit(this.queryForm); // 重新查詢
    });
  }
}
