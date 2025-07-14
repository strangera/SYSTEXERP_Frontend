import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';

// 資料模型：活動項目
interface ActivityItem {
  id: number;
  activityType: string;
  department: string;
  activityGroup: string;
  activityName: string;
  activityStartDate: string;
  activityEndDate: string;
  activityOfficialDate: string;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  CanDel: boolean;
}

@Component({
  selector: 'app-tls26080',
  templateUrl: './tls26080.component.html',
  styleUrl: './tls26080.component.scss',
})
export class TLS26080Component extends BasicQueryPageComponent<ActivityItem> implements OnInit {
  // 查詢表單
  queryForm = this.formBuilder.group({
    activityType: [''],
    department: [''],
    activityGroup: [''],
    activityName: [''],
    activityStartDate: [null],
    activityEndDate: [null],
    activityOfficialDate: [null],
  });

  totalRecords = 0;
  data: ActivityItem[] = [];
  columns: Column[] = [
    {
      field: 'activityType',
      header: '活動類型',
      visible: true,
      format: (value: string) => this.activityTypeOptions.find(option => option.value === value)?.label || value
    },
    {
      field: 'department',
      header: '部門',
      visible: true,
      format: (value: string) => this.departmentOptions.find(option => option.value === value)?.label || value
    },
    {
      field: 'activityGroup',
      header: '活動群組',
      visible: true,
      format: (value: string) => this.activityGroupOptions.find(option => option.value === value)?.label || value
    },
    {
      field: 'activityName',
      header: '活動名稱',
      visible: true,
      format: (value: string) => this.activityNameOptions.find(option => option.value === value)?.label || value
    },
    { field: 'activityStartDate', header: '活動起始日', visible: true },
    { field: 'activityEndDate', header: '活動結束日', visible: true },
    { field: 'activityOfficialDate', header: '活動正檔日', visible: true },
  ];
  selectedItems: ActivityItem[] = [];

  // 下拉選單選項
  activityTypeOptions: any[] = [
    { label: '滿千送百', value: 'TYPE001' },
    { label: '滿額積點', value: 'TYPE002' }
  ];

  departmentOptions: any[] = [
    { label: '營運部', value: 'DEPT001' },
    { label: '行銷部', value: 'DEPT002' }
  ];

  activityGroupOptions: any[] = [
    { label: '母親節檔DM', value: 'GROUP001' }
  ];

  activityNameOptions: any[] = [
    { label: '母親節滿5000送100', value: 'ACTIVITY001' }
  ];

  // 假資料
  mockData: ActivityItem[] = [
    {
      id: 1,
      activityType: 'TYPE001', // 滿千送百
      department: 'DEPT001',   // 營運部
      activityGroup: 'GROUP001', // 母親節檔DM
      activityName: 'ACTIVITY001', // 母親節滿5000送100
      activityStartDate: '2025-03-01',
      activityEndDate: '2025-03-31',
      activityOfficialDate: '2025-03-15',
      CRT_Date: '2025-01-15',
      CRT_USR_No: 'U001',
      CRT_USR_Name: '張三',
      CanDel: true
    },
    {
      id: 2,
      activityType: 'TYPE002', // 滿額積點
      department: 'DEPT002',   // 行銷部
      activityGroup: 'GROUP001', // 母親節檔DM
      activityName: 'ACTIVITY001', // 母親節滿5000送100
      activityStartDate: '2025-06-01',
      activityEndDate: '2025-08-31',
      activityOfficialDate: '2025-07-01',
      CRT_Date: '2025-04-01',
      CRT_USR_No: 'U002',
      CRT_USR_Name: '李四',
      CanDel: true
    },
    {
      id: 3,
      activityType: 'TYPE001', // 滿千送百
      department: 'DEPT001',   // 營運部
      activityGroup: 'GROUP001', // 母親節檔DM
      activityName: 'ACTIVITY001', // 母親節滿5000送100
      activityStartDate: '2025-09-01',
      activityEndDate: '2025-09-30',
      activityOfficialDate: '2025-09-15',
      CRT_Date: '2025-07-01',
      CRT_USR_No: 'U003',
      CRT_USR_Name: '王五',
      CanDel: false
    },
    {
      id: 4,
      activityType: 'TYPE002', // 滿額積點
      department: 'DEPT002',   // 行銷部
      activityGroup: 'GROUP001', // 母親節檔DM
      activityName: 'ACTIVITY001', // 母親節滿5000送100
      activityStartDate: '2025-12-01',
      activityEndDate: '2025-12-31',
      activityOfficialDate: '2025-12-25',
      CRT_Date: '2025-10-01',
      CRT_USR_No: 'U004',
      CRT_USR_Name: '趙六',
      CanDel: true
    },
    {
      id: 5,
      activityType: 'TYPE001', // 滿千送百
      department: 'DEPT001',   // 營運部
      activityGroup: 'GROUP001', // 母親節檔DM
      activityName: 'ACTIVITY001', // 母親節滿5000送100
      activityStartDate: '2025-05-01',
      activityEndDate: '2025-05-31',
      activityOfficialDate: '2025-05-10',
      CRT_Date: '2025-03-15',
      CRT_USR_No: 'U005',
      CRT_USR_Name: '陳七',
      CanDel: true
    }
  ];

  constructor(
    private validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26080', '/TLS/TLS26080cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadMockData();
  }

  // 載入假資料
  loadMockData(): void {
    this.data = [...this.mockData];
    this.totalRecords = this.mockData.length;
  }

  // 提交查詢
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.messageService.blockUi();

      // 模擬 API 查詢
      setTimeout(() => {
        const formValues = frm.value;
        let filteredData = [...this.mockData];

        // 篩選邏輯
        if (formValues.activityType) {
          filteredData = filteredData.filter(item =>
            item.activityType === formValues.activityType
          );
        }
        if (formValues.department) {
          filteredData = filteredData.filter(item =>
            item.department === formValues.department
          );
        }
        if (formValues.activityGroup) {
          filteredData = filteredData.filter(item =>
            item.activityGroup === formValues.activityGroup
          );
        }
        if (formValues.activityName) {
          filteredData = filteredData.filter(item =>
            item.activityName === formValues.activityName
          );
        }
        if (formValues.activityStartDate) {
          filteredData = filteredData.filter(item =>
            new Date(item.activityStartDate) >= new Date(formValues.activityStartDate)
          );
        }
        if (formValues.activityEndDate) {
          filteredData = filteredData.filter(item =>
            new Date(item.activityEndDate) <= new Date(formValues.activityEndDate)
          );
        }
        if (formValues.activityOfficialDate) {
          filteredData = filteredData.filter(item =>
            item.activityOfficialDate === formValues.activityOfficialDate
          );
        }

        this.data = filteredData;
        this.totalRecords = filteredData.length;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);

        this.loading = false;
        this.messageService.unblockUi();
      }, 1000);
    });
  }

  // 刪除項目
  onDelete(data: ActivityItem | ActivityItem[]): void {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) return;

    const idList = items
      .filter(item => item && item.id != null)
      .map(item => item.id);

    if (idList.length === 0) {
      this.messageService.warnBubble('未找到有效的刪除項目');
      return;
    }

    // 模擬 API 刪除
    setTimeout(() => {
      this.mockData = this.mockData.filter(item => !idList.includes(item.id));
      this.messageService.successBubble('選中項目刪除成功');
      this.onSubmit(this.queryForm); // 刷新資料
    }, 500);

    this.selectedItems = [];
  }

  isRowSelectable(rowData: ActivityItem): boolean {
    return rowData.CanDel;
  }
}
