import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { formatDate } from '@shared/componentkit/table/table.model';
import { formatAmount } from '@shared/componentkit/table2/table2.model';
import { SharedDropdownService } from '@shared/services/shared-dropdown.service';
import { AccordionModule } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { environment } from '../../../../environments/environment';
import { Tls2d010Service } from '../../../service/api/tls/tls2d010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { DropDownListService, IAPS1003Item, IDropdownItem } from './../../../service/utility/dropDownList.service';

import { FileExportService } from '@shared/service/file-export.service';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-tls2d010',
  templateUrl: './tls2d010.component.html',
  styleUrls: ['./tls2d010.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    MultiSelectComponent,
    CalendarComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule,
    Button,
    FileUploadModule
  ]
})
export class TLS2D010Component extends BasicQueryPageComponent<any> implements OnInit {
  currentCreateType: 'normal' | 'counter' = 'counter';
  queryForm = this.formBuilder.group({
    tlt_noList: [[]], // 專櫃編號
    CAP_ItemList: [[]],
    AccNoList: [[]], // 會計科目代號
    org_idList: [[] as number[]], // 組織
    tpy_YYYYMM: [], // 扣款年月
    tpy_date: [], // 扣款日期
    pod_noList: [[]], // 維護日
    CRT_USR_No: [''],
    GUI_FLAG: [''],
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }])
  });
  //     CRT_USR_No: [this.authService.currentUserValue?.user_No], 預設為登入者


  columns: any[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'CAP_Item', header: '扣款項目', visible: true },
    { field: 'CAP_Name', header: '扣款名稱', visible: true },
    { field: 'AccNo', header: '會計科目代號', visible: true },
    { field: 'AccCName', header: '會計科目名稱', visible: true },
    { field: 'org_id', header: '組織代號', visible: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
    { field: 'pod_no', header: '活動名稱', visible: true },
    { field: 'tpy_date', header: '扣款日期', visible: true, format: formatDate },
    { field: 'GUI_FLAG', header: '是否開立發票', visible: true, format: (value: string) => value === 'Y' ? '是' : value === 'N' ? '否' : '' },
    { field: 'tpy_net', header: '扣款(未稅)', visible: true, format: formatAmount, align: 'right' },
    { field: 'remarks', header: '備註', visible: true },
    { field: 'CRT_USR_Name', header: '建立者', visible: true },
    { field: 'CRT_Date', header: '建立時間', visible: true, format: formatDate },
    { field: 'UPD_USR_Name', header: '修改者', visible: true },
    { field: 'UPD_Date', header: '修改時間', visible: true, format: formatDate },
  ];

  totalRecords = 0;
  data: any[] = [];
  selectedFile?: File;
  AccNoOptions: IDropdownItem[] = [];
  tlt_noOptions: IDropdownItem[] = [];
  org_idOptions: IDropdownItem[] = [];
  CAP_ItemOptions: IAPS1003Item[] = [];
  CRT_USR_NoOptions: IDropdownItem[] = [];
  pod_noOptions: any[] = [];

  get f() {
    return this.queryForm.controls;
  }

  constructor(
    router: Router,
    private route: ActivatedRoute,
    private tls2d010Service: Tls2d010Service,
    private dropDownListService: DropDownListService,
    public sharedDropdownService: SharedDropdownService,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2D010', '/TLS/TLS2D010CRU', this.queryForm, (form) => this.onSubmit(form));
    // 查專櫃下拉
    this.dropDownListService.queryTLTTALENTDropDownList().subscribe((res) => {
      this.tlt_noOptions = (res?.Data || []).map((item: any) => ({
        value: item.talent_id,
        label: `${item.tlt_no}-${item.tlt_name}`,
        No: item.tlt_no,
        Name: item.tlt_name
      }));
    });

    this.dropDownListService.queryAPS1003DropDownList({ CAP_ItemList: [] }) // 參數照 interface
      .subscribe((res) => {
        this.CAP_ItemOptions = (res?.Data || []).map((item: any) => ({
          CAP_Item: item.CAP_Item, // 扣款項目代碼
          CAP_Name: item.CAP_Name, // 顯示名稱
          value: item.CAP_Item,    // 綁定值
          label: `${item.CAP_Item}-${item.CAP_Name}`, // 顯示文字
          No: item.CAP_Item,       // 必須的屬性
          Name: item.CAP_Name,     // 必須的屬性
          AccNo: item.AccNo,       // 會計科目
          GUI_FLAG: item.GUI_FLAG, // 是否開立發票
          CAP_TaxType: item.CAP_TaxType, // 課稅別
          CAP_Type: item.CAP_Type,       // 扣款類型
        }));
      });

    this.dropDownListService.queryGLS1005_DropDownList().subscribe((res) => {
      this.AccNoOptions = (res?.Data || []).map((item: any) => ({
        value: item.No,
        label: `${item.No}-${item.Name}`,
        No: item.No,
        Name: item.Name
      }));
    });
    this.dropDownListService.querySYS3100_DropDownList().subscribe(
      (res) => {
        this.org_idOptions = (res?.Data || []).map((item: any) => ({
          value: item.No,                // 綁定值
          label: `${item.No}-${item.Name}`, // 顯示文字
          No: item.No,
          Name: item.Name
        }));
      },
    );
    this.dropDownListService.queryTBLUSER_DropDownList().subscribe((res) => {
      this.CRT_USR_NoOptions = (res?.Data || []).map((item: any) => ({
        value: item.No,               // 綁定值
        label: `${item.No}-${item.Name}`, // 顯示文字
        No: item.No,
        Name: item.Name
      }));
    });
    this.dropDownListService.queryTALPORDERM_DropDownList().subscribe((res) => {
      this.pod_noOptions = (res?.Data || []).map((item: any) => ({
        value: item.No,
        label: `${item.No}-${item.Name}`
      }));
    });

  }

  onSubmit(frm: FormGroup) {
    const formValue = frm.value;
    const payload: any = { ...formValue };

    // 專櫃編號：MultiSelect 綁的是 talent_id，需要轉成後端要的 tlt_no
    if (Array.isArray(payload.tlt_noList) && payload.tlt_noList.length) {
      payload.tlt_noList = payload.tlt_noList
        .map((val: any) => {
          const match = this.tlt_noOptions.find(opt =>
            opt?.value === val || opt?.No === val || (opt as any)?.tlt_no === val
          );
          return match?.No ?? val;
        })
        .filter((val: any) => val !== null && val !== undefined && val !== '');
    }

    // 分頁欄位：後端使用 PageSize/PageIndex/Offset
    const pageSize = Number(formValue.pageSize ?? 20);
    const pageIndex = Number(formValue.pageIndex ?? 1);
    payload.PageSize = pageSize;
    payload.PageIndex = pageIndex;
    payload.Offset = (pageIndex - 1) * pageSize;

    if (!Array.isArray(payload.SortBy) || !payload.SortBy.length) {
      payload.SortBy = [{ field: 'tlt_no', order: 1 }];
    }

    // 給可能使用的 OrderBy
    if (!payload.OrderBy && payload.SortBy[0]?.field) {
      payload.OrderBy = payload.SortBy[0].field;
    }
    // 若 tpy_date 有值且為 Date，轉成 yyyy-MM-dd 字串
    if (payload.tpy_date instanceof Date) {
      const yyyy = payload.tpy_date.getFullYear();
      const mm = String(payload.tpy_date.getMonth() + 1).padStart(2, '0');
      const dd = String(payload.tpy_date.getDate()).padStart(2, '0');
      payload.tpy_date = `${yyyy}-${mm}-${dd}`;
    }
    // 若 tpy_YYYYMM 有值且為 Date，轉成 yyyymm 字串
    if (payload.tpy_YYYYMM instanceof Date) {
      const yyyy = payload.tpy_YYYYMM.getFullYear();
      const mm = String(payload.tpy_YYYYMM.getMonth() + 1).padStart(2, '0');
      payload.tpy_YYYYMM = `${yyyy}${mm}`;
    } else if (typeof payload.tpy_YYYYMM === 'string') {
      // 如果是像 2026-01 或 2026/01 或 202601 等字串，嘗試轉為 yyyymm
      const s = String(payload.tpy_YYYYMM).replace(/[^0-9]/g, '');
      if (s.length === 6) {
        payload.tpy_YYYYMM = `${s.substring(0, 4)}${s.substring(4, 6)}`;
      }
    }
    this.loading = true;
    this.tls2d010Service.queryTLS2D010(payload).subscribe({
      next: (res) => {
        this.data = res?.Data || [];
        // 支援後端回傳不同的總數欄位名稱 (TotalCount / Total / TotalRecords)
        this.totalRecords = res?.TotalCount ?? res?.Total ?? res?.TotalRecords ?? this.data.length;
        // 查詢成功後，記錄當前查詢條件，供返回本頁時還原
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  setCounterType(row: any) {
    return { ...row, type: 'counter' };
  }
  onDelete(selectedItems: any[]): void {
    if (!selectedItems || selectedItems.length === 0) {
      alert('請先選擇要刪除的項目');
      return;
    }

    const idList = selectedItems.map((item: any) => item.id);

    this.messageService.confirm({
      message: `確定要刪除 ${idList.length} 筆資料嗎？`,
      header: '刪除確認',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.tls2d010Service.deleteTLS2D010({ idList })
          .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
          .subscribe({
            next: () => {
              this.messageService.successBubble('刪除成功');
              this.onSubmit(this.queryForm);
            },
          });
      },
      reject: () => {
        // 使用者取消刪除，不做任何事
      }
    });
  }
  btnLoading = false;
  excelLoading = false;
  downloadTemplate() {
    const export$ = this.tls2d010Service.downloadTLS2D010Template();
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoading = isLoading);
  }

  /** 匯入 Excel 並產生錯誤檔 */
  onImportExcel(event: FileSelectEvent) {
    const file = event.files[0];
    const formData = new FormData();
    formData.append('file', file);
    this.excelLoading = true;
    this.tls2d010Service.uploadExcel(formData)
      .pipe(untilDestroyed(this), finalize(() => (this.excelLoading = false)))
      .subscribe({
        next: (res) => {
          const data = res?.Data;

          if (data) {
            if (data.ErrorFilePath) {
              // 有錯誤檔：顯示錯誤提示
              this.messageService.errorBubble(`部分資料匯入失敗，請下載錯誤檔檢查`);
              // 自動下載錯誤檔
              this.downloadErrorFile(data.ErrorFilePath);
            } else if (data.Success === false) {
              // 匯入失敗但沒有錯誤檔：直接顯示錯誤訊息
              const backendMessage = res?.Message || '';
              const errorDetail = Array.isArray(data.Errors) && data.Errors.length
                ? data.Errors.join('\n')
                : '';
              const finalMessage = backendMessage || errorDetail || '匯入失敗，請聯絡系統管理員';
              this.messageService.errorBubble(finalMessage);
            } else {
              // 成功：顯示成功筆數並重新查詢
              this.messageService.infoBubble(`匯入成功，筆數：${data.SuccessCount}`);
              this.onSubmit(this.queryForm);
            }
          }
        },
      });
  }

  /** 自動下載錯誤檔 */
  downloadErrorFile(filePath: string) {
    window.open(`${environment.ApiUrl}/${filePath}`, '_blank');
  }

}

