import { Component, OnInit } from '@angular/core';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { Validators } from '@angular/forms';

interface RecruitmentSummary {
  recruitmentCode: string;
  counterCode: string;
  counterName: string;
  startDate: string;
  endDate: string;
  baseAmount: number;
  salesToDate: number;
  percentage: number;
}
const day = new Date();

@Component({
  selector: 'app-tls13050',
  templateUrl: './tls13050.component.html',
})

export class TLS13050Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    startMonth: [null, Validators.required],
    endMonth: [null, Validators.required],
    ...createPaginationConfig([{ field: 'recruitmentCode', order: 1 }])
  });

  data: RecruitmentSummary[] = [];
  selectedItems: RecruitmentSummary[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'recruitmentCode', header: '專櫃招募編號', visible: true },
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'counterName', header: '櫃位名稱', visible: true },
    { field: 'startDate', header: '起始日期', visible: true },
    { field: 'endDate', header: '結束日期', visible: true },
    { field: 'baseAmount', header: '包底金額', visible: true },
    { field: 'salesToDate', header: '至當前月份止銷售額', visible: true },
    { field: 'percentage', header: '比率 (%)', visible: true },
  ];
  constructor(
    private LocationOptionsService: LocationOptionsService,

  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS13050', undefined, this.queryForm, this.onSubmit.bind(this));
  }
  onSubmit(form: any): void {
    this.handleSubmit(form, () => {
      // 模擬查詢結果
      this.data = [
        {
          recruitmentCode: 'RC001',
          counterCode: 'C001',
          counterName: '專櫃A',
          startDate: '2021/01/01',
          endDate: '2025/12/31',
          baseAmount: 100000,
          salesToDate: 85000,
          percentage: 85
        },
        {
          recruitmentCode: 'RC002',
          counterCode: 'C002',
          counterName: '專櫃B',
          startDate: '2020/03/01',
          endDate: '2025/11/30',
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
