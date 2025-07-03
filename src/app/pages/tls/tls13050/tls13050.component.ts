import { Component, OnInit } from '@angular/core';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { Tls13050Service } from '../../../service/api/tls/tls13050.service';
import { QueryTLS13050Request } from '../../../shared/models/tls/queryTLS13050-request.model';

@Component({
  selector: 'app-tls13050',
  templateUrl: './tls13050.component.html',
})
export class TLS13050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    tlt_floorList: [[]],
    tlt_bdate_start: [''],
    tlt_bdate_end: [''],
    tlt_edate_start: [''],
    tlt_edate_end: [''],
    cag_bdate_start: [''],
    cag_bdate_end: [''],
    cag_edate_start: [''],
    cag_edate_end: [''],
    check_day_start: [0],
    check_day_end: [0],
    ...createPaginationConfig([{ field: 'recruitmentCode', order: 1 }])
  });


  floorOptions: any[] = [];
  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;
  BUILDING_NO_Options: any[] = [];

  columns: any[] = [
    { field: 'recruitmentCode', header: '專櫃招募編號', visible: true },
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'buildingName', header: '館別', visible: true },
    { field: 'floor', header: '樓層', visible: true },
    { field: 'organizationName', header: '組織名稱', visible: true },
    { field: 'locationCode', header: '位置編號', visible: true },
    { field: 'counterName', header: '專櫃名稱', visible: true },
    { field: 'startDate', header: '起始日期', visible: true },
    { field: 'endDate', header: '結束日期', visible: true },
    { field: 'salesActual', header: '(A)累積營業實績', visible: true },
    { field: 'guaranteeAmount', header: '(B)年度包底金額', visible: true },
    { field: 'difference', header: '(A-B)累積差額', visible: true },
    { field: 'completionRate', header: '年度包底營業額完成率', visible: true },
  ];

  constructor(
    private locationOptionsService: LocationOptionsService,
    private tls13050Service: Tls13050Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13050', undefined, this.queryForm, (form) => this.onSubmit(form));

    this.locationOptionsService.getBuildingOptions().subscribe({
      next: (res) => this.BUILDING_NO_Options = res,
      error: () => this.messageService.errorBubble('載入館別選單失敗')
    });
    this.locationOptionsService.getFloorOptions().subscribe({
      next: (res) => this.floorOptions = res,
      error: () => this.messageService.errorBubble('載入樓層選單失敗')
    });
  }

  onSubmit(form: any): void {
    this.handleSubmit(form, () => {
      const formValue = form.getRawValue();

      const body: QueryTLS13050Request = {
        tlt_floorList: formValue.tlt_floor || [],
        tlt_bdate_start: formValue.tlt_contract_bdate_from || '',
        tlt_bdate_end: formValue.tlt_contract_bdate_to || '',
        tlt_edate_start: formValue.tlt_contract_edate_from || '',
        tlt_edate_end: formValue.tlt_contract_edate_to || '',
        cag_bdate_start: '',
        cag_bdate_end: '',
        cag_edate_start: '',
        cag_edate_end: '',
        check_day_start: formValue.check_day || '',
        check_day_end: formValue.check_day || ''
      };

      console.log('送出的查詢 body', body);

      this.tls13050Service.queryTLS13050(body).subscribe({
        next: (res) => {
          console.log('查詢成功', res);
          this.data = res.Data || [];
          this.totalRecords = res.TotalCount || this.data.length;
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err) => {
          console.error('查詢失敗', err);
          this.loading = false;
          this.messageService.errorBubble('查詢失敗，請聯絡系統管理員');
        },
      });
    });
  }

}
