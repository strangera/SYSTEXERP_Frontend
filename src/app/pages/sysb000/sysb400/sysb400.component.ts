import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/service/notification.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { NavigationExtras, Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';

interface Columns {
  field: string;
  header: string;
  visible: boolean;
}

interface Organization {
  org_id: number; // 組織代碼
  org_name: string; // 組織名稱
  level_id: string; // 階層代碼
  level_name: string; // 階層名稱
  p_level_id: string; // 上層組織代碼
  stop_flag: boolean; // 是否停用
}

@Component({
  selector: 'app-sysb400',
  templateUrl: './sysb400.component.html',
  styleUrls: ['./sysb400.component.scss'],
})
export class SYSB400Component extends BasicQpageComponent implements OnInit {
  data: Organization[] = [
    { stop_flag: false, org_id: 0, org_name: '全公司', level_id: '100000', level_name: '全公司', p_level_id: '全公司' },
    { stop_flag: true, org_id: 1, org_name: '室/部', level_id: '101000', level_name: '經營企劃部(停用)', p_level_id: '全公司' },
    // 更多資料...
  ];
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
    p_org_id: ['', Validators.maxLength(20)], // 上層組織代碼
    p_level_id: ['', Validators.maxLength(2)], // 上層組織階層代碼(空白代表第一層)
    stop_flag: [['N'] as string[], Validators.maxLength(2)], // 是否停用
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

  pages: any[] = [];
  rows: number = 10;
  first: number = 0;
  selectedPage: number = 1;
  IsPaginator: boolean = true;
  IsScrollable: boolean = false;
  IsScrollHeight: string = 'flex';
  tableSize: string = 'p-datatable-sm p-datatable-gridlines p-datatable-striped';
  selectedRows: Organization[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private messageService: NotificationService,
    private router: Router,
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '410004';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.calculateTotalPages();
  }

  // 計算總頁數並生成頁面選項
  calculateTotalPages(): void {
    const totalRecords = this.data.length;
    const totalPages = Math.ceil(totalRecords / this.rows);

    this.pages = Array(totalPages).fill(0).map((_, i) => ({
      label: `第 ${i + 1} 頁`,
      value: i + 1,
    }));
  }

  // 跳轉頁面
  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.pages.length) return;
    this.first = (pageNumber - 1) * this.rows;
  }

  togglePaginator(): void {
    this.IsPaginator = !this.IsPaginator;
    this.IsScrollable = !this.IsScrollable;
    this.IsScrollHeight = this.IsPaginator ? 'flex' : '700px';
    this.tableSize = this.IsPaginator
      ? 'p-datatable-sm p-datatable-gridlines p-datatable-striped'
      : 'p-datatable-sm p-datatable-striped';
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.calculateTotalPages();
    this.selectedPage = Math.ceil(this.first / this.rows) + 1;
  }

  applyFilters(): void {
    const filters = this.queryForm.value;
    this.filteredData = [...this.data];

    if (filters.org_name) {
      this.filteredData = this.filteredData.filter(
        item => item.org_name === filters.org_name
      );
    }

    if (filters.org_id) {
      const org_id = parseInt(filters.org_id, 10);
      this.filteredData = this.filteredData.filter(item => item.org_id >= org_id);
    }

    if (filters.level_id) {
      this.filteredData = this.filteredData.filter(item =>
        item.level_id.includes(filters.level_id ?? '')
      );
    }

    if (filters.p_org_id) {
      this.filteredData = this.filteredData.filter(item =>
        item.level_name.includes(filters.p_org_id ?? '')
      );
    }

    if (filters.p_level_id) {
      this.filteredData = this.filteredData.filter(item =>
        item.p_level_id.includes(filters.p_level_id ?? '')
      );
    }
  }

  onSitemap(): void {
    this.router.navigate(['/SYSB000/SYSB400OS']);
  }

  onCreate(): void {
    const extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Create,
        queryform: this.queryForm.value,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/SYSB000/SYSB400CRU'], extras);
  }

  onSubmit(): void {
    if (this.queryForm.valid) {
      console.log('Form submitted:', this.queryForm.value);
    } else {
      console.warn('Invalid form');
    }
  }

  onClearForm(): void {
    this.queryForm.reset();
  }

  isDisabled(): boolean {
    return !this.selectedRows.some(row => row.stop_flag);
  }

  onEdit(row: Organization): void {
    console.log('Edit:', row);
  }

  onDetail(row: Organization): void {
    console.log('Detail:', row);
  }

  onDelete(): void {
    const deletableRows = this.selectedRows.filter(row => row.stop_flag);
    if (deletableRows.length > 0) {
      console.log('Deleting:', deletableRows);
      this.filteredData = this.filteredData.filter(
        row => !deletableRows.includes(row)
      );
    } else {
      alert('無可刪除的項目');
    }
  }
}
