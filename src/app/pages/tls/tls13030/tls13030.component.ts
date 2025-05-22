import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { RegionService } from '../../../service/basic/region-code.service';
import { FloorService } from '../../../service/basic/floor.service';
import { OperationStatusService } from '../../../service/basic/operation-status.service';
import { BigCategoryCodeService } from '../../../service/basic/big-category-code.service';
import { DeductionService } from '../../../service/basic/deduction.service';
import { TLS13030Service } from '../../../service/API/tls/tls13030.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { Tls11010Service } from '../../../service/API/tls/tls11010.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

@Component({
  selector: 'app-tls13030',
  templateUrl: './tls13030.component.html',
  styleUrls: ['./tls13030.component.scss'],
})
export class TLS13030Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    tlt_no: ['', [Validators.maxLength(10)]],
    tlt_name: ['', [Validators.maxLength(50)]],
    floor_noList: [[] as string[]],
    area_noList: [[] as string[]],
    tlt_openflagList: [[] as string[]],
    tlt_bdate_start: [null],
    tlt_bdate_end: [null],
    tlt_edate_start: [null],
    tlt_edate_end: [null],
    cap_typeList: [[] as string[]],
    cap_itemList: [[] as string[]],
    tpy_bdate_start: [null],
    tpy_bdate_end: [null],
    tpy_edate_start: [null],
    tpy_edate_end: [null],
    bus_type: ['', [Validators.maxLength(50)]],
    tlt_building: ['', [Validators.maxLength(1)]],
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }])
  });

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

  regionOptions: any[] = [];
  floorOptions: any[] = [];
  operationStatusOptions: any[] = [];
  bus_typeOptions: any[] = [];
  deductionCategoryOptions: any[] = [];
  deductionCodeNameServOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];

  columns: any[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },

    {
      field: 'tlt_building',
      header: '館別',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.BUILDING_NO_Options),
    },
    { field: 'floor_desc', header: '樓層', visible: true },
    { field: 'area_desc', header: '區域', visible: true },
    { field: 'bus_type', header: '大分類', visible: true },
    {
      field: 'tlt_period',
      header: '合約起迄日',
      visible: true,
      format: (_: any, rowData: any) => {
        const formatDate = (raw: string): string => {
          if (!raw) return '';
          const date = new Date(raw);
          if (isNaN(date.getTime())) return ''; // 無效日期
          const yyyy = date.getFullYear().toString();
          const mm = (date.getMonth() + 1).toString().padStart(2, '0');
          const dd = date.getDate().toString().padStart(2, '0');
          return `${yyyy}${mm}${dd}`;
        };

        const start = formatDate(rowData.tlt_bdate);
        const end = formatDate(rowData.tlt_edate);

        if (start && end) return `${start} ~ ${end}`;
        return start || end || '';
      }
    },
    { field: 'cap_type', header: '扣款類別', visible: true },
    { field: 'CAP_Name', header: '扣款項目名稱', visible: true },
    {
      field: 'tlt_period',
      header: '扣款起迄日',
      visible: true,
      format: (_: any, rowData: any) => {
        const start = rowData.tpy_bdate ?? '';
        const end = rowData.tpy_edate ?? '';
        if (start && end) return `${start} ~ ${end}`;
        if (start) return start;
        if (end) return end;
        return '';
      }
    },


    { field: 'tpy_totalamt', header: '總金額', visible: true },
    { field: 'down_payment', header: '頭期款', visible: true },
    { field: 'period_nos', header: '期數', visible: true },
    { field: 'tpy_amount', header: '每月扣款金額', visible: true },
    { field: 'tpy_rate', header: '費用計算的比率', visible: true },
  ];

  constructor(
    private RegionService: RegionService,
    private floorService: FloorService,
    private operationStatusService: OperationStatusService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private deductionService: DeductionService,
    private tls11010Service: Tls11010Service,
    private TLS13030Service: TLS13030Service,
    private notificationService: NotificationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13030', '', this.queryForm, (f) => this.onSubmit(f));
    this.operationStatusService.getOperationStatuses().subscribe(data => this.operationStatusOptions = data);
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => this.bus_typeOptions = data);
    this.deductionService.getDeductionCategories().subscribe(data => this.deductionCategoryOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe((res) => (this.BUILDING_NO_Options = res));
    this.queryForm.controls.cap_typeList.valueChanges.subscribe((selectedCapTypes: string[] | null) => {
      if (selectedCapTypes?.length) {
        const payload = { cap_typeList: selectedCapTypes };
        this.deductionService.getAPS1003DropDownList(payload).subscribe(res => {
          this.deductionCodeNameServOptions = res?.map((x: any) => ({
            label: `${x.value} - ${x.label}`,
            value: x.value
          })) || [];
          this.queryForm.controls.cap_itemList.setValue([]);
        });
      } else {
        this.deductionCodeNameServOptions = [];
        this.queryForm.controls.cap_itemList.setValue([]);
      }
    });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const formValue = { ...form.value };

      for (const key in formValue) {
        if (formValue[key] === '') {
          formValue[key] = null;
        }
      }


      console.log('🔍 查詢發送參數:', formValue);

      this.TLS13030Service.queryTLS13030(formValue).subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.data = res.Data || [];
            this.totalRecords = res.TotalCount || this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, formValue);
            this.messageService.successBubble('查詢成功');
          } else {
            this.messageService.errorBubble('查詢失敗');
          }
        },
        error: () => {
          this.messageService.errorBubble('查詢錯誤');
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  onDelete(selectedItems: any[]): void {
    if (!selectedItems.length) return;
    const confirm = window.confirm('是否確定刪除選取項目？');
    if (!confirm) return;

    const idList = selectedItems.map((item) => item.id);

    this.TLS13030Service.deleteTLS13030(idList).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.onSubmit(this.queryForm);
      },
      error: () => {
        this.messageService.errorBubble('刪除失敗');
      },
    });
  }


  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }

}
