// import { ApiResponse } from './../../../service/system/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { LocationOptionsService } from '../../../service/API/dropdownservice/location-options.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';

interface SalesRecord {
  id: number;
  salesDate: string;
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

export class TLS2A020Component extends BasicQueryPageComponent<any> implements OnInit {

  // 進度條、頁數設定
  // progressValue = 0;
  // showPageSizeDialog = false;
  // customPageSize = 1000;

  // 表單
  queryForm = this.formBuilder.group({
    salesDate: [new Date(), [Validators.required]],
    tlt_floor: [[]],
    sort: [''],
    ECR_No: [[]],
    tlt_building: [''],
    paymentTool: [''],
    radioOption: ['ECR'],
    ...createPaginationConfig([{ field: 'pendingApprovalRegisterCode', order: 1 }])
  });

  // 表格欄位
  columns: any[] = [
    { field: 'salesDate', header: '銷售日期', visible: true },
    { field: 'pendingApprovalRegisterCode', header: '未審核收銀機號', visible: true },
    { field: 'pendingApprovalPaymentTool', header: '未審核支付工具', visible: true },
    { field: 'systemAmount', header: '系統金額', visible: true },
    { field: 'receiptAmount', header: '實收金額', visible: true }
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
    private ecrNoService: ECRNoService

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
          salesDate: '2025/06/23',
          pendingApprovalRegisterCode: 'R001',
          pendingApprovalPaymentTool: 'LINE Pay',
          systemAmount: 1200,
          receiptAmount: 1180
        },
        {
          id: 2,
          salesDate: '2025/06/23',
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

  // 刪除項目
  // onDelete(rowData: Pos10015[]): void {
  // const idList = rowData
  //   .map(item => item.id)
  //   .filter(id => id !== undefined && id !== null);
  // console.log(idList);
  // if (idList.length === 0) {
  //   this.messageService.warnBubble('無有效的 ID 可供刪除');
  //   return;
  // }
  // this.tls2a020service.deleteTLS2a020({ idList }).subscribe({
  //   next: (response) => {
  //     if (response.Status === '0000') {
  //       this.messageService.successBubble('選中項目刪除成功');
  //       this.selectedItems = []; // 清空選中項目
  //       this.onSubmit(this.queryForm); // 重新查詢以更新列表
  //     } else {
  //       console.error('API error:', response.Status, response.Message);
  //       this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
  //     }
  //   }
  // });
  // }
}
