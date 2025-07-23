import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '@shared/componentkit/table/table.model';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { MultiSelectComponent } from '@shared/componentkit';
import { ITLS27050Data, TLS27050Service } from '@service/api/tls/tls27050.service';

@Component({
  selector: 'app-tls27050',
  templateUrl: './tls27050.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, MultiSelectComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class TLS27050Component extends BasicQueryPageComponent<ITLS27050Data> implements OnInit {
  queryForm = this.formBuilder.group({
    saleDate: [, [Validators.required]], // 銷售日期
    PAY_NOList: [], // 支付工具別
  });
  totalRecords = 0;
  pos1006DropDownList: IDropdownItem[] = [];
  data: any[] = [
  ];
  columns: Column[] = [
    { field: 'paymentType', header: '支付別', visible: true },
    { field: 'barcodeNumber', header: 'Barcode NO.', visible: true },
    { field: 'cashRegisterStatus', header: '收銀機狀況', visible: true },
    { field: 'amount', header: '金額', visible: true },
  ];
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly Tls27050Service: TLS27050Service,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27050', 'TLS/TLS27050cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownListService.queryPOS1006_DropDownList().subscribe((res) => {
      this.pos1006DropDownList = res.Data;
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}
