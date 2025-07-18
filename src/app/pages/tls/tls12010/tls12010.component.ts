import { Label } from './../tls51070-os/tls51070-os.component';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, formatDate } from '../../../shared/componentkit/table/table.model';
import { apiOption, option } from '../../../shared/models/sys/sysb000.module';
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
import { Tls12010Service } from '../../../service/api/tls/tls12010.service';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';

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
  VEN_Addr?: string; // 公司通訊地址
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

// 2.1.2.1 潛在客戶資料維護
@Component({
    selector: 'app-tls12010',
    templateUrl: './tls12010.component.html',
    styleUrl: './tls12010.component.scss',
    standalone: true,
    imports: [MenubarComponent, ButtonComponent,InputTextComponent, InputNumberComponent, AccordionModule, FormsModule, ReactiveFormsModule,CalendarComponent, CalendarRangeComponent, CalendarRangeQuickComponent, DropdownComponent, MultiSelectComponent, InputTextComponent, TableComponent, TranslateModule]
})
export class TLS12010Component extends BasicQueryPageComponent<Potential_Customer> implements OnInit{
    // 查詢
      queryForm = this.formBuilder.group({
        // Potential_Customer 潛在客戶主檔
        CRT_Date_start: [null],  // 建立日期_起始日
        CRT_Date_end: [null],  // 建立日期_終止日
        contact_USR_No: ['', [Validators.maxLength(16)]],  // 接洽人員代碼/名稱 -- 之後會用dropdown*
        cus_uniform_id: ['', [Validators.maxLength(16)]], // 廠商統一編號 --這邊要請後端更新 pos2013.ven_uniform 的下拉 *
        // /*若廠商類型為1=統編, 為廠商統編 (pos2013.ven_uniform) */
	         /*若廠商 類型為2=身份證字號, 進行身份證檢查碼檢查 */
	         /*若廠商類型為3=員工ID, 檢查 tblUser.user_no */ 
        VEN_Name: ['', [Validators.maxLength(100)]], // 廠商名稱(中文)
        /*若廠商類型為2=身份證字號, 由使用者自行輸入 */
	      /*若廠商類型為3=員工ID, tblUser.user_name */
        VEN_EngName: ['', [Validators.maxLength(100)]], // 廠商名稱(英文)
        /*若廠商類型為2=身份證字號, 由使用者自行輸入 */
	      /*若廠商類型為3=員工ID, 由使用者自行輸入 */
        bus_type: ['', [Validators.maxLength(2)]], // 業種-大分類代碼(tltbustype)
        tlt_name: ['', [Validators.maxLength(100)]],  // 品牌(專櫃名稱)
        tlt_EngName: ['', [Validators.maxLength(100)]], // 品牌英文(專櫃名稱)
        //分頁查詢
        ...createPaginationConfig([{ field: 'contact_USR_No', order: 1 }]), // 分頁和排序參數
      });
      // 表格
      // ----------------------------------------------------------------
      totalRecords = 0;// 分頁和排序參數 // 排序需要
    
      cus_type_Option: option[] = [ // 廠商類型（1=統編、2=身份證、3=員工ID）
        {value: '1', label: '統編'},
        {value: '2', label: '身份證'},
        {value: '3', label: '員工ID'}
      ];
  
      business_type_Option: apiOption[] = []; // 經營方式(SYS1000.T117)（長度1，1=生產者、2=代理商、3=經銷商、4=其它）
      bus_type_Option: apiOption[] = []; // 業種-大分類代碼
      tlt_name_Option: apiOption[] = []; // 品牌
      cus_uniform_Option: apiOption[] = []; // 廠商統一編號(pos2013) -- 等候端提供 (必須包含No、Name、EName)
      contact_USR_Option: apiOption[] = [  // 接洽人員代碼/名稱 -- 等候端提供
        {No: '123',Name:'張三',Label: '123-張三'}
      ];
      
