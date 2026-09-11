import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS41010Service } from '@service/api/tls/tls41010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AutoCompleteComponent } from '@shared/components/auto-complete/auto-complete.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AddButton, ReportColumn } from '@shared/components/table-report/table-report.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { Actions } from '@shared/service/permission-guard.service';
import { ValidationService } from '@shared/service/validation.service';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { Menu, MenuModule } from 'primeng/menu';
import { debounceTime, distinctUntilChanged, filter, finalize, forkJoin, map, Observable, startWith, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { queryTLS24010EcrNoListItem, TLS24010Data, TLS24010Request, Tls24010Service } from '../../../service/api/tls/tls24010.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { STORE_WAY, TLS24010_EDIT_TYPE } from '../tls24010-cru/tls24010-cru.model';
import { FileExportService } from './../../../shared/service/file-export.service';
import { C_columns, columns, FIX_TYPE, TXN_GUIPAPER, TXN_GUIPaperOptions, TXN_STATUS, TxnTypeOptions } from './tls24010.model';
@Component({
  selector: 'app-tls24010',
  templateUrl: './tls24010.component.html',
  styleUrls: ['./tls24010.component.scss'],
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
  TxnTypeOptions = TxnTypeOptions
  ECR_NoOptions: queryTLS24010EcrNoListItem[] = [];
  TLT_NoOptions: IDropdownItem[] = [];
  // Table
  data: TLS24010Data[] = [];
  columns = columns;
  historyRequestBody: TLS24010Request | null = null;
  totalRecords = 0;
  selectedRowData?: TLS24010Data;
  addButton: AddButton[] = [];
  items: MenuItem[] = [];
  isClosed = false; // 當日是否已關帳
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
  ) {
    super();
    this.tableQueryFunction = this.tableQueryFunction.bind(this);
  }
  ngOnInit(): void {
    this.initializePage('TLS24010', 'tls/tls24010cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownList.queryTLTTALENT_ByContractDate_DropDownList(this.datePipe.transform(yesterday, 'yyyy-MM-dd')).pipe(untilDestroyed(this)).subscribe(options => {
      this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    // 監聽日期變化來連動專櫃編下拉選單
    this.queryForm.get('TXN_Date')?.valueChanges.pipe(
      startWith(this.queryForm.get('TXN_Date')?.value || yesterday), // 初始值處理
      debounceTime(500),         // 等使用者停手 0.5 秒
      distinctUntilChanged(),    // 只有值變動才執行
      filter(value => {
        if (!value) return false;
        // 先轉成字串檢查長度，避免 datePipe 噴錯
        const str = value instanceof Date ? value.toISOString() : String(value);
        return str.length >= 10;
      }),
      map(value => {
        // 第二道防線：轉換日期未成功時(日期輸入格式錯誤)，傳入null
        try {
          return this.datePipe.transform(value, 'yyyy-MM-dd');
        } catch {
          return null;
        }
      }),
      filter(dateString => !!dateString),
      switchMap(dateString =>
        forkJoin({
          options: this.dropDownList.queryTLTTALENT_ByContractDate_DropDownList(dateString!),
          ecrData: this.tls24010Service.queryTLS24010EcrNoList({ TXN_Date: dateString! }),
          closeData: this.tls24010Service.queryTLS24010IsClose(dateString!),
        })
      ),
      untilDestroyed(this)
    ).subscribe(({ options, ecrData, closeData }) => {
      // 下拉選單處理
      this.TLT_NoOptions = options.Data.map(item => ({
        ...item,
        label: `${item.No} - ${item.Name}`,
        value: item.No
      }));

      this.ECR_NoOptions = ecrData.Data.map(item => ({
        ...item,
        label: `${item.ECR_No}- ${item.ECR_Name}`, // 下拉顯示文字
        value: item.ECR_No  // 實際存入表單的值
      }));

      // 已關帳=Y，不可異動
      this.isClosed = (closeData.Data === 'Y');
    });
  }
  onECRNoChanged(ecrNo: string): void {
    // 1. 如果清空收銀機號，就清空並解鎖專櫃編號
    if (!ecrNo) {
      this.queryForm.get('TLT_No')?.setValue(null);
      this.queryForm.get('TLT_No')?.enable();
      return;
    }

    // 2. 直接從前端存好的收銀機下拉陣列中，找出這台收銀機的完整資料
    const selectedEcr = this.ECR_NoOptions.find(option => option.ECR_No === ecrNo);

    if (selectedEcr) {
      // 3. 在專櫃下拉選單中尋找是否有對應的專櫃編號
      const matchingTlt = this.TLT_NoOptions.find(option => option.No === selectedEcr.ECR_TLT_No);

      // 自動帶入專櫃編號 (如果有找到就帶入 No，沒有就填 null)
      this.queryForm.get('TLT_No')?.setValue(matchingTlt ? matchingTlt.No : null);

      // 4. 判斷是否鎖定專櫃編號欄位 (自收機台限制)
      // 條件：補登類別為 E 且 機台類型為 2 且 確實有找到對應的專櫃
      if (this.queryForm.get('TXN_GUIPaper')?.value === 'E' && selectedEcr.ECR_Type === '2' && matchingTlt) {
        this.queryForm.get('TLT_No')?.disable();
      } else {
        this.queryForm.get('TLT_No')?.enable();
      }
    }
  }
  tableQueryFunction(body: TLS24010Request): Observable<ApiResponse<TLS24010Data[]>> {
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
        this.data = res.Data;
        this.historyRequestBody = body;
        this.totalRecords = res.TotalCount;
        if (frm.get('TXN_GUIPaper')?.value === TXN_GUIPAPER.折讓單交易取消) {
          this.addButton = [
            {
              label: '列印折讓單', icon: 'pi pi-print',
              action: (rowdata: TLS24010Data) => {
                if (!rowdata || !rowdata.TXN_Ret_No) return this.messageService.errorBubble('無折讓單號，無法列印折讓單');
                this.tls24010Service.printTLS24010(rowdata.TXN_Ret_No).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
                  globalThis.open(environment.ApiUrl + res.Data.Print_URL, '_blank');
                  this.onSubmit(this.queryForm);
                })
              },
            }
          ];
        } else {
          this.addButton = [
            {
              label: (rowData: TLS24010Data) => {
                if (this.isSpecialPaper) {
                  const today = new Date();
                  const txnDate = new Date(rowData.TXN_Date);
                  const isToday = today.toDateString() === txnDate.toDateString();

                  if (isToday) {
                    return '此筆作廢交易請至收銀機台執行取消';
                  }
                  return rowData.Check_Status === 'Y' ? '已審核不可取消作廢' : '取消作廢';
                }

                return '修正交易資料';
              },
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
              disabled: (rowData: TLS24010Data) => {
                if (rowData.TXN_Status === TXN_STATUS.作廢交易) return true;
                //「取消作廢」模式要多判斷是否已審核
                if (this.isSpecialPaper) {
                  // 判斷 TXN_Date 是否為當天
                  const today = new Date();
                  const txnDate = new Date(rowData.TXN_Date);
                  const isToday = today.toDateString() === txnDate.toDateString();

                  if (isToday) return true; // 當天作廢交易，停用按鈕

                  return rowData.Check_Status === 'Y';
                }
                return false;
              }
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
      const isCheckStatus = rowData?.Check_Status === 'Y';
      const isCross = this.isCrossPeriod(rowData.TXN_Date) && rowData.TXN_GUIBegNo !== '00000000';
      // --- 預設時間為 23:00 的 Date 物件 ---
      const defaultVoidDate = new Date();
      defaultVoidDate.setHours(23, 0, 0, 0);
      this.messageService.confirm({
        header: isCross ? '開立折讓單' : '作廢交易資料',
        message: isCross ? '此筆交易已跨期，確定作廢後會開立折讓單，確定作廢嗎?' : '確定作廢嗎?',
        contentTemplate: this.customTimeTemp,
        templateContext: { data: { selectedDate: defaultVoidDate } },
        acceptLabel: '確定作廢',
        accept: (result) => {
          const selectedDate = result?.data?.selectedDate;
          if (!this.isValidVoidDate(selectedDate, rowData.TXN_Date)) return;
          const formattedDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd') || '';
          this.loading = true;
          this.tls24010Service.queryTLS24010IsClose(formattedDate).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(closeRes => {
            if (closeRes.Data === 'Y') {
              this.messageService.errorBubble('此作廢日期已關帳，請選擇其他日期');
              setTimeout(() => {
                this.onEditData(rowData, type);
              }, 0);
              return;
            }
            // 作廢日期等同交易日期(當日作廢)，要多判斷是否審核
            const txnDateStr = this.datePipe.transform(rowData.TXN_Date, 'yyyy-MM-dd');
            if (formattedDate === txnDateStr && isCheckStatus) {
              this.messageService.errorBubble('有支付工具已審核，不可當日作廢，請選擇其他日期');
              setTimeout(() => {
                this.onEditData(rowData, type);
              }, 0);
              return;
            }
            // --- 檢查通過，執行作廢邏輯 ---
            this.executeVoidUpdate(rowData, selectedDate, formattedDate);
          });
        },
        // extraButtons: [
        //   {
        //     label: '確認資料', severity: 'info',
        //     action: () => this.onEdit({ ...rowData, type, TXN_GUIPaper: this.historyRequestBody?.TXN_GUIPaper }, this.historyRequestBody)
        //   }
        // ]
      });
    } else if (type === FIX_TYPE.刪除交易) {
      const txnDate = this.datePipe.transform(rowData.TXN_Date, 'yyyy-MM-dd')
      if (!txnDate) return;
      const body = {
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
        TXN_Date: txnDate,
        ECR_No: rowData.ECR_No,
        TXN_No: Number(rowData.TXN_No),
        TLT_No: rowData.TLT_No,
      };
      this.messageService.confirm({
        header: '刪除交易', message: '交易資料刪除後，將查不到這筆資料，您確認要刪除嗎?',
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

  /** 作廢更新邏輯*/
  private executeVoidUpdate(rowData: TLS24010Data, selectedDate: Date, formattedDate: string): void {
    this.loading = true;
    this.messageService.infoBubble('作廢中請稍後...');

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
        Void_Date: formattedDate,
        Void_Time: this.datePipe.transform(selectedDate, 'HH:mm:ss') || '',
      }
    };

    this.tls24010Service.updateTLS24010(data).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
      this.messageService.successBubble(res.Message);
      if (res.Data?.Is_Create_Ret) {
        setTimeout(() => {
          this.messageService.confirm({
            header: '折讓單已產生',
            message: '是否要列印折讓單?',
            accept: () => {
              this.loading = true;
              this.tls24010Service.printTLS24010(res.Data?.TXN_Ret_No || '').pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((printRes) => {
                globalThis.open(environment.ApiUrl + printRes.Data.Print_URL, '_blank');
                this.onSubmit(this.queryForm);
              });
            }
          });
        }, 1000);
      } else {
        this.onSubmit(this.queryForm);
      }
    });
  }

  updateItems(): void {
    const row = this.selectedRowData;
    const isFixedTerm = row?.tlt_term_type?.toString().trim() === '1';
    const isCheckStatus = row?.Check_Status === 'Y';
    this.items = [
      {
        label: '專櫃編號修正',
        icon: 'pi pi-id-card',
        disabled: isFixedTerm || !this.hasPermission(Actions.CounterNoCorrection) || this.isClosed,
        styleClass: this.isClosed ? 'close-date-disabled' : '',
        command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.專櫃編號修正),
      },
      {
        label: '折數修正',
        icon: 'pi pi-percentage',
        disabled: isFixedTerm || this.selectedRowData?.store_way === STORE_WAY.自營 || !this.hasPermission(Actions.DiscountCorrection) || this.isClosed,
        styleClass: this.isClosed ? 'close-date-disabled' : '',
        command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.折扣別修正)
      },
      {
        label: '抽成類別修正', icon: 'pi pi-tags',
        disabled: isFixedTerm || this.selectedRowData?.store_way === STORE_WAY.自營 || !this.hasPermission(Actions.CommissionTypeCorrection) || this.isClosed,
        styleClass: this.isClosed ? 'close-date-disabled' : '',
        command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.抽成類別修正)
      },
      {
        label: '付款別修正', icon: 'pi pi-credit-card',
        disabled: !this.hasPermission(Actions.PaymentTypeCorrection) || this.isClosed,
        styleClass: this.isClosed ? 'close-date-disabled' : '',
        command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.付款別修正),
      },
      {
        label: '是否為預售交易修正', icon: 'pi pi-shopping-cart',
        disabled: !this.hasPermission(Actions.PresaleCorrection) || this.isClosed,
        styleClass: this.isClosed ? 'close-date-disabled' : '',
        command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.預售交易修正),
      },
      {
        label: '交易資料作廢', icon: 'pi pi-times-circle',
        disabled: !this.hasPermission(Actions.InvalidateTransaction), // 沒有作廢權限交易不可作廢
        command: () => this.onEditData(this.selectedRowData!, FIX_TYPE.交易資料作廢),
      }
    ];
    const TXN_GUIPaper = this.queryForm.controls.TXN_GUIPaper.value;
    if (TXN_GUIPaper === TXN_GUIPAPER.補原機台 || TXN_GUIPaper === TXN_GUIPAPER.手開發票) { // 補原機台、手開發票才有刪除
      this.items.push({
        label: '刪除',
        icon: 'pi pi-trash',
        disabled: (() => {
          if (isCheckStatus || this.isClosed) return true; // 已關帳或已審核的付款別交易不可刪除
          if (!this.hasPermission(Actions.Delete)) return true;// 1. 沒有權限，直接禁用
          if (!row) return true; // 2. 如果沒有選中任何列 (row 為空)，應預設為禁用
          // if (isFixedTerm) return true;
          if (row.GUI_Track === '00' && row.TXN_GUIBegNo === '00000000') return false; // 3. 無發票狀態：可以刪除 (disable = false)
          return !row?.IsCanDel;// 4. 有發票或其他狀態：依據 IsCanDel 欄位決定
        })(),
        styleClass: isCheckStatus ? 'check-status-disabled' : (this.isClosed ? 'close-date-disabled' : ''),
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
    const inertData = { ...frm.getRawValue(), TXN_No: '系統自動產生' };
    this.queryStateService.setQueryState(this.ProgNo, frm.value);
    this.onCreate(inertData, frm.getRawValue());
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
    // 根據 value 定義配置
    const configs: Record<string, { label: string; columns: ReportColumn[] }> = {
      'M': { label: '銷售日期', columns: columns },
      'C': { label: '折讓單日期', columns: C_columns },
      'R': { label: '作廢日期', columns: columns },
      'default': { label: '銷售日期', columns: columns }
    };
    const config = configs[value] || configs['default'];
    this.TXN_Date_Label = config.label;
    this.columns = config.columns;
    form.get('TXN_No')?.setValidators([Validators.maxLength(8), Validators.max(99999999)]);
    // 驗證規則要先套用，重設欄位時才會用「新」規則重新驗證，而不是沿用切換前的舊規則
    form.patchValue({ ECR_No: null, TXN_No: null });
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

  /** 提示訊息 */
  getTooltipMessage(): string {
    // 補登類別檢查
    if (this.checkTXN_GUIPaper) {
      return '新增時，請將補登類別改為「補原機台」「手開發票」';
    }
    // 已關帳提示
    if (this.isClosed) {
      return '已關帳不可異動資料';
    }
    return '';
  }
}
