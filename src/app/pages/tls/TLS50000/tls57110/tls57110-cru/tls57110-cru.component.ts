import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-tls57110-cru',
  templateUrl: './tls57110-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AccordionModule,
    ButtonComponent,
    TableComponent
  ]
})
export class TLS57110CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    DisplayMode: [1, [Validators.required]],
    ODM_No: [''],
    HOS_No: [[]],
    LOGO_No: [[]],
    stockDate: [''],
    displayCount: [],
  });
  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
  columns: ReportColumn[] = [
    { field: 'brand', header: '品牌', visible: true },
    { field: 'initialInventory', header: '期初存貨', visible: true },
    { field: 'purchaseQuantity', header: '進貨量', visible: true },
    { field: 'returnQuantity', header: '進退量', visible: true },
    { field: 'salesQuantity', header: '銷貨量', visible: true },
    { field: 'transferIn', header: '撥入量', visible: true },
    { field: 'transferOut', header: '撥出量', visible: true },
    { field: 'inventoryAdjustment', header: '盤點量', visible: true },
    { field: 'damagedQuantity', header: '報廢量', visible: true },
    { field: 'claimQuantity', header: '領用量', visible: true },
    { field: 'claimReturnQuantity', header: '領用退回量', visible: true },
    { field: 'peerTransferIn', header: '同業調入量', visible: true },
    { field: 'peerTransferOut', header: '同業調出量', visible: true },
    { field: 'endingInventory', header: '期末存貨', visible: true },
  ];


  constructor(

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS57110');
    // 儲存查詢頁面的數據到 queryStateService，以便返回時能恢復
    // const state = this.router.lastSuccessfulNavigation?.extras.state;
    // if (state?.['queryConditions']) {
    //   // 如果從查詢頁面傳過來查詢條件，儲存起來
    //   this.queryStateService.setQueryState('TLS22010_data', state['queryConditions']);
    // }

    this.onSubmit(this.queryForm);

  }
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;


    this.loading = false;

  }
}
