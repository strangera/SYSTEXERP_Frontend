import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Permissions
// Shared
// import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { Sysb300Service } from '../../../service/sysb/sysb300.service';
import { option, Sys300m } from '../sysb300m/sysb300m';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

@Component({
  selector: 'app-sysb300',
  templateUrl: './sysb300.component.html',
  styleUrl: './sysb300.component.scss',
})
// 組織階層設定作業
export class SYSB300Component
  extends BasicQueryPageComponent<Sys300m>
  implements OnInit
{
  // 查詢
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    // SYS3000 組織階層設定檔
    id: [],
    level_id: ['', [Validators.maxLength(2)]], // 組織階層代碼
    level_name: ['', [Validators.maxLength(30)]], // 組織階層名稱
    p_level_id: [, [Validators.maxLength(2)]], // 上層組織階層代碼

    // 以下可以不用顯示於查詢頁
    CRT_Date: [], // 建立日期
    CRT_USR_No: [, [Validators.maxLength(10)]], // 建立人員
    CRT_USR_Name: ['', [Validators.maxLength(20)]], // 建立人員姓名
    UPD_Date: [], // 變更日期
    UPD_USR_No: [, [Validators.maxLength(10)]], // 變更人員
    UPD_USR_Name: ['', [Validators.maxLength(20)]], // 變更人員姓名
  });
  // 表格
  // ----------------------------------------------------------------
  data: Sys300m[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'level_id', header: '階層代碼', visible: true },
    { field: 'level_name', header: '階層名稱', visible: true },
    { field: 'p_level_id', header: '上層組織', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  upgroup_Options: option[] = [];

  constructor(private sysb300Service: Sysb300Service) {
    super();
  }

  ngOnInit(): void {
    // this.ProgNo = '410003';
    // this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 新增：在 ngOnInit 中調用 initializePage 設置 ProgNo 和 cruPage
    this.initializePage('410003', '/SYSB000/SYSB300CRU');

    // 新增：調試權限數據
    console.log('funInfo:', this.funInfo);
    console.log('queryPermission:', this.queryPermission);
    //
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid) {
      const query = {
        level_id: this.queryForm.value.level_id,
        level_name: this.queryForm.value.level_name,
        p_level_id: this.queryForm.value.p_level_id,
      };

      console.log('查詢條件', query);

      this.sysb300Service.querySYS3000(query).subscribe((response) => {
        this.data = response.Data;
        console.log('查詢結果', this.data);
        // this.queryStateService.setQueryState(QUERY_STORAGE_KEY, form.value);
        this.loading = false;
      });
    }
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }

  loadOptions() {
    {
      const query = {
        level_id: '',
        level_name: '',
        p_level_id: '',
      };

      this.sysb300Service.querySYS3000(query).subscribe((response) => {
        this.upgroup_Options = response.Data.map((item: any) => ({
          value: item.level_id,
          label: item.level_name,
        }));
      });
    }
  }
}
