import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { SortMeta } from 'primeng/api';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { FIN31020Data, FIN31020Service } from './../../../service/api/fin/fin31020.service';
import { DropDownListService } from './../../../service/utility/dropDownList.service';

//1.3.1.2 應收調整科目設定維護
@Component({
  selector: 'app-fin31020',
  templateUrl: './fin31020.component.html',
  standalone: true,
  imports: [MultiSelectComponent, DropdownComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, TableComponent, InputTextComponent, TranslateModule]
})
export class FIN31020Component extends BasicQueryPageComponent<FIN31020Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    CAR_AccNo: [""],
    CAR_Type: [null],
    Remark: [null, Validators.maxLength(100)],
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [{ field: 'CAR_AccNo', order: 1 }],

  });
  expansionRowsPerPageOptions: number[] = [30, 60, 90, 120, 150];

  AccNoOptions: { label: string; value: string; ABAT_YN?: string }[] = []; // 科目代號選項 (包含 ABAT_YN)
  selectedItems: FIN31020Data[] = [];
  totalRecords = 0
  data: FIN31020Data[] = [];
  columns = [
    { field: 'CAR_AccNo', header: '調整科目代號', visible: true },
    { field: 'CAR_Type', header: '加減項', visible: true },
    { field: 'Remark', header: '備註', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員代號', visible: true },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true },
    { field: 'UPD_Date', header: '變更日期', visible: true, format: formatDate },
    { field: 'UPD_USR_No', header: '變更人員代號', visible: true },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: true },
  ];
  minusOption = [
    { value: '1', label: '加項' },
    { value: '2', label: '減項' },
  ];
  constructor(
    private dropDownListService: DropDownListService,
    private fin31020Service: FIN31020Service
  ) {
    super(); // 呼叫父類建構子
  }

  // override navigation to CRU to include current query conditions so CRU 返回時能還原原查詢
  override onCreate(data?: unknown, queryConditions?: any) {
    this.navigateWithState(CRUDStatus.Create, data, this.queryForm.getRawValue());
  }

  override onEdit(data: FIN31020Data, queryConditions?: any) {
    this.navigateWithState(CRUDStatus.Edit, data, this.queryForm.getRawValue());
  }

  override onDetail(data: FIN31020Data, queryConditions?: any) {
    this.navigateWithState(CRUDStatus.Read, data, this.queryForm.getRawValue());
  }

  ngOnInit(): void {
    this.initializePage('FIN31020', '/FIN/FIN31020CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadOptions();
  }

  get multiSortMeta(): SortMeta[] {
    const v = this.queryForm.controls['SortBy']?.value;
    return Array.isArray(v) ? (v as SortMeta[]) : [];
  }

  // Local lazy-load handler to normalize SortBy without changing shared code
  onTableLazyLoad(event: any): void {
    console.debug('FIN31020 onTableLazyLoad event:', event);
    const pageSize = event?.pageSize ?? event?.rows ?? this.queryForm.controls['pageSize'].value;
    const pageIndex = event?.pageIndex ?? event?.page ?? (event?.first && pageSize ? (event.first / pageSize) + 1 : this.queryForm.controls['pageIndex'].value);

    // try various possible sort fields emitted by table
    let s = event?.SortBy ?? event?.sortBy ?? event?.Sort ?? event?.multiSortMeta ?? [];
    if (s == null) s = [];
    else if (!Array.isArray(s)) s = [s];

    this.queryForm.patchValue({ pageSize, pageIndex, SortBy: s });
    console.debug('FIN31020 patched queryForm.SortBy:', this.queryForm.controls['SortBy'].value);
    // trigger submit
    this.onSubmit(this.queryForm);
  }
  private loadOptions(): void {
    // 科目代號 (使用 ledgerMD 版本，包含 ABAT_YN)
    this.dropDownListService.queryGLS1005_ledgerMD_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.AccNoOptions = (res.Data || []).map((x: { No: string; Name: string; ABAT_YN?: string }) => ({
          label: `${x.No} - ${x.Name}`,
          value: x.No,
          ABAT_YN: x.ABAT_YN?.trim() ?? ''
        }));
      });

  }
  isRowSelectable = (row: FIN31020Data): boolean => row.CanDel;

  onDelete(rows: FIN31020Data[]): void {
    if (!rows?.length) {
      this.messageService.errorBubble('請先勾選要刪除的資料');
      return;
    }
    const accNoList = rows.map(r => r.CAR_AccNo);
    this.messageService.confirm({
      header: '刪除確認',
      message: `確定要刪除科目代號「${accNoList.join('、')}」嗎？`,
      acceptLabel: '確定刪除',
      rejectLabel: '取消',
      accept: () => {
        this.messageService.blockUi();
        this.fin31020Service.deleteFIN31020(accNoList)
          .pipe(untilDestroyed(this), finalize(() => this.messageService.unblockUi()))
          .subscribe({
            next: (res) => {
              if (res.Status === '0000' || res.Status === '0001') {
                this.messageService.successBubble(`科目代號「${accNoList.join('、')}」已刪除`);
                this.onSubmit(this.queryForm);
              } else {
                this.messageService.errorBubble(res.Message || '刪除失敗');
              }
            },
          });
      },
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      // 處理 CAR_Type：如果為陣列且包含所有選項或為空，傳空字串代表後端要的「全選」；否則傳單一值字串
      const rawCAR = formValue.CAR_Type;
      let CAR_Type_payload = '';
      if (Array.isArray(rawCAR)) {
        // 如果選到全部或為空，傳空字串；否則取第一個（通常只有一個選項時）
        if (rawCAR.length === 0) {
          CAR_Type_payload = '';
        } else if (rawCAR.length === this.minusOption.length) {
          CAR_Type_payload = '';
        } else {
          CAR_Type_payload = String(rawCAR[0]);
        }
      } else if (rawCAR === null || rawCAR === undefined || rawCAR === '') {
        CAR_Type_payload = '';
      } else {
        CAR_Type_payload = String(rawCAR);
      }

      // 正規化 SortBy：確保送給後端的是陣列（後端期待 List<Sort>）
      let sortByPayload: any = formValue.SortBy;
      if (sortByPayload == null) {
        sortByPayload = [];
      } else if (!Array.isArray(sortByPayload)) {
        sortByPayload = [sortByPayload];
      }

      // Build OrderBy as "FIELD ASC|DESC" because some backends expect direction in OrderBy string
      const firstSort = sortByPayload && sortByPayload.length ? sortByPayload[0] : null;
      const orderDir = firstSort ? (firstSort.order === -1 ? 'DESC' : 'ASC') : 'ASC';
      const orderByStr = firstSort ? `${firstSort.field} ${orderDir}` : 'CAR_AccNo ASC';

      const payload = {
        PageSize: formValue.pageSize ?? 30,
        PageIndex: formValue.pageIndex ?? 1,
        Offset: 0,
        OrderBy: orderByStr,
        SortBy: sortByPayload,
        CAR_AccNo: formValue.CAR_AccNo || undefined,
        CAR_Type: CAR_Type_payload || undefined,
        Remark: formValue.Remark || undefined,
      } as any;

      console.debug('FIN31020 outgoing payload:', payload);
      this.fin31020Service
        .queryFIN31020(payload)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
          next: (response) => {
            console.debug('FIN31020 response head:', response?.Message, 'TotalCount:', response?.TotalCount);
            console.debug('FIN31020 response sample first rows:', (response?.Data || []).slice(0, 5));
            if (response && response.Data) {
              this.data = response.Data
              this.totalRecords = response.TotalCount || 0;
            } else {
              this.data = [];
              this.totalRecords = 0;
            }
          },
        });
    });
  }
}
