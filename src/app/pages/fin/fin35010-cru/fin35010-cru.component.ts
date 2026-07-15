import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN35010DetailResponse, FIN35010ModifyRequest, FIN35010Response, Fin35010Service, FIN35010TLTRequest, FIN35010TLTResponse } from '@service/api/fin/fin35010.service';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";
import { InputTextareaComponent } from "@shared/componentkit/input-textarea/input-textarea.component";
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatDate } from '@others/component/table/table.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { UpdateType } from '../fin35010/fin35010.model';

@Component({
  selector: 'app-fin35010-cru',
  templateUrl: './fin35010-cru.component.html',
  standalone: true,
  imports: [DialogComponent, TableEditComponent, AsyncPipe, TableReportComponent, MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, CalendarComponent, NgIf, TranslateModule, InputNumberComponent, InputTextareaComponent]
})
export class FIN35010CRUComponent extends BasicCruPageComponent<FIN35010Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    Id: [{ value: null as number | null, disabled: true }], // 新增 Id 欄位用於更新/讀取
    In_Date: [new Date() as Date | null, [Validators.required]],
    Data_Source: [{ value: '2', disabled: true }, [Validators.required]], // 新增 Data_Source (用於判斷合約轉入)
    STO_No: [this.authService.currentUserValue?.SYS_StoreNo, [Validators.required]], // 新增 STO_No
    Deposit_Mode: ['1' as string | null, [Validators.required]], // 新增 Deposit_Mode (可能需要根據 DepositTypeOptions 設置初始值)
    Deposit_Type: [null as string | null, [Validators.required]], // 保證類別
    CHK_Type: [null as string | null],
    Status: [{ value: '0', disabled: true }, [Validators.required]],
    CHK_No: [null as string | null, [Validators.required, Validators.maxLength(10)]],
    CHK_Amt: [null as number | null, [Validators.required, Validators.max(9999999999)]],
    CHK_ExpireDate: [null as Date | null],
    Deposit_Date: [null as Date | null],
    Return_Date: [null as Date | null],
    VEN_No: [null as string | null],
    VEN_Name: [{ value: null as string | null, disabled: true }],
    TLT_No: [null as string | null],
    Talent_Id: [null as number | null], // 新增 Talent_Id
    Org_Id: [{ value: null as string | null, disabled: true }], // 新增 Org_Id
    TLT_Name: [{ value: null as string | null, disabled: true }],
    tlt_bdate: [{ value: null as Date | null, disabled: true }],
    tlt_edate: [{ value: null as Date | null, disabled: true }],
    Return_EDate: [null as Date | null],
    Return_Get_Person: [null as string | null, [Validators.maxLength(50)]],
    Remark: [null as string | null, [Validators.maxLength(160)]],
    update_type: ['1' as UpdateType | null], // 根據 UpdateType 決定要送出的異動狀態
  });

  VEN_NoOptions$ = this.dropdown.queryPos2013({ VEN_Flag: '' });
  venNoResolvedOptions: Option[] | null = null;
  tlt_noOptions$ = this.dropdown.queryTLTTALENTDropDownList();
  Org_IdOptions$ = this.dropdown.querySys3100();
  tltNoResolvedOptions: any[] | null = null;
  Deposit_TypeOptions = getSYS1000Options('Deposit_Type');// 保證金類型 (1=押金 2=履約保證金 3=施工保證金 4=開業保證金)
  CHK_TypeOptions = getSYS1000Options('CHK_Type');// 票據種類 (1=支票 2=本票 3=銀行保證函 4=其他)
  StatusOptions = getSYS1000Options('ARS4008_Status');// (0=未繳票 1=已繳票 2=已退票 3=封存)
  columns: EditColumn[] = [
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'TLT_No', header: '專櫃編號' },
    { field: 'TLT_Name', header: '專櫃名稱' },
    { field: 'tlt_bdate', header: '合約起始日期', format: formatDate },
    { field: 'tlt_edate', header: '合約終止日期', format: formatDate },
    { field: 'CHK_Type', header: '票據種類', format: (v) => getSYS1000('CHK_Type', v) },
    { field: 'CHK_Amt', header: '票據金額', format: formatAmount },
  ];
  data: FIN35010DetailResponse[] = [];
  selectedItems: FIN35010DetailResponse[] = [];
  constructor(
    public readonly fin35010Service: Fin35010Service,
    private readonly dropdown: DropdownApiService,
    private readonly ngZone: NgZone,
    private readonly datePipe: DatePipe,
    private readonly cdr: ChangeDetectorRef,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('FIN35010', this.dataForm);
    if (this.rowdata) {
      switch (this.rowdata?.update_type) {
        case UpdateType.Deposit: this.formTitle = '新增【繳票】資訊'; this.dataForm.disable(); break;
        case UpdateType.CancelDeposit: this.formTitle = '新增【取消繳票】資訊'; this.dataForm.disable(); break;
        case UpdateType.Refund: this.formTitle = '新增【退票】資訊'; this.dataForm.disable(); break;
        case UpdateType.CancelRefund: this.formTitle = '新增【取消退票】資訊'; this.dataForm.disable(); break;
        default: break;
      }
    }
    if (this.isFormCreateable && this.rowdata) {
      this.dataForm.patchValue(this.rowdata as FIN35010Response);
      if (this.rowdata.Data_Source === '1') {
        this.dataForm.controls.Deposit_Mode.disable();
        this.dataForm.controls.Status.disable();
        this.dataForm.controls.CHK_Amt.disable();
        this.dataForm.controls.CHK_Type.disable();
      }
    }
    // 2. 處理讀取明細
    if (!this.isFormCreateable && this.rowdata) {
      const body = { Id: (this.rowdata as FIN35010Response).Id };
      this.fin35010Service.queryFIN35010Detail(body).pipe(untilDestroyed(this)).subscribe(res => {
        this.dataForm.patchValue({
          ...res.Data,
          Id: (this.rowdata as FIN35010Response).Id,
          In_Date: res.Data.In_Date ? new Date(res.Data.In_Date) : null,
          CHK_ExpireDate: res.Data.CHK_ExpireDate ? new Date(res.Data.CHK_ExpireDate) : null,
          Deposit_Date: res.Data.Deposit_Date ? new Date(res.Data.Deposit_Date) : null,
          Return_Date: res.Data.Return_Date ? new Date(res.Data.Return_Date) : null,
          Return_EDate: res.Data.Return_EDate ? new Date(res.Data.Return_EDate) : null,
          tlt_bdate: res.Data.TLT_BDate ? new Date(res.Data.TLT_BDate) : null,
          tlt_edate: res.Data.TLT_EDate ? new Date(res.Data.TLT_EDate) : null,
        });
        this.applyContractTransferRules(res.Data.Data_Source);
      })
    }
    this.dropdown.queryPos2013({ VEN_Flag: '' }).pipe(untilDestroyed(this)).subscribe(options => {
      this.venNoResolvedOptions = options;
      this.setupVenNoChangeListener();
    });
    this.dropdown.queryTLTTALENTDropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.tltNoResolvedOptions = options;
      this.setupTltNoChangeListener();
    });
  }
  private setupVenNoChangeListener(): void {
    this.dataForm.controls.VEN_No.valueChanges.pipe(untilDestroyed(this)).subscribe(venNo => {
      if (this.venNoResolvedOptions && venNo) {
        const selectedVendor = this.venNoResolvedOptions.find(opt => opt.value === venNo);
        if (selectedVendor) {
          this.ngZone.run(() => {
            this.dataForm.patchValue({ VEN_Name: selectedVendor['Name'] }, { emitEvent: false });
          });
        }
      }
    });
  }
  // 監聽 TLT_No (專櫃號碼) 變化，並自動帶入相關的人才/合約資訊
  private setupTltNoChangeListener(): void {
    this.dataForm.controls.TLT_No.valueChanges.pipe(untilDestroyed(this)).subscribe(tltNo => {
      if (this.tltNoResolvedOptions && tltNo) {
        const selectedTalent = this.tltNoResolvedOptions.find(opt => opt.tlt_no === tltNo);
        this.dataForm.patchValue({
          Talent_Id: selectedTalent.talent_id || null,
          Org_Id: selectedTalent.org_id || null,
          TLT_Name: selectedTalent.tlt_name || null,
          tlt_bdate: selectedTalent.tlt_bdate || null,
          tlt_edate: selectedTalent.tlt_edate || null,
        });
      }
    });
  }
  // 根據 Data_Source 判斷是否為合約轉入 (假設 Data_Source='1' 為合約轉入)
  private applyContractTransferRules(dataSource: string | null): void {
    // 假設 '1' 代表合約轉入 (需根據實際後端定義確認)
    if (dataSource === '1') {
      const disableFields: (keyof typeof this.dataForm.controls)[] = [
        'Deposit_Mode', 'In_Date', 'Deposit_Type', 'CHK_Type', 'VEN_No',
        'TLT_No'
      ];
      disableFields.forEach(controlName => this.dataForm.get(controlName)?.disable());
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 取得當前商店編號
      const stoNo = this.authService.currentUserValue?.SYS_StoreNo ?? '';
      const rawValue = frm.getRawValue();
      const updateType = String(this.rowdata?.update_type || '0');

      // --- 情況 A：如果是批次模式 (Table 有資料) ---
      if (this.isFormCreateable && this.data && this.data.length > 0) {
        const listBody: FIN35010ModifyRequest[] = this.data.map(item => ({
          ...item,
          ...rawValue,
          update_type: updateType,
          STO_No: stoNo,
          In_Date: this.datePipe.transform(item.In_Date, 'yyyy-MM-dd') || '',
          CHK_ExpireDate: this.datePipe.transform(item.CHK_ExpireDate, 'yyyy-MM-dd') || undefined,
          Deposit_Date: this.datePipe.transform(item.Deposit_Date, 'yyyy-MM-dd') || undefined,
          Return_Date: this.datePipe.transform(item.Return_Date, 'yyyy-MM-dd') || undefined,
          Return_EDate: this.datePipe.transform(item.Return_EDate, 'yyyy-MM-dd') || undefined,
          CHK_Amt: Number(item.CHK_Amt) || 0,
          Talent_Id: item.Talent_Id ? Number(item.Talent_Id) : undefined,
          TLT_No: item.TLT_No,
          Org_Id: item.Org_Id,
          TLT_Name: item.TLT_Name,
          tlt_bdate: item.tlt_bdate,
          tlt_edate: item.tlt_edate,
          CHK_Type: item.CHK_Type,
          VEN_No: item.VEN_No,
          VEN_Name: item.VEN_Name,
        }));

        this.fin35010Service.insertListFIN35010({ List: listBody }).pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
        ).subscribe(res => {
          this.messageService.successBubble(res.Message || '批次新增成功');
          this.onCancel();
        });
        return;
      }

      // --- 情況 B：單筆模式 ---
      // 1. 使用你保留的 getTargetStatus 取得狀態
      const targetStatus = this.getTargetStatus(updateType);

      // 2. 處理日期自動回寫邏輯
      let depositDate: string | undefined = this.datePipe.transform(rawValue.Deposit_Date, 'yyyy-MM-dd') || undefined;
      let returnDate: string | undefined = this.datePipe.transform(rawValue.Return_Date, 'yyyy-MM-dd') || undefined;
      const today = this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;

      switch (updateType) {
        case '1': // 繳票
          depositDate = today;
          break;
        case '2': // 取消繳票
          depositDate = undefined;
          break;
        case '3': // 退票
          returnDate = today;
          break;
        case '4': // 取消退票
          returnDate = undefined;
          break;
      }

      const formattedBody: FIN35010ModifyRequest = {
        ...rawValue,
        Id: this.isFormCreateable ? undefined : rawValue.Id,
        update_type: updateType,
        Status: targetStatus,       // 使用 getTargetStatus 的結果
        Deposit_Date: depositDate,
        Return_Date: returnDate,
        STO_No: stoNo,
        In_Date: this.datePipe.transform(rawValue.In_Date, 'yyyy-MM-dd') || '',
        CHK_ExpireDate: this.datePipe.transform(rawValue.CHK_ExpireDate, 'yyyy-MM-dd') || undefined,
        Return_EDate: this.datePipe.transform(rawValue.Return_EDate, 'yyyy-MM-dd') || undefined,
        CHK_Amt: rawValue.CHK_Amt ? Number(rawValue.CHK_Amt) : 0,
        Talent_Id: rawValue.Talent_Id ? Number(rawValue.Talent_Id) : undefined,
      };

      const $req = this.isFormCreateable
        ? this.fin35010Service.insertFIN35010(formattedBody)
        : this.fin35010Service.updateFIN35010(formattedBody);

      $req.pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this)
      ).subscribe(res => {
        this.messageService.successBubble(res.Message);
        this.onCancel();
      });
    });
  }

  // 保留此方法，供單筆模式使用
  private getTargetStatus(updateType: UpdateType | string): string {
    switch (String(updateType)) {
      case '1': return '1'; // 繳票 -> 已繳票
      case '2': return '0'; // 取消繳票 -> 未繳票
      case '3': return '2'; // 退票 -> 已退票
      case '4': return '1'; // 取消退票 -> 已繳票
      default: return '0';
    }
  }

  dialogVisible = false;
  dialogData: FIN35010TLTResponse[] = [];
  selectedItemsDialog: FIN35010TLTResponse[] = [];
  dialogColumns: ReportColumn[] = [
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'TLT_Name', header: '專櫃名稱' },
    { field: 'tlt_bdate', header: '合約起始日期', format: formatDate },
    { field: 'tlt_edate', header: '合約終止日期', format: formatDate },
    { field: 'org_id', header: '組織編號' },
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'CHK_Type', header: '票據種類', format: (v) => getSYS1000('CHK_TYPE', v) },
    { field: 'CHK_Amt', header: '票據金額', format: formatAmount },
  ];
  totalRecords = 0;
  lastQueryBody: FIN35010TLTRequest | null = null;
  isRowSelectable(row: FIN35010TLTResponse): boolean {
    return !this.data || !this.data.some(item => item.Talent_Id === row.talent_id);
  }
  dialogQueryForm = this.formBuilder.group({
    Deposit_Type: [null as string | null],
    query_date: [null as string | null, [Validators.required]],
    tlt_no: [null as string | null],
    ven_no: [null as string | null],
    org_id: [null as string | null],
    pageIndex: [1],
    pageSize: [30],
  })
  dialogSubmitted = false;
  dialogLoading = false;
  onQuery(frm: FormGroup) {
    this.dialogSubmitted = true;
    this.dialogLoading = true;
    if (frm?.invalid) {
      this.dialogLoading = false;
      return;
    }
    const rawValue = frm.getRawValue();
    const body: FIN35010TLTRequest = {
      ...rawValue,
      Deposit_Type: rawValue.Deposit_Type || undefined,
      query_date: rawValue.query_date ? this.datePipe.transform(rawValue.query_date, 'yyyy-MM-dd') || undefined : undefined,
      tlt_no: rawValue.tlt_no || undefined,
      ven_no: rawValue.ven_no || undefined,
      org_id: rawValue.org_id || undefined,
    };
    this.fin35010Service.queryFIN35010TLTTALENT(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(res => {
      this.dialogData = res.Data;
      this.totalRecords = res.TotalCount;
      this.lastQueryBody = body;
    });
  }
  saveDialog() {
    this.dialogVisible = false;

    // 進行欄位轉換 Mapping
    const mappedItems: FIN35010DetailResponse[] = this.selectedItemsDialog.map(item => ({
      // 基礎/預設欄位
      Id: 0, // 新增的資料通常 ID 為 0 或 null
      STO_No: item.STO_No,
      Deposit_Mode: item.Deposit_Mode || '1',
      Data_Source: item.Data_Source || '1',
      In_Date: item.In_Date,
      Deposit_Type: item.Deposit_Type,
      CHK_Type: item.CHK_Type,
      Status: item.Status || '0',

      // 關鍵業務欄位
      CHK_No: '', // 專櫃查詢結果通常沒有票號，需讓使用者後續在 Table 補齊
      CHK_Amt: item.CHK_Amt,
      CHK_ExpireDate: '',
      Deposit_Date: '',
      Return_Date: '',

      // 廠商與櫃位資訊 (注意大小寫轉換)
      VEN_No: item.VEN_No,
      VEN_Name: item.VEN_Name,
      TLT_No: item.tlt_no,       // TLTResponse 是 tlt_no -> DetailResponse 是 TLT_No
      Talent_Id: item.talent_id,
      Org_Id: item.org_id,
      TLT_Name: item.TLT_Name,
      tlt_bdate: item.tlt_bdate, // TLTResponse 是 tlt_bdate -> DetailResponse 是 TLT_BDate
      tlt_edate: item.tlt_edate,
      Return_EDate: '',
      Return_Get_Person: '',
      Remark: ''
    }));

    // 合併到現有的 data 列表
    this.data = [
      ...this.data,
      ...mappedItems
    ];

    // 清空選擇項
    this.selectedItemsDialog = [];
    this.selectedItems = [];
    this.cdr.detectChanges();
  }
}
