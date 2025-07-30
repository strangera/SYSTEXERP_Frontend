import { Tls29010Service } from './../../../service/api/tls/tls29010.service';
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
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';

// TALPORDERD_OPENDisc
export interface TALPORDERD_OPENDisc {
  id: number; // 主鍵，自動編號
  mid: number; // 主鍵，自動編號

  str_no: string; // 店部編號
  pod_no: string; // 活動編號(TALPORDERM)
  talent_id: number; // 合約編號系統
  tlt_id: string; // 抽成類別(0-9)

  tlt_no: string; // 專櫃編號
  cag_barcode: string; // 折數(條碼)
  use_flag: string; // 是否使用 Y/N

  CRT_Date: string; // 建立日期 (ISO 字串格式: YYYY-MM-DD)
  CRT_USR_No: string; // 建立人員代碼
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: string; // 變更日期 (ISO 格式: YYYY-MM-DDTHH:mm:ss)
  UPD_USR_No: string; // 變更人員代碼
  UPD_USR_Name: string; // 變更人員姓名

  CanDel?: boolean;  //能否刪除(僅顯示)
}

@Component({
  selector: 'app-tls29010',
  templateUrl: './tls29010.component.html',
  styleUrls: ['./tls29010.component.scss'],
  standalone: true,
  imports: [MenubarComponent, ButtonComponent,InputTextComponent, InputNumberComponent, AccordionModule, FormsModule, ReactiveFormsModule,CalendarComponent, CalendarRangeComponent, CalendarRangeQuickComponent, DropdownComponent, MultiSelectComponent, InputTextComponent, TableComponent, TranslateModule]
})

// 2.2.9.1 折扣開放維護作業
export class TLS29010Component extends BasicQueryPageComponent<TALPORDERD_OPENDisc> implements OnInit{

    // 查詢
      queryForm = this.formBuilder.group({
        // TALPORDERM
        pod_no: [''],       // 活動申請編號YYYYMMDDSSS(活動起始日期+流水號)
        pod_type: [[]], // 折扣別(1=預售, 2=滿千送百發行, 3=滿千送百兌回, 4~5=會員卡集點, 6~7=全館集點, 8=期間開放折扣)
        pod_sdate: [null], // 活動起始日 (Date)
        pod_edate: [null], // 活動終止日 (Date)
        pod_status: [[]], // 活動狀態(0=未核准, 1=已核准, 9=刪除)
        mantain_sdate: [null], // 建立、變更日，查詢合併為維護日 (Date) (upd優先，upd是null查crt)
        mantain_edate: [null], // 建立、變更日，查詢合併為維護日 (Date)
        tlt_id: [[]], // 抽成類別(0-9)
        tlt_no: [[]], // 專櫃編號
        use_flag: [[]], // 是否使用 Y/N
        crt_usr_name: [''], // 建立人員姓名
        locationNumber:[[]],// 專櫃位置編號 // POS2002

        //分頁查詢
        ...createPaginationConfig([{ field: 'pod_no', order: 1 }]), // 分頁和排序參數
      });
      // 表格
      // ----------------------------------------------------------------
      totalRecords = 0;// 分頁和排序參數 // 排序需要
    
      whetherOption: option[] = [ // 是否使用 Y/N
        {value: 'Y', label: '是'},
        {value: 'N', label: '否'}
      ];

      pod_status_Options = [
        { label: '未核准', value: '0' },
        { label: '已核准', value: '1' },
        { label: '刪除', value: '9' },
      ];

      podTypeOptions = [
        { label: '1 預售', value: '1' },
        { label: '2 滿千送百(發行)', value: '2' },
        { label: '3 滿千送百(兌回)', value: '3' },
        { label: '4 會員卡集點-銷售', value: '4' },
        { label: '5 會員卡集點-點數', value: '5' },
        { label: '6 全館集點-銷售', value: '6' },
        { label: '7 全館集點-點數', value: '7' },
        { label: '8 期間開放折扣', value: '8' }, //新增用這個
      ];


      tlt_No_Option: apiOption[] = [];  // 專櫃編號下拉
      pos2002_location_Option: apiOption[] = [];  // 專櫃編號下拉
      
      data: TALPORDERD_OPENDisc[] = [];
      columns: Column[] = [
        { field: 'str_no', header: '店部編號', visible: true },
        { field: 'pod_no', header: '活動編號', visible: true },
        { field: 'talent_id', header: '合約編號系統', visible: true },
        { field: 'tlt_id', header: '抽成類別(0-9)', visible: true },
        { field: 'tlt_no', header: '專櫃編號', visible: true },
        { field: 'cag_barcode', header: '折數(條碼)', visible: true },
        { field: 'use_flag', header: '是否使用', visible: true, format: (value: string) =>
          this.whetherOption.find((option) => option.value === value)?.label || value
        },

        { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate  },
        { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
        { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
        { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDate },
        { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
        { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
      ];
    
      selectedItems: TALPORDERD_OPENDisc[] = [];// 多選項目
    
      // ----------------------------------------------------------------
      constructor(private tls12010Service: Tls29010Service) {
        super();
      }
    
      ngOnInit(): void {
        this.initializePage('TLS29010', 'TLS/TLS29010cru', this.queryForm, (form) => this.onSubmit(form));
        this.loadOption();
      }
    
      onSubmit(frm: FormGroup) {
        console.log('查詢條件',frm.value);
        this.handleSubmit(frm, () => {
          // this.tls12010Service.queryTLS12010(frm.value).subscribe({
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
        onDelete(data: TALPORDERD_OPENDisc | TALPORDERD_OPENDisc[]): void {
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

      loadOption(){
        // 專櫃編號
        this.tls12010Service
          .queryTLTTALENT_Status_DropDownList({})
          .subscribe((response) => {
            this.tlt_No_Option = response.Data.map((item: apiOption) => ({
              No: item.No,
              Name: item.Name,
              Label: item.No + '-' + item.Name,
            }));

            console.log('專櫃編號 下拉:', response.Data);
          });

        // 專櫃位置編號
        this.tls12010Service
          .queryPOS2002_DropDownList({})
          .subscribe((response) => {
            this.pos2002_location_Option = response.Data.map((item: apiOption) => ({
              No: item.No,
              Name: item.Name,
              Label: item.No + '-' + item.Name,
            }));

            console.log('專櫃編號 下拉:', response.Data);
          });  
      }
}
