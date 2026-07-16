import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN41040data as fin41040data } from '@service/api/fin/fin41040.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { TableComponent } from '@others/component/table/table.component';
import { AddButton, Column } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { Fin41040Service } from './../../../service/api/fin/fin41040.service';

// FIN41040 產生年中版本作業
@Component({
  selector: 'app-fin41040',
  templateUrl: './fin41040.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    ButtonComponent,
    CalendarComponent,
    FormsModule,
    MenubarComponent,
    ReactiveFormsModule,
    TableComponent,
    TranslateModule]
})
export class FIN41040Component extends BasicQueryPageComponent<fin41040data> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    BudgetYear: ['', [Validators.required]], // 年度 (例如： 2026)
    //分頁查詢
    // ...createPaginationConfig([{ field: 'budget_year', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  data: fin41040data[] = [];
  columns: Column[] = [
    { field: 'budget_year', header: '年度', visible: true },
    { field: 'budget_version', header: '目前最新版本', visible: true },
    { field: 'new_budget_year', header: '產生年度', visible: true },
    { field: 'new_budget_version', header: '產生版本', visible: true },
  ];

  selectedItems: fin41040data[] = [];// 多選項目

  public readonly addButton: AddButton[] = [
    {
      label: '確定',
      icon: 'pi pi-circle',
      action: (rowData: fin41040data) => this.generateNewVersion(rowData),
    },
  ];


  // ----------------------------------------------------------------
  constructor(
    private fin41040Service: Fin41040Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN41040', 'FIN/FIN41040cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 將date格式轉換為string("2026")
      const payload = {
        BudgetYear: frm.value.BudgetYear ? frm.value.BudgetYear.getFullYear().toString() : null,
      };
      console.log('產生年中版本作業 request:', payload);
      this.fin41040Service.queryFIN41040(payload).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            const result = Array.isArray(response.Data)
              ? response.Data
              : (response.Data ? [response.Data] : []);
            this.data = result;

            // 將 NewBudgetYear = BudgetYear, NewBudgetVersion = BudgetVersion + 1
            this.data = this.data.map(item => ({
              ...item,
              new_budget_year: item.budget_year,
              new_budget_version: (parseInt(item.budget_version, 10) + 1).toString()
            }));
            console.log('Result', this.data);
            this.totalRecords = response.TotalCount;
            this.queryStateService.setQueryState(this.ProgNo, payload);
          } else {
            console.error('API error:', response.Status, response.Message);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  generateNewVersion(rowData: fin41040data) {
    // console.log('產生年中版本作業 - 產生新版本:', rowData);
    const payload = {
      OldBudgetYear: rowData.budget_year,
      OldVersion: rowData.budget_version,
      NewBudgetYear: rowData.new_budget_year,
      NewVersion: rowData.new_budget_version,
    };

    console.log('產生request:', payload);

    this.fin41040Service.copyFIN41040(payload).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.messageService.successBubble(response.Message);
          this.onSubmit(this.queryForm); // 重新查詢以更新表格
        } else {
          this.messageService.errorBubble('產生年中版本失敗: ' + response.Error.Message);
        }
      },
      error: (err: string) => {
        console.error('API error:', err);
        this.messageService.errorBubble('產生年中版本失敗: ' + err);
      },
    });
  }
}
