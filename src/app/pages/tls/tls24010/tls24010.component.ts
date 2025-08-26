import { AddButton, formatDateToYYYY_MM_DD } from './../../../shared/componentkit/table/table.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
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
import { STORE_WAY, TLS24010_EDIT_TYPE } from '../tls24010-cru/tls24010-cru.model';
import { yesterday } from '@shared/models/system/query-form.model';

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
  @ViewChild('menu') menu?: Menu;
  queryForm = this.formBuilder.nonNullable.group({
    TXN_GUIPaper: ['E', [Validators.required]],/*補登類別 → TXN_GUIPaper */
    TXN_Date: [null as Date | null, [Validators.required]],    /*銷售日期 → POS5006.TXN_Date */
    ECR_No: ['', [Validators.required]], /*收銀機號 → ECR_No */
    TLT_No: ['', [Validators.required]], /*櫃編 → TLT_No */
    TXN_No: [null as string | number | null, [Validators.maxLength(8), Validators.max(99999999)]],  /*交易序號 → TXN_No */
    TLT_Name: [''], /*櫃名 → TLT_Name */
    store_way: [''], /*櫃位類型 → store_way */
    talent_id: [0], /*專櫃代號 → talent_id */
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
  columns = columns
  addButton: AddButton[] = []
  constructor(
    private readonly dropDownList: DropDownListService,
    private readonly tls24010Service: Tls24010Service,
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS24010', 'tls/tls24010cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownList.queryPOS1002_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.ECR_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    this.dropDownList.queryTLTTALENT_ByContractDate_DropDownList(yesterday.toISOString().split('T')[0]).pipe(untilDestroyed(this)).subscribe(options => {
      this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    const txnDate = this.queryForm.get('TXN_Date')?.value;
    if (!txnDate) {
      this.queryForm.get('TXN_Date')?.setValue(new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0));
    }
  }
  onDateSelect(event: Date): void {
    this.queryForm.get('TXN_Date')?.setValue(event);
    this.dropDownList.queryTLTTALENT_ByContractDate_DropDownList(event.toISOString().split('T')[0]).pipe(untilDestroyed(this)).subscribe(options => {
      this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.tls24010Service.queryTLS24010(frm.getRawValue()).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data.map(item => ({
          ...item, TXN_No: item.TXN_No.toString(),
        }));
        this.totalRecords = res.TotalCount;
        this.updateData(frm);
      });
    });
  }
  isTXN_GUIPaper!: boolean;
  updateData(frm: FormGroup): void {
    const TLT_No = frm.get('TLT_No')?.value;
    const data = this.TLT_NoOptions.find(option => option.No === TLT_No);
    if (data?.store_way && data?.Name && data?.talent_id) {
      this.queryForm.get('store_way')?.setValue(data.store_way);
      this.queryForm.get('TLT_Name')?.setValue(data?.Name);
      this.queryForm.get('talent_id')?.setValue(data?.talent_id);
    }
    const txn_no = frm.get('TXN_No')?.value;
    if (txn_no) {
      this.queryForm.get('TXN_No')?.setValue(txn_no);
    }
    this.isTXN_GUIPaper = frm.get('TXN_GUIPaper')?.value === 'R' || frm.get('TXN_GUIPaper')?.value === 'C';
    this.queryStateService.setQueryState(this.ProgNo, frm.value);
    this.addButton = [
      {
        label: frm.get('TXN_GUIPaper')?.value === 'R' || frm.get('TXN_GUIPaper')?.value === 'C' ? '取消作廢' : '修正交易資料',
        icon: frm.get('TXN_GUIPaper')?.value === 'R' || frm.get('TXN_GUIPaper')?.value === 'C' ? 'pi pi-undo' : 'pi pi-ellipsis-h',
        action: (rowdata: TLS24010Data, event) => frm.get('TXN_GUIPaper')?.value === 'R' || frm.get('TXN_GUIPaper')?.value === 'C' ? this.onCancel(rowdata) : this.openModal(rowdata, event),
        disabled: (rowData: TLS24010Data) => rowData.TXN_Status === 'D'
      }
    ]
    this.updateItems(frm);
  }
  items: MenuItem[] = [];
  updateItems(frm: FormGroup): void {
    const store_way = frm.get('store_way')?.value;
    this.items = [
      { label: '專櫃編號修正', icon: 'pi pi-id-card', command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.專櫃編號修正) },
      { label: '折數修正', icon: 'pi pi-percentage', disabled: store_way === STORE_WAY.自營, command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.折扣別修正) },
      { label: '抽成類別修正', icon: 'pi pi-tags', disabled: store_way === STORE_WAY.自營, command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.抽成類別修正) },
      { label: '付款別修正', icon: 'pi pi-credit-card', command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.付款別修正) },
      { label: '是否為預售交易修正', icon: 'pi pi-shopping-cart', command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.預售交易修正) },
      { label: '交易資料作廢', icon: 'pi pi-trash', command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.交易資料作廢) },
    ];
  }

  openModal(rowdata: TLS24010Data, event?: Event): void {
    this.selectedRowData = rowdata;
    if (this.menu && event) {
      this.menu.toggle(event);
    }
  }
  // 補登資料
  onCreateData(frm: FormGroup): void {
    if (frm?.value.TXN_GUIPaper === 'R' || frm?.value.TXN_GUIPaper === 'C') { return; }
    this.submitted = true;
    if (!this.queryForm.valid) { return; }
    this.updateData(frm);
    const inertData = {
      ...frm.value,
      TXN_No: '系統自動產生',
    };
    this.onCreate(inertData);
  }
  // 查看補登資料
  onDetailData(rowdata: TLS24010Data): void {
    if (this.isTXN_GUIPaper) { return; }
    const history = this.queryStateService.getQueryStateValue(this.ProgNo);
    this.onDetail({
      ...rowdata,
      TXN_GUIPaper: history?.TXN_GUIPaper,
      store_way: history?.store_way,
      talent_id: history?.talent_id
    });
  }
  // 編輯補登資料
  onEditData(rowData: TLS24010Data, type: string): void {
    const history = this.queryStateService.getQueryState(this.ProgNo);
    if (type === FIX_TYPE.交易資料作廢) {
      this.messageService.confirm({
        header: '作廢交易資料',
        message: '確定要作廢交易資料嗎?',
        accept: () => {
          const body = {
            Store_way: history?.value.store_way || '',
            SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
            TXN_Date: formatDateToYYYY_MM_DD(rowData.TXN_Date) || '',
            ECR_No: rowData.ECR_No || '',
            TXN_No: Number(rowData.TXN_No) || 0,
            POS5006_ID: rowData.ID || 0,
            TXN_Remark: rowData.TXN_Remark || '',
          }
          const data = {
            ...body,
            EditType: TLS24010_EDIT_TYPE.交易資料作廢,
          }
          this.tls24010Service.updateTLS24010(data).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.messageService.successBubble(res.Message);
            this.onSubmit(this.queryForm);
          });
        },
        extraButtons: [
          {
            label: '確認資料',
            severity: 'info',
            action: () => {
              this.onEdit({
                ...rowData,
                type,
                TXN_GUIPaper: history?.value.TXN_GUIPaper,
                store_way: history?.value.store_way,
                talent_id: history?.value.talent_id
              });
            }
          }
        ]
      });
    } else {
      this.onEdit({
        ...rowData,
        type,
        TXN_GUIPaper: this.queryForm.value.TXN_GUIPaper,
        store_way: this.queryForm.value.store_way,
        talent_id: this.queryForm.value.talent_id
      });
    }
  }

  onCancel(rowdata: TLS24010Data): void {
    this.messageService.confirm({
      header: '取消作廢交易資料',
      message: '確定要取消作廢交易資料嗎?',
      accept: () => {
        this.loading = true;
        this.tls24010Service.cancelVoidTLS24010({
          SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
          TXN_Date: formatDateToYYYY_MM_DD(rowdata.TXN_Date) || '',
          ECR_No: rowdata.ECR_No,
          TXN_No: Number(rowdata.TXN_No),
        }).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
          this.onSubmit(this.queryForm);
          this.messageService.successBubble(res.Message);
        });
      }
    });
  }

  get checkTXN_GUIPaper(): boolean {
    return this.queryForm.get('TXN_GUIPaper')?.value === 'R' || this.queryForm.get('TXN_GUIPaper')?.value === 'C'
  }
}
