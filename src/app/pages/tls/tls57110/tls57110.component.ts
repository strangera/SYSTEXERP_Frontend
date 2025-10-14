import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-tls57110',
  templateUrl: './tls57110.component.html',
  styleUrl: './tls57110.component.scss',
  standalone: true,
  imports: [MenubarComponent, TableReportComponent, MultiSelectComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, CalendarComponent, InputNumberComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class TLS57110Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    DisplayMode: [1, [Validators.required]],
    ODM_No: [''],
    HOS_No: [[]],
    LOGO_No: [[]],
    stockDate: [''],
    displayCount: [],
    ...createPaginationConfig([{ field: 'LOGO_No', order: 1 }]),
  });

  totalRecords = 0;
  data: any[] = [];
  columns: any[] = [
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
  displayModeOptions = [
    { value: 1, label: '彙總' },
    { value: 2, label: '明細' },
  ];
  warehouseOptions: IDropdownItem[] = [];
  brandCodeOptions: IDropdownItem[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS57110', 'tls/tls57110cru');
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(response => {
      this.warehouseOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, No: item.No }));
    });
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.brandCodeOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, No: item.No }));
    });
  }


  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;


    this.loading = false;

  }
}
