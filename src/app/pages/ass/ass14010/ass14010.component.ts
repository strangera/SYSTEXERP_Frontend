import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { VendorService } from '../../../service/basic/vendor.service';
import { PaperTypeService } from '../../../service/basic/paper-type.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
//

//3.1.4.1  進貨發票建檔作業
@Component({
    selector: 'app-ass14010',
    templateUrl: './ass14010.component.html',
    styleUrl: './ass14010.component.scss',
    standalone: true,
    imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, TableComponent, TranslateModule]
})
export class ASS14010Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    invoiceNumber: [, [this.validationService.numberValidator, Validators.maxLength(16)]], // 發票/收據號碼
    supplierCode: [], // 供應商編號
    requestType: [], // 請款單據種類
    orderNumber: [, [this.validationService.numberValidator, Validators.maxLength(11)]], // 驗收單號
    maintenanceNumber: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 發票維護單號
    invoiceFormat: [], // 發票格式
    taxType: [], // 稅別
    deductionsType: [], // 扣抵別
  });
  // 下拉資料多個呈現
  // ----------------------------------------------------------------
  roles: any[] = [
    { id: 1, roleCode: 'ADMIN', roleName: 'Administrator' },
    { id: 2, roleCode: 'USER', roleName: 'User' },
    { id: 3, roleCode: 'GUEST', roleName: 'Guest' },
  ];
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    {
      'invoiceNumber': 'CG12345678', 'orderNumber': '2014030001', 'maintenanceNumber': 'I0000001', 'supplierCode': '03550014-1/A公司',
      'requestType': '發票', 'invoiceFormat': 21, 'taxType': '應稅',
      'noTaxAmount': 65400, 'taxAmount': 3270, 'totalAmount': 658670, 'deductionsType': '代表近項可扣抵之進貨及費用',
    },
  ];
  columns: any[] = [
    { field: 'invoiceNumber', header: '發票/收據號碼', visible: true },
    { field: 'orderNumber', header: '驗收單號', visible: true },
    { field: 'maintenanceNumber', header: '發票維護單號', visible: true },
    { field: 'supplierCode', header: '供應商編號', visible: true },
    { field: 'requestType', header: '請款單據種類', visible: true },
    { field: 'invoiceFormat', header: '發票格式', visible: true },
    { field: 'taxType', header: '稅別', visible: true },
    { field: 'noTaxAmount', header: '未稅金額', visible: true },
    { field: 'taxAmount', header: '稅額', visible: true },
    { field: 'totalAmount', header: '金額', visible: true },
    { field: 'deductionsType', header: '扣抵別', visible: true },
  ];
  // ----------------------------------------------------------------

  supplierCodeOptions: any[] = [];
  requestTypeOptions: any[] = [];
  invoiceFormatOptions: any[] = [
    { value: 1, label: '21/進項三聯式、電子計算機統一發票' },
    { value: 2, label: '22/進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: 3, label: '25/進向三連式收銀機統一發票及一般稅額計算之電子發票' },
    { value: 4, label: '26/彙總登陸每張稅額五百元以下之盡項三聯式、電子計算機之統一發票' },
    { value: 5, label: '27/彙總登陸每張稅額五百元以下之盡項二聯式收銀雞統一發票、載有稅額之其他憑證' },
    { value: 6, label: '28/進項海關代徵營業稅繳納證' },
  ];
  taxTypeOptions: any[] = [
    { value: 1, label: '應稅' },
    { value: 2, label: '免稅' },
  ];
  deductionsTypeOptions: any[] = [
    { value: 1, label: '代表近項可扣抵之進貨及費用' },
    { value: 2, label: '代表近項可扣抵之固定資產' },
    { value: 3, label: '代表近項不可扣抵之進貨及費用' },
    { value: 4, label: '代表近項不可扣抵之固定資產' },
  ];
  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private vendorService: VendorService,
    private paperTypeService: PaperTypeService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310028';
    this.cruPage = '/ASS1000/ASS14010CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.vendorService.getVendors().subscribe(data => {
      this.supplierCodeOptions = data;
    });
    //
    this.paperTypeService.getSystemTypes().subscribe(data => {
      this.requestTypeOptions = data;
    });
    // ----------------------------------------------------------------
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
  // ----------------------------------------------------------------
  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(this.router, CRUDStatus.Create, null, this.cruPage);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(this.router, CRUDStatus.Edit, data, this.cruPage);
    }
  }

  onDetail(data: any) {
    this.navigateWithState(this.router, CRUDStatus.Read, data, this.cruPage);
  }
}
