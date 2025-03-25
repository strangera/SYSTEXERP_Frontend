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
  isdelete: boolean;
  group_no: number;
  group_Name: string;
  section_no: string;
  section_name: string;
  upsection_no: string;
}

@Component({
  selector: 'app-sysb400',
  templateUrl: './sysb400.component.html',
  styleUrls: ['./sysb400.component.scss'],
})
export class SYSB400Component extends BasicQpageComponent implements OnInit {
  data: Organization[] = [
    { isdelete: false, group_no: 0, group_Name: '全公司', section_no: '100000', section_name: '全公司', upsection_no: '全公司' },
    { isdelete: true, group_no: 1, group_Name: '室/部', section_no: '101000', section_name: '經營企劃部(停用)', upsection_no: '全公司' },
    // 更多資料...
  ];
  filteredData: Organization[] = [...this.data];
  columns: any[] = [
    { field: 'group_no', header: '階層代碼', visible: true },
    { field: 'group_Name', header: '階層名稱', visible: true },
    { field: 'upsection_no', header: '上層組織', visible: true },
    { field: 'section_no', header: '組織代碼', visible: true },
    { field: 'section_name', header: '組織名稱', visible: true },
  ];

  queryForm = this.formBuilder.group({
    group_no: ['', Validators.maxLength(10)],
    group_Name: ['', Validators.maxLength(10)],
    section_no: ['', Validators.maxLength(10)],
    section_name: ['', Validators.maxLength(10)],
    upsection_no: ['', Validators.maxLength(10)],
  });

  rowsPerPageOptions = [10, 25, 50, 100];
  rowsPerPageDropdownOptions = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
  ];

  groupNameOptions: any[] = [
    { value: '全公司', label: '全公司' },
    { value: '室/部', label: '室/部' },
    { value: 'Team', label: 'Team' },
    { value: '組', label: '組' },
    { value: '樓層', label: '樓層' },
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

    if (filters.group_Name) {
      this.filteredData = this.filteredData.filter(
        item => item.group_Name === filters.group_Name
      );
    }

    if (filters.group_no) {
      const groupNo = parseInt(filters.group_no, 10);
      this.filteredData = this.filteredData.filter(item => item.group_no >= groupNo);
    }

    if (filters.section_no) {
      this.filteredData = this.filteredData.filter(item =>
        item.section_no.includes(filters.section_no ?? '')
      );
    }

    if (filters.section_name) {
      this.filteredData = this.filteredData.filter(item =>
        item.section_name.includes(filters.section_name ?? '')
      );
    }

    if (filters.upsection_no) {
      this.filteredData = this.filteredData.filter(item =>
        item.upsection_no.includes(filters.upsection_no ?? '')
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
    return !this.selectedRows.some(row => row.isdelete);
  }

  onEdit(row: Organization): void {
    console.log('Edit:', row);
  }

  onDetail(row: Organization): void {
    console.log('Detail:', row);
  }

  onDelete(): void {
    const deletableRows = this.selectedRows.filter(row => row.isdelete);
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
