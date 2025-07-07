import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { SupplementCategoryService } from '../../../service/basic/supplement-category.service';
import { FloorService } from '../../../service/basic/floor.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';

// 交易補登作業
@Component({
  selector: 'app-tls24010',
  templateUrl: './tls24010.component.html',
})
export class TLS24010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    supplementCategory: [, [Validators.required]],  // 補登類別
    saleDateStart: [, [Validators.required]],  // 銷售日期起
    saleDateEnd: [, [Validators.required]],  // 銷售日期迄
    cashierCode: [],  // 收銀機號
    counterCode: [, [Validators.required]],  // 專櫃編號
    transactionSerial: [],  // 交易序號
    invoiceCarrierType: [],  // 電子發票載具種類
    visitorCount: [],  // 來客數
    cashierNumber: [88888888]  // 收銀員編號
  });
  supplementCategoryOptions: any[] = [];
  cashierOptions: any[] = [];
  counterCodeOptions: any[] = [];
  invoiceCarrierTypeOptions: any[] = [];  // 電子發票載具種類選項
  data: any[] = [];
  columns: Column[] = [
    { field: 'salesDate', header: '銷售日期', visible: true },
    { field: 'cashRegisterStatus', header: '收銀機代號', visible: true },
    { field: 'transactionFlow', header: '交易流水號', visible: true },
    { field: 'invoiceNumber', header: '發票號碼', visible: true },
    { field: 'invoiceStatus', header: '發票狀態', visible: true },
    { field: 'counterName', header: '專櫃編號/名稱', visible: true },
    { field: 'transactionType', header: '交易型態', visible: true },
    { field: 'salesTotal', header: '銷售總額', visible: true },
    { field: 'invoiceAmount', header: '發票金額/已開發票金額', visible: true },
    { field: 'profitAmount', header: '溢收金額', visible: true },
    { field: 'transactionCount', header: '交易筆數/銷售單數', visible: true },
    { field: 'repairer', header: '補登者', visible: true },
    { field: 'repairDate', header: '補登日期', visible: true },
    { field: 'remark', header: '備註', visible: true }
  ];
  constructor(
    private supplementCategoryService: SupplementCategoryService,
    private floorService: FloorService,  // 收銀機號
    private counterCodeService: CounterCodeService,  // 專櫃編號
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS24010', 'TLS/TLS24010CRU', this.queryForm, (form) => this.onSubmit(form));
    this.supplementCategoryService.getSupplementCategories().subscribe((data) => {
      this.supplementCategoryOptions = data;
    });
    this.floorService.getFloors().subscribe((data) => {
      this.cashierOptions = data;
    });
    this.counterCodeService.getCounterCodes().subscribe((data) => {
      this.counterCodeOptions = data;
    });
    // 假設有一個服務來獲取電子發票載具種類選項
    this.invoiceCarrierTypeOptions = [
      { label: '載具1', value: 1 },
      { label: '載具2', value: 2 },
      { label: '載具3', value: 3 }
    ];
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.queryStateService.setQueryState(this.ProgNo, frm.value);
    });
  }
}
