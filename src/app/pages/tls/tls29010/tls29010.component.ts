import { Tls29010Service } from './../../../service/api/tls/tls29010.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, formatDate, AddButton } from '../../../shared/componentkit/table/table.model';
import { apiOption, option } from '../../../shared/models/sys/sysb000.model';
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
import { finalize } from 'rxjs';
import { DropDownListService } from '@service/utility/dropDownList.service';

// TALPORDERM (主檔)
export interface TALPORDERM {
  id: string; // identity(1,1) not null
  mid: number; // DEFAULT 0 not null
  str_no: string; // 店部編號
  pod_no: string; // 活動申請編號YYYYMMDDSSS(活動起始日期+流水號)
  pod_type: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
  // 活動類型:
  // 1=預售 (只有預售才下到 pos)
  // 2=滿千送百發行
  // 3=滿千送百兌回
  // 4=會員卡集點-銷售 (不用)
  // 5=會員卡集點-點數 (不用)
  // 6=全館消費滿額集點-銷售
  // 7=全館消費滿額集點-點數
  // 8=期間開放折扣

  org_id?: string | null; // 組織-部門(SYS3100) //
  act_no?: string | null; // 活動編號(群組) // 券類才會用到
  pod_desc?: string | null; // 活動名稱
  pod_sdate: Date; // 活動起始日期
  pod_edate: Date; // 活動終止日期
  pod_busdate?: Date | null; // 活動正檔日期 // 券類才會用到
  pod_back_sdate?: Date | null;  //活動兌回起始日期
  pod_back_edate?: Date | null;  //活動兌回終止日期
  pod_status: '0' | '1' | '9';
  // 0=未核准 1=已核准 9=刪除

  approved_userno?: string | null; // 核准人員
  approved_usr_name?: string | null; // 核准人員姓名
  approved_date?: Date | null; // 核准日期

  CRT_Date: string; // 建立日期 (ISO 字串格式: YYYY-MM-DD)
  CRT_USR_No: string; // 建立人員代碼
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: string; // 變更日期 (ISO 格式: YYYY-MM-DDTHH:mm:ss)
  UPD_USR_No: string; // 變更人員代碼
  UPD_USR_Name: string; // 變更人員姓名
}

@Component({
  selector: 'app-tls29010',
  templateUrl: './tls29010.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, InputTextComponent, InputNumberComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, CalendarRangeComponent, CalendarRangeQuickComponent, DropdownComponent, MultiSelectComponent, InputTextComponent, TableComponent, TranslateModule]
})

// 2.2.9.1 折扣開放維護作業
export class TLS29010Component extends BasicQueryPageComponent<TALPORDERM> implements OnInit {

  // 查詢
  queryForm = this.formBuilder.group({
    // TALPORDERM
    pod_no: [null],   // 活動申請編號YYYYMMDDSSS(活動起始日期+流水號)
    pod_type: [['8']], // 活動類型(1=預售, 2=滿千送百發行, 3=滿千送百兌回, 4~5=會員卡集點, 6~7=全館集點, 8=期間開放折扣) // 新增規則這裡部定查8
    pod_sdate: [null], // 活動起始日 (Date)
    pod_edate: [null], // 活動終止日 (Date)
    pod_status: [[]], // 活動狀態(0=未核准, 1=已核准, 9=刪除)
    mantain_sdate: [null], // 建立、變更日，查詢合併為維護日 (Date) (upd優先，upd是null查crt)
    mantain_edate: [null], // 建立、變更日，查詢合併為維護日 (Date)
    tlt_id: [[]], // 抽成類別(0-9)
    tlt_no: [[]], // 專櫃編號
    use_flag: [[]], // 是否使用 Y/N
    crt_usr_name: [null], // 建立人員姓名

    //---0801更新(位置編號不使用)---

    //分頁查詢
    ...createPaginationConfig([{ field: 'pod_no', order: 1 }]), // 分頁和排序參數
  });

  // 20251016 核准按鈕  (狀態不是未審核都不能點)
  addButton: AddButton[] = [
    { label: '核准', icon: 'pi pi-check-circle text-green-500', action: (rowData: TALPORDERM) => { this.statusChange(rowData, '已核准'); }, disabled: (rowData: TALPORDERM) => rowData.pod_status !== '0' }, // 審核
  ]
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  whetherOption: option[] = [ // 是否使用 Y/N
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' }
  ];

  pod_status_Options = [
    { label: '未核准', value: '0' },
    { label: '已核准', value: '1' },
    { label: '刪除', value: '9' },
  ];

