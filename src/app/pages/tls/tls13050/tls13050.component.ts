import { Component, OnInit } from '@angular/core';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { Validators } from '@angular/forms';

interface Option {
  label: string;
  value: string;
}

interface RecruitmentSummary {
  recruitmentCode: string;
  counterCode: string;
  buildingName: string;
  floor: string;
  organizationName: string;
  locationCode: string;
  counterName: string;
  startDate: string;
  endDate: string;
  salesActual: number;
  guaranteeAmount: number;
  difference: number;
  commissionRate: number;
  underGuaranteeCommissionRate: number;
  completionRate: number;
  baseAmount: number;
  salesToDate: number;
  percentage: number;
}

@Component({
  selector: 'app-tls13050',
  templateUrl: './tls13050.component.html',
})

export class TLS13050Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    tlt_floor: [[]],
    startMonth: [null, Validators.required],
    endMonth: [null, Validators.required],
    tlt_building: [''],
    tlt_contract_bdate_from: [],// 合約日期範圍
    tlt_contract_bdate_to: [],
    tlt_contract_edate_from: [],
    tlt_contract_edate_to: [],
    check_day: [, [Validators.maxLength(10)]],
    ...createPaginationConfig([{ field: 'recruitmentCode', order: 1 }])
  });

  floorOptions: any[] = [];
  data: RecruitmentSummary[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;
  BUILDING_NO_Options: any[] = [];

  columns: any[] = [
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'recruitmentCode', header: '專櫃招募編號', visible: true },
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
    { field: 'commissionRate', header: '抽成率(%)', visible: true },
    { field: 'underGuaranteeCommissionRate', header: '包底不足抽成率(含稅)(%)', visible: true },
    { field: 'completionRate', header: '年度包底營業額完成率', visible: true },
    { field: 'baseAmount', header: '包底金額', visible: true },
    { field: 'salesToDate', header: '至當前月份止銷售金額', visible: true },
    { field: 'percentage', header: '比率 (%)', visible: true },
  ];

  constructor(
    private locationOptionsService: LocationOptionsService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13050', undefined, this.queryForm, (form) => this.onSubmit(form));

    this.locationOptionsService.getBuildingOptions().subscribe({
      next: (res: Option[]) => this.BUILDING_NO_Options = res,
      error: () => this.messageService.errorBubble('載入館別選單失敗')
    });
    this.locationOptionsService.getFloorOptions().subscribe({
      next: (res) => this.floorOptions = res,
      error: () => this.messageService.errorBubble('載入樓層選單失敗')
    });

  }

  onSubmit(form: any): void {
    this.handleSubmit(form, () => {
      // 模擬查詢結果
      this.data = [
        {
          recruitmentCode: 'RC001',
          counterCode: 'C001',
          buildingName: '館別一',
          floor: '1F',
          organizationName: '組織甲',
          locationCode: 'L001',
          counterName: '專櫃A',
          startDate: '2021/01/01',
          endDate: '2025/12/31',
          salesActual: 85000,
          guaranteeAmount: 100000,
          difference: -15000,
          commissionRate: 10,
          underGuaranteeCommissionRate: 5,
          completionRate: 85,
          baseAmount: 100000,
          salesToDate: 85000,
          percentage: 85
        },
        {
          recruitmentCode: 'RC002',
          counterCode: 'C002',
          buildingName: '館別二',
          floor: 'B1',
          organizationName: '組織乙',
          locationCode: 'L002',
          counterName: '專櫃B',
          startDate: '2020/03/01',
          endDate: '2025/11/30',
          salesActual: 60000,
          guaranteeAmount: 120000,
          difference: -60000,
          commissionRate: 12,
          underGuaranteeCommissionRate: 7,
          completionRate: 50,
          baseAmount: 120000,
          salesToDate: 60000,
          percentage: 50
        }
      ];

      this.totalRecords = this.data.length;
      this.loading = false;
      this.messageService.unblockUi();
    });
  }
}
