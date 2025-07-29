import { AddButton } from './../../../shared/componentkit/table/table.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
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
import { columns, FIX_TYPE, TXN_GUIPaperOptions, txnStatusOptions } from './tls24010.model';

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
  queryForm = this.formBuilder.nonNullable.group({
    TXN_GUIPaper: ['E', [Validators.required]],/*補登類別 → TXN_GUIPaper */
    TXN_Date: [new Date(), [Validators.required]],    /*銷售日期 → POS5006.TXN_Date */
    ECR_No: ['', [Validators.required]], /*收銀機號 → ECR_No */
    TLT_No: ['000164', [Validators.required]], /*櫃編 → TLT_No */
    TLT_Name: [''], /*櫃名 → TLT_Name */
    store_way: [''], /*櫃位類型 → store_way */
    talent_id: [0], /*專櫃代號 → talent_id */
    TXN_No: [null as number | null, [Validators.maxLength(8), Validators.max(99999999)]],  /*交易序號 → TXN_No */
    ...createPaginationConfig([{ field: 'TXN_Date', order: -1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  today = new Date(); // 獲取當前日期
  TXN_GUIPaperOptions = TXN_GUIPaperOptions
  txnStatusOptions = txnStatusOptions
  ECR_NoOptions: IDropdownItem[] = [];
  TLT_NoOptions: IDropdownItem[] = [];
  data: TLS24010Data[] = [];
  selectedRowData?: TLS24010Data;
  columns: Column[] = columns
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
    this.dropDownList.queryTLTTALENT_ByContractDate_DropDownList(this.today.toISOString().split('T')[0]).pipe(untilDestroyed(this)).subscribe(options => {
      this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    this.queryForm.get('TLT_No')?.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
      if (value) {
        const store_way = this.TLT_NoOptions.find(option => option.No === value)?.store_way;
        if (store_way) {
          this.queryForm.get('store_way')?.setValue(store_way);
        }
        const TLT_Name = this.TLT_NoOptions.find(option => option.No === value)?.Name;
        if (TLT_Name) {
          this.queryForm.get('TLT_Name')?.setValue(TLT_Name);
        }
        const talent_id = this.TLT_NoOptions.find(option => option.No === value)?.talent_id;
        if (talent_id) {
          this.queryForm.get('talent_id')?.setValue(talent_id);
        }
      }
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.tls24010Service.queryTLS24010(frm.getRawValue()).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  @ViewChild('menu') menu?: Menu;
  items: MenuItem[] = [
    { label: '專櫃編號修正', icon: 'pi pi-id-card', disabled: false, command: () => this.onEditFix(this.selectedRowData!, FIX_TYPE.專櫃編號修正) },
    { label: '折扣別修正', icon: 'pi pi-percentage', disabled: false, command: () => this.onEditFix(this.selectedRowData!, FIX_TYPE.折扣別修正) },
    { label: '抽成類別修正', icon: 'pi pi-tags', disabled: false, command: () => this.onEditFix(this.selectedRowData!, FIX_TYPE.抽成類別修正) },
    { label: '付款別修正', icon: 'pi pi-credit-card', disabled: false, command: () => this.onEditFix(this.selectedRowData!, FIX_TYPE.付款別修正) },
    { label: '發票修正', icon: 'pi pi-receipt', disabled: false, command: () => this.onEditFix(this.selectedRowData!, FIX_TYPE.發票修正) },
    { label: '交易資料作廢', icon: 'pi pi-trash', disabled: false, command: () => this.onEditFix(this.selectedRowData!, FIX_TYPE.交易資料作廢) },
    { label: '預售交易修正', icon: 'pi pi-shopping-cart', disabled: false, command: () => this.onEditFix(this.selectedRowData!, FIX_TYPE.預售交易修正) },
  ];
  openModal(rowdata: TLS24010Data, event?: Event): void {
    this.selectedRowData = rowdata;
    if (this.menu && event) {
      this.menu.toggle(event);
    }
  }
  onCreateData(): void {
    this.submitted = true;
    if (!this.queryForm.valid) { return; }
    this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
    this.onCreate(this.queryForm.value);
  }

  onDetailData(rowdata: TLS24010Data): void {
    this.onDetail({
      ...rowdata,
      TXN_GUIPaper: this.queryForm.value.TXN_GUIPaper || 'E'
    });
  }

  onDateSelect(event: Date): void {
    this.queryForm.get('TXN_Date')?.setValue(event);
    this.dropDownList.queryTLTTALENT_ByContractDate_DropDownList(event.toISOString().split('T')[0]).pipe(untilDestroyed(this)).subscribe(options => {
      this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
  }
  onEditFix(rowData: TLS24010Data, type: string): void {
    this.onEdit({ ...rowData, type });
  }
}
