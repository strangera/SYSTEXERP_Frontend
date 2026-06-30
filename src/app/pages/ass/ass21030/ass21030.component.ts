import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21030Service } from '@service/api/ass/ass21030.service';
import { formatYYYYMM } from '@shared/componentkit/table/table.model';
import { apiOption } from '@shared/models/tls/tls000.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { finalize, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx-js-style';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CustomFooterTableComponent } from '../../../shared/componentkit/custom-footer-table/customFooterTable.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { Column, createPaginationConfig, formatAmount, formatDate, formatOptionLabel } from '../../../shared/componentkit/table/table.model';
import { option } from '../../../shared/models/sys/sysb000.model';

// 分攤設定介面
export interface ApportionmentSetting {
  TLT_No: string; // 專櫃編號
  TLT_Name: string; // 專櫃名稱
  ENG_Rate: number; // 比率(%)
  ENG_Remark?: string; // 備註
}

// ENG2001 抄錶明細檔
export interface ENG2001 {
  ID: number; // 主鍵，自動編號,
  ENG_Type: string, // 能源類型：水錶G01、電錶G02、瓦斯錶G03
  ENG_MeterNo: string, // 錶號
  Location_No: string, // 設備位置編號，對應 POS2002.LOCATION_No
  TLT_No: string, // 專櫃編號，對應 POS2002.TLT_No
  ENG_YYMM: string, // 結算年月
  ENG_Amount: number, // 本次抄錶金額
  ENG_CurrentReading_Last: number, // 上次抄錶度數
  ENG_LastReadingDate: Date; // 上次抄錶日
  ENG_CurrentReading: number, // 本次抄錶度數
  UsageAmount: number; // 用量
  ENG_Date: Date; // 本次抄錶日
  ENG_ImpFileName?: string; // 匯入檔案名稱
  ENG_Status?: string; // 結算狀態：0=未結算、1=已結算

  ENG_Remark?: string; // 備註

  CRT_Date: string; // 建立日期 (ISO 字串格式: YYYY-MM-DD)
  CRT_USR_No?: string; // 建立人員代碼
  CRT_USR_Name?: string; // 建立人員姓名
  UPD_Date?: string; // 變更日期 (ISO 格式: YYYY-MM-DDTHH:mm:ss)
  UPD_USR_No?: string; // 變更人員代碼
  UPD_USR_Name?: string; // 變更人員姓名

  CanDel?: boolean;  //能否刪除(僅顯示)

  ApportionmentSettings?: ApportionmentSetting[]; // 分攤設定
}
@Component({
  selector: 'app-ass21030',
  templateUrl: './ass21030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    ButtonModule,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    MultiSelectComponent,
    FileUploadModule,
    CustomFooterTableComponent,
    TranslateModule]
})

