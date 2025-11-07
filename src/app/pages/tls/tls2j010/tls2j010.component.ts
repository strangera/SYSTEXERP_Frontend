import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { TLS2J010Service } from '@service/api/tls/tls2j010.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls2j010',
  templateUrl: './tls2j010.component.html',
  styleUrl: './tls2j010.component.scss',
  standalone: true,
  imports: [
    InputTextComponent,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TableReportComponent,
    TranslateModule
  ]
})
export class TLS2J010Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.nonNullable.group({
    CHG_ItemName: ['', [Validators.maxLength(10)]],
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'CHG_ItemName', order: 1 }]],
  });

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

  lastQueryBody: any = {};
  columns: any[] = [
    { field: 'CHG_ItemName', header: '品項名稱', visible: true },
  ];

  constructor(
    public readonly tls2j010Service: TLS2J010Service
  ) {
    super();
  }

  /** 判斷行是否可選擇 */
  isRowSelectable = (rowData: any): boolean => {
    return rowData.CanDel === true;
  };

  ngOnInit(): void {
    this.initializePage('TLS2J010', '/TLS/TLS2J010CRU', this.queryForm, (frm) => this.onSubmit(frm));
  }

  /** 查詢 */
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();

      const payload = {
        pageSize: formValue.pageSize || 30,
        pageIndex: formValue.pageIndex || 1,
        OrderBy: '',
        Offset: 0,
        SortBy: formValue.SortBy || [{ field: 'CHG_ItemName', order: 1 }],
        CHG_ItemName: formValue.CHG_ItemName?.trim() || '',
      };

      this.lastQueryBody = payload;
      this.loading = true;
      this.tls2j010Service.queryTLS2J010(payload)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res?.Status === '0000') {
              this.data = res.Data || [];
              this.totalRecords = res.TotalCount ?? this.data.length;
            } else {
              this.data = [];
              this.totalRecords = 0;
            }
          },

        });
    });
  }

  /** 刪除 */
  onDelete(): void {
    if (this.selectedItems.length === 0) {
      alert('請先選擇要刪除的項目');
      return;
    }
    const canDeleteItems = this.selectedItems.filter(item => item.CanDel === true);
    const cannotDeleteItems = this.selectedItems.filter(item => item.CanDel === false);

    if (cannotDeleteItems.length > 0) {
      const cannotDeleteNames = cannotDeleteItems.map(item => item.CHG_ItemName || `ID: ${item.ID}`);
      alert(`以下項目因已被使用，無法刪除：\n${cannotDeleteNames.join('\n')}`);
      return;
    }
    if (canDeleteItems.length === 0) {
      alert('所選項目均無法刪除');
      return;
    }

    const deleteIds = canDeleteItems.map((item) => item.ID ?? item.SeqNo);
    const payload = { IDs: deleteIds };

    this.confirmationService.confirm({
      message: `確定要刪除 ${deleteIds.length} 筆資料嗎？`,
      header: '刪除確認',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.tls2j010Service.deleteTLS2J010(payload)
          .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
          .subscribe({
            next: (res) => {
              if (res?.Status === '0000') {
                this.selectedItems = []; // 清空選中項目
                this.onSubmit(this.queryForm);
              }
            },
          });
      },
      reject: () => {
        console.log('用戶取消刪除');
      }
    });
  }
}
