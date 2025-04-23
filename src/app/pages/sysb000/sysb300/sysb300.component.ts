import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { Sysb300Service } from '../../../service/sysb/sysb300.service';

@Component({
  selector: 'app-sysb300',
  templateUrl: './sysb300.component.html',
  styleUrl: './sysb300.component.scss'
})
// 組織階層設定作業
export class SYSB300Component extends BasicQpageComponent implements OnInit {
  // 查詢
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    // SYS3000 組織階層設定檔
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
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'level_id', header: '階層代碼', visible: true },
    { field: 'level_name', header: '階層名稱', visible: true },
    { field: 'p_level_id', header: '上層組織', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  upgroup_Options: any[] = [
    { value: "", label: '全公司' },
    { value: "10", label: '室/部' },
    { value: "20", label: 'Team' },
    { value: "30", label: '樓/組' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private sysb300Service: Sysb300Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '410003';
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      const query = {
        "PageSize": 10,
        "PageIndex": 0,
        "OrderBy": "",
        "Offset": 0,
        "SortBy": [
          {
            "field": "A.LEVEL_ID",
            "order": 1
          }
        ],
        "level_id": this.queryForm.value.level_id,
        "level_name": this.queryForm.value.level_name,
        "p_level_id": this.queryForm.value.p_level_id,
      };

      console.log('查詢條件', query);

      this.sysb300Service.querySYS3000(query).subscribe((response) => {
        this.data = response.Data;
        console.log('查詢結果',this.data);
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
    this.queryForm.reset();  // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true
      };

      //console.log("extra", extras);
      this.router.navigate(['/SYSB000/SYSB300CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true
      };

      this.router.navigate(['/SYSB000/SYSB300CRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true
    };

    this.router.navigate(['/SYSB000/SYSB300CRU'], extras);
  }
}
