import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Tls11010Service } from '../../../service/API/tls/tls11010.service';

@Component({
  selector: 'app-tls11010',
  templateUrl: './tls11010.component.html',
  styleUrls: ['./tls11010.component.scss'],
})
export class TLS11010Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    LOCATION_No: ['', [Validators.maxLength(10)]],
    LOCATION_Name: ['', [Validators.maxLength(30)]],
    BUILDING_NO: [[] as string[]],
    FLOOR_NO: [[] as string[]],
    AREA_NO: [[] as string[]],
    GROSS_SPACE: [''],
    NET_SPACE: [''],
    LOCATION_Status: [[] as number[]],
    ORG_No: [[] as string[]],
    Location_Purpose: [[] as string[]],
    X_coordinate: [''],
    Y_coordinate: [''],
    Location_Remark: [''],
  });

  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'building_no', header: '館別', visible: true },
    { field: 'FLOOR_NO', header: '樓層', visible: true },
    { field: 'AREA_NO', header: '區域', visible: true },
    { field: 'LOCATION_No', header: '位置代碼', visible: true },
    { field: 'GROSS_SPACE', header: '營業坪數', visible: true },
    { field: 'NET_SPACE', header: '簽約坪數', visible: true },
    { field: 'Location_Purpose', header: '用途', visible: true },
    { field: 'LOCATION_Status', header: '狀態', visible: true },
    { field: 'X_coordinate', header: '平面圖X座標', visible: true },
    { field: 'Y_coordinate', header: '平面圖Y座標', visible: true },
    { field: 'Location_Remark', header: '備註', visible: true },
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

  constructor(private tls11010Service: Tls11010Service) {
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
      const payload = this.tls11010Service.buildQueryPayload(frm.value);

      this.loading = true;
      this.messageService.blockUi();

      this.tls11010Service.queryData(payload).subscribe({
        next: (res) => {
          this.data = res?.Data || [];
          this.totalRecords = res?.totalCount || this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        },
        error: () => {},
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  onClearForm() {
    this.queryForm.reset();
    this.data = [];
    this.totalRecords = 0;
  }

  onLazyLoad(event: any) {
    const { first, rows, sortField, multiSortMeta } = event;
    const pageIndex = Math.floor((first ?? 0) / (rows ?? 10)) + 1;
    const payload = this.tls11010Service.buildQueryPayload(this.queryForm.value, pageIndex, rows, sortField, multiSortMeta);

    this.loading = true;
    this.messageService.blockUi();

    this.tls11010Service.queryData(payload).subscribe({
      next: (res) => {
        this.data = Array.isArray(res?.Data) ? res.Data : [];
        this.totalRecords = res.totalCount ?? this.data.length;
        this.messageService.successBubble('查詢成功');
      },
      error: () => this.messageService.errorBubble('查詢失敗'),
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
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
}