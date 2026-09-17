import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { Tls12010Service } from '../../../service/api/tls/tls12010.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { ReportColumn } from '../../../shared/components/table-report/table-report.model';
import { AddButton, formatDate } from '../../../others/component/table/table.model';
import { apiOption, option } from '../../../shared/models/sys/sysb000.model';

export interface Potential_Customer {
  id: number; // 主鍵，自動編號

  contact_USR_No: string; // 接洽人員代碼
  contact_USR_Name: string; // 接洽人員姓名
  cus_type: string; // 廠商類型：1=統編、2=身份證字號、3=員工ID
  cus_uniform_id: string; // 廠商統一編號 (根據類型不同有不同意義)
  VEN_Name: string; // 廠商名稱
  VEN_EngName?: string; // 廠商英文名稱
  bus_type?: string; // 業種-大分類代碼
  tlt_name?: string; // 品牌（專櫃名稱）
  tlt_EngName?: string; // 品牌英文（專櫃名稱）
  VEN_Boss: string; // 廠商聯絡人
  VEN_BossTel: string; // 廠商聯絡人電話
  VEN_BossTitle?: string; // 廠商聯絡人頭銜
  VEN_BossFax?: string; // 廠商聯絡人傳真
  VEN_BossMobile?: string; // 廠商聯絡人行動電話
  VEN_BossEmail?: string; // 廠商聯絡人電子郵件
  VEN_Addr?: string; // 郵寄地址
  VEN_PersonInCharge?: string; // 公司負責人
  business_type?: string; // 經營方式
  demanded_area?: number; // 需求面積 (小數，預設 0)
  country_of_origin?: string; // 商品出產地
  remarks?: string; // 備註 (HTML 格式)

  CRT_Date: string; // 建立日期 (ISO 字串格式: YYYY-MM-DD)
  CRT_USR_No?: string; // 建立人員代碼
  CRT_USR_Name?: string; // 建立人員姓名
  UPD_Date?: string; // 變更日期 (ISO 格式: YYYY-MM-DDTHH:mm:ss)
  UPD_USR_No?: string; // 變更人員代碼
  UPD_USR_Name?: string; // 變更人員姓名

  CanDel?: boolean;  //能否刪除(僅顯示)
}

export interface POS2013 {
  No: string,
  Name: string,
  ShortName: string,
  VEN_No: string,
  VEN_EngName: string,

  Label: string,
}

