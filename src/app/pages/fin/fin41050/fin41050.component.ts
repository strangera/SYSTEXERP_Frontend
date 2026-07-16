import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { fin41050data, fin41050response, Fin41050Service } from '@service/api/fin/fin41050.service';
import { Fin55070Service } from '@service/api/fin/fin55070.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableComponent } from '@others/component/table/table.component';
import { Column, createPaginationConfig, formatAmount } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-fin41050',
  standalone: true,
  templateUrl: './fin41050.component.html',
  imports: [
    AccordionModule,
    ButtonComponent,
    ButtonModule,
    CalendarComponent,
    DropdownComponent,
    FormsModule,
    InputTextComponent,
    InputNumberComponent,
    InputNumberRangeComponent,
    MenubarComponent,
    ReactiveFormsModule,
    TableComponent,
    TranslateModule
  ]
})
export class Fin41050Component extends BasicQueryPageComponent<fin41050data> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // fin41050data
    Org_ID: [null], // 部門代號
    Budget_Version: [null], // 版本
    Budget_YM: [null], // 年月
    AccNo: [null, [Validators.maxLength(20)]], // 會計科目
    Budget_From: [null, [Validators.max(10000000)]], // 金額區間 (起)
    Budget_To: [null, [Validators.max(10000000)]], // 金額區間 (迄)

    Remark: ['', [Validators.maxLength(100)]], // 備註
    //分頁查詢
    ...createPaginationConfig([{ field: 'Org_ID', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  Org_ID_Options: { value: string; label: string }[] = []; // 供應商編號 下拉選項
  AccNo_Options: { value: string; label: string }[] = []; // 會計科目 下拉選項

  data: fin41050data[] = [];
  columns: Column[] = [
    // { field: 'ID', header: 'ID', hidden: true },
    { field: 'Org_ID', header: '部門代號' },
    { field: 'Org_Name', header: '部門名稱' },
    { field: 'Budget_Version', header: '版本' },
    { field: 'Budget_Year', header: '年度' },
    { field: 'Budget_Month', header: '月份' },
    { field: 'AccNo', header: '會計科目' },
    { field: 'AccCName', header: '會計科目名稱' },
    { field: 'Budget', header: '預算金額', format: formatAmount },
    { field: 'Remark', header: '備註' },

  ];
  selectedItems: fin41050data[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(
    private fin41050Service: Fin41050Service,
    private fin55070Service: Fin55070Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN41050', 'FIN/FIN41050cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 先將Budget_YM拆成 Budget_Year、Budget_Month兩個參數，再送出API
      const payload = {
        ...frm.value,
        Budget_Year: frm.value.Budget_YM ? frm.value.Budget_YM.getFullYear().toString() : '',
        Budget_Month: frm.value.Budget_YM ? (frm.value.Budget_YM.getMonth() + 1).toString().padStart(2, '0') : '',// getMonth() 補0
        PageIndex: frm.value.pageIndex, // 轉型：小寫變大寫
        PageSize: frm.value.pageSize    // 轉型：小寫變大寫
      }
      console.log(' 部門預算request:', JSON.stringify(payload, null, 2));
      this.loading = false;
      this.fin41050Service.queryFIN41050(payload).subscribe({
        next: (response: fin41050response) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            console.log('Result', this.data);
            this.totalRecords = response.TotalCount || this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, payload);
          } else {
            console.error('API error:', response.Error.Message);
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

  //---刪除檢查---
  onDelete(data: fin41050data | fin41050data[]): void {
    console.log('Delete data:', JSON.stringify(data, null, 2));

    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      console.error('No items to delete');
      this.messageService.errorBubble('無法刪除：沒有選中的項目');
      return;
    }

    // 收集所有有效的 ID
    const idList = items
      .filter((item) => item && item.ID != null && item.ID !== undefined)
      .map((item) => item.ID);

    if (idList.length === 0) {
      console.error('No valid IDs to delete');
      this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
      return;
    }

    const deleteBody = {
      IDs: idList, // 符合 API 的 idList 格式
    };
    this.fin41050Service.deleteFIN41050(deleteBody).subscribe({
      next: (response: any) => {
        if (response.Status === '0000') {
          this.messageService.successBubble('選中項目刪除成功');
        } else {
          console.error('API error:', response.Status, response.Message);
          this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
        }
      },
      error: (err: string) => {
        console.error('API error:', err);
        this.messageService.errorBubble('刪除失敗');
      },
      complete: () => {
        this.onSubmit(this.queryForm);
      },
    });

    this.selectedItems = [];
  }

  loadOptions() {
    // 部門代號
    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];
        this.Org_ID_Options = list.map((item: { No?: string; Name?: string }) => ({
          value: item.No ?? '',
          label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        }));
      });
    //會計科目
    this.fin55070Service.getAccNoList().subscribe(res => {
      this.AccNo_Options = res;
    });
  }
}