// 能源抄表作業
export class ASS21030Component extends BasicQueryPageComponent<ENG2001> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // ENG2001 抄錶明細檔 + ENG1001 能源錶號明細檔
    EngTypes: [[], [Validators.maxLength(3)]], // 能源類型：水錶G01、電錶G02、瓦斯錶G03
    ENG_MeterNo: [null, [Validators.maxLength(5)]], // 錶號 (/Share/queryENG1001_ENG_MeterNo_DropDownList)
    SYS_StoreNo: [this.authService.getUserInfo()?.SYS_StoreNo ?? '', [Validators.maxLength(10)]], // 分店編號 section抓
    Mid: [Number(this.authService.getUserInfo()?.mid), [Validators.maxLength(19)]], //  section抓
    ENG_YYMM: [null, [Validators.maxLength(6)]], // 結算年月
    ENG_Amount: [null, [Validators.min(0)]], // 結算金額
    ENG_Status: [null, [Validators.maxLength(1)]], // 結算狀態：0=未抄錶、1=已抄錶、2=已結算

    //分頁查詢
    ...createPaginationConfig([{ field: 'EngTypes', order: 1 }, { field: 'ENG_MeterNo', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  ENG_Type_Option: option[] = [ // 能源類型選項
    { value: 'G01', label: '水錶' },
    { value: 'G02', label: '電錶' },
    { value: 'G03', label: '瓦斯錶' }
  ];
  ENG_Status_Option: option[] = [ // 抄錶狀態選項
    { value: '0', label: '未結算' },
    { value: '1', label: '已結算' }
  ];

  ENG_MeterNo_Option: apiOption[] = [];

  data: ENG2001[] = [];
  columns: Column[] = [
    { field: 'ENG_Type', header: '能源類型', visible: true, options: this.ENG_Type_Option, format: (value) => formatOptionLabel(value, this.ENG_Type_Option) },
    { field: 'ENG_MeterNo', header: '錶號', visible: true },
    { field: 'Location_No', header: '位置編號', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'TLT_Name', header: '專櫃名稱', visible: true },
    { field: 'ENG_YYMM', header: '結算年月', visible: true, format: formatYYYYMM },
    { field: 'UsageAmount', header: '使用度數', visible: true },
    { field: 'ENG_Amount', header: '結算金額', visible: true, format: formatAmount },
    { field: 'ENG_Date', header: '抄表日期', visible: true, format: formatDate },
    { field: 'ENG_Status', header: '結算狀態', visible: true, options: this.ENG_Status_Option, format: (value) => formatOptionLabel(value, this.ENG_Status_Option) },
    { field: 'ENG_ImpFileName', header: '匯入檔案名稱', visible: true },
    { field: 'ENG_Remarks', header: '備註', visible: false },


    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDate },
    { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
  ];

  selectedItems: ENG2001[] = [];// 多選項目

  btnPDFLoading = false; // PDF 讀取進度條
  btnExcelLoading = false; // Excel 讀取進度條
  btnTemplateLoading = false;

  // 展開詳細資料的欄位定義 (分攤設定)
  expansionColumns: Column[] = [
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'TLT_Name', header: '專櫃名稱', visible: true },
    { field: 'ENG_Rate', header: '比率(%)', visible: true, format: formatAmount }
  ];

  // ----------------------------------------------------------------
  constructor(private ass21030Service: ASS21030Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS21030', 'ASS/ASS21030cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    // 取出原始值
    const formValue = { ...frm.value };

    // 假設 ENG_YYMM 是 Date 物件，就轉成 YYYYMM
    if (formValue.ENG_YYMM instanceof Date) {
      const year = formValue.ENG_YYMM.getFullYear();
      const month = String(formValue.ENG_YYMM.getMonth() + 1).padStart(2, '0');
      formValue.ENG_YYMM = `${year}${month}`;
    }

    console.log('送出查詢條件', JSON.stringify(formValue, null, 2));

    this.handleSubmit(frm, () => {
      this.ass21030Service.queryASS21030(formValue).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = (response.Data || []).map((item: any) => {
              let engDate: Date | null = null;

              if (item.ENG_YYMM && typeof item.ENG_YYMM === 'string' && item.ENG_YYMM.length === 6) {
                const year = parseInt(item.ENG_YYMM.substring(0, 4), 10);
                const month = parseInt(item.ENG_YYMM.substring(4, 6), 10) - 1; // JS 的月份從 0 開始
                engDate = new Date(year, month, 1); // 結算年月通常取當月第一天
              }

              // 如果後端返回的是中文，轉換回代碼（保持原始值）
              let engType = item.ENG_Type;
              if (engType && typeof engType === 'string') {
                const typeOption = this.ENG_Type_Option.find(opt => opt.label === engType);
                if (typeOption) {
                  engType = typeOption.value;
                }
              }

              // 如果後端返回的是中文，轉換回代碼（保持原始值）
              let engStatus = item.ENG_Status;
              if (engStatus && typeof engStatus === 'string') {
                const statusOption = this.ENG_Status_Option.find(opt => opt.label === engStatus);
                if (statusOption) {
                  engStatus = statusOption.value;
                }
              }

              return {
                ...item,
                ENG_YYMM: engDate, // 換成 Date 物件
                ENG_Type: engType, // 確保是代碼而非中文
                ENG_Status: engStatus, // 確保是代碼而非中文
              } as ENG2001;
            });

            console.log('轉換後結果', response.Data);
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, formValue);
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

  // 刪除項目
  onDelete(data: ENG2001[]): void {
    this.messageService.confirm({
      message: `是否確認刪除選中的能源抄錶資料?`,
      header: `確認刪除`,
      accept: () => {
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
          idList: idList, // 符合 API 的 idList 格式
        };

        console.log('deleteBody', deleteBody);

        this.ass21030Service.deleteASS21030(deleteBody).pipe(untilDestroyed(this)).subscribe({
          next: (response) => {
            if (response.Status === '0000') {
              this.messageService.successBubble('刪除成功');
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
      },
    });
  }


  isRowSelectable(rowData: ENG2001): boolean {
    return rowData.CanDel ?? false;
  }

  /**
   * 編輯按鈕禁用條件（僅未結算狀態可編輯）
   */
  editDisabled = (rowData: ENG2001): boolean => {
    return rowData.ENG_Status !== '0'; // 0:未結算才能編輯，其他狀態禁用
  }

  loadOptions() {
    // 查 取得能源表號
    this.ass21030Service.queryENG1001_ENG_MeterNo_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.ENG_MeterNo_Option = response.Data.map((item: any) => ({
        No: item.ENG_MeterNo, // 能源表號
        Name: item.ENG_MeterNo,
      }));
      console.log('能源表號代號:', response.Data);
    });
  }

  //匯入excel並更新資料
  onFileUpload(event: FileSelectEvent) {
    const file = event.files[0];
    const formData = new FormData();
    formData.append('file', file);

    this.ass21030Service.importASS21030(formData).pipe(untilDestroyed(this)).subscribe({
      next: (res) => {
        const data = res?.Data;

        if (data) {
          if (data.ErrorFilePath) {
            this.messageService.errorBubble(`匯入失敗，共 ${data.ErrorCount} 筆錯誤，請下載錯誤檔修正後重新上傳`);
            this.downloadErrorFile(data.ErrorFilePath);
          } else {
            this.messageService.infoBubble(`匯入成功，共 ${data.SuccessCount} 筆`);
            this.onSubmit(this.queryForm);
          }
        }
      },
      error: (err) => {
        console.error(err);
        this.messageService.errorBubble('檔案上傳失敗，請稍後再試');
      },
    });
  }

  downloadErrorFile(filePath: string) {
    globalThis.open(`${environment.ApiUrl}/${filePath}`, '_blank');
  }

  // 匯出 PDF
  onExportPDF(frm: FormGroup) {
    // 取出原始值
    const formValue = { ...frm.value };

    // 假設 ENG_YYMM 是 Date 物件，就轉成 YYYYMM
    if (formValue.ENG_YYMM instanceof Date) {
      const year = formValue.ENG_YYMM.getFullYear();
      const month = String(formValue.ENG_YYMM.getMonth() + 1).padStart(2, '0');
      formValue.ENG_YYMM = `${year}${month}`;
    }

    this.btnPDFLoading = true;
    this.ass21030Service.exportASS21030PDF(formValue)
      .pipe(finalize(() => this.btnPDFLoading = false), untilDestroyed(this))
      .subscribe(blob => {
        if (blob) {
          // 產生時間戳記 YYYYMMDDHHMMSS
          const now = new Date();
          const timestamp = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0') +
            now.getSeconds().toString().padStart(2, '0');
          const fileName = `能源抄表資料${timestamp}.pdf`;

          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(blobUrl);
        }
      });
  }

  // 匯出 Excel
  onExportExcel(frm: FormGroup) {
    // 取出原始值
    const formValue = { ...frm.value };

    // 假設 ENG_YYMM 是 Date 物件，就轉成 YYYYMM
    if (formValue.ENG_YYMM instanceof Date) {
      const year = formValue.ENG_YYMM.getFullYear();
      const month = String(formValue.ENG_YYMM.getMonth() + 1).padStart(2, '0');
      formValue.ENG_YYMM = `${year}${month}`;
    }

    this.btnExcelLoading = true;
    this.ass21030Service.exportASS21030(formValue)
      .pipe(finalize(() => this.btnExcelLoading = false), untilDestroyed(this))
      .subscribe(blob => {
        if (blob) {
          // 產生時間戳記 YYYYMMDDHHMMSS
          const now = new Date();
          const timestamp = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0') +
            now.getSeconds().toString().padStart(2, '0');
          const fileName = `能源抄表資料${timestamp}.xlsx`;

          const blobUrl = URL.createObjectURL(blob);

          // 建立下載連結
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(blobUrl);
        }
      });
  }

  // 載入展開詳細資料 (分攤設定)
  loadDetails = (rowData: ENG2001): Observable<any> => {
    // 直接從 rowData 的 ApportionmentSettings 取得資料
    if (rowData.ApportionmentSettings && Array.isArray(rowData.ApportionmentSettings)) {
      return of({ Data: rowData.ApportionmentSettings });
    }
    return of({ Data: [] });
  };

  /**
  * 匯出Excel範本
  */
  async onExportTemplate() {
    this.btnTemplateLoading = true;
    try {
      // 建立工作簿
      const wb = XLSX.utils.book_new();

      // 2. 定義標題列與範例資料
      // 標題包含：項次, 結算年月(yyyymm), 能源錶號(5碼), 能源類型(G01:水 G02:電 G03:瓦斯), 本次抄錶日(yyyy/mm/dd), 本次抄錶度, 結算金額
      const header = [
        '項次',
        '結算年月\n(yyyymm)',
        '能源錶號\n(5碼)',
        '能源類型\n(G01:水 G02:電 G03:瓦斯)',
        '本次抄錶日\n(yyyy/mm/dd)',
        '本次抄錶度',
        '結算金額'
      ];

      // 建立工作表
      const ws = XLSX.utils.aoa_to_sheet([header]);

      // 3. 設定欄寬 (根據內容長度微調)
      ws['!cols'] = [
        { wch: 8 },  // 項次
        { wch: 15 }, // 結算年月
        { wch: 15 }, // 能源錶號
        { wch: 35 }, // 能源類型 (欄位較長)
        { wch: 20 }, // 本次抄錶日
        { wch: 15 }, // 本次抄錶度
        { wch: 15 }  // 結算金額
      ];

      // 4. 🔑 設定儲存格格式
      // 我們將 B, C, D 欄（索引 1, 2, 3）設定為文字格式，防止前導零消失
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

      // 遍歷每一列（從第 2 列開始，並預留 100 列空列供使用者填寫）
      for (let row = 1; row <= range.e.r + 100; row++) {
        [1, 2, 3].forEach(colIdx => { // 針對 結算年月、能源錶號、能源類型
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: colIdx });

          if (!ws[cellAddress]) {
            ws[cellAddress] = { t: 's', v: '' };
          }

          ws[cellAddress].t = 's'; // 設定為 String
          ws[cellAddress].z = '@'; // 強制 Excel 識別為文字格式
        });
      }

      console.log('📤 匯出能源結算 Excel 範本:', [wb, ws]);

      // 5. 將工作表加入工作簿並下載
      XLSX.utils.book_append_sheet(wb, ws, '能源結算範本');

      const fileName = `EnergyUploadSample.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('加載 Excel 套件失敗', error);
      this.messageService.errorBubble('無法產生範本，請稍後再試');
    } finally {
      this.btnTemplateLoading = false;
    }
  }
}