// 2.1.2.1 潛在客戶資料維護
@Component({
  selector: 'app-tls12010',
  templateUrl: './tls12010.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, InputTextComponent, InputNumberComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, CalendarRangeComponent, CalendarRangeComponent, DropdownComponent, MultiSelectComponent, InputTextComponent, TableReportComponent, TranslateModule]
})
export class TLS12010Component extends BasicQueryPageComponent<Potential_Customer> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // Potential_Customer 潛在客戶主檔
    CreatedDateStart: [null],  // 建立日期_起始日
    CreatedDateEnd: [null],  // 建立日期_終止日
    contact_USR_Name: ['', [Validators.maxLength(16)]],  // 接洽人員代碼/名稱 -- 之後會用dropdown*
    cus_uniform_id: [[]], // 廠商統一編號 --這邊要請後端更新 pos2013.ven_uniform 的下拉 *
    // /*若廠商類型為1=統編, 為廠商統編 (pos2013.ven_uniform) */
    /*若廠商 類型為2=身份證字號, 進行身份證檢查碼檢查 */
    /*若廠商類型為3=員工ID, 檢查 tblUser.user_no */
    VEN_Name: ['', [Validators.maxLength(100)]], // 廠商名稱(中文)
    /*若廠商類型為2=身份證字號, 由使用者自行輸入 */
    /*若廠商類型為3=員工ID, tblUser.user_name */
    VEN_EngName: ['', [Validators.maxLength(100)]], // 廠商名稱(英文)
    /*若廠商類型為2=身份證字號, 由使用者自行輸入 */
    /*若廠商類型為3=員工ID, 由使用者自行輸入 */
    bus_type: [[]], // 業種-大分類代碼(tltbustype)
    tlt_name: ['', [Validators.maxLength(100)]],  // 品牌(專櫃名稱) --- 20251007 修改: 品牌名稱(中文)應為文字輸入欄位
    tlt_EngName: ['', [Validators.maxLength(100)]], // 品牌英文(專櫃名稱)
    //分頁查詢
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'contact_USR_No', order: 1 }]],
  });
  // 表格
  // ----------------------------------------------------------------
  lastQueryBody: any;
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  cus_type_Option: option[] = [ // 廠商類型（1=統編、2=身份證、3=員工ID）
    { value: '1', label: '統編' },
    { value: '2', label: '身份證' },
    { value: '3', label: '員工ID' }
  ];

  business_type_Option: apiOption[] = []; // 經營方式(SYS1000.T117)（長度1，1=生產者、2=代理商、3=經銷商、4=其它）
  bus_type_Option: apiOption[] = []; // 業種-大分類代碼
  tlt_name_Option: apiOption[] = []; // 品牌
  cus_uniform_Option: POS2013[] = []; // 廠商統一編號(pos2013) -- 等候端提供 (必須包含No、Name、EName)
  contact_USR_Option: apiOption[] = [];  // 接洽人員代碼/名稱

  data: Potential_Customer[] = [];
  columns: ReportColumn[] = [
    { field: 'contact_USR_No', header: '接洽人員代碼', visible: true, width: '70px' },
    { field: 'contact_USR_Name', header: '接洽人員姓名', visible: true },
    {
      field: 'cus_type', header: '廠商類型', visible: true, format: (value: string) =>
        this.cus_type_Option.find((option) => option.value === value)?.label || value
    },
    { field: 'cus_uniform_id', header: '廠商統一編號', visible: true },
    { field: 'VEN_Name', header: '廠商名稱(中文)', visible: true, width: '100px' },
    { field: 'VEN_EngName', header: '廠商名稱(英文)', visible: true },
    { field: 'bus_type', header: '大分類代碼', visible: true },
    { field: 'bus_type_name', header: '大分類名稱', visible: true },
    { field: 'tlt_name', header: '品牌名稱(中文)', visible: true, width: '100px' },
    { field: 'tlt_EngName', header: '品牌名稱(英文)', visible: true },
    { field: 'VEN_Boss', header: '廠商聯絡人', visible: true },
    { field: 'VEN_BossTel', header: '廠商聯絡人電話', visible: true, width: '70px' },
    { field: 'VEN_BossTitle', header: '廠商聯絡人頭銜', visible: true },
    { field: 'VEN_BossFax', header: '廠商聯絡人傳真', visible: true },
    { field: 'VEN_BossMobile', header: '廠商聯絡人行動電話', visible: true, width: '70px' },
    { field: 'VEN_BossEmail', header: '廠商聯絡人電子郵件', visible: true, width: '100px' },
    { field: 'VEN_Addr', header: '郵寄地址', visible: true, width: '200px' },
    { field: 'VEN_Address', header: '公司營登地址', visible: true, width: '100px' },
    { field: 'VEN_PersonInCharge', header: '公司負責人', visible: true },
    {
      field: 'business_type', header: '經營方式', visible: true, format: (value: string) =>
        this.business_type_Option.find((option) => option.No === value)?.Label || value
    },
    { field: 'demanded_area', header: '需求面積', visible: true },
    { field: 'country_of_origin', header: '商品出產地', visible: true },
    { field: 'remarks', header: '備註', visible: true, width: '200px' },

    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate, width: '70px' },
    { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDate, width: '70px' },
    { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
  ];

  addButton: AddButton[] = [
    {
      label: '匯出PDF',
      icon: 'fa-regular fa-file-pdf',
      action: (rowData) => this.onReport(rowData, false), // 傳入 rowData 並指定非 Excel
      loading: () => this.btnPDFLoading
    },
    {
      label: '匯出Excel',
      icon: 'fa-regular fa-file-lines',
      action: (rowData) => this.onReport(rowData, true), // 傳入 rowData 並指定為 Excel
      loading: () => this.btnExcelLoading
    }
  ];

  selectedItems: Potential_Customer[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(public readonly tls12010Service: Tls12010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS12010', 'TLS/TLS12010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    console.log('查詢條件', frm.value);
    this.handleSubmit(frm, () => {
      this.tls12010Service.queryTLS12010(frm.value).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.lastQueryBody = frm.value;
            this.data = response.Data || [];
            console.log('Result', response.Data);
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
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
  onDelete(data: Potential_Customer | Potential_Customer[]): void {
    this.messageService.confirm({
      message: `是否確認刪除選中的潛在客戶?`,
      header: `確認刪除`,
      accept: () => {
        // 1. 準備 ID 陣列
        const items = Array.isArray(data) ? data : [data];
        const ids = items
          .filter(item => item && item.id != null)
          .map(item => item.id);

        if (ids.length === 0) {
          this.messageService.errorBubble('請先選擇要刪除的項目');
          return;
        }

        // 2. 根據你提供的 API 需求，格式應該是這樣：
        const deleteBody = {
          idList: ids  // 直接對應 API 的 {"idList": [0]}
        };

        console.log('Sending Delete Payload:', deleteBody);

        this.loading = true;
        this.tls12010Service.deleteTLS12010(deleteBody)
          .pipe(
            untilDestroyed(this),
            finalize(() => this.loading = false)
          )
          .subscribe({
            next: (response) => {
              if (response.Status === '0000') {
                this.messageService.successBubble('刪除成功');
                this.selectedItems = [];
                this.onSubmit(this.queryForm);
              } else {
                // 這裡會抓到 API 回傳的 "idList field is required" 錯誤
                this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
              }
            },
            error: (err) => {
              console.error('HTTP Error:', err);
              this.messageService.errorBubble('網路通訊失敗');
            }
          });
      }
    });
  }

  //接待人員變化
  onUSR_NoChange(id: string): void {
    // contact_USR_Option 有對應的No 就將Name寫入 contact_USR_Name
    const selectedUSR = this.contact_USR_Option.find(item => item.No === id);
    if (selectedUSR) {
      this.queryForm.get('contact_USR_Name')?.setValue(selectedUSR.Name);
    } else {
      // 若找不到，清空欄位或保留原值，看你的需求
      this.queryForm.get('contact_USR_Name')?.setValue('');
    }
  }

  isRowSelectable(rowData: Potential_Customer): boolean {
    return rowData.CanDel ?? false;
  }

  loadOptions() {
    // 查 大分類(專櫃)
    this.tls12010Service.queryTLTBUSTYPE_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.bus_type_Option = response.Data.map((item: any) => ({
        No: item.No, // 大分類(專櫃) 號
        Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      }));
      console.log('大分類代號:', this.bus_type_Option);
    });
    // 查 品牌
    this.tls12010Service.queryPLULOGO_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.tlt_name_Option = response.Data.map((item: any) => ({
        No: item.No, // 專櫃主代碼
        Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      }));
      console.log('品牌代碼:', this.tlt_name_Option);
    });
    // 查 廠商統一編號（從Potential_Customer取distinct值）
    this.tls12010Service.queryTLS12010_CusUniformDropDown().pipe(untilDestroyed(this)).subscribe((response) => {
      this.cus_uniform_Option = (response.Data ?? []).map((item: { Value: string; Label: string }) => ({
        No: item.Value,
        Name: item.Value,
        ShortName: '',
        VEN_No: '',
        VEN_EngName: '',
        Label: item.Label,
      }));
    });
    // 查 經營方式
    this.tls12010Service.querySYS1000_DropDownList({ "SYS_Type": 'T117' }).pipe(untilDestroyed(this)).subscribe((response) => {
      this.business_type_Option = response.Data.map((item: any) => ({
        No: item.No, // 經營方式 代碼
        Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      }));
      console.log('經營方式代號:', this.business_type_Option);
    });

    // 查詢 接待人員
    this.tls12010Service.queryTBLUSER_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.contact_USR_Option = response.Data.map((item: any) => ({
        No: item.No, // 接待人員 名稱
        Name: item.Name, // 接待人員 名稱
        Label: item.No + '-' + item.Name //標籤
      }));
      console.log('接待人員代號:', this.contact_USR_Option);
    });
  }

  // 列印明細
  btnPDFLoading = false;
  btnExcelLoading = false;
  onReport(rowData: Potential_Customer, isExcel: boolean) {
    if (!rowData || !rowData.id) {
      this.messageService.errorBubble('找不到該筆資料的 ID');
      return;
    }

    // 根據 API 需求包裝參數，對應您原本程式碼中的 PC_id
    const formValue = { ID: rowData.id };

    if (isExcel) {
      this.btnExcelLoading = true;
      this.tls12010Service.exportTLS12010(formValue)
        .pipe(
          finalize(() => this.btnExcelLoading = false),
          untilDestroyed(this)
        )
        .subscribe({
          next: (blob: Blob) => {
            this.downloadFile(blob, `潛在客戶明細_${rowData.id}_${new Date().getTime()}.xlsx`);
            this.messageService.successBubble('匯出 Excel 成功');
          },
          error: (err) => {
            console.error(err);
            this.messageService.errorBubble('匯出失敗');
          }
        });
    } else {
      this.btnPDFLoading = true;
      this.tls12010Service.exportTLS12010PDF(formValue)
        .pipe(
          finalize(() => this.btnPDFLoading = false),
          untilDestroyed(this)
        )
        .subscribe({
          next: (blob: Blob) => {
            this.downloadFile(blob, `潛在客戶明細_${rowData.id}_${new Date().getTime()}.pdf`);
            this.messageService.successBubble('匯出 PDF 成功');
          },
          error: (err) => {
            console.error(err);
            this.messageService.errorBubble('匯出失敗');
          }
        });
    }
  }

  // 輔助方法：處理 Blob 下載
  private downloadFile(data: Blob, fileName: string) {
    const url = globalThis.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    globalThis.URL.revokeObjectURL(url); // 釋放記憶體
    document.body.removeChild(a);
  }
}
