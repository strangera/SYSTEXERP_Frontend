import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';


@Component({
  selector: 'app-ass17100',
  templateUrl: './ass17100.component.html',
  styleUrls: ['./ass17100.component.scss'],
})
export class ASS17100Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    startDate: [],
    endDate: [],
    warehouse: [],
    itemNumber: [],
  });

  // 下拉選單選項
  warehouseOptions: any[] = [
    { value: 1, label: '001 - 倉庫A' },
    { value: 2, label: '002 - 倉庫B' },
    { value: 3, label: '003 - 倉庫C' },
  ];

  itemNumberOptions: any[] = [
    { value: 1, label: '3A24210000001' },
    { value: 2, label: '3A24210000002' },
    { value: 3, label: '3A24210000003' },
    { value: 4, label: '3A24210000004' },
    { value: 5, label: '3A24210000005' },
  ];

  // 表格資料
  data: any[] = [];
  columns: any[] = [
    { field: 'date', header: '日期', visible: true },
    { field: 'beginningQuantity', header: '期初數量', visible: true },
    { field: 'currentPurchase', header: '本期進貨', visible: true },
    { field: 'currentUsageQuantity', header: '本期領用量', visible: true },
    { field: 'currentReturn', header: '本期退料', visible: true },
    { field: 'currentAdjustment', header: '本期調整', visible: true },
    { field: 'currentTransfer', header: '本期調撥', visible: true },
    { field: 'currentScrap', header: '本期報廢', visible: true },
    { field: 'endingQuantity', header: '本期期末', visible: true },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,

  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '310058';
    this.authService.getUserPermissions(this.ProgNo);

  }

  onSubmit(frm: FormGroup): void {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 在此處進行查詢邏輯
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  onCreate(): void {
    if (this.canAdd()) {
      const extras: NavigationExtras = {
        state: { crudstatus: CRUDStatus.Create, queryform: this.queryForm },
        skipLocationChange: true,
      };
      this.router.navigate(['ASS1000/ASS17100CRU'], extras);
    }
  }

  onEdit(data: any): void {
    if (this.canEdit()) {
      const extras: NavigationExtras = {
        state: { crudstatus: CRUDStatus.Edit, rowdata: data, queryform: this.queryForm },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  onDetail(data: any): void {
    const extras: NavigationExtras = {
      state: { crudstatus: CRUDStatus.Read, rowdata: data, queryform: this.queryForm },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }

  onClearForm(): void {
    this.queryForm.reset(); // 重置表單
  }
}
