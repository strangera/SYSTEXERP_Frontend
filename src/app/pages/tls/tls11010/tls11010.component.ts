import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { FloorService } from './../../../service/basic/floor.service';
import { RegionCodeService } from './../../../service/basic/region-code.service';
import { OrganizationNumberService } from './../../../service/basic/organization-number.service';
import { UsageService } from './../../../service/basic/usage.service';

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
  enableLazy = false;
  hasQueried = false;
  initialized = false;

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
  LOCATION_Status_Options: any[] = [];
  BUILDING_NO_Options: any[] = [];

  constructor(
    private http: HttpClient,
    private floorService: FloorService,
    private regionCodeService: RegionCodeService,
    private organizationNumberService: OrganizationNumberService,
    private usageService: UsageService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS11010', 'TLS/TLS11010CRU');

    this.http
      .post<any>(
        `${environment.ApiUrl}/TLS0000/TLS1000/queryTLS11010_SYS3900_DropDownList`,
        {},
      )
      .subscribe((res) => {
        this.floorOptions = Array.isArray(res?.Data)
          ? res.Data.map((i: { No: string; Name: string }) => ({
              label: i.Name,
              value: i.No,
            }))
          : [];
      });

    this.http
      .post<any>(
        `${environment.ApiUrl}/TLS0000/TLS1000/queryTLS11010_SYS3A00_DropDownList`,
        {},
      )
      .subscribe((res) => {
        this.RegionCodeOptions = Array.isArray(res?.Data)
          ? res.Data.map((i: { No: string; Name: string }) => ({
              label: i.Name,
              value: i.No,
            }))
          : [];
      });

    this.http
      .post<any>(
        `${environment.ApiUrl}/TLS0000/TLS1000/queryTLS11010_SYS3100_DropDownList`,
        {},
      )
      .subscribe((res) => {
        this.OrganizationCodeOptions = Array.isArray(res?.Data)
          ? res.Data.map((i: { No: string; Name: string }) => ({
              label: i.Name,
              value: i.No,
            }))
          : [];
      });

    this.http
      .post<any>(
        `${environment.ApiUrl}/TLS0000/TLS1000/queryTLS11010_SYS3F00_DropDownList`,
        {},
      )
      .subscribe((res) => {
        this.usageOptions = Array.isArray(res?.Data)
          ? res.Data.map((i: { No: string; Name: string }) => ({
              label: i.Name,
              value: i.No,
            }))
          : [];
      });

    this.LOCATION_Status_Options = [
      { value: 0, label: '空位' },
      { value: 1, label: '使用中' },
      { value: 2, label: '保留(不使用)' },
      { value: 3, label: '停用' },
    ];

    this.http
      .post<any>(
        `${environment.ApiUrl}/TLS0000/TLS1000/queryTLS11010_SYS3800_DropDownList`,
        {},
      )
      .subscribe((res) => {
        this.BUILDING_NO_Options = Array.isArray(res?.Data)
          ? res.Data.map((i: { No: string; Name: string }) => ({
              label: i.Name,
              value: i.No,
            }))
          : [];
      });
  }

  onSubmitQuery(frm: FormGroup) {
    this.submitted = true;
    if (frm.invalid) return;

    this.enableLazy = true;

    // ✅ 延遲觸發第一次 lazy load 查詢（確保表格初次顯示即有分頁支援）
    setTimeout(() => {
      this.onLazyLoad({
        first: 0,
        rows: 10,
        sortField: '',
        sortOrder: 1,
        multiSortMeta: [{ field: 'LOCATION_No', order: 1 }],
      });
    }, 0);
  }

  onClearForm() {
    this.queryForm.reset();
    this.enableLazy = false;
    this.hasQueried = false;
    this.initialized = false;
    this.data = [];
    this.totalRecords = 0;
  }

  onLazyLoad(event: any) {
    if (!this.initialized) {
      this.initialized = true;
      return;
    }

    const { first, rows, sortField, multiSortMeta } = event;
    const pageIndex = Math.floor((first ?? 0) / (rows ?? 10)) + 1;

    const formValue = this.queryForm.value;
    const hasFilter =
      formValue.LOCATION_No ||
      formValue.ORG_No ||
      formValue.BUILDING_NO ||
      formValue.FLOOR_NO ||
      formValue.AREA_NO ||
      formValue.GROSS_SPACE ||
      formValue.NET_SPACE ||
      formValue.LOCATION_Status ||
      formValue.Location_Purpose;

    if (!hasFilter) {
      this.data = [];
      this.totalRecords = 0;
      return;
    }

    const payload = {
      request: {
        PageSize: rows ?? 10,
        PageIndex: pageIndex,
        OrderBy: sortField ?? '',
        Offset: first ?? 0,
        SortBy: multiSortMeta ?? [{ field: 'LOCATION_No', order: 1 }],
        LOCATION_No: [formValue.LOCATION_No],
        org_id: formValue.ORG_No,
        building_no: formValue.BUILDING_NO,
        FLOOR_NO: formValue.FLOOR_NO,
        AREA_NO: formValue.AREA_NO,
        GROSS_SPACE: formValue.GROSS_SPACE || null,
        NET_SPACE: formValue.NET_SPACE || null,
        LOCATION_Status: formValue.LOCATION_Status,
        Purpose_no: formValue.Location_Purpose,
      },
    };

    this.loading = true;
    this.messageService.blockUi();

    this.http
      .post<any>(`${environment.ApiUrl}/TLS0000/TLS1000/queryTLS11010`, payload)
      .subscribe({
        next: (res) => {
          this.data = Array.isArray(res?.Data) ? res.Data : [];
          this.totalRecords = res.totalCount ?? this.data.length;
          console.log('總筆數 totalRecords =', this.totalRecords);
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
    this.http
      .post(`${environment.ApiUrl}/TLS0000/TLS1000/deleteTLS11010`, { idList })
      .subscribe({
        next: () => {
          this.messageService.successBubble('刪除成功');
          this.onSubmitQuery(this.queryForm);
        },
        error: () => this.messageService.errorBubble('刪除失敗'),
      });
  }
}
