import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { FloorService } from '../../../service/basic/floor.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { MachinedisplayService } from '../../../service/basic/machinedisplay.service';

@Component({
  selector: 'app-tls22010',
  templateUrl: './tls22010.component.html',
  styleUrls: ['./tls22010.component.scss'],
})
export class TLS22010Component implements OnInit {
  ProgNo: string = '220006';

  // 權限
  funInfo?: FunsrightInfo;
  addPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.add,
  };
  queryPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.query,
  };
  editPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.edit,
  };

  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    date: [],                    // 日期
    floor: [],                   // 樓層
    floorRadio: [''],            // 樓層單選按鈕
    machineCode: [],             // 收銀機代碼
    machineCodeRadio: [''],      // 收銀機代碼單選按鈕
    machineDisplayOptions: [],   // 收銀機顯示選項
  });

  // 表格資料
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'collectionMachineCode', header: '收據機代碼', visible: true },
    { field: 'line', header: '線號', visible: true },
    { field: 'district', header: '區域', visible: true },
    { field: 'floor', header: '樓層', visible: true },
    { field: 'salesAmountA', header: '銷售金額 (A)', visible: true },
    { field: 'depositAmount', header: '預購金額', visible: true },
    { field: 'refundAmountC2', header: '預購結帳 (C2)', visible: true },
    { field: 'discountD', header: '銷售小計(D) = (A)', visible: true },
    { field: 'agencyFeeL', header: '代收/付金額 (L)', visible: true },
    { field: 'invoicedAmountE', header: '已開發票金額 (E)', visible: true },
    { field: 'reportedAmountK', header: '已開溢付 (K)', visible: true },
    { field: 'remittedAmountI', header: '已匯送付 (I)', visible: true },
    { field: 'invoiceTotalAmountF', header: '發票總金額 (F)', visible: true },
    { field: 'invoiceNoTaxAmountM', header: '發票未稅金額 (M)', visible: true },
    { field: 'invoiceTaxAmountN', header: '發票稅額 (N)', visible: true },
    { field: 'invoiceCashAmountO', header: '發票免稅金額 (O)', visible: true },
    { field: 'collectionAmountG', header: '溢收 (G)', visible: true },
    { field: 'discountJ', header: '折讓 (J)', visible: true },
    { field: 'paymentAmountH', header: '付款金額(H)=(D)+(G)-(C2)-(K)', visible: true },
    { field: 'zReportAmount', header: 'Z 報表總金額', visible: true },
    { field: 'kioskOperation', header: '後台(作廢/補登)', visible: true },
    { field: 'status', header: '狀態', visible: true },
  ];

  // 樓層選項
  floorOptions: any[] = [];
  // 收銀機顯示選項
  machinedisplayOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private floorService: FloorService,
    private machineDisplayService: MachinedisplayService
  ) { }

  ngOnInit(): void {
    // 初始化權限
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 加載樓層選項
    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
    });

    // 加載收銀機顯示選項
    this.machineDisplayService.getMachinedisplay().subscribe((data) => {
      this.machinedisplayOptions = data;
    });
  }

  // 檢查是否有查詢權限
  canQuery(): boolean {
    return true;
  }

  // 檢查是否有新增權限
  canAdd(): boolean {
    return true;
  }

  // 檢查是否有編輯權限
  canEdit(): boolean {
    return true;
  }

  // 提交表單
  onSubmit(frm: FormGroup): void {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交查詢邏輯
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  // 查詢邏輯
  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  // 清空表單
  onClearForm(): void {
    this.queryForm.reset(); // 重置表單
  }

  // Handle Radio Button Selection
  onRadioSelect(selected: string): void {
    if (selected === 'floor') {
      this.queryForm.controls.floorRadio.setValue('floor');
      this.queryForm.controls.machineCodeRadio.setValue(''); // Deselect 收銀機代碼
    } else if (selected === 'machineCode') {
      this.queryForm.controls.machineCodeRadio.setValue('machineCode');
      this.queryForm.controls.floorRadio.setValue(''); // Deselect 樓層
    }
  }

  // 創建新數據
  onCreate(): void {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm.value,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  // 編輯數據
  onEdit(data: any): void {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm.value,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  // 查看詳細信息
  onDetail(data: any): void {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm.value,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
