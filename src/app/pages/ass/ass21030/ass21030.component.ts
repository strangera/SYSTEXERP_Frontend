import { ASS21030Service } from '@service/api/ass/ass21030.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, formatDate } from '../../../shared/componentkit/table/table.model';
import { option } from '../../../shared/models/sys/sysb000.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { environment } from 'src/environments/environment';
import { formatYYYYMM } from '@shared/componentkit/table2/table2.model';
import { apiOption } from '@shared/models/tls/tls000.model';

// ENG2001 抄錶明細檔
export interface ENG2001 {
  ID: number; // 主鍵，自動編號,
  ENG_Type: string, // 能源類型：水錶G01、電錶G02、瓦斯錶G03
  ENG_MeterNo: string, // 錶號
  Location_No: string, // 設備位置編號，對應 POS2002.LOCATION_No
  TLT_No: string, // 專櫃編號，對應 POS2002.TLT_No
  ENG_YYMM: string, // 結算年月
  ENG_CurrentReading_Last: number, // 上次抄錶度數
  ENG_CurrentReading: number, // 本次抄錶度數
  UsageAmount: number; // 用量
  ENG_Date: Date; // 本次抄錶日
  ENG_ImpFileName?: string; // 匯入檔案名稱
  ENG_Remark?: string; // 備註

  CRT_Date: string; // 建立日期 (ISO 字串格式: YYYY-MM-DD)
  CRT_USR_No?: string; // 建立人員代碼
  CRT_USR_Name?: string; // 建立人員姓名
  UPD_Date?: string; // 變更日期 (ISO 格式: YYYY-MM-DDTHH:mm:ss)
  UPD_USR_No?: string; // 變更人員代碼
  UPD_USR_Name?: string; // 變更人員姓名

  CanDel?: boolean;  //能否刪除(僅顯示)
}
@Component({
  selector: 'app-ass21030',
  templateUrl: './ass21030.component.html',
  styleUrl: './ass21030.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    InputTextComponent,
    InputNumberComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    CalendarRangeComponent,
    CalendarRangeQuickComponent,
    DropdownComponent,
    MultiSelectComponent,
    FileUploadModule,
    InputTextComponent,
    TableComponent,
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
      ENG_Status: [null, [Validators.maxLength(1)]], // 抄錶狀態：0=未抄錶、1=已抄錶、2=已結算

      //分頁查詢
      ...createPaginationConfig([{ field: 'ENG_MeterNo', order: 1 }]), // 分頁和排序參數
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
      { value: '0', label: '未抄錶' },
      { value: '1', label: '已抄錶' },
      { value: '2', label: '已結算' }
    ];

    ENG_MeterNo_Option: apiOption[] = [];

    data: ENG2001[] = [];
    columns: Column[] = [
      { field: 'ID', header: 'ID', visible: false },
      { field: 'ENG_Type', header: '能源類型', visible: true, options: this.ENG_Type_Option },
      { field: 'ENG_MeterNo', header: '錶號', visible: true },
      { field: 'Location_No', header: '位置編號', visible: true },
      { field: 'TLT_No', header: '專櫃編號', visible: true },
      { field: 'ENG_YYMM', header: '結算年月', visible: true, format: formatYYYYMM },
      { field: 'ENG_CurrentReading_Last', header: '上期抄錶度', visible: true },
      { field: 'ENG_CurrentReading', header: '本期抄錶度', visible: true },
      { field: 'ENG_Date', header: '抄表日期', visible: true, format: formatDate },
      { field: 'ENG_ImpFileName', header: '匯入檔案名稱', visible: true },
      { field: 'ENG_Remarks', header: '備註', visible: true },

      { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate },
      { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
      { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
      { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDate },
      { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
      { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
    ];
  
    selectedItems: ENG2001[] = [];// 多選項目
  
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

      console.log('送出查詢條件',  JSON.stringify(formValue, null, 2));

      this.handleSubmit(frm, () => {
        this.ass21030Service.queryASS21030(formValue).subscribe({
          next: (response) => {
            if (response.Status === '0000') {
              this.data = (response.Data || []).map((item: any) => {
              let engDate: Date | null = null;

              if (item.ENG_YYMM && typeof item.ENG_YYMM === 'string' && item.ENG_YYMM.length === 6) {
                const year = parseInt(item.ENG_YYMM.substring(0, 4), 10);
                const month = parseInt(item.ENG_YYMM.substring(4, 6), 10) - 1; // JS 的月份從 0 開始
                engDate = new Date(year, month, 1); // 結算年月通常取當月第一天
              }

              return {
                ...item,
                ENG_YYMM: engDate, // 換成 Date 物件
              } as ENG2001;
            });

            console.log('轉換後結果', response.Data );
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
    onDelete(data: ENG2001 | ENG2001[]): void {
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
  
      // this.ass21030Service.deleteASS21030(deleteBody).subscribe({
      //   next: (response) => {
      //     if (response.Status === '0000') {
      //       this.messageService.successBubble('選中項目刪除成功');
      //     } else {
      //       console.error('API error:', response.Status, response.Message);
      //       this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
      //     }
      //   },
      //   error: (err: string) => {
      //     console.error('API error:', err);
      //     this.messageService.errorBubble('刪除失敗');
      //   },
      //   complete: () => {
      //     this.onSubmit(this.queryForm);
      //   },
      // });
  
      this.selectedItems = [];
    }
  
  
    isRowSelectable(rowData: ENG2001): boolean {
      return rowData.CanDel ?? false;
    }
  
    loadOptions() {
      // 查 取得能源表號
      this.ass21030Service.queryENG1001_ENG_MeterNo_DropDownList({}).subscribe((response) => {
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
                // 有錯誤檔：顯示錯誤提示
                this.messageService.errorBubble(`部分資料匯入失敗，請下載錯誤檔檢查`);
                // 自動下載錯誤檔
                this.downloadErrorFile(data.ErrorFilePath);
              } else {
                // 沒有錯誤檔：顯示成功筆數
                this.messageService.infoBubble(`匯入成功，筆數：${data.SuccessCount}`);
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
        window.open(`${environment.ApiUrl}/${filePath}`, '_blank');
      }

}
