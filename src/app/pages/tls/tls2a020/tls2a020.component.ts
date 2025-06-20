import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

const now = new Date();

interface SalesRecord {
  id: number;
  pendingApprovalRegisterCode: string;
  pendingApprovalPaymentTool: string;
  systemAmount: number;
  receiptAmount: number;
}

@Component({
  selector: 'app-tls2a020',
  templateUrl: './tls2a020.component.html',
  styleUrls: ['./tls2a020.component.scss']
})

export class TLS2A020Component extends BasicQueryPageComponent<any> {
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  selectedItems: any[] = [];


  // 查詢表單
  queryForm = this.formBuilder.group({
    salesDate: [now, [Validators.required]],
    cashRegisterNumber: [''],
    floor: [''],
    sort: [''],
    ...createPaginationConfig([{ field: 'pendingApprovalRegisterCode', order: 1 }])
  });

  // 表格欄位
  columns: any[] = [
    { field: 'pendingApprovalRegisterCode', header: '未審核收銀機號', visible: true },
    { field: 'pendingApprovalPaymentTool', header: '未審核支付工具', visible: true },
    { field: 'systemAmount', header: '系統金額', visible: true },
    { field: 'receiptAmount', header: '貨收金額', visible: true }
  ];

  // 樓層選單（模擬）
  floorOptions: any[] = [
    { label: '1F', value: '1F' },
    { label: '2F', value: '2F' },
    { label: 'B1', value: 'B1' }
  ];

  totalRecords = 0;
  data: SalesRecord[] = [];


  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.initializePage('TLS2A020', '/TLS/TLS2A020CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  // ✅ 查詢事件
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      // 模擬查詢 API 回傳資料
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


  // ✅ 清除查詢表單
  onClearForm(): void {
    this.queryForm.reset();
    this.queryForm.patchValue({ salesDate: now });
  }


  // ✅ 刪除項目（模擬）
  onDelete(data: SalesRecord | SalesRecord[]): void {
    const items = Array.isArray(data) ? data : [data];
    const idList = items.map(item => item.id).filter(id => id != null);

    if (idList.length === 0) {
      this.messageService.warnBubble('未找到有效的刪除項目');
      return;
    }

    // TODO: 可串接 delete API，例如：this.apiService.deleteTLS2A020({ idList }).subscribe(...)
    this.messageService.successBubble('刪除成功（模擬）');
    this.onSubmit(this.queryForm); // 查詢更新
  }

  // ✅ 權限控制
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
