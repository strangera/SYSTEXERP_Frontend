import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
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
  // 下拉選單選項
  vouTypeOptions = getSYS1000Options('VouType')// 傳票型態
  srcSheetTypeOptions = getSYS1000Options('ENTRY_TYPE')// 傳票種類
  postFlagOptions = getSYS1000Options('PostFlag')// 傳票狀態
  orgOptions$ = this.dropDown.querySys3100();
  accnoOptions$ = this.dropDown.queryGls1005();
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
    { field: 'ORG_ID', header: '組織代碼', type: 'dropdown', optionsAsync: true, options: this.orgOptions$, optionLabel: 'label', optionValue: 'value' },
    { field: 'DetailNo', header: '廠商代碼' },
    { field: 'ap_amt', header: '應付帳款金額', textAlign: 'right', format: formatAmount },
    { field: 'AccNo', header: '會計科目', type: 'dropdown', optionsAsync: true, options: this.accnoOptions$, optionLabel: 'label', optionValue: 'value' },
    { field: 'ent_date', header: '立帳日期', format: formatDate },
    { field: 'perget_date', header: '預計收款日期', format: formatDate },
    { field: 'SrcVouNo', header: '原始憑證' },
    { field: 'NoteDesc', header: '備註', type: 'input', validate: [validateRequired], width: '250px' },
    { field: 'Ven_Uniform', header: '廠商統一編號' },
    { field: 'PTA', header: '立沖代號' },
    { field: 'AP_Status', header: '狀態' },
  ];
  detailData: any[] = [];
  totalRecords = 0;
  detailFooterData: any = null;
  detailColumns: Column[] = [
    { field: 'org_id', header: '組織代碼', visible: true },
    { field: 'org_name', header: '組織名稱', visible: true },
    { field: 'DetailNo', header: '廠商代碼', visible: true },
    { field: 'ar_amt', header: '應收帳款金額', visible: true, isTotal: true, format: formatAmount },
    { field: 'accno', header: '會計科目', visible: true },
    { field: 'ent_date', header: '立帳日期', visible: true, format: formatDate },
    { field: 'perget_date', header: '預計收款日期', visible: true, format: formatDate },
    { field: 'SrcVouNo', header: '原始憑證', visible: true },
    { field: 'notedesc', header: '備註', visible: true }
  ];
  constructor(
    private tls2c040Service: TLS2C040Service,
    private dropDown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS55060', this.dataForm);
    console.log(this.rowdata)
    // 編輯時 帶回明細資料
    if (this.isFormEditable) {
      this.editData = this.rowdata._GLS6002List;
      this.editFooterData.debitAmount = this.editData.reduce((sum, item) => sum + (item.AccDC === 'D' ? item.AccAmt : 0), 0);
      this.editFooterData.creditAmount = this.editData.reduce((sum, item) => sum + (item.AccDC === 'C' ? item.AccAmt : 0), 0);
    }
    // 檢視時：依 queryData 決定要呼叫哪個 API
    if (this.crudstatus === CRUDStatus.Read) {
      if (this.queryData === '應付') {
        // 直接呼叫應付明細 API
        this.tls2c040Service.queryTLS2C040_GLS6005(this.rowdata).pipe(untilDestroyed(this)).subscribe(resp => {
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
        this.tls2c040Service.queryTLS2C040_GLS6004(this.rowdata).pipe(untilDestroyed(this)).subscribe(response => {
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
              this.tls2c040Service.queryTLS2C040_GLS6004(this.rowdata).pipe(untilDestroyed(this)).subscribe(resp => {
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
        this.tls2c040Service.queryTLS2C040(this.rowdata).pipe(untilDestroyed(this)).subscribe(response => {
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
    this.tls2c040Service.queryTLS2C040_GLS6004(req).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
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
      this.tls2c040Service.updateTLS2C040(updateRequest).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(() => {
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
          this.tls2c040Service.updateTLS2C040(updateRequest).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(() => {
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
        this.tls2c040Service.updateTLS2C040(updateRequest).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(() => {
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
}
