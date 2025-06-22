import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { LocationOptionsService } from '../../../service/API/dropdownservice/location-options.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { Router } from '@angular/router';

interface SalesRecord {
  id: number;
  pendingApprovalRegisterCode: string;
  pendingApprovalPaymentTool: string;
  systemAmount: number;
  receiptAmount: number;
  tlt_no?: string;
  tlt_name?: string;
}

const now = new Date();

@Component({
  selector: 'app-tls2a020',
  templateUrl: './tls2a020.component.html',
})

export class TLS2A020Component extends BasicQueryPageComponent<any> {
  // 進度條、頁數設定
  progressValue = 0;
  showPageSizeDialog = false;
  customPageSize = 1000;

  // 表單
  queryForm = this.formBuilder.group({
    salesDate: [new Date(), [Validators.required]],
    tlt_floor: [[]],
    sort: [''],
    ECR_No: [[]],
    tlt_building: [''],
    ...createPaginationConfig([{ field: 'pendingApprovalRegisterCode', order: 1 }])
  });

  // 表格欄位
  columns: any[] = [
    { field: 'pendingApprovalRegisterCode', header: '未審核收銀機號', visible: true },
    { field: 'pendingApprovalPaymentTool', header: '未審核支付工具', visible: true },
    { field: 'systemAmount', header: '系統金額', visible: true },
    { field: 'receiptAmount', header: '貨收金額', visible: true }
  ];

  // 選單資料
  floorOptions: any[] = [];
  ECRNoOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];

  // 表格資料
  selectedItems: any[] = [];
  totalRecords = 0;
  data: SalesRecord[] = [];

  constructor(
    private locationOptionsService: LocationOptionsService,
    private ecrNoService: ECRNoService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2A020', '/TLS/TLS2A020CRU', this.queryForm, (form) => this.onSubmit(form));

    this.ecrNoService.getECRNo().subscribe({
      next: (res) => this.ECRNoOptions = res,
      error: () => this.messageService.errorBubble('載入收銀機代號失敗')
    });

    this.locationOptionsService.getBuildingOptions().subscribe({
      next: (res) => this.BUILDING_NO_Options = res,
      error: () => this.messageService.errorBubble('載入館別選單失敗')
    });

    this.locationOptionsService.getFloorOptions().subscribe({
      next: (res) => this.floorOptions = res,
      error: () => this.messageService.errorBubble('載入樓層選單失敗')
    });
  }

  // 查詢功能
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      // 模擬查詢結果
      this.data = [
        {
          id: 1,
          pendingApprovalRegisterCode: 'R001',
          pendingApprovalPaymentTool: 'LINE Pay',
          systemAmount: 1200,
          receiptAmount: 1180
        },
        {
          id: 2,
          pendingApprovalRegisterCode: 'R002',
          pendingApprovalPaymentTool: '信用卡',
          systemAmount: 2400,
          receiptAmount: 2400
        }
      ];
      this.totalRecords = this.data.length;
      this.loading = false;
      this.messageService.unblockUi();
    });
  }

  // 清除功能
  onClearForm(): void {
    this.queryForm.reset();
    this.queryForm.patchValue({ salesDate: now });
  }

  // 刪除功能（模擬）
  onDelete(data: SalesRecord | SalesRecord[]): void {
    const items = Array.isArray(data) ? data : [data];
    const idList = items.map(item => item.id).filter(id => id != null);

    if (idList.length === 0) {
      this.messageService.warnBubble('未找到有效的刪除項目');
      return;
    }

    this.messageService.successBubble('刪除成功（模擬）');
    this.onSubmit(this.queryForm);
  }

  // 報表模式
  goToReportMode(): void {
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請先完成查詢條件');
      this.queryForm.markAllAsTouched();
      return;
    }

    this.customPageSize = 1000;
    this.showPageSizeDialog = true;
  }

  confirmPageSizeAndNavigate(): void {
    const rawFormValue: Record<string, any> = { ...this.queryForm.value };
    for (const key in rawFormValue) {
      if (rawFormValue[key] === '') rawFormValue[key] = null;
    }

    const queryFormValue = {
      ...rawFormValue,
      pageSize: this.customPageSize
    };

    this.router.navigate(['/TLS/TLS2A020CRU'], {
      state: {
        queryFormValue,
        pageSize: this.customPageSize
      }
    });

    this.showPageSizeDialog = false;
  }


  // 權限控制
  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }
}
