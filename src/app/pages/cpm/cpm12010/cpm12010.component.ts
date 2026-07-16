import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'; // 引入 FormBuilder
import { untilDestroyed } from '@ngneat/until-destroy'; // 確保您有安裝此函式庫
import { TranslateModule } from '@ngx-translate/core';
import { Cpm12010Data, Cpm12010Service, DropdownCpm12010Data, QueryCpm12010Request } from '@service/api/cpm/cpm12010.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { Column, formatDateTime } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs'; // 引入 finalize
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

//5.1.2.1 顧客意見類別維護
@Component({
  selector: 'app-cpm12010',
  templateUrl: './cpm12010.component.html',
  standalone: true,
  imports: [TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, TranslateModule] // 補上 BasicQueryPageComponent
})
export class CPM12010Component extends BasicQueryPageComponent<Cpm12010Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    KIND_ID: [null],
    KIND_Name: [null, Validators.maxLength(60)],
    PageSize: [30],
    PageIndex: [1],
  });
  totalRecords = 0;
  // 資料列表
  data: Cpm12010Data[] = [];
  lastQuery: QueryCpm12010Request | null = null;
  // 顧客意見類別下拉選單 (供查詢條件使用，可選)
  kindDropdown: DropdownCpm12010Data[] = [];

  // 表格欄位定義
  columns: Column[] = [
    { field: 'KIND_ID', header: '客戶意見類別編號', visible: true },
    { field: 'KIND_Name', header: '類別名稱', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員編號', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員名稱', visible: false },
  ];

  // 選中的列 (用於刪除)
  selectedRows: Cpm12010Data[] = [];

  constructor(
    public readonly cpm12010Service: Cpm12010Service, // 注入服務
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化頁面，設定程式編號、新增/修改頁面路由、表單、和提交函式
    this.initializePage('CPM12010', '/cpm/cpm12010cru', this.queryForm, (form) => this.onSubmit(form));
    // 讀取下拉選單資料
    this.getKindDropdown();
  }

  /** 取得顧客意見類別下拉選單 */
  getKindDropdown(): void {
    this.cpm12010Service.dropdownCPM12010().pipe(untilDestroyed(this)).subscribe(res => {
      this.kindDropdown = res.Data;
    });
  }

  /** 提交查詢 */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 呼叫查詢服務
      this.cpm12010Service.queryCPM12010(frm.value).pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this)
      ).subscribe(res => {
        this.lastQuery = frm.value;
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  /** 刪除選中的資料 */
  onDelete(data: Cpm12010Data[]): void {
    this.messageService.confirm({
      header: `是否確認刪除 ${data.length} 筆資料?`,
      accept: () => {
        const idList = data.map(item => item.ID);
        this.cpm12010Service.deleteCPM12010({ IDList: idList }).pipe(untilDestroyed(this)).subscribe(res => {
          this.messageService.successBubble(res.Message);
          this.selectedRows = []; // 清空選取
          this.onSubmit(this.queryForm); // 重新查詢
        });
      }
    });
  }
}
