import { AsyncPipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS41010Service } from '@service/api/tls/tls41010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AutoCompleteComponent } from '@shared/componentkit/auto-complete/auto-complete.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { yesterday } from '@shared/models/system/query-form.model';
import { Actions } from '@shared/service/permission-guard.service';
import { ValidationService } from '@shared/service/validation.service';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { finalize, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TLS24010Data, TLS24010Request, Tls24010Service } from '../../../service/api/tls/tls24010.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { STORE_WAY, TLS24010_EDIT_TYPE } from '../tls24010-cru/tls24010-cru.model';
import { AddButton, formatDateToYYYY_MM_DD } from './../../../shared/componentkit/table/table.model';
import { C_columns, columns, FIX_TYPE, TXN_GUIPaperOptions, txnStatusOptions } from './tls24010.model';
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
    InputTextComponent,
    MenuModule,
    TranslateModule,
    TableReportComponent,
    AsyncPipe,
    AutoCompleteComponent
  ],
})
export class TLS24010Component extends BasicQueryPageComponent<TLS24010Data> implements OnInit {
  @ViewChild('menu') menu?: Menu;
  TXN_Date_Label = '銷售日期';
  queryForm = this.formBuilder.nonNullable.group({
    TXN_GUIPaper: ['E', [Validators.required]],/*補登類別 → TXN_GUIPaper */
    TXN_Date: [null as Date | null, [Validators.required]],    /*銷售日期 → POS5006.TXN_Date */
    ECR_No: [null as string | null], /*收銀機號 → ECR_No */
    TLT_No: [null as string | null], /*櫃編 → TLT_No */
    TXN_No: [null as string | number | null, [Validators.maxLength(8), this.validation.numberValidator]],  /*交易序號 → TXN_No */
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
    private readonly validation: ValidationService
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
  public tableQueryFunction = (body: TLS24010Request): Observable<ApiResponse<TLS24010Data[]>> => {
    // 這裡確保將 Component 中已有的 TLT_NoOptions 傳入 Service
    return this.tls24010Service.queryTLS24010(body, this.TLT_NoOptions);
  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const rawTxnNo = frm.value.TXN_No;
      const isInvalidOrNonNumeric = !rawTxnNo || rawTxnNo === '' || isNaN(Number(rawTxnNo));
      const body = {
        ...frm.value,
        TXN_Date: frm.value.TXN_Date ? formatDateToYYYY_MM_DD(frm.value.TXN_Date) : '',
        TXN_No: isInvalidOrNonNumeric ? null : rawTxnNo,
        pageSize: 30,
        pageIndex: 1,
        SortBy: [{ field: 'TXN_Date', order: -1 }],
      }
      this.tableQueryFunction(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.historyRequestBody = body;
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.isTXN_GUIPaper = frm.get('TXN_GUIPaper')?.value === 'R' || frm.get('TXN_GUIPaper')?.value === 'C';
        if (frm.get('TXN_GUIPaper')?.value === 'C') {
          this.addButton = [
            {
              label: '列印折讓單',
              icon: 'pi pi-print',
              action: (rowdata: TLS24010Data) => {
                if (!rowdata.TXN_Ret_No) {
                  this.messageService.errorBubble('無折讓單號，無法列印折讓單');
                  return;
                }
                this.tls24010Service.printTLS24010(rowdata?.TXN_Ret_No || '').pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
                  window.open(environment.ApiUrl + res.Data.Print_URL, '_blank');
                  this.onSubmit(this.queryForm);
                })
              },
            }
          ];
        } else {
          this.addButton = [
            {
              label: frm.get('TXN_GUIPaper')?.value === 'R' || frm.get('TXN_GUIPaper')?.value === 'C' ? '取消作廢' : '修正交易資料',
              icon: frm.get('TXN_GUIPaper')?.value === 'R' || frm.get('TXN_GUIPaper')?.value === 'C' ? 'pi pi-undo' : 'pi pi-ellipsis-h',
              action: (rowdata: TLS24010Data, event) => {
                const data = this.TLT_NoOptions.find(option => option.No === rowdata.TLT_No);
                if (data?.store_way && data?.Name && data?.talent_id) {
                  rowdata.store_way = data.store_way;
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
        this.updateItems();
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
      // 1. 取得原始交易日期
      const orgDate = rowData.TXN_Date; // 假設 TXN_Date 格式為 'YYYY-MM-DD'，可以直接被 new Date() 解析

      // 2. 判斷是否跨期
      const isCross = this.isCrossPeriod(orgDate);

      let headerMessage: string;
      let confirmMessage: string;

      if (isCross && rowData.TXN_GUIBegNo !== '00000000') {
        // 跨期：應開立折讓單
        headerMessage = `開立折讓單`;
        confirmMessage = `此筆交易已跨期，需進行開立折讓單作業。確定要開立折讓單嗎?`;
      } else {
        // 未跨期：作廢交易資料
        headerMessage = `作廢交易資料`;
        confirmMessage = `此筆交易未跨期，確定要作廢交易資料嗎?`;
      }

      // 3. 呼叫確認服務
      this.messageService.confirm({
        header: headerMessage,
        message: confirmMessage,
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
            if (res.Data?.Is_Create_Ret) {
              setTimeout(() => {
                this.messageService.confirm({
                  header: '折讓單已產生',
                  message: '是否要列印折讓單?',
                  accept: () => {
                    this.tls24010Service.printTLS24010(res.Data?.TXN_Ret_No || '').pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
                      window.open(environment.ApiUrl + res.Data.Print_URL, '_blank');
                      this.onSubmit(this.queryForm);
                    })
                  }
                });
              }, 1000);
            } else {
              this.onSubmit(this.queryForm);
            }
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
      }, this.historyRequestBody);
    }
  }
  items: MenuItem[] = [];
  updateItems(): void {
    this.items = [
      {
        label: '專櫃編號修正',
        icon: 'pi pi-id-card',
        disabled: !this.hasPermission(Actions.CounterNoCorrection),
        command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.專櫃編號修正),
      },
      {
        label: '折數修正',
        icon: 'pi pi-percentage',
        disabled: this.selectedRowData?.store_way === STORE_WAY.自營 || !this.hasPermission(Actions.DiscountCorrection),
        command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.折扣別修正)
      },
      {
        label: '抽成類別修正', icon: 'pi pi-tags',
        disabled: this.selectedRowData?.store_way === STORE_WAY.自營 || !this.hasPermission(Actions.CommissionTypeCorrection),
        command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.抽成類別修正)
      },
      {
        label: '付款別修正', icon: 'pi pi-credit-card',
        disabled: !this.hasPermission(Actions.PaymentTypeCorrection),
        command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.付款別修正),
      },
      {
        label: '是否為預售交易修正', icon: 'pi pi-shopping-cart',
        disabled: !this.hasPermission(Actions.PresaleCorrection),
        command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.預售交易修正),
      },
      {
        label: '交易資料作廢', icon: 'pi pi-trash',
        disabled: !this.hasPermission(Actions.InvalidateTransaction),
        command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.交易資料作廢),
      },
    ];
  }

  openModal(rowdata: TLS24010Data, event?: Event): void {
    this.selectedRowData = rowdata;
    this.updateItems();
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
      this.columns = columns;
      this.TXN_Date_Label = '銷售日期';
    } else if (value === 'C') {
      form.get('ECR_No')?.setValidators(null);
      form.get('TXN_No')?.setValidators([Validators.maxLength(8), Validators.max(99999999)]);
      form.updateValueAndValidity();
      this.cdr.markForCheck();
      form.get('ECR_No')?.setValue(null);
      form.get('TXN_No')?.setValue(null);
      this.columns = C_columns;
      this.TXN_Date_Label = '折讓單日期';
    } else if (value === 'R') {
      // 移除必填驗證規則，保留其他規則
      form.get('ECR_No')?.setValidators(null);
      form.get('TXN_No')?.setValidators([Validators.maxLength(8), Validators.max(99999999)]);
      form.updateValueAndValidity();
      this.cdr.markForCheck();
      form.get('ECR_No')?.setValue(null);
      form.get('TXN_No')?.setValue(null);
      this.columns = columns;
      this.TXN_Date_Label = '作廢日期';
    } else {
      // 移除必填驗證規則，保留其他規則
      form.get('ECR_No')?.setValidators(null);
      form.get('TXN_No')?.setValidators([Validators.maxLength(8), Validators.max(99999999)]);
      form.updateValueAndValidity();
      this.cdr.markForCheck();
      form.get('ECR_No')?.setValue(null);
      form.get('TXN_No')?.setValue(null);
      this.columns = columns;
      this.TXN_Date_Label = '銷售日期';
    }
  }
  btnLoading = false;
  onExportPDF(frm: FormGroup): void {
    this.submitted = true;
    this.btnLoading = true;
    this.messageService.blockUi();
    if (frm.valid) {
      const body = {
        ...frm.value,
        TXN_Date: frm.value.TXN_Date ? formatDateToYYYY_MM_DD(frm.value.TXN_Date) : '',
      }
      this.tls24010Service.exportTLS24010PDF(body).pipe(finalize(() => this.btnLoading = false), untilDestroyed(this)).subscribe(res => {
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

  /**
 * 判斷作廢是否跨期 (模擬後端邏輯)
 * 根據台灣發票每兩個月一期的規則判斷。
 * @param orgDateString 原始日期的字串 (例如 'YYYY-MM-DD')
 * @returns boolean 是否跨期
 */
  private isCrossPeriod(orgDateString: string): boolean {
    // 原始日期
    const orgDate = new Date(orgDateString);
    const orgYear = orgDate.getFullYear();
    // Month 是 0-11，所以不用減 1
    // (Month / 2) + 1 即可得到期數 (1月-2月是第1期, 3月-4月是第2期, ...)
    const orgPeriod = Math.floor(orgDate.getMonth() / 2) + 1;

    // 作廢日期 (現在時間)
    const voidDate = new Date();
    const voidYear = voidDate.getFullYear();
    const voidPeriod = Math.floor(voidDate.getMonth() / 2) + 1;

    // 年度或期數不同即為跨期
    return orgYear !== voidYear || orgPeriod !== voidPeriod;
  }
}