  // 20251015 更新: 本作業固定操作的活動類型為 8=期間開放折扣
  podTypeOptions = [
    // { label: '1 預售', value: '1' },
    // { label: '2 滿千送百(發行)', value: '2' },
    // { label: '3 滿千送百(兌回)', value: '3' },
    // { label: '4 會員卡集點-銷售', value: '4' },
    // { label: '5 會員卡集點-點數', value: '5' },
    // { label: '6 全館集點-銷售', value: '6' },
    // { label: '7 全館集點-點數', value: '7' },
    { label: '8 期間開放折扣', value: '8' }, //新增用這個
  ];

  tlt_id_Options = [
    { label: '類別0', value: '0' },
    { label: '類別1', value: '1' },
    { label: '類別2', value: '2' },
    { label: '類別3', value: '3' },
    { label: '類別4', value: '4' },
    { label: '類別5', value: '5' },
    { label: '類別6', value: '6' },
    { label: '類別7', value: '7' },
    { label: '類別8', value: '8' },
    { label: '類別9', value: '9' },
  ];


  tlt_No_Option: apiOption[] = [];  // 專櫃編號下拉

  data: TALPORDERM[] = [];
  columns: Column[] = [
    // { field: 'id', header: '流水號', visible: false },
    // { field: 'mid', header: 'MID', visible: false },
    // { field: 'str_no', header: '店部編號', visible: true }, // 20251015 此欄位不顯示調整
    { field: 'pod_no', header: '活動申請編號', visible: true },
    {
      field: 'pod_type',
      header: '活動類型',
      visible: true,
      format: (value: string) =>
      ({
        '1': '預售',
        '2': '滿千送百發行',
        '3': '滿千送百兌回',
        '4': '會員卡集點-銷售',
        '5': '會員卡集點-點數',
        '6': '全館滿額集點-銷售',
        '7': '全館滿額集點-點數',
        '8': '期間開放折扣',
      }[value] || value),
    },
    { field: 'org_id', header: '組織部門', visible: true },
    // { field: 'act_no', header: '活動編號(群組)', visible: true },  // 券類才會用到
    { field: 'pod_desc', header: '活動名稱', visible: true },
    { field: 'pod_sdate', header: '活動起始日', visible: true, format: formatDate },
    { field: 'pod_edate', header: '活動結束日', visible: true, format: formatDate },
    // { field: 'pod_busdate', header: '活動正檔日', visible: true, format: formatDate },  // 券類才會用到
    { field: 'pod_back_sdate', header: '活動兌回起始日期', visible: true, format: formatDate },
    { field: 'pod_back_edate', header: '活動兌回終止日期', visible: true, format: formatDate },
    {
      field: 'pod_status',
      header: '活動狀態',
      visible: true,
      format: (value: string) =>
      ({
        '0': '未核准',
        '1': '已核准',
        '9': '刪除',
      }[value] || value),
    },
    { field: 'approved_userno', header: '核准人員代碼', visible: false },
    { field: 'approved_usr_name', header: '核准人員姓名', visible: false },
    { field: 'approved_date', header: '核准日期', visible: false, format: formatDate },

    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDate },
    { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
  ];

  selectedItems: TALPORDERM[] = [];// 多選項目

  btnLoading = false; //審核按鈕的讀取

  // ----------------------------------------------------------------
  constructor(
    private tls29010Service: Tls29010Service,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS29010', 'TLS/TLS29010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOption();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('query condition', frm.value);
      this.tls29010Service.queryTLS29010(frm.value).subscribe({
        next: (response) => {
          // console.log('回傳階層:', response.Data);
          if (response.Status === '0000') {
            this.data = response.Data || [];
            console.log('Result', this.data);
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
  onDelete(data: TALPORDERM | TALPORDERM[]): void {
    // console.log('Delete data:', JSON.stringify(data, null, 2));

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


    const deleteBody = {
      idList: idList, // 符合 API 的 idList 格式
    };

    console.log('刪除資料', deleteBody);
    this.tls29010Service.deleteTLS29010M(deleteBody).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.messageService.successBubble('選中項目刪除成功');
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
  }

  isRowSelectable(rowData: TALPORDERM): boolean {
    return true;
    // return false; //不予許刪除
  }

  // 20251016 核准按鈕狀態切換
  statusChange(rowData: TALPORDERM, status: string) {
    this.btnLoading = true;

    const apprPod_no = rowData.pod_no;
    if (apprPod_no) {
      const body = {
        pod_no: rowData.pod_no,
      }
      console.log('核准資料', body)
      this.tls29010Service.apprTLS29010(body).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe(response => {
        this.messageService.successBubble(response.Message);
        this.onSubmit(this.queryForm);
      });
    } else {
      this.messageService.errorBox('核准失敗，請重新操作')
    }

    this.btnLoading = false;
  }

  loadOption() {
    // 專櫃編號
    this.dropDownListService
      .queryTLTTALENT_DropDownList().pipe(untilDestroyed(this))
      .subscribe((response) => {
        this.tlt_No_Option = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        console.log('專櫃編號 下拉:', response.Data);
      });
  }
}
