import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS41010Service } from '@service/api/tls/tls41010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AutoCompleteComponent } from '@shared/componentkit/auto-complete/auto-complete.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { Actions } from '@shared/service/permission-guard.service';
import { ValidationService } from '@shared/service/validation.service';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
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
import { AddButton } from './../../../shared/componentkit/table/table.model';
import { FileExportService } from './../../../shared/service/file-export.service';
import { C_columns, columns, FIX_TYPE, TXN_GUIPAPER, TXN_GUIPaperOptions, TXN_STATUS, txnStatusOptions } from './tls24010.model';
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
    AutoCompleteComponent,
    CalendarModule
  ],
})
export class TLS24010Component extends BasicQueryPageComponent<TLS24010Data> implements OnInit {
  @ViewChild('customTimeTemp') customTimeTemp!: TemplateRef<any>;
  @ViewChild('menu') menu?: Menu;
  TXN_Date_Label = '銷售日期';
  queryForm = this.formBuilder.nonNullable.group({
    TXN_GUIPaper: ['E', [Validators.required]],/*補登類別 → TXN_GUIPaper */
    TXN_Date: [yesterday, [Validators.required]],    /*銷售日期 → POS5006.TXN_Date */
    ECR_No: [null as string | null], /*收銀機號 → ECR_No */
    TLT_No: [null as string | null], /*櫃編 → TLT_No */
    TXN_No: [null as string | number | null, [Validators.maxLength(8), this.validation.numberValidator]],  /*交易序號 → TXN_No */
    TLT_Name: [''], /*櫃名 → TLT_Name */
    store_way: [''], /*櫃位類型 → store_way */
    talent_id: [0], /*專櫃代號 → talent_id */
    rece_yn: [null], /*是否開立業主發票 → rece_yn */
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'TXN_Date', order: -1 }]],
  });
  // Options
  TXN_GUIPaperOptions = TXN_GUIPaperOptions
  txnStatusOptions = txnStatusOptions
  ECR_NoOptions = this.dropDown.queryPos1002();
  TLT_NoOptions: IDropdownItem[] = [];
  // Table
  data: TLS24010Data[] = [];
  columns = columns;
  historyRequestBody?: TLS24010Request;
  totalRecords = 0;
  selectedRowData?: TLS24010Data;
  addButton: AddButton[] = [];
  items: MenuItem[] = [];
  get isSpecialPaper(): boolean { // 交易作廢取消 || 折讓單交易取消
    const paper = this.queryForm.get('TXN_GUIPaper')?.value;
    return paper === TXN_GUIPAPER.交易作廢取消 || paper === TXN_GUIPAPER.折讓單交易取消;
  }
  constructor(
    private readonly dropDownList: DropDownListService,
    private readonly dropDown: DropdownApiService,
    public readonly tls24010Service: Tls24010Service,
    private readonly tLS41010Service: TLS41010Service,
    private readonly cdr: ChangeDetectorRef,
    private readonly validation: ValidationService,
    private readonly datePipe: DatePipe,
    private readonly fileExportService: FileExportService
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS24010', 'tls/tls24010cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownList.queryTLTTALENT_ByContractDate_DropDownList(this.datePipe.transform(yesterday, 'yyyy-MM-dd')).pipe(untilDestroyed(this)).subscribe(options => {
      this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    this.queryForm.get('TXN_Date')?.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
      const dateString = value ? this.datePipe.transform(value, 'yyyy-MM-dd') : '';
      if (!dateString) { return; }
      this.dropDownList.queryTLTTALENT_ByContractDate_DropDownList(dateString).pipe(untilDestroyed(this)).subscribe(options => {
        this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
      });
    });
  }
  onECRNoChanged(ecrNo: string): void {
    if (!ecrNo) return this.queryForm.get('TLT_No')?.setValue(null);
    this.tLS41010Service.queryTLS41010({ ECR_No: ecrNo }).pipe(untilDestroyed(this)).subscribe(res => {
      if (res.Data.length !== 0) {
        const ECR_TLT_No = this.TLT_NoOptions.filter(option => option.No === res.Data[0].ECR_TLT_No);
        this.queryForm.get('TLT_No')?.setValue(ECR_TLT_No.length > 0 ? ECR_TLT_No[0].No : null);
      }
    });
  }
  public tableQueryFunction = (body: TLS24010Request): Observable<ApiResponse<TLS24010Data[]>> => {
    return this.tls24010Service.queryTLS24010(body, this.TLT_NoOptions);
  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const rawTxnNo = frm.value.TXN_No;
      const body = {
        ...frm.value,
        TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd') || '',
        TXN_No: (!rawTxnNo || rawTxnNo === '' || isNaN(Number(rawTxnNo))) ? null : rawTxnNo
      }
      this.tableQueryFunction(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.historyRequestBody = body;
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        if (frm.get('TXN_GUIPaper')?.value === TXN_GUIPAPER.折讓單交易取消) {
          this.addButton = [
            {
              label: '列印折讓單', icon: 'pi pi-print',
              action: (rowdata: TLS24010Data) => {
                if (!rowdata || !rowdata.TXN_Ret_No) return this.messageService.errorBubble('無折讓單號，無法列印折讓單');
                this.tls24010Service.printTLS24010(rowdata.TXN_Ret_No).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
                  window.open(environment.ApiUrl + res.Data.Print_URL, '_blank');
                  this.onSubmit(this.queryForm);
                })
              },
            }
          ];
        } else {
          this.addButton = [
            {
              label: this.isSpecialPaper ? '取消作廢' : '修正交易資料',
              icon: this.isSpecialPaper ? 'pi pi-undo' : 'pi pi-ellipsis-h',
              action: (rowdata: TLS24010Data, event) => {
                const data = this.TLT_NoOptions.find(option => option.No === rowdata.TLT_No);
                if (data?.store_way && data?.Name && data?.talent_id) {
                  rowdata.store_way = data.store_way;
                  rowdata.talent_id = data?.talent_id;
                }
                if (frm.get('TXN_GUIPaper')?.value === TXN_GUIPAPER.交易作廢取消) {
                  this.onCancel(rowdata)
                } else {
                  this.openModal(rowdata, event);
                }
              },
              disabled: (rowData: TLS24010Data) => rowData.TXN_Status === TXN_STATUS.作廢交易
            }
          ]
        }
        this.updateItems();
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  // 查看補登資料
  onDetailData(rowdata: TLS24010Data): void { this.onDetail(rowdata, this.historyRequestBody); }
  // 編輯補登資料
  onEditData(rowData: TLS24010Data, type: string): void {
    // 1. 處理非作廢、非刪除的一般編輯
    if (type !== FIX_TYPE.交易資料作廢 && type !== FIX_TYPE.刪除交易) {
      return this.onEdit({ ...rowData, type, TXN_GUIPaper: this.historyRequestBody?.TXN_GUIPaper }, this.historyRequestBody);
    }
    if (type === FIX_TYPE.交易資料作廢) {
      const isCross = this.isCrossPeriod(rowData.TXN_Date) && rowData.TXN_GUIBegNo !== '00000000';
      // --- 預設時間為 23:00 的 Date 物件 ---
      const defaultVoidDate = new Date();
      defaultVoidDate.setHours(23, 0, 0, 0);
      this.messageService.confirm({
        header: isCross ? '開立折讓單' : '作廢交易資料',
        message: isCross ? '此筆交易已跨期，需進行開立折讓單作業。確定要開立折讓單嗎?' : '此筆交易未跨期，確定要作廢交易資料嗎?',
        contentTemplate: this.customTimeTemp,
        templateContext: { data: { selectedDate: defaultVoidDate } },
        accept: (result) => {
          const selectedDate = result?.data?.selectedDate;
          if (!this.isValidVoidDate(selectedDate, rowData.TXN_Date)) return;
          this.loading = true;
          const data = {
            Store_way: rowData.store_way || '',
            SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
            TXN_Date: this.datePipe.transform(rowData.TXN_Date, 'yyyy-MM-dd') || '',
            ECR_No: rowData.ECR_No || '',
            TXN_No: Number(rowData.TXN_No) || 0,
            POS5006_ID: rowData.ID || 0,
            TXN_Remark: rowData.TXN_Remark || '',
            EditType: TLS24010_EDIT_TYPE.交易資料作廢,
            VoidEdit: {
              Void_Date: this.datePipe.transform(selectedDate, 'yyyy-MM-dd') || '',
              Void_Time: this.datePipe.transform(selectedDate, 'HH:mm:ss') || '',
            }
          };
          this.tls24010Service.updateTLS24010(data).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.messageService.successBubble(res.Message);
            if (res.Data?.Is_Create_Ret) {
              setTimeout(() => {
                this.messageService.confirm({
                  header: '折讓單已產生', message: '是否要列印折讓單?',
                  accept: () => {
                    this.loading = true;
                    this.tls24010Service.printTLS24010(res.Data?.TXN_Ret_No || '').pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((printRes) => {
                      window.open(environment.ApiUrl + printRes.Data.Print_URL, '_blank');
                      this.onSubmit(this.queryForm);
                    });
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
            label: '確認資料', severity: 'info',
            action: () => this.onEdit({ ...rowData, type, TXN_GUIPaper: this.historyRequestBody?.TXN_GUIPaper }, this.historyRequestBody)
          }
        ]
      });
    } else if (type === FIX_TYPE.刪除交易) {
      const txnDate = this.datePipe.transform(rowData.TXN_Date, 'yyyy-MM-dd')
      if (!txnDate) return;
      const body = {
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
        TXN_Date: txnDate,
        ECR_No: rowData.ECR_No,
        TXN_No: Number(rowData.TXN_No),
      };
      this.messageService.confirm({
        header: '刪除交易', message: '確定要刪除交易嗎?',
        accept: () => {
          this.loading = true;
          this.tls24010Service.deleteTLS24010(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
            this.messageService.successBubble(res.Message);
            this.onSubmit(this.queryForm);
          })
        }
      });
    }
  }
  /** 輔助：驗證作廢日期 */
  private isValidVoidDate(selected: Date, txnDateStr: string): boolean {
    if (!selected) {
      this.messageService.errorBubble('請選擇作廢日期');
      return false;
    }
    // 清除時間部分，只比較年月日
    const s = new Date(selected).setHours(0, 0, 0, 0);
    const t = new Date(txnDateStr).setHours(0, 0, 0, 0);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (s < t) {
      this.messageService.errorBubble('作廢日期不可早於交易日期');
      return false;
    }
    if (s > today) {
      this.messageService.errorBubble('作廢日期不可晚於今日');
      return false;
    }
    return true;
  }
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
        label: '交易資料作廢', icon: 'pi pi-times-circle',
        disabled: !this.hasPermission(Actions.InvalidateTransaction),
        command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.交易資料作廢),
      }
    ];
    const TXN_GUIPaper = this.queryForm.controls.TXN_GUIPaper.value;
    if (TXN_GUIPaper === TXN_GUIPAPER.補原機台 || TXN_GUIPaper === TXN_GUIPAPER.手開發票) { // 補原機台、手開發票才有刪除
      this.items.push({
        label: '刪除',
        icon: 'pi pi-trash',
        disabled: (() => {
          if (!this.hasPermission(Actions.Delete)) return true;// 1. 沒有權限，直接禁用
          const row = this.selectedRowData;
          if (!row) return true; // 2. 如果沒有選中任何列 (row 為空)，應預設為禁用
          if (row.GUI_Track === '00' && row.TXN_GUIBegNo === '00000000') return false; // 3. 無發票狀態：可以刪除 (disable = false)
          return !row?.IsCanDel;// 4. 有發票或其他狀態：依據 IsCanDel 欄位決定
        })(),
        command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.刪除交易),
      });
    }
  }
  openModal(rowdata: TLS24010Data, event?: Event): void {
    this.selectedRowData = rowdata;
    this.updateItems();
    if (this.menu && event) this.menu.toggle(event);
  }
  // 補登資料
  onCreateData(frm: FormGroup): void {
    if (this.isSpecialPaper || !frm) return;
    if (!frm.get('ECR_No')?.value) return this.messageService.errorBubble('請選擇收銀機號');
    if (!frm.get('TLT_No')?.value) return this.messageService.errorBubble('請選擇專櫃編號');
    this.submitted = true;
    if (!frm.valid) { return; }
    const TLT_No = frm.get('TLT_No')?.value;
    const data = this.TLT_NoOptions.find(option => option.No === TLT_No);
    if (data?.store_way && data?.Name && data?.talent_id) {
      frm.get('store_way')?.setValue(data.store_way);
      frm.get('TLT_Name')?.setValue(data?.Name);
      frm.get('talent_id')?.setValue(data?.talent_id);
      frm.get('rece_yn')?.setValue(data?.rece_yn);
    }
    const inertData = { ...frm.value, TXN_No: '系統自動產生' };
    this.queryStateService.setQueryState(this.ProgNo, frm.value);
    this.onCreate(inertData, frm.value);
  }

  onCancel(rowdata: TLS24010Data): void {
    this.messageService.confirm({
      header: '取消作廢交易資料', message: '確定要取消作廢交易資料嗎?',
      accept: () => {
        this.loading = true;
        this.tls24010Service.cancelVoidTLS24010({
          SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
          TXN_Date: this.datePipe.transform(rowdata.TXN_Date, 'yyyy-MM-dd') || '',
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
    const form = this.queryForm;
    return form.get('TXN_GUIPaper')?.value === 'R' || form.get('TXN_GUIPaper')?.value === 'C' || form.get('TXN_GUIPaper')?.value === 'M';
  }
  onTXNGuipaperChanged(value: string): void {
    const form = this.queryForm;
    this.data = [];
    this.submitted = false;
    form.patchValue({ ECR_No: null, TXN_No: null });// 重設欄位
    // 根據 value 定義配置
    const configs: Record<string, { label: string; columns: ReportColumn[]; ecrRequired?: boolean; txnRequired?: boolean }> = {
      'M': { label: '銷售日期', columns: columns, ecrRequired: true, txnRequired: true },
      'C': { label: '折讓單日期', columns: C_columns },
      'R': { label: '作廢日期', columns: columns },
      'default': { label: '銷售日期', columns: columns }
    };
    const config = configs[value] || configs['default'];
    // 統一處理驗證
    this.TXN_Date_Label = config.label;
    this.columns = config.columns;
    const ecrValidators = config.ecrRequired ? [Validators.required] : null;
    const txnValidators = [Validators.maxLength(8), Validators.max(99999999)];
    if (config.txnRequired) txnValidators.push(Validators.required);
    form.get('ECR_No')?.setValidators(ecrValidators);
    form.get('TXN_No')?.setValidators(txnValidators);
    form.updateValueAndValidity();
    this.cdr.markForCheck();
  }
  btnLoading = false;
  onExportPDF(frm: FormGroup): void {
    this.submitted = true;
    this.btnLoading = true;
    if (frm.valid) {
      const body = {
        ...frm.value,
        TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd') || '',
      }
      const export$ = this.tls24010Service.exportTLS24010PDF(body);
      this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoading = isLoading).subscribe();
      this.submitted = false;
    } else {
      this.btnLoading = false;
    }
  }
  // 判斷作廢是否跨期，根據台灣發票每兩個月一期的規則判斷。
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
