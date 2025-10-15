import { AddButton, formatDateToYYYY_MM_DD } from './../../../shared/componentkit/table/table.model';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TLS24010Data, TLS24010Request, Tls24010Service } from '../../../service/api/tls/tls24010.service';
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
import { TranslateModule } from '@ngx-translate/core';
import { columns, FIX_TYPE, TXN_GUIPaperOptions, txnStatusOptions } from './tls24010.model';
import { STORE_WAY, TLS24010_EDIT_TYPE } from '../tls24010-cru/tls24010-cru.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { TLS41010Service } from '@service/api/tls/tls41010.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AsyncPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { HttpResponse } from '@angular/common/http';
import { AutoCompleteComponent } from '@shared/componentkit/auto-complete/auto-complete.component';
// 交易補登作業
@Component({
  selector: 'app-tls24010',
  templateUrl: './tls24010.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    CalendarComponent,
    DropdownComponent,
    InputNumberComponent,
    MenuModule,
    TranslateModule,
    TableReportComponent,
    AsyncPipe,
    AutoCompleteComponent
  ],
})
export class TLS24010Component extends BasicQueryPageComponent<TLS24010Data> implements OnInit {
  @ViewChild('menu') menu?: Menu;
  queryForm = this.formBuilder.nonNullable.group({
    TXN_GUIPaper: ['E', [Validators.required]],/*補登類別 → TXN_GUIPaper */
    TXN_Date: [null as Date | null, [Validators.required]],    /*銷售日期 → POS5006.TXN_Date */
    ECR_No: [null as string | null], /*收銀機號 → ECR_No */
    TLT_No: [null as string | null], /*櫃編 → TLT_No */
    TXN_No: [null as string | number | null, [Validators.maxLength(8), Validators.max(99999999)]],  /*交易序號 → TXN_No */
    TLT_Name: [''], /*櫃名 → TLT_Name */
    store_way: [''], /*櫃位類型 → store_way */
    talent_id: [0], /*專櫃代號 → talent_id */
  });
  historyRequestBody?: TLS24010Request;
  color: string | undefined;
  totalRecords = 0;
  isTXN_GUIPaper!: boolean;
  today = new Date(); // 獲取當前日期
  TXN_GUIPaperOptions = TXN_GUIPaperOptions
  txnStatusOptions = txnStatusOptions
  ECR_NoOptions = this.dropDown.queryPos1002();
  TLT_NoOptions: IDropdownItem[] = [];
  data: TLS24010Data[] = [];
  selectedRowData?: TLS24010Data;
  columns = columns
  addButton: AddButton[] = []
  constructor(
    private readonly dropDownList: DropDownListService,
    private readonly dropDown: DropdownApiService,
    public readonly tls24010Service: Tls24010Service,
    private readonly tLS41010Service: TLS41010Service,
    private readonly cdr: ChangeDetectorRef,
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS24010', 'tls/tls24010cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownList.queryTLTTALENT_ByContractDate_DropDownList(yesterday.toISOString().split('T')[0]).pipe(untilDestroyed(this)).subscribe(options => {
      this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    const txnDate = this.queryForm.get('TXN_Date')?.value;
    if (!txnDate) {
      this.queryForm.get('TXN_Date')?.setValue(new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0));
    }
    this.queryForm.get('TXN_Date')?.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
      const dateString = value ? formatDateToYYYY_MM_DD(value) : '';
      if (!dateString) { return; }
      this.dropDownList.queryTLTTALENT_ByContractDate_DropDownList(dateString).pipe(untilDestroyed(this)).subscribe(options => {
        this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
      });
    });
  }
  onECRNoChanged(event: string): void {
    if (!event) {
      this.queryForm.get('TLT_No')?.setValue(null);
      return;
    }
    const body = { ECR_No: event };
    this.tLS41010Service.queryTLS41010(body).pipe(untilDestroyed(this)).subscribe(res => {
      if (res.Data.length !== 0) {
        const ECR_TLT_No = this.TLT_NoOptions.filter(option => option.No === res.Data[0].ECR_TLT_No);
        this.queryForm.get('TLT_No')?.setValue(ECR_TLT_No.length > 0 ? ECR_TLT_No[0].No : null);
      }
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        TXN_Date: frm.value.TXN_Date ? formatDateToYYYY_MM_DD(frm.value.TXN_Date) : '',
        pageSize: 30,
        pageIndex: 1,
        SortBy: [{ field: 'TXN_Date', order: -1 }],
      }
      this.tls24010Service.queryTLS24010(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.historyRequestBody = body;
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.isTXN_GUIPaper = frm.get('TXN_GUIPaper')?.value === 'R' || frm.get('TXN_GUIPaper')?.value === 'C';
        if (frm.get('TXN_GUIPaper')?.value === 'C') {
          this.addButton = [];
        } else {
          this.addButton = [
            {
              label: frm.get('TXN_GUIPaper')?.value === 'R' || frm.get('TXN_GUIPaper')?.value === 'C' ? '取消作廢' : '修正交易資料',
              icon: frm.get('TXN_GUIPaper')?.value === 'R' || frm.get('TXN_GUIPaper')?.value === 'C' ? 'pi pi-undo' : 'pi pi-ellipsis-h',
              action: (rowdata: TLS24010Data, event) => {
                const data = this.TLT_NoOptions.find(option => option.No === rowdata.TLT_No);
                if (data?.store_way && data?.Name && data?.talent_id) {
                  rowdata.store_way = data.store_way;
                  rowdata.TLT_Name = data?.Name;
                  rowdata.talent_id = data?.talent_id;
                }
                if (frm.get('TXN_GUIPaper')?.value === 'R') {
                  this.onCancel(rowdata)
                } else {
                  this.openModal(rowdata, event);
                }
              },
              disabled: (rowData: TLS24010Data) => rowData.TXN_Status === 'D'
            }
          ]
        }
        this.updateItems(frm);
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  // 查看補登資料
  onDetailData(rowdata: TLS24010Data): void {
    this.onDetail(rowdata, this.historyRequestBody);
  }
  // 編輯補登資料
  onEditData(rowData: TLS24010Data, type: string): void {
    if (type === FIX_TYPE.交易資料作廢) {
      this.messageService.confirm({
        header: '作廢交易資料',
        message: '確定要作廢交易資料嗎?',
        accept: () => {
          const data = {
            Store_way: rowData.store_way || '',
            SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
            TXN_Date: formatDateToYYYY_MM_DD(rowData.TXN_Date) || '',
            ECR_No: rowData.ECR_No || '',
            TXN_No: Number(rowData.TXN_No) || 0,
            POS5006_ID: rowData.ID || 0,
            TXN_Remark: rowData.TXN_Remark || '',
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
                TXN_GUIPaper: this.queryStateService.getQueryStateValue(this.ProgNo)?.TXN_GUIPaper,
              });
            }
          }
        ]
      });
    } else {
      this.onEdit({
        ...rowData,
        type,
        TXN_GUIPaper: this.queryStateService.getQueryStateValue(this.ProgNo)?.TXN_GUIPaper,
      });
    }
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
    this.isTXN_GUIPaper = frm.get('TXN_GUIPaper')?.value === 'R' || frm.get('TXN_GUIPaper')?.value === 'C';
    if (frm?.value.TXN_GUIPaper === 'R' || frm?.value.TXN_GUIPaper === 'C') { return; }
    if (!frm || !frm.get('ECR_No')?.value) {
      this.messageService.errorBubble('請選擇收銀機號');
      return;
    }
    if (!frm.get('TLT_No')?.value) {
      this.messageService.errorBubble('請選擇專櫃編號');
      return;
    }
    this.submitted = true;
    if (!this.queryForm.valid) { return; }
    const TLT_No = frm.get('TLT_No')?.value;
    const data = this.TLT_NoOptions.find(option => option.No === TLT_No);
    if (data?.store_way && data?.Name && data?.talent_id) {
      this.queryForm.get('store_way')?.setValue(data.store_way);
      this.queryForm.get('TLT_Name')?.setValue(data?.Name);
      this.queryForm.get('talent_id')?.setValue(data?.talent_id);
    }
    const inertData = {
      ...frm.value,
      TXN_No: '系統自動產生',
    };
    this.onCreate(inertData);
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
    return this.queryForm.get('TXN_GUIPaper')?.value === 'R' ||
      this.queryForm.get('TXN_GUIPaper')?.value === 'C' ||
      this.queryForm.get('TXN_GUIPaper')?.value === 'M';
  }
  onTXNGuipaperChanged(value: string): void {
    this.submitted = false;
    const form = this.queryForm;
    if (value === 'M' && form) {
      // 加入本身的驗證規則以及額外加入必填
      form.get('ECR_No')?.setValidators([Validators.required]);
      form.get('TXN_No')?.setValidators([Validators.required, Validators.maxLength(8), Validators.max(99999999)]);
      form.updateValueAndValidity();
      this.cdr.markForCheck();
      form.get('ECR_No')?.setValue(null);
      form.get('TXN_No')?.setValue(null);
    } else {
      // 移除必填驗證規則，保留其他規則
      form.get('ECR_No')?.setValidators(null);
      form.get('TXN_No')?.setValidators([Validators.maxLength(8), Validators.max(99999999)]);
      form.updateValueAndValidity();
      this.cdr.markForCheck();
      form.get('ECR_No')?.setValue(null);
      form.get('TXN_No')?.setValue(null);
    }
  }
  btnLoading = false;
  onExportPDF(frm: FormGroup): void {
    this.submitted = true;
    this.btnLoading = true;
    this.messageService.blockUi();
    if (frm.valid) {
      this.tls24010Service.exportTLS24010PDF(frm.value).pipe(finalize(() => this.btnLoading = false), untilDestroyed(this)).subscribe(res => {
        this.handleFileExport(res, '.pdf');
      })
      this.submitted = false;
    } else {
      this.btnLoading = false;
    }
    this.messageService.unblockUi();
  }
  // 處理檔案匯出的通用邏輯
  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    const blob = response.body;

    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService.warnBubble('沒有找到符合條件的資料，無法生成報表。');
    }
  }
  // 輔助方法：從 header 獲取檔名
  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) {
      return `download${defaultExtension}`;
    }

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch.length > 1) {
      const encodedFilename = filenameStarMatch[1];
      try {
        const decoded = decodeURIComponent(encodedFilename.replace(/^UTF-8''/, ''));
        return decoded;
      } catch (error) {
        console.error('Failed to decode filename*', error);
        return encodedFilename;
      }
    }

    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch && filenameMatch.length > 1) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }
}
