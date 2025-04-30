import { Sysb400Service } from './../../../service/sysb/sysb400.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Shared
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

interface Organization {
  org_id: number; // 組織代碼
  org_name: string; // 組織名稱
  level_id: string; // 階層代碼
  level_name: string; // 階層名稱
  p_level_id: string; // 上層組織代碼
  stop_flag: boolean; // 是否停用
  CRT_Date: Date;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: Date;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

@Component({
  selector: 'app-sysb400',
  templateUrl: './sysb400.component.html',
  styleUrls: ['./sysb400.component.scss'],
})
export class SYSB400Component
  extends BasicQueryPageComponent<Organization>
  implements OnInit
{
  data: Organization[] = [];
  filteredData: Organization[] = [...this.data];
  columns: any[] = [
    { field: 'org_id', header: '階層代碼', visible: true },
    { field: 'org_name', header: '階層名稱', visible: true },
    { field: 'level_id', header: '組織代碼', visible: true },
    { field: 'level_name', header: '組織名稱', visible: true },
    { field: 'p_level_id', header: '上層組織', visible: true },
  ];

  queryForm = this.formBuilder.group({
    // SYS3100 + SYS3000
    org_id: ['', Validators.maxLength(20)], // 組織代碼
    org_name: ['', Validators.maxLength(40)], // 組織名稱
    level_id: ['', Validators.maxLength(2)], // 階層代碼
    // p_org_id: ['', Validators.maxLength(20)], // 上層組織代碼
    // p_level_id: ['', Validators.maxLength(2)], // 上層組織階層代碼(空白代表第一層)
    // stop_flag: [['N'] as string[], Validators.maxLength(2)], // 是否停用
  });

  rowsPerPageOptions = [10, 25, 50, 100];
  rowsPerPageDropdownOptions = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
  ];

  level_nameOptions: any[] = [
    { value: '全公司', label: '全公司' },
    { value: '室/部', label: '室/部' },
    { value: 'Team', label: 'Team' },
    { value: '組', label: '組' },
    { value: '樓層', label: '樓層' },
  ];

  whetherOptions: any[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  constructor(private sysb400Service: Sysb400Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('410004', '/SYSB000/SYSB400CRU');
  }

  onSubmit(frm: FormGroup): void {
    if (this.queryForm.valid) {
      const query = {
        level_id: frm.value.level_id,
        org_id: frm.value.org_id,
        org_name: frm.value.org_name,
      };
      if (frm.valid) {
        console.log('查詢條件', this.queryForm.value);
        this.sysb400Service.querySYSB400(query).subscribe((response) => {
          this.data = response.Data;
          console.log('查詢結果', response.Data);
          // this.queryStateService.setQueryState(QUERY_STORAGE_KEY, form.value);
          this.loading = false;
        });
      }
    } else {
      console.warn('Invalid form');
    }
  }

  onClearForm(): void {
    this.queryForm.reset();
  }

  onSitemap(): void {
    this.router.navigate(['/SYSB000/SYSB400OS']);
  }
}
