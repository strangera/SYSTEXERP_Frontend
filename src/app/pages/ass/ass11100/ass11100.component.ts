import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { ASS11100Service } from '../../../service/api/ass/ass11100.service';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { ASS11100Data } from './ass11100.model';

//3.1.1.10 倉別設定作業
@Component({
  selector: 'app-ass11100',
  templateUrl: './ass11100.component.html',
  styleUrl: './ass11100.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule
  ]
})
export class ASS11100Component extends BasicQueryPageComponent<ASS11100Data> implements OnInit {
  // 查詢表單
  queryForm = this.formBuilder.group({
    WH_ID: ['', [Validators.maxLength(10)]], // 倉別
    WH_NAME: ['', [Validators.maxLength(50)]], // 倉別名稱
    ATT_ORG_ID: [null], // 部門代號
    NOTES: ['', [Validators.maxLength(160)]], // 備註
    ...createPaginationConfig([{ field: 'WH_ID', order: 1 }]), // 分頁和排序參數
  });

  totalRecords = 0;
  data: ASS11100Data[] = [];
  selectedItems: ASS11100Data[] = [];
  organizationOptions: Array<{ label: string; value: string }> = [];

  columns: Column[] = [
    { field: 'WH_ID', header: '倉別', visible: true, showSort: true },
    { field: 'WH_NAME', header: '倉別名稱', visible: true, showSort: true },
    { field: 'ATT_ORG_ID', header: '部門代號', visible: true, showSort: true },
    { field: 'NOTES', header: '備註', visible: true, type: 'html', showSort: true },
  ];

  constructor(
    private ass11100Service: ASS11100Service,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11100', 'ass/ass11100cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOrganizationOptions();
  }

  // 載入部門下拉選單
  loadOrganizationOptions(): void {
    this.dropDownListService.querySYS3100_DropDownList().subscribe({
      next: (response) => {
        if (response.Status === '0000' && response.Data) {
          this.organizationOptions = response.Data.map(item => ({
            label: `${item.No || ''}-${item.Name || ''}`,
            value: item.No || ''
          }));
        }
      },
      error: (err) => {
        console.error('載入部門下拉選單失敗:', err);
      }
    });
  }

  // 提交查詢
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.ass11100Service.queryASS11100(frm.value).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  // 刪除項目
  onDelete(data: ASS11100Data | ASS11100Data[]): void {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) return;

    const idList = items
      .filter(item => item && item.id != null)
      .map(item => item.id!);

    if (idList.length === 0) {
      this.messageService.warnBubble('未找到有效的刪除項目');
      return;
    }

    this.messageService.confirm({
      header: `是否確認刪除 ${items.length} 筆資料?`,
      accept: () => {
        this.ass11100Service.deleteASS11100({ idList }).subscribe({
          next: (response) => {
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
            this.onSubmit(this.queryForm); // 刷新資料
            this.selectedItems = [];
          },
        });
      }
    });
  }

  // 判斷行是否可選
  isRowSelectable(rowData: ASS11100Data): boolean {
    return true; // 所有行都可選，或根據業務邏輯判斷
  }
}
