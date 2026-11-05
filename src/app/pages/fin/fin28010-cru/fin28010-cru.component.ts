import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { formatAmount } from '@others/component/table/table.model';
import { validateRequired } from '@others/component/table/validate-field.model';
import { Fin28010Service } from '@service/api/fin/fin28010.service';
import { IDropdownItem } from '@service/utility/dropdown-api.model';
import { DropDownListService } from '@service/utility/dropDownList.service';
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
  selector: 'app-fin28010-cru',
  templateUrl: './fin28010-cru.component.html',
  standalone: true,
  imports: [
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
  ]
})
export class FIN28010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    WSLIP_NO: [{ value: '系統自動產生', disabled: true }],  // 匯款單號
    INV_YN: ['Y'],                     // 補發票與否
    VouType: ['3'],                    // 傳票種類
    VouDate: [''],                     // 傳票日期
    Remark: [''],                         // 傳票摘要
    PostFlag: ['1'],                     // 傳票狀態
    CRT_USR_No: [''],                // 建立人員
    CRT_Date: [''],                  // 建立日期
    VoucherType: ['RM'],              // 傳票種類
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
  editData: any[] = [];
  // 保存查詢帶入的原始明細複本，用於還原
  private originalDetails: any[] = [];
  selectedItems: any[] = [];
  editFooterData = {
    d_amt: 0, // 借方總金額
    c_amt: 0, // 貸方總金額
  }

  editColumns: EditColumn[] = [
    {
      field: 'dc', header: '借/貸',
      format: (v: any, i?: any, r?: any) => {
        if (v === 1 || v === '1') return '借';
        if (v === 2 || v === '2') return '貸';
        return v ?? '';
      }
    },
    { field: 'AccNo', header: '會計科目' },
    { field: 'AccCName', header: '會計科目名稱' },
    { field: 'NoteDesc', header: '摘要', type: 'input', validate: [validateRequired], width: '250px' },
    {
      field: 'd_amt', header: '借方金額',
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
      field: 'c_amt', header: '貸方金額',
      format: (v, i, r) => {
        if (r?.AccDC) {
          return r.AccDC === 'C' ? formatAmount(r.AccAmt) : '0';
        } else {
          return v ? formatAmount(v) : '0';
        }
      }
    },
    { field: 'org_id', header: '組織代碼' },
    { field: 'VEN_No', header: '廠商/員工編號' },
    { field: 'PTA', header: '立沖代號' }
  ];
  detailData: any[] = [];
  totalRecords = 0;
  detailFooterData: any[] = [];


  constructor(

    private dropDownListService: DropDownListService,
    private fin28010Service: Fin28010Service,
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN28010', this.dataForm);

    // 只開放「傳票摘要」欄位可編輯，其餘維持唯讀
    this.dataForm.get('Remark')?.enable({ emitEvent: false });

    // // 確保傳票型態 VoucherType 為下拉可選（不要唯讀）
    // this.dataForm.get('VoucherType')?.enable({ emitEvent: false });

    const details = this.queryData?.details as any[] | undefined;
    if (Array.isArray(details) && details.length) {
      // 儲存原始的複本，避免之後在編輯時修改原始資料來源
      this.originalDetails = details.map(d => ({ ...d }));
      this.editData = this.originalDetails.map(d => ({ ...d }));
      this.editFooterData = {
        d_amt: this.originalDetails.reduce((sum, r) => sum + (Number(r.d_amt) || 0), 0),
        c_amt: this.originalDetails.reduce((sum, r) => sum + (Number(r.c_amt) || 0), 0),
      };
      this.totalRecords = this.originalDetails.length;
    }

    // 將查詢畫面輸入的傳票日期帶入 CRU 顯示
    const queryForm = this.queryData?.form as { VouDate?: any } | undefined;
    if (queryForm?.VouDate) {
      this.dataForm.patchValue({ VouDate: queryForm.VouDate });
    }

    // 載入傳票種類，顯示為 No-Name
    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'entry_type' })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.srcSheetTypeOptions = (response.Data || []).map((item: any) => ({
          ...item,
          Name: `${item.No}-${item.Name}`,
        }));
      });

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
    // 以查詢時輸入的日期與匯款單號為主
    const queryForm = this.queryData?.form as { WSLIP_NO?: string; VouDate?: Date | string } | undefined;
    const queryVouDate = queryForm?.VouDate ?? null;
    const queryWslipNo = queryForm?.WSLIP_NO ?? '';

    if (!queryVouDate) {
      this.messageService.errorBubble('查詢的傳票日期不存在，請返回查詢頁重新查詢');
      this.loading = false;
      this.messageService.unblockUi();
      return;
    }

    const queryVouDateObj = typeof queryVouDate === 'string' ? new Date(queryVouDate) : queryVouDate;
    const vouDateString = this.datePipe.transform(queryVouDateObj, 'yyyy-MM-dd');

    const rows = (this.editData || []).filter(r => !r._isAutoInsertCandidate);

    const payload = {
      WSLIP_NO: queryWslipNo,
      VouDate: vouDateString,
      VouType: formValue.VouType,
      PostFlag: formValue.PostFlag,
      VoucherType: formValue.VoucherType,
      INV_YN: formValue.INV_YN,
      Remark: formValue.Remark || '',
      GLS3002List: rows.map(r => ({
        dc: r.dc || '',
        AccNo: r.AccNo || '',
        d_amt: Number(r.d_amt) || 0,
        c_amt: Number(r.c_amt) || 0,
        org_id: r.org_id || '',
        VEN_No: r.VEN_No || '',
        NoteDesc: r.NoteDesc || '',
        PTA: r.PTA || '',
      })),
    };

    this.fin28010Service.insertFIN28010(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
          this.submitted = false;
          this.messageService.unblockUi();
        }),
      )
      .subscribe({
        next: (res) => {
          console.log('[FIN28010 insert response]', res);
          if (res.Status === '0000' || res.Status === '0001') {
            const vouNo = typeof res.Data === 'string' ? res.Data : (res.Data?.VouNo ?? '');
            this.messageService.confirm({
              header: '新增成功',
              message: vouNo ? `傳票編號為:${vouNo}` : (res.Message || '儲存成功'),
              acceptLabel: '回查詢畫面',
              showRejectButton: false,
              accept: () => this.onCancel(),
            });
          } else {
            this.messageService.errorBubble(res.Message || '儲存失敗');
          }
        },

      });
  }

  // 取消/還原：將編輯表格還原為原始查詢帶入的明細，並回復表單欄位
  // 還原編輯資料為查詢時的初始明細（由 originalDetails 提供）
  onRestore(): void {
    this.submitted = false;

    if (Array.isArray(this.originalDetails) && this.originalDetails.length) {
      this.editData = this.originalDetails.map(d => ({ ...d }));
      this.editFooterData = {
        d_amt: this.originalDetails.reduce((sum, r) => sum + (Number(r.d_amt) || 0), 0),
        c_amt: this.originalDetails.reduce((sum, r) => sum + (Number(r.c_amt) || 0), 0),
      };
      this.totalRecords = this.originalDetails.length;
    } else {
      this.editData = [];
      this.editFooterData = { d_amt: 0, c_amt: 0 };
      this.totalRecords = 0;
    }

    // 回填查詢時帶入的表單欄位（若有）
    const queryForm = this.queryData?.form as any | undefined;
    if (queryForm) {
      const restore: any = {};
      if (queryForm.VouDate !== undefined) restore.VouDate = queryForm.VouDate;
      if (queryForm.Remark !== undefined) restore.Remark = queryForm.Remark;
      try { this.dataForm.patchValue(restore); } catch (e) { /* ignore */ }
    }
  }

}
