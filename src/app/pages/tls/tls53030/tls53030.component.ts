import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import saveAs from 'file-saver';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { TLS53030Data, TLS53030Service } from '../../../service/api/tls/tls53030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AddButton, Column, createPaginationConfig, formatDate } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls53030',
  templateUrl: './tls53030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    CalendarRangeComponent,
    TableComponent,
    TranslateModule,
    RadiobuttonComponent
  ]
})
export class TLS53030Component extends BasicQueryPageComponent<TLS53030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    PST_No: ['', Validators.maxLength(15)],                     // 盤點單編號
    HOS_No: [[]],                                               // 倉庫代碼 (改為陣列)
    LOGO_No: [[]],                                              // 品牌代碼 (改為陣列)
    PST_DateStart: [null],                                      // 盤點基準日期(起)
    PST_DateEnd: [new Date(), Validators.required],             // 盤點基準日期(迄)
    PST_Status: [[]],                                           // 盤點狀態 (多選)
    showDiff: [true],                                          // 是否顯示盤點差異欄位
    ...createPaginationConfig([{ field: 'PST_No', order: -1 }]) // 分頁和排序參數
  });

  data: TLS53030Data[] = [];
  selectedItems: TLS53030Data[] = [];
  totalRecords = 0;

  //#region 下拉選項
  hosOptions: any[] = [];       // 倉別選項
  logoOptions: any[] = [];      // 品牌選項

  // 盤點狀態選項
  pstStatusOptions: any[] = [
    { value: '0', label: '盤點資料維護作業-待盤點' },
    { value: '1', label: '初盤-盤點中' },
    { value: '2', label: '複盤-盤點完成' },
    { value: '3', label: '抽盤-小盤結案' },
    { value: '4', label: '已結案' },
    { value: '9', label: '作廢' }
  ];

  // 盤點類別選項
  pstTypeOptions: any[] = [
    { value: '1', label: '初盤' },
    { value: '2', label: '複盤' },
    { value: '3', label: '抽盤' }
  ];

  // 顯示差異選項
  showDiffOptions: any[] = [
    { label: '只顯示有差異資料', value: true },
    { label: '全部', value: false },
  ];
  //#endregion

  columns: Column[] = [
    { field: 'id', header: '序號', visible: false },
    { field: 'PST_No', header: '盤點單編號', visible: true },
    { field: 'HOS_No', header: '倉庫代碼', visible: true },
    { field: 'HOS_NAME', header: '倉庫名稱', visible: true },
    { field: 'LOGO_No', header: '品牌代碼', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
    {
      field: 'PST_Date',
      header: '盤點基準日期',
      visible: true,
      format: formatDate
    },
    {
      field: 'PST_Type',
      header: '盤點類別',
      visible: true,
      format: (v) => this.pstTypeOptions.find(opt => opt.value === v)?.label || v,
    },
    {
      field: 'PST_Status',
      header: '盤點狀態',
      visible: true,
      format: (v) => this.pstStatusOptions.find(opt => opt.value === v)?.label || v,
    },
  ];

  loadingStates = new Map<number, {
    print: boolean;
    conclude: boolean;
    reverted: boolean;
    void: boolean
  }>();

  addButton: AddButton[] = [
    {
      label: '結案',
      icon: 'pi pi-check text-green-500',
      action: (rowData: TLS53030Data) => { this.concludeTLS53030(rowData); },
      disabled: (rowData: TLS53030Data) => !['1', '2', '3'].includes(rowData.PST_Status),
      loading: (rowData: TLS53030Data) => this.getLoadingState(rowData.id, 'conclude'),
    },
    {
      label: '反結案',
      icon: 'pi pi-undo text-orange-500',
      action: (rowData: TLS53030Data) => { this.revertedTLS53030(rowData); },
      disabled: (rowData: TLS53030Data) => rowData.PST_Status !== '4', // 只有已結案(4)才可以反結案
      loading: (rowData: TLS53030Data) => this.getLoadingState(rowData.id, 'reverted'),
    },
    {
      label: '作廢',
      icon: 'pi pi-times text-red-500',
      action: (rowData: TLS53030Data) => { this.voidTLS53030(rowData); },
      disabled: (rowData: TLS53030Data) => !['0', '1', '2', '3'].includes(rowData.PST_Status), // 只有未結案(0,1,2,3)才可以作廢
      loading: (rowData: TLS53030Data) => this.getLoadingState(rowData.id, 'void'),
    },
    {
      label: '列印',
      icon: 'pi pi-print text-cyan-500',
      action: (rowData: TLS53030Data) => { this.onPrint(rowData); },
      loading: (rowData: TLS53030Data) => this.getLoadingState(rowData.id, 'print'),
    },
  ];

  // 取得 loading 狀態
  getLoadingState(id: number, action: 'print' | 'conclude' | 'reverted' | 'void'): boolean {
    return this.loadingStates.get(id)?.[action] || false;
  }

  // 設定 loading 狀態
  setLoadingState(id: number, action: 'print' | 'conclude' | 'reverted' | 'void', loading: boolean): void {
    if (!this.loadingStates.has(id)) {
      this.loadingStates.set(id, { print: false, conclude: false, reverted: false, void: false });
    }
    const state = this.loadingStates.get(id)!;
    state[action] = loading;
  }

  constructor(
    private tls53030Service: TLS53030Service,
    private datePipe: DatePipe,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS53030', 'tls/tls53030cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    const queryRequest = {
      ...frm.getRawValue(),
      PST_DateStart: this.datePipe.transform(frm.get('PST_DateStart')?.value, 'yyyy-MM-dd') || null,
      PST_DateEnd: this.datePipe.transform(frm.get('PST_DateEnd')?.value, 'yyyy-MM-dd') || null
    };

    this.handleSubmit(frm, () => {
      this.tls53030Service.queryTLS53030(queryRequest)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  loadOptions() {
    // 倉別選項
    this.dropDownListService.getPOS2034Options()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.hosOptions = response.Data.map(item => ({
          value: item.No,
          label: `${item.No}-${item.Name}`
        }));
      });

    // 品牌選項
    this.dropDownListService.queryPLULOGO_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.logoOptions = response.Data.map(item => ({
          value: item.No,
          label: `${item.No}-${item.Name}`
        }));
      });
  }

  private extractFilenameFromResponse(response: HttpResponse<Blob>, defaultFilename: string): string {
    const contentDisposition = response.headers.get('content-disposition');
    let filename = defaultFilename;

    if (contentDisposition) {
      const filenameRegex = /filename\*=UTF-8''(.+?)(?:\.[^.]+)?$|filename="(.+?)(?:\.[^.]+)?"$/;
      const matches = contentDisposition.match(filenameRegex);
      if (matches) {
        filename = matches[1] || matches[2] || filename;
        filename = decodeURIComponent(filename);
      }
      filename = filename.replace(/["']/g, '');
    }

    return filename;
  }

  private downloadFile(response: HttpResponse<Blob>, defaultFilename: string, mimeType: string): void {
    if (!response.body) {
      console.error('下載失敗：檔案內容為空');
      return;
    }

    const filename = this.extractFilenameFromResponse(response, defaultFilename);
    const blob = new Blob([response.body], { type: mimeType });
    saveAs(blob, filename);
    console.log('下載成功:', filename);
  }

  // 列印
  onPrint(rowData: TLS53030Data) {
    this.setLoadingState(rowData.id, 'print', true);

    const payload = {
      MID: rowData.MID,
      PST_No: rowData.PST_No || '',
      SYS_StoreNo: rowData.SYS_StoreNo || '',
      HOS_No: rowData.HOS_No || '',
      PST_Date: this.datePipe.transform(rowData.PST_Date, 'yyyy-MM-dd') || ''
    };

    this.tls53030Service.exportTLS53030DetailPDF(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.setLoadingState(rowData.id, 'print', false);
        })
      )
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          this.downloadFile(response, '盤點試算表.pdf', 'application/pdf');
        },
        error: (err: any) => {
          console.error('匯出失敗:', err);
        }
      });
  }

  // 結案盤點單
  concludeTLS53030(rowData: TLS53030Data) {
    this.setLoadingState(rowData.id, 'conclude', true);

    this.tls53030Service.concludeTLS53030(this.createOperationRequest(rowData))
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.setLoadingState(rowData.id, 'conclude', false);
        })
      )
      .subscribe(
        () => this.onSubmit(this.queryForm)
      );
  }

  // 反結案盤點單
  revertedTLS53030(rowData: TLS53030Data) {
    this.setLoadingState(rowData.id, 'reverted', true);

    this.tls53030Service.revertedTLS53030(this.createOperationRequest(rowData))
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.setLoadingState(rowData.id, 'reverted', false);
        })
      )
      .subscribe(
        () => this.onSubmit(this.queryForm)
      );
  }

  // 作廢盤點單
  voidTLS53030(rowData: TLS53030Data) {
    this.setLoadingState(rowData.id, 'void', true);

    this.tls53030Service.voidTLS53030(this.createOperationRequest(rowData))
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.setLoadingState(rowData.id, 'void', false);
        })
      )
      .subscribe(
        () => this.onSubmit(this.queryForm)
      );
  }

  // 產生操作請求物件
  createOperationRequest(rowData: TLS53030Data) {
    return {
      MID: rowData.MID || 0,
      PST_No: rowData.PST_No || '',
      SYS_StoreNo: rowData.SYS_StoreNo || '',
      HOS_No: rowData.HOS_No || ''
    };
  }

  // 編輯禁用
  editDisabled(rowData: TLS53030Data) {
    return !['0', '1', '2', '3'].includes(rowData.PST_Status) || rowData.PST_Type === '尚未盤點'
  }
}
