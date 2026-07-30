import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CustomFooterTableComponent } from '@others/component/custom-footer-table/customFooterTable.component';
import { formatAmount } from '@others/component/table/table.model';
import { validateRequired } from '@others/component/table/validate-field.model';
import { Fin33010Service } from '@service/api/fin/fin33010.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

@Component({
  selector: 'app-fin33010-cru',
  templateUrl: './fin33010-cru.component.html',
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
    CustomFooterTableComponent,
    DatePipe
  ]
})
export class FIN33010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  @ViewChild(TableEditComponent) tableEditComponent?: TableEditComponent;
  dataForm = this.formBuilder.nonNullable.group({
    WSLIP_NO: [{ value: '系統自動產生', disabled: true }],  // 匯款單號
    INV_YN: ['Y'],                     // 補發票與否
    VouType: ['3'],                    // 傳票種類
    VouDate: [''],                     // 傳票日期
    Remark: [''],                         // 傳票摘要
    PostFlag: ['1'],                     // 傳票狀態
    CRT_USR_No: [''],                // 建立人員
    CRT_Date: [''],                  // 建立日期
    VoucherType: ['RC'],              // 傳票種類
  });

  // 傳票型態
  vouTypeOptions: IDropdownItem[] = [
    { No: '1', Name: '現金收入' },
    { No: '2', Name: '現金支出' },
    { No: '3', Name: '轉帳傳票' }
  ];
  // 傳票種類
  srcSheetTypeOptions: IDropdownItem[] = [];
  // 傳票狀態
  postFlagOptions: IDropdownItem[] = [
    { No: '0', Name: '作廢' },
    { No: '1', Name: '建立' },
    { No: '2', Name: '確認' },
    { No: '3', Name: '過帳' }
  ];
  INV_YNOptions: IDropdownItem[] = [
    { No: 'Y', Name: '補發票' },
    { No: 'N', Name: '不補發票' }
  ];
  // 組織代碼下拉
  Org_IdOptions: IDropdownItem[] = [];
  editData: any[] = [];
  originalEditData: any[] = [];
  selectedItems: any[] = [];
  editFooterData = {
    D_Amt: 0, // 借方總金額
    C_Amt: 0, // 貸方總金額
  }

  editColumns: EditColumn[] = [
    // { field: 'dc', header: '借/貸' },
    { field: 'AccNo', header: '會計科目代號' },
    { field: 'AccCName', header: '會計科目名稱' },
    { field: 'Ven_No', header: '廠商編號' },
    { field: 'NoteDesc', header: '摘要', type: 'input', validate: [validateRequired], width: '250px' },
    {
      field: 'D_Amt', header: '借方金額',
      format: (v, i, r) => {
        if (r?.AccDC) {
          // 一般資料行
          return r.AccDC === 'D' ? formatAmount(r.AccAmt) : '0';
        } else {
          // footer 資料
          return v ? formatAmount(v) : '0';
        }
      },
    },
    {
      field: 'C_Amt', header: '貸方金額',
      format: (v, i, r) => {
        if (r?.AccDC) {
          return r.AccDC === 'C' ? formatAmount(r.AccAmt) : '0';
        } else {
          return v ? formatAmount(v) : '0';
        }
      }
    },
    {
      field: 'Org_Id',
      header: '組織代碼',
      type: 'dropdown',
      width: '15rem',
      options: () => this.Org_IdOptions,
      optionLabel: 'label',
      optionValue: 'value',
      // 僅當 DC 為 'D' 時可編輯
      disabled: (value, index, rowData) => (rowData?.dc || rowData?.DC) !== 'D',
      format: (value: string) =>
        this.Org_IdOptions.find((option) => option.value === value || option.No === value)?.label || value,
    },
    { field: 'PTA', header: '立沖代號' },
    { field: '?', header: '活動代號' },
    { field: '?', header: '對象別編號' },

  ];
  detailData: any[] = [];
  totalRecords = 0;
  detailFooterData: any[] = [];


  constructor(

    private dropDownListService: DropDownListService,
    private fin33010Service: Fin33010Service,
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN33010', this.dataForm);

    // 只開放「傳票摘要」欄位可編輯，其餘維持唯讀
    this.dataForm.get('Remark')?.enable({ emitEvent: false });

    const details = this.queryData?.details as any[] | undefined;
    if (Array.isArray(details) && details.length) {
      this.editData = details;
      // 儲存一份原始資料快照，供取消時還原
      this.originalEditData = JSON.parse(JSON.stringify(details));
      this.editFooterData = {
        D_Amt: details.reduce((sum, r) => sum + (Number(r.D_Amt) || 0), 0),
        C_Amt: details.reduce((sum, r) => sum + (Number(r.C_Amt) || 0), 0),
      };
      this.totalRecords = details.length;
    }

    // 將查詢畫面輸入的傳票日期帶入 CRU 顯示
    const queryForm = this.queryData?.form as { VouDate?: any } | undefined;
    if (queryForm?.VouDate) {
      this.dataForm.patchValue({ VouDate: queryForm.VouDate });
    }

    // 載入傳票種類
    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'entry_type' })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.srcSheetTypeOptions = response.Data;
      });

    // 載入組織代碼下拉選單 (SYS3100)
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.Org_IdOptions = (response.Data || []).map(item => ({
          ...item,
          value: item.No,
          label: `${item.No}-${item.Name}`,
        }));

        // 重新指定一次資料參考，讓 TableEdit 以已載入的 Org_IdOptions 重算顯示文字
        if (this.editData && this.editData.length) {
          this.editData = [...this.editData];
        }
      });

  }

  // 當按下取消或清除時，呼叫此方法還原明細及其他狀態
  onReset(): void {
    // 還原 editData 為初始快照
    if (this.originalEditData && this.originalEditData.length) {
      this.editData = JSON.parse(JSON.stringify(this.originalEditData));
      this.editFooterData = {
        D_Amt: this.editData.reduce((sum, r) => sum + (Number(r.D_Amt) || 0), 0),
        C_Amt: this.editData.reduce((sum, r) => sum + (Number(r.C_Amt) || 0), 0),
      };
      this.totalRecords = this.editData.length;
    } else {
      this.editData = [];
      this.editFooterData = { D_Amt: 0, C_Amt: 0 };
      this.totalRecords = 0;
    }
    // 清除已選擇項
    this.selectedItems = [];

    // 強制通知 TableEditComponent 重新初始化內部資料 (避免 Service 判定為已同步而跳過初始化)
    const te = this.tableEditComponent as any;
    if (te && te.dataService && typeof te.dataService.initializeData === 'function') {
      try {
        te.dataService.initializeData(
          this.editData,
          te.columns || this.editColumns,
          te.dataKey || '_TABLE_KEY',
          te.dataStatusField || '_dataStatus',
          te.dataStatusValue || { Original: 'original', New: 'new', Modified: 'modified', Deleted: 'deleted' },
          te.keepDeletedData || false,
          te.canInsert || false,
          te.rowValidate || undefined,
          te.defaultInsertData || {},
          te.disabled || false
        );
        // 觸發子元件變更檢測
        if (te.cdr && typeof te.cdr.detectChanges === 'function') te.cdr.detectChanges();
      } catch (e) {
        console.warn('force reinit table edit failed', e);
      }
    }
  }


  onSubmit(frm: FormGroup): void {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.invalid) {
      // 這個畫面目前沒有額外的 ReactiveForm 驗證規則
      this.loading = false;
      this.messageService.unblockUi();
      return;
    }

    const formValue = frm.getRawValue();
    // 以查詢時輸入的條件為主
    const queryForm = this.queryData?.form as { VouDate?: any; RCV_No?: string } | undefined;
    const queryVouDate = queryForm?.VouDate ?? null;

    if (!queryVouDate) {
      this.messageService.errorBubble('查詢的傳票日期不存在，請返回查詢頁重新查詢');
      this.loading = false;
      this.messageService.unblockUi();
      return;
    }

    const queryVouDateObj = typeof queryVouDate === 'string' ? new Date(queryVouDate) : queryVouDate;

    const rows = (this.editData || []).filter((r: any) => !r._isAutoInsertCandidate);

    const payload = {
      PageSize: 0,
      PageIndex: 0,
      OrderBy: '',
      Offset: 0,
      SortBy: [{ field: 'AccNo', order: 1 }],
      RCV_No: queryForm?.RCV_No ?? '',
      VouDate: queryVouDateObj ? queryVouDateObj.toISOString() : '',
      Details: rows.map((r: any) => ({
        SerNo: r.SerNo || '',
        DC: r.dc || r.DC || '',
        AccNo: r.AccNo || '',
        AccCName: r.AccCName || '',
        Ven_No: r.Ven_No || '',
        NoteDesc: r.NoteDesc || '',
        D_Amt: Number(r.D_Amt) || 0,
        C_Amt: Number(r.C_Amt) || 0,
        Org_Id: r.Org_Id || '',
        PTA: r.PTA || '',
        ProjectNo: r.ProjectNo || '',
        SubDetailNo: r.SubDetailNo || '',
      })),
    };

    this.fin33010Service.insertFIN33010(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
          this.submitted = false;
          this.messageService.unblockUi();
        }),
      )
      .subscribe({
        next: (res: any) => {
          if (res.Status === '0000' || res.Status === '0001') {
            const voucherNo = res.Data?.VouNo ?? res.Message ?? '';
            this.messageService.confirm({
              header: '新增成功',
              message: `傳票號碼：${voucherNo}`,
              icon: 'pi pi-check-circle',
              acceptLabel: '確定',
              showRejectButton: false,
              accept: () => this.onCancel(),
            });
          } else {
            this.messageService.errorBubble(res.Message || '儲存失敗');
          }
        },

      });
  }

}
