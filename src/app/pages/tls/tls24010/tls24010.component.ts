import { AddButton } from './../../../shared/componentkit/table/table.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatDate } from '../../../shared/componentkit/table/table.model';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TLS24010Data, Tls24010Service } from '../../../service/api/tls/tls24010.service';
import { finalize } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

// 交易補登作業
@Component({
  selector: 'app-tls24010',
  templateUrl: './tls24010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    CalendarComponent,
    DropdownComponent,
    InputNumberComponent,
    TableComponent,
    MenuModule,
    TranslateModule,
  ],
})
export class TLS24010Component extends BasicQueryPageComponent<TLS24010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_GUIPaper: ['', [Validators.required]],/*補登類別 → TXN_GUIPaper */
    TXN_Date: [new Date(), [Validators.required]],    /*銷售日期 → POS5006.TXN_Date */
    ECR_No: ['', [Validators.required]], /*收銀機號 → ECR_No */
    TLT_No: ['', [Validators.required]], /*櫃編 → TLT_No */
    TXN_No: [null as number | null, [Validators.maxLength(8), Validators.max(99999999)]],  /*交易序號 → TXN_No */
    ...createPaginationConfig([{ field: 'TXN_Date', order: -1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  today = new Date(); // 獲取當前日期
  TXN_GUIPaperOptions: { label: string, value: string }[] = [
    { label: '補原機台', value: 'E' },
    { label: '手開二聯式發票', value: '2' }
  ];
  TXN_ModeOptions: { label: string, value: string }[] = [
    { label: '收銀', value: 'R' },
    { label: '補輸入', value: 'E' },
    { label: '訓練', value: 'T' },
    { label: '事後登錄', value: 'P' },
  ];
  ECR_NoOptions: { No: string, Name: string, label: string }[] = [];
  TLT_NoOptions: { No: string, Name: string, label: string }[] = [];
  data: TLS24010Data[] = [{ TXN_Date: '2025-07-10T16:15:33.560Z', ECR_No: '000011', TXN_No: '12345678', TLT_No: '001', TLT_Name: '專櫃A', TXN_Mode: 'R' }];
  columns: Column[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'TLT_Name', header: '專櫃名稱', visible: true },
    { field: 'TXN_Mode', header: '交易型態', visible: true, format: (value: string) => this.TXN_ModeOptions.find(opt => opt.value === value)?.label || value },
  ];
  addButton: AddButton[] = [
    { label: '功能', icon: 'pi pi-ellipsis-h', action: (rowdata, event) => this.openModal(rowdata, event) }
  ]
  constructor(
    private readonly dropDownList: DropDownListService,
    private readonly tls24010Service: Tls24010Service,
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS24010', 'tls/tls24010cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownList.queryPOS1002_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.ECR_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.tls24010Service.queryTLS24010(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  @ViewChild('menu') menu?: Menu;
  items: MenuItem[] = [
    { label: '專櫃編號修正', icon: 'pi pi-id-card', disabled: true },
    { label: '折數修正及特價註記修正', icon: 'pi pi-percentage', disabled: false },
    { label: '抽成類別修正', icon: 'pi pi-tags', disabled: false },
    { label: '付款別修正', icon: 'pi pi-credit-card', disabled: false },
    { label: '發票修正', icon: 'pi pi-receipt', disabled: false },
    { label: '交易資料作廢', icon: 'pi pi-trash', disabled: false },
    { label: '預售交易修正', icon: 'pi pi-shopping-cart', disabled: false },
  ];
  openModal(rowdata: TLS24010Data, event?: Event): void {
    if (this.menu && event) {
      this.menu.toggle(event);
    }
  }
}
