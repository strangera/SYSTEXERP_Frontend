import { formatDate, formatDateTime } from './../../../shared/componentkit/table/table.model';
import { Sysbc00Service } from './../../../service/api/sys/sysbc00.service';
import { Component, OnInit } from '@angular/core';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FileSelectEvent } from 'primeng/fileupload';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { TLS21040Data, Tls21040Service } from '@service/api/tls/tls21040.service';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-tls21040',
  templateUrl: './tls21040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    InputTextComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS21040Component extends BasicQueryPageComponent<TLS21040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    CRD_BinCode: ['', [Validators.maxLength(16)]],
    BNK_No: ['', [Validators.maxLength(3)]],
    CRD_TypeList: [null],
    CRD_KindList: [null],
    ...createPaginationConfig([{ field: 'id', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  data: TLS21040Data[] = [];
  selectedItems: TLS21040Data[] = [];
  columns: Column[] = [
    { field: 'CRD_BinCode', header: '信用卡 BIN 碼', visible: true },
    { field: 'BNK_No', header: '發卡銀行代碼', visible: true },
    { field: 'CRD_Type', header: '信用卡卡別', visible: true, format: (value: string) => this.cardTypeOptions.find(item => item.value === value)?.label || value },
    { field: 'CRD_Kind', header: '信用卡卡種', visible: true, format: (value: string) => this.cardCategoryOptions.find(item => item.value === value)?.label || value },
    { field: 'Active_Date', header: '生效日期', visible: true, format: formatDate },
    { field: 'Disable_Date', header: '終止日期', visible: true, format: formatDate },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
  ];
  cardTypeOptions: { value: string, label: string }[] = [
    { value: 'V', label: 'VISA' },
    { value: 'M', label: 'MASTER' },
    { value: 'J', label: 'JCB' },
    { value: 'A', label: 'AE' },
    { value: 'D', label: 'DINERS' },
    { value: 'S', label: '銀聯卡' },
    { value: 'N', label: '聯合簽帳卡' },
    { value: 'O', label: '其他' },
  ];
  cardCategoryOptions: { value: string, label: string }[] = [
    { value: 'B', label: '商務卡' },
    { value: 'C', label: '普卡' },
    { value: 'G', label: '金卡' },
    { value: 'I', label: '無限卡' },
    { value: 'O', label: '其他' },
    { value: 'P', label: '白金卡' },
    { value: 'S', label: '御璽、鈦金、晶緻卡' },
    { value: 'T', label: '鈦金卡' },
  ];
  bankOptions: { BNK_No: string, BNK_Name: string }[] = [];
  constructor(
    private sysbc00Service: Sysbc00Service,
    private tls21040Service: Tls21040Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS21040', 'TLS/TLS21040cru', this.queryForm, (form) => this.onSubmit(form));
    this.sysbc00Service.querySYSBC00({}).subscribe((res) => {
      this.bankOptions = res.Data.map(item => ({
        ...item, label: item.BNK_No + ' - ' + item.BNK_Name
      }));
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls21040Service.queryTLS21040(frm.getRawValue()).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe((res) => {
        this.data = res.Data.map(item => ({
          ...item,
          Active_Date: this.parseYMD(item.Active_Date),
          Disable_Date: this.parseYMD(item.Disable_Date)
        }));
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      })
    });
  }
  private parseYMD(ymd: string | Date | null): Date | null {
    if (!ymd) return null;

    const str = ymd.toString();
    if (str.length !== 8) return null;

    const year = +str.slice(0, 4);
    const month = +str.slice(4, 6) - 1; // JS 月份從 0 開始
    const day = +str.slice(6, 8);

    return new Date(year, month, day);
  }
  onDelete(rows: TLS21040Data[]) {
    this.confirmationService.confirm({
      message: `是否確認刪除此信用卡卡種?`,
      header: `確認刪除`,
      accept: () => {
        const idsToDelete = rows.map(item => item.id);
        this.loading = true; // 設置載入狀態
        this.tls21040Service.deleteTLS21040(idsToDelete).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe({
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

  isRowSelectable(rowData: TLS21040Data): boolean {
    return rowData.CanDel
  }

  onImportExcel(event: FileSelectEvent): void {
    const file = event.files[0];
    this.tls21040Service.uploadTLS21040(file).subscribe(res => {
      if (res.Status === '0000') {
        this.messageService.successBubble(res.Message);
      } else {
        this.messageService.errorBubble(res.Message);
        window.open(environment.ApiUrl + res.Data.ErrorFilePath, '_blank');
      }
    })
  }
}
