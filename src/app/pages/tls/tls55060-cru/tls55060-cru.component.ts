import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IDropdownItem } from '@service/utility/dropdown-api.model';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { Column, formatAmount, formatDate, LazyLoadEvent } from '@shared/componentkit/table/table.model';
import { validateRequired } from '@shared/componentkit/table/validate-field.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { TLS2C040Service } from '../../../service/api/tls/tls2c040.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-tls55060-cru',
  templateUrl: './tls55060-cru.component.html',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    TranslateModule,
    TableEditComponent,
    CustomFooterTableComponent
  ]
})
export class TLS55060CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    VouNo: [{ value: '', disabled: true }],                     // 傳票編號
    VouType: [{ value: '', disabled: true }],                   // 傳票種類
    SrcSheetType: [{ value: '', disabled: true }],              // 傳票型態
    VouDate: [{ value: '', disabled: true }],                   // 傳票日期
    Remark: ['', Validators.required],                          // 傳票摘要
    No: [{ value: '', disabled: true }],                        // 結帳單號
    PostFlag: [{ value: '', disabled: true }],                  // 傳票狀態
    CRT_USR_No: [{ value: '', disabled: true }],                // 建立人員
    CRT_Date: [{ value: '', disabled: true }],                  // 建立日期
    UPD_USR_No: [{ value: '', disabled: true }],                // 修改人員
    UPD_Date: [{ value: '', disabled: true }],                  // 修改日期
  });

  //#region 下拉選單選項
  // 傳票型態
  vouTypeOptions: IDropdownItem[] = [
    { No: '1', Name: '現金收入' },
    { No: '2', Name: '現金支出' },
    { No: '3', Name: '轉帳傳票' }
  ];
  // 傳票種類
  srcSheetTypeOptions: IDropdownItem[] = [];
  // 下拉選項快取
  orgOptions: IDropdownItem[] = [];
  accnoOptions: IDropdownItem[] = [];
  // 傳票狀態
  postFlagOptions: IDropdownItem[] = [
    { No: '0', Name: '作廢' },
    { No: '1', Name: '建立' },
    { No: '2', Name: '確認' },
    { No: '3', Name: '過帳' }
  ];
  //#endregion

  //#region 編輯明細table相關
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent
  editData: any[] = [];
  selectedItems: any[] = [];
  editFooterData = {
    debitAmount: 0, // 借方總金額
    creditAmount: 0, // 貸方總金額
  }

  // 將後端 YYYYMMDD 字串轉為 YYYY/MM/DD，讓共用 formatDate 可解析
  private toIsoDateString(val: any): string {
    if (!val) return '';
    if (typeof val === 'string' && /^\d{8}$/.test(val)) {
      return `${val.substring(0, 4)}/${val.substring(4, 6)}/${val.substring(6, 8)}`;
    }
    return val;
  }

  editColumns: EditColumn[] = [
    // { field: 'VOUNO', header: '應收帳款代號' },
    // { field: 'SrcSheetType', header: '專案代號' },
    { field: 'ORG_ID', header: '組織代碼', type: 'dropdown', options: this.orgOptions, optionLabel: 'Display', optionValue: 'No' },
    // { field: 'org_name', header: '組織名稱' },
    // { field: 'CustomerNo', header: '客戶代碼' },
    { field: 'DetailNo', header: '廠商代碼' },
    // { field: 'VouType', header: '傳票類型' },
    // { field: 'sam_yyymm', header: '年月', format: formatYYYYMM },
    // { field: 'sam_termno', header: '帳次' },
    { field: 'ap_amt', header: '應付帳款金額', textAlign: 'right', format: formatAmount },
    // { field: 'pta_amt', header: '沖帳金額', textAlign: 'right', format: formatAmount },
    { field: 'AccNo', header: '會計科目', type: 'dropdown', options: this.accnoOptions, optionLabel: 'Display', optionValue: 'No' },
    { field: 'ent_date', header: '立帳日期', format: formatDate },
    { field: 'perget_date', header: '預計收款日期', format: formatDate },
    { field: 'SrcVouNo', header: '原始憑證' },
    { field: 'NoteDesc', header: '備註', type: 'input', validate: [validateRequired], width: '250px' },
    { field: 'Ven_Uniform', header: '廠商統一編號' },
    { field: 'PTA', header: '立沖代號' },
    { field: 'AP_Status', header: '狀態' },
    // { field: 'Trans_Status', header: '抛轉應收狀態' }
  ];
  //#endregion

  //#region 檢視明細table相關
  detailData: any[] = [];
  totalRecords = 0;
  // detailFooterData 有時傳給 custom-footer-table（陣列），有時傳給 app-table-edit（物件）
  detailFooterData: any = null;

  detailColumns: Column[] = [
    // { field: 'VOUNO', header: '應收帳款代號', visible: true },
    // { field: 'SrcSheetType', header: '專案代號', visible: true },
    { field: 'org_id', header: '組織代碼', visible: true },
    { field: 'org_name', header: '組織名稱', visible: true },
    // { field: 'CustomerNo', header: '客戶代碼', visible: true },
    { field: 'DetailNo', header: '廠商代碼', visible: true },
    // { field: 'VouType', header: '傳票類型', visible: true },
    // { field: 'sam_yyymm', header: '年月', visible: true, format: formatYYYYMM },
    // { field: 'sam_termno', header: '帳次', visible: true },
    { field: 'ar_amt', header: '應收帳款金額', visible: true, isTotal: true, format: formatAmount },
    // { field: 'pta_amt', header: '沖帳金額', visible: true, format: formatAmount },
    { field: 'accno', header: '會計科目', visible: true },
    { field: 'ent_date', header: '立帳日期', visible: true, format: formatDate },
    { field: 'perget_date', header: '預計收款日期', visible: true, format: formatDate },
    { field: 'SrcVouNo', header: '原始憑證', visible: true },
    { field: 'notedesc', header: '備註', visible: true }
  ];
  //#endregion

  constructor(
    private tls2c040Service: TLS2C040Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS55060', this.dataForm);

    // 載入傳票種類
    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'entry_type' })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.srcSheetTypeOptions = response.Data;
      });

    // 載入組織下拉 (顯示 No-Name)
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(resp => {
        const mapped = (resp.Data || []).map((it: any) => ({
          ...it,
          No: String(it.No), // 確保為字串，避免型別差異
          Display: `${it.No}-${it.Name}`,
          label: `${it.No}-${it.Name}`
        }));
        // 就地更新陣列，保留原始引用給 editColumns.options
        this.orgOptions.splice(0, this.orgOptions.length, ...mapped);
        // 重新指派 editColumns 以觸發下拉 cell 重新渲染，避免只 mutation 無法更新子元件快取
        this.editColumns = this.editColumns.map(col => col.field === 'ORG_ID' ? { ...col, options: this.orgOptions } : col);
      });

    // 載入會計科目下拉 (顯示 No-Name)
    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(resp => {
        const mapped = (resp.Data || []).map((it: any) => ({
          ...it,
          No: String(it.No), // 確保為字串
          Display: `${it.No}-${it.Name}`,
          label: `${it.No}-${it.Name}`
        }));
        this.accnoOptions.splice(0, this.accnoOptions.length, ...mapped);
        // 重新指派 editColumns 以觸發下拉 cell 重新渲染
        this.editColumns = this.editColumns.map(col => col.field === 'AccNo' ? { ...col, options: this.accnoOptions } : col);
      });

    // 編輯時 帶回明細資料
    if (this.crudstatus === CRUDStatus.Edit) {
      this.editData = this.rowdata._GLS6002List;
      this.editFooterData.debitAmount = this.totalDebitAmount;
      this.editFooterData.creditAmount = this.totalCreditAmount;
    }

    // 檢視時：依 queryData 決定要呼叫哪個 API
    if (this.crudstatus === CRUDStatus.Read) {
      this.loading = true;
      if (this.queryData === '應付') {
        // 直接呼叫應付明細 API
        const req = { PageSize: 0, PageIndex: 0, OrderBy: '', Offset: 0, SortBy: [], id: this.rowdata.id ?? 0 };
        this.tls2c040Service.queryTLS2C040_GLS6005(req)
          .pipe(untilDestroyed(this), finalize(() => { this.loading = false; }))
          .subscribe(resp => {
            const rawList = resp.Data?._GLS6005List ?? [];
            const list = rawList.map((d: any) => ({
              ...d,
              ent_date: this.toIsoDateString(d.ent_date),
              perget_date: this.toIsoDateString(d.perget_date)
            }));
            this.detailData = list;
            this.totalRecords = resp.TotalCount ?? (this.detailData.length || 0);
            this.detailFooterData = { ap_amt: resp.Data?.Total_AP_Amt };
            this.editData = (list || []).map((d: any) => ({
              ...d,
              ORG_ID: d.org_id != null ? String(d.org_id) : d.org_id,
              AccNo: d.accno != null ? String(d.accno) : d.accno,
              NoteDesc: d.notedesc
            }));
          });
      } else if (this.queryData === '應收') {
        // 使用主查詢先取主檔與分錄（若主檔無明細再 fallback 到 GLS6004）
        const mainReq = { id: this.rowdata?.id ?? 0, PageSize: 1, PageIndex: 1, SortBy: [] };
        this.tls2c040Service.queryTLS2C040(mainReq)
          .pipe(untilDestroyed(this), finalize(() => { this.loading = false; }))
          .subscribe(response => {
            const main = (response.Data && response.Data.length) ? response.Data[0] : null;
            if (main) {
              this.rowdata = main as any;
              try {
                if (this.dataForm.disabled) this.dataForm.enable();
                this.dataForm.patchValue({
                  VouNo: main.VouNo,
                  VouType: main.VouType,
                  SrcSheetType: main.SrcSheetType,
                  VouDate: main.VouDate,
                  Remark: main.Remark,
                  No: main.No,
                  PostFlag: main.PostFlag,
                  CRT_USR_No: main.CRT_USR_No,
                  CRT_Date: main.CRT_Date,
                  UPD_USR_No: main.UPD_USR_No,
                  UPD_Date: main.UPD_Date
                });
              } finally { if (!this.useReadonlyInsteadOfDisable) this.dataForm.disable(); }

              const mainDetails = main._GLS6002List ?? [];
              const details = (mainDetails || []).map((d: any) => ({
                ...d,
                ent_date: this.toIsoDateString(d.ent_date),
                perget_date: this.toIsoDateString(d.perget_date)
              }));

              if (details.length) {
                this.detailData = details;
                this.totalRecords = details.length;
                this.detailFooterData = [{ group_name: '總計', ar_amt: details.reduce((s: number, r: any) => s + (Number(r.ar_amt) || 0), 0) }];
              } else {
                const req = { id: this.rowdata.id, PageSize: 20, PageIndex: 0, SortBy: [] };
                this.tls2c040Service.queryTLS2C040_GLS6004(req)
                  .pipe(untilDestroyed(this), finalize(() => this.loading = false))
                  .subscribe(resp => {
                    const list = (resp.Data._GLS6004List || []).map((d: any) => ({
                      ...d,
                      ent_date: this.toIsoDateString(d.ent_date),
                      perget_date: this.toIsoDateString(d.perget_date)
                    }));
                    this.detailData = list;
                    this.totalRecords = resp.TotalCount;
                    this.detailFooterData = [{ group_name: '總計', ar_amt: resp.Data.Total_ar_amt }];
                  });
              }
            }
          });
      } else {
        // 其他情況，使用主查詢以確保表單有主檔資料
        const mainReq = { id: this.rowdata?.id ?? 0, PageSize: 1, PageIndex: 1, SortBy: [] };
        this.tls2c040Service.queryTLS2C040(mainReq)
          .pipe(untilDestroyed(this), finalize(() => { this.loading = false; }))
          .subscribe(response => {
            const main = (response.Data && response.Data.length) ? response.Data[0] : null;
            if (main) {
              this.rowdata = main as any;
              try {
                if (this.dataForm.disabled) this.dataForm.enable();
                this.dataForm.patchValue({
                  VouNo: main.VouNo,
                  VouType: main.VouType,
                  SrcSheetType: main.SrcSheetType,
                  VouDate: main.VouDate,
                  Remark: main.Remark,
                  No: main.No,
                  PostFlag: main.PostFlag,
                  CRT_USR_No: main.CRT_USR_No,
                  CRT_Date: main.CRT_Date,
                  UPD_USR_No: main.UPD_USR_No,
                  UPD_Date: main.UPD_Date
                });
              } finally { if (!this.useReadonlyInsteadOfDisable) this.dataForm.disable(); }
            }
          });
      }
    }
  }

  // 處理 table lazy load（分頁/排序）事件
  override onLazyLoadData(event: LazyLoadEvent, form: FormGroup): void {
    // 更新表單的分頁/排序欄位，方便其他邏輯使用（若有）
    form.patchValue({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      SortBy: event.SortBy
    });

    // 由後端查詢指定頁面的應收/應付明細
    const raw = form.getRawValue();
    const req = {
      id: this.rowdata.id,
      PageSize: raw.pageSize ?? event.pageSize ?? 20,
      PageIndex: raw.pageIndex ?? event.pageIndex ?? 1,
      SortBy: raw.SortBy ?? event.SortBy ?? []
    };
    this.loading = true;
    this.tls2c040Service.queryTLS2C040_GLS6004(req)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(response => {
        this.detailData = response.Data?._GLS6004List ?? [];
        this.totalRecords = response.TotalCount ?? (this.detailData.length || 0);
        this.detailFooterData = [{ group_name: '總計', ar_amt: response.Data?.Total_ar_amt }];
      });
  }

  onSubmit(form: FormGroup): void {
    const formValue = form.getRawValue();
    // 送出前先驗證明細table
    const valid = this.tableEditComponent.validateAndShowErrors()
    if (!valid) {
      this.loading = false
      return;
    }
    // 若為檢視且是應付，直接使用 editData 呼叫更新 API（handleSubmit 在 Read 模式不會執行 callback）
    if (this.crudstatus === CRUDStatus.Read && this.queryData === '應付') {
      this.messageService.blockUi();
      this.loading = true;
      const build = this.buildGLS6002List(this.editData);
      if (build.invalidIndex >= 0) {
        this.messageService.unblockUi();
        this.loading = false;
        this.messageService.warnBubble(`第 ${build.invalidIndex + 1} 筆會計科目不可為空`);
        return;
      }

      const updateRequest = {
        id: this.rowdata.id,
        Remark: formValue.Remark || '',
        GLS6002List: build.list
      };

      this.tls2c040Service.updateTLS2C040(updateRequest)
        .pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
        .subscribe(() => {
          this.messageService.successBubble('應付明細已更新');
          this.onCancel();
        });

      return;
    }

    this.handleSubmit(form, () => {
      // 更新傳票摘要或應付明細（Edit 模式或 Read+應付 模式）
      if (this.crudstatus === CRUDStatus.Edit) {
        // 在 Edit 模式下，若為 應付 (queryData === '應付') 不允許更新
        if (this.queryData === '應付') {
          this.messageService.warnBubble('應付模式下不可於編輯模式更新');
          this.loading = false;
          return;
        }

        if (this.canEdit()) {
          const build = this.buildGLS6002List(this.editData);
          if (build.invalidIndex >= 0) {
            this.loading = false;
            this.messageService.warnBubble(`第 ${build.invalidIndex + 1} 筆會計科目不可為空`);
            return;
          }

          const updateRequest = {
            id: this.rowdata.id,
            Remark: formValue.Remark || '',
            GLS6002List: build.list
          };

          this.tls2c040Service.updateTLS2C040(updateRequest)
            .pipe(untilDestroyed(this), finalize(() => this.loading = false))
            .subscribe(() => {
              this.messageService.successBubble('修改成功');
              this.onCancel();
            });
        }
      }
      // 若為檢視且是 應付，使用 editData 送出更新（允許直接在檢視中修改應付明細）
      else if (this.crudstatus === CRUDStatus.Read && this.queryData === '應付') {
        const build = this.buildGLS6002List(this.editData);
        if (build.invalidIndex >= 0) {
          this.loading = false;
          this.messageService.warnBubble(`第 ${build.invalidIndex + 1} 筆會計科目不可為空`);
          return;
        }

        const updateRequest = {
          id: this.rowdata.id,
          Remark: formValue.Remark || '',
          GLS6002List: build.list
        };

        this.tls2c040Service.updateTLS2C040(updateRequest)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(() => {
            this.messageService.successBubble('應付明細已更新');
            this.onCancel();
          });
      }
    });
  }

  // 將 editData 轉成後端要的 GLS6002List，同時驗證必填欄位（例如 AccNo 不可為 null/空）
  private buildGLS6002List(data: any[]): { list: any[]; invalidIndex: number } {
    const list = (data || []).map((d: any) => ({
      id: d.id ?? null,
      NoteDesc: d.NoteDesc ?? d.notedesc ?? '',
      AccNo: d.AccNo != null ? String(d.AccNo) : (d.accno != null ? String(d.accno) : null),
      ORG_ID: d.ORG_ID != null ? String(d.ORG_ID) : (d.org_id != null ? String(d.org_id) : null)
    }));

    const invalidIndex = list.findIndex(item => item.AccNo === null || item.AccNo === undefined || String(item.AccNo).trim() === '');
    return { list, invalidIndex };
  }

  get totalDebitAmount() {
    return this.editData.reduce((sum, item) => sum + (item.AccDC === 'D' ? item.AccAmt : 0), 0);
  }

  get totalCreditAmount() {
    return this.editData.reduce((sum, item) => sum + (item.AccDC === 'C' ? item.AccAmt : 0), 0);
  }
}
