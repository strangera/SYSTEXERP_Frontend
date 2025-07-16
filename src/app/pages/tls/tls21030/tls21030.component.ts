import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, formatDateTime, formatYN } from '../../../shared/componentkit/table/table.model';
import { TLS21030Data, Tls21030Service } from '../../../service/api/tls/tls21030.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonYNComponent } from '../../../shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

/* TALTALENT_BILL_NOTES 對帳單備註檔 */
@Component({
  selector: 'app-tls21030',
  templateUrl: './tls21030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    RadiobuttonYNComponent,
    InputTextComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS21030Component extends BasicQueryPageComponent<TLS21030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    money_type: [null],     // 結帳方式 10=十日結、15=半月結、30=月結
    term_no: [[1]], // 帳次 Default: 1
    race_yn: [null],        // 是否使用業主發票 (Y=是、N=否)
    bill_remarks: [''],     // 說明 存為html格式
    tlt_nos: [null, [Validators.maxLength(12)]],        // 專櫃編號 (table: TALTALENT_BILL_NOTES_DETALL)
  });
  totalRecords = 0;
  data: TLS21030Data[] = [];
  selectedItems: TLS21030Data[] = [];
  columns: Column[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'money_type', header: '結帳方式', visible: true, format: (value: string) => this.settlementMethodOptions.find(option => option.value === value)?.label || '' },
    { field: 'term_no', header: '帳次', visible: true },
    { field: 'race_yn', header: '是否使用業主發票', visible: true, format: formatYN },
    { field: 'bill_remark1', header: '說明1', visible: true },
    { field: 'bill_remark2', header: '說明2', visible: true },
    { field: 'bill_remark3', header: '說明3', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: false },
    { field: 'UPD_Date', header: '更新日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '更新人員', visible: false },
    { field: 'UPD_USR_Name', header: '更新人員名稱', visible: false },
  ];
  settlementMethodOptions = [
    { value: '1', label: '十日結' },
    { value: '2', label: '半月結' },
    { value: '3', label: '月結' },
  ];
  accountingPeriodOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' }
  ];
  constructor(
    private tls21030Service: Tls21030Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS21030', 'tls/tls21030cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls21030Service.queryTLS21030(frm.value).pipe(finalize(() => this.loading = false)).pipe(untilDestroyed(this)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    })
  }

  onDelete(rows: TLS21030Data[]) {
    this.confirmationService.confirm({
      message: `是否確認刪除此銀行?`,
      header: `確認刪除銀行`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const idsToDelete = rows.map(item => item.id);
        this.loading = true; // 設置載入狀態
        this.tls21030Service.deleteTLS21030(idsToDelete).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe({
          next: (response) => {
            if (response.Status === '0000') { // 假設 '0000' 為成功狀態碼
              this.messageService.successBubble('刪除成功');
              this.selectedItems = []; // 清空選取狀態
              this.onSubmit(this.queryForm);
            } else {
              console.error('刪除失敗響應:', response);
            }
          }
        });
      }
    });
  }
}