      data: Potential_Customer[] = [];
      columns: Column[] = [
        { field: 'contact_USR_No', header: '接洽人員代碼', visible: true },
        { field: 'contact_USR_Name', header: '接洽人員姓名', visible: true },
        { field: 'cus_type', header: '廠商類型', visible: true, format: (value: string) =>
          this.cus_type_Option.find((option) => option.value === value)?.label || value
        },
        { field: 'cus_uniform_id', header: '廠商統一編號', visible: true },
        { field: 'VEN_Name', header: '廠商名稱', visible: true },
        { field: 'VEN_EngName', header: '廠商英文名稱', visible: true },
        { field: 'bus_type', header: '大分類代碼', visible: true },
        { field: 'tlt_name', header: '品牌（專櫃名稱）', visible: true },
        { field: 'tlt_EngName', header: '品牌英文名稱', visible: true },
        { field: 'VEN_Boss', header: '廠商聯絡人', visible: true },
        { field: 'VEN_BossTel', header: '廠商聯絡人電話', visible: true },
        { field: 'VEN_BossTitle', header: '廠商聯絡人頭銜', visible: true },
        { field: 'VEN_BossFax', header: '廠商聯絡人傳真', visible: true },
        { field: 'VEN_BossMobile', header: '廠商聯絡人行動電話', visible: true },
        { field: 'VEN_BossEmail', header: '廠商聯絡人電子郵件', visible: true },
        { field: 'VEN_Addr', header: '公司通訊地址', visible: true },
        { field: 'VEN_PersonInCharge', header: '公司負責人', visible: true },
        { field: 'business_type', header: '經營方式', visible: true, format: (value: string) =>
          this.business_type_Option.find((option) => option.No === value)?.Label || value
        },
        { field: 'demanded_area', header: '需求面積', visible: true },
        { field: 'country_of_origin', header: '商品出產地', visible: true },
        { field: 'remarks', header: '備註', visible: true },

        { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate  },
        { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
        { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
        { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDate },
        { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
        { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
      ];
    
      selectedItems: Potential_Customer[] = [];// 多選項目
    
      // ----------------------------------------------------------------
      constructor(private tls12010Service: Tls12010Service) {
        super();
      }
    
      ngOnInit(): void {
        this.initializePage('TLS12010', 'TLS/TLS12010cru', this.queryForm, (form) => this.onSubmit(form));
        this.loadOptions();
      }
    
      onSubmit(frm: FormGroup) {
        console.log('查詢條件',frm.value);
        this.handleSubmit(frm, () => {
          // this.tls41050Service.queryTLS41050(frm.value).subscribe({
          //   next: (response) => {
          //     if (response.Status === '0000') {
          //       this.data = response.Data || [];
          //       console.log('Result', this.data);
          //       this.totalRecords = response.TotalCount || response.Data.length;
          //       this.queryStateService.setQueryState(this.ProgNo, frm.value);
          //     } else {
          //       console.error('API error:', response.Status, response.Message);
          //     }
          //     this.loading = false;
          //     this.messageService.unblockUi();
          //   },
          //   error: (err: string) => {
          //     console.error('API error:', err);
          //     this.loading = false;
          //     this.messageService.unblockUi();
          //   },
          // });
        });
      }

      // 刪除項目
        onDelete(data: Potential_Customer | Potential_Customer[]): void {
          console.log('Delete data:', JSON.stringify(data, null, 2));
      
          const items = Array.isArray(data) ? data : [data];
          if (items.length === 0) {
            console.error('No items to delete');
            this.messageService.errorBubble('無法刪除：沒有選中的項目');
            return;
          }
      
          // 收集所有有效的 ID
          const idList = items
            .filter((item) => item && item.id != null && item.id !== undefined)
            .map((item) => item.id);
      
          if (idList.length === 0) {
            console.error('No valid IDs to delete');
            this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
            return;
          }
    
      
          // const deleteBody = {
          //   idList: idList, // 符合 API 的 idList 格式
          // };
          // this.tls41050Service.deleteTLS51070(deleteBody).subscribe({
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
    
      isRowSelectable(): boolean {
        // return rowData.CanDel
        return false; //不予許刪除
      }
  
      loadOptions(){
        // 查 大分類(專櫃)
        this.tls12010Service.queryTLTBUSTYPE_DropDownList({}).subscribe((response) => {
          this.bus_type_Option = response.Data.map((item: any) => ({
            No: item.No, // 收銀機號
            Label: item.No + '/' + item.Name, // 組合成顯示用的Label
          }));
          console.log('大分類代號:', this.bus_type_Option);
        });
        // 查 品牌
        this.tls12010Service.queryPLULOGO_DropDownList({}).subscribe((response) => {
          this.tlt_name_Option = response.Data.map((item: any) => ({
            No: item.No, // 專櫃主代碼
            Label: item.No + '/' + item.Name, // 組合成顯示用的Label
          }));
          console.log('品牌代號:', this.tlt_name_Option);
        });
        // 查 統編
        this.tls12010Service.queryPOS2013_DropDownList({}).subscribe((response) => {
          this.cus_uniform_Option = response.Data.map((item: any) => ({
            No: item.No, // 統編代碼
            Label: item.No + '/' + item.Name, // 組合成顯示用的Label
          }));
          console.log('統編代號:', response.Data);
        });
        // 查 經營方式
         this.tls12010Service.querySYS1000_DropDownList({"SYS_Type": 'T117'}).subscribe((response) => {
          this.business_type_Option = response.Data.map((item: any) => ({
            No: item.No, // 經營方式 代碼
            Label: item.No + '/' + item.Name, // 組合成顯示用的Label
          }));
          console.log('經營方式代號:', response.Data);
        });
      }
}
