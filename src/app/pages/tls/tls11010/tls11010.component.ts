import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Tls11010Service } from '../../../service/API/tls/tls11010.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { InputNumberRangeComponent } from '../../../../../src/app/shared/componentkit/input-number-range/input-number-range.component';



@Component({
  selector: 'app-tls11010',
  templateUrl: './tls11010.component.html',
  styleUrls: ['./tls11010.component.scss'],
})
export class TLS11010Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    LOCATION_No: [[] as string[], [Validators.maxLength(10)]],
    org_id: [[] as string[], [Validators.maxLength(20)]],
    org_name: [[] as string[], [Validators.maxLength(20)]],
    building_no: ['', [Validators.maxLength(1)]],
    FLOOR_NO: [[] as string[], [Validators.maxLength(2)]],
    AREA_NO: [[] as string[], [Validators.maxLength(2)]],
    GROSS_SPACE_start: [null, [Validators.min(0), Validators.max(9999.999)]],
    GROSS_SPACE_end: [null, [Validators.min(0), Validators.max(9999.999)]],
    NET_SPACE_start: [null, [Validators.min(0), Validators.max(9999.999)]],
    NET_SPACE_end: [null, [Validators.min(0), Validators.max(9999.999)]],
    LOCATION_Status: ['', [Validators.maxLength(1)]],
    Purpose_no: [[] as string[], [Validators.maxLength(2)]],
    ...createPaginationConfig([{ field: 'LOCATION_No', order: 1 }]),
  });

  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'LOCATION_No', header: '位置代碼', visible: true },
    { field: 'LOCATION_Name', header: '店位說明', visible: true },
    { field: 'org_id', header: '組織代碼', visible: true },
    { field: 'org_name', header: '組織名稱', visible: true },
    { field: 'building_no', header: '館別', visible: true },
    { field: 'FLOOR_NO', header: '樓層', visible: true },
    { field: 'AREA_NO', header: '區域', visible: true },
    { field: 'GROSS_SPACE', header: '簽約坪數', visible: true },
    { field: 'NET_SPACE', header: '營業坪數', visible: true },
    { field: 'LOCATION_Status', header: '使用狀態', visible: true },
    { field: 'Purpose_no', header: '用途代碼', visible: true },
    { field: 'Draw_X', header: 'X 軸', visible: true },
    { field: 'Draw_Y', header: 'Y 軸', visible: true }
  ];

  floorOptions: any[] = [];
  RegionCodeOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  usageOptions: any[] = [];
  LOCATION_Status_Options: any[] = [
    { value: 0, label: '空位' },
    { value: 1, label: '使用中' },
    { value: 2, label: '保留(不使用)' },
    { value: 3, label: '停用' },
  ];
  BUILDING_NO_Options: any[] = [];

  constructor(private tls11010Service: Tls11010Service,

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS11010', 'TLS/TLS11010CRU', this.queryForm, (form) => this.onSubmit(form));

    this.tls11010Service.getFloorOptions().subscribe((res) => (this.floorOptions = res));
    this.tls11010Service.getRegionOptions().subscribe((res) => (this.RegionCodeOptions = res));
    this.tls11010Service.getOrgOptions().subscribe((res) => (this.OrganizationCodeOptions = res));
    this.tls11010Service.getUsageOptions().subscribe((res) => (this.usageOptions = res));
    this.tls11010Service.getBuildingOptions().subscribe((res) => (this.BUILDING_NO_Options = res));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.messageService.blockUi();

      const formValue = { ...frm.value };

      // 將空字串欄位轉為 null，以符合後端 char? 要求
      if (formValue.building_no === '') {
        formValue.building_no = null;
      }
      if (formValue.LOCATION_Status === '') {
        formValue.LOCATION_Status = null;
      }

      console.log('🔍 查詢條件 request payload:', formValue);

      // ✅ 使用修正後的 formValue
      this.tls11010Service.queryData(formValue).subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.data = res?.Data || [];
            this.totalRecords = res?.TotalCount || this.data.length;
            console.log('✅ totalRecords =', this.totalRecords);
            this.queryStateService.setQueryState(this.ProgNo, formValue);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: () => { },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  onDelete(selectedItems: any[]) {
    if (!selectedItems.length) return;
    const confirm = window.confirm('是否確定刪除選取項目？');
    if (!confirm) return;

    const idList = selectedItems.map((item) => item.id);
    this.tls11010Service.deleteData(idList).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.onSubmit(this.queryForm);
      },
      error: () => this.messageService.errorBubble('刪除失敗'),
    });
  }
  getLabelFromOptions(value: any, options: any[]): string {
    console.log('🧩 mapping value:', value, 'options:', options); // 👉 加這行

    if (Array.isArray(value)) {
      return value.map(v => {
        const option = options.find(opt => opt.value === v);
        return option ? option.label : v;
      }).join(', ');
    }

    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  }


}
