import { DropDownListService } from './../../../service/utility/dropDownList.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatDateTime, formatYN } from '../../../shared/componentkit/table/table.model';
import { TLS21030Data, Tls21030Service } from '../../../service/api/tls/tls21030.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { RadiobuttonYNComponent } from '../../../shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { Base64Service } from '../../../shared/service/base64.service';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

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
    DropdownComponent,
    ReactiveFormsModule,
    RadiobuttonYNComponent,
    InputTextComponent,
    TableComponent,
    TranslateModule,
    MultiSelectComponent
  ],
})
export class TLS21030Component extends BasicQueryPageComponent<TLS21030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    money_type: [null],     // 結帳方式 10=十日結、15=半月結、30=月結
    term_no: [1],           // 帳次 Default: 1
    rece_yn: [null],        // 是否使用業主發票 (Y=是、N=否)
    bill_remark: [''],     // 說明 存為html格式
    tlt_noList: [null],        // 專櫃編號 (table: TALTALENT_BILL_NOTES_DETALL)
    ...createPaginationConfig([{ field: 'id', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  data: TLS21030Data[] = [];
  selectedItems: TLS21030Data[] = [];
  columns: Column[] = [
    { field: 'money_type', header: '結帳方式', visible: true, format: (value: string) => this.settlementMethodOptions.find(option => option.value === value)?.label || '' },
    { field: 'term_no', header: '帳次', visible: true },
    { field: 'rece_yn', header: '是否使用業主發票', visible: true, format: formatYN },
    { field: 'bill_remark1', header: '說明1', visible: true, type: 'html' },
    { field: 'bill_remark2', header: '說明2', visible: true, type: 'html' },
    { field: 'bill_remark3', header: '說明3', visible: true, type: 'html' },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: false },
    { field: 'UPD_Date', header: '更新日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '更新人員', visible: false },
    { field: 'UPD_USR_Name', header: '更新人員名稱', visible: false },
  ];
  settlementMethodOptions = [
    { value: '10', label: '十日結' },
    { value: '15', label: '半月結' },
    { value: '30', label: '月結' },
  ];
  accountingPeriodOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' }
  ];
  TLTTALENT_DropDownList: { No: string, Name: string, label: string }[] = []; // 專櫃編號下拉選單資料
  constructor(
    private readonly tls21030Service: Tls21030Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS21030', 'tls/tls21030cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownListService.queryTLTTALENT_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.TLTTALENT_DropDownList = res.Data.map(item => ({
        ...item, label: `${item.No} - ${item.Name}`
      }));
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls21030Service.queryTLS21030(frm.value).pipe(finalize(() => this.loading = false)).pipe(untilDestroyed(this)).subscribe(res => {
        this.data = res.Data.map(item => ({
          ...item,
          bill_remark1: Base64Service.decode(item.bill_remark1) || '',
          bill_remark2: Base64Service.decode(item.bill_remark2) || '',
          bill_remark3: Base64Service.decode(item.bill_remark3) || '',
        }));
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    })
  }

  onDelete(rows: TLS21030Data[]) {
    this.confirmationService.confirm({
      message: `是否確認刪除此對帳單備註?`,
      header: `確認刪除對帳單備註`,
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
