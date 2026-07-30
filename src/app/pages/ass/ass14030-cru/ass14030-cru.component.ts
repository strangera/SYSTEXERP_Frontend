import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS14030Service } from '@service/api/ass/ass14030.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { formatAmount } from '@shared/components/table-report/table-report.model';
import { PanelModule } from 'primeng/panel';
import {
  ASS14030DetailItem,
  ASS14030QueryRow,
  UpdateASS14030DetailItem,
  UpdateASS14030Request,
} from '../ass14030/ass14030.model';

//3.1.4.3  傳票審核傳送作業 CRU
@Component({
  selector: 'app-ass14030-cru',
  templateUrl: './ass14030-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    ReactiveFormsModule,
    CalendarComponent,
    InputTextComponent,
    ButtonComponent,
    TableEditComponent,
    TranslateModule,
  ],
})
export class ASS14030CRUComponent extends BasicCruPageComponent<ASS14030QueryRow> implements OnInit {
  private readonly service = inject(ASS14030Service);
  private readonly dropdownApiService = inject(DropdownApiService);
  private readonly destroyRef = inject(DestroyRef);

  dataForm = this.formBuilder.group({
    VouNo: [{ value: '', disabled: true }], // 傳票編號
    Voucher_Name: [{ value: '', disabled: true }], // 傳票種類
    VouTypeName: [{ value: '', disabled: true }], // 傳票型態
    VouDate: [null as Date | null, [Validators.required]], // 傳票日期（可編輯）
    Remark: ['', [Validators.maxLength(200)]], // 傳票摘要（可編輯）
    ORI_SLIP: [{ value: '', disabled: true }], // 結帳單號
    PostFlagName: [{ value: '', disabled: true }], // 傳票狀態
    CRT_USR_Name: [{ value: '', disabled: true }], // 建立者
    CRT_Date: [{ value: '', disabled: true }], // 建立日
    UPD_USR_Name: [{ value: '', disabled: true }], // 修改者
    UPD_Date: [{ value: '', disabled: true }], // 修改日
  });

  /** 明細資料（table-edit 綁定） */
  data: ASS14030DetailItem[] = [];

  /** 科目代號下拉選項：GLS1005 會計科目設定檔 */
  accNoOptions = this.dropdownApiService.queryGls1005();
  /** 組織代號下拉選項：SYS3100 */
  orgIdOptions = this.dropdownApiService.querySys3100();

  detailColumns: EditColumn[] = [
    { field: 'SerNo', header: '序號', textAlign: 'center', width: '70px' },
    {
      field: 'AccNo', header: '科目代號', type: 'dropdown',
      optionLabel: 'label', optionValue: 'value',
      optionsAsync: true,
      options: () => this.accNoOptions,
    },
    {
      field: 'DetailNo', header: '廠商代號', textAlign: 'center',
      format: (value, _index, rowData) => rowData?.VEN_Name ? `${value ?? ''} ${rowData.VEN_Name}` : (value ?? ''),
    },
    { field: 'NoteDesc', header: '摘要', type: 'input', maxLength: 100 },
    { field: 'DebitAmt', header: '借方金額', textAlign: 'right', format: formatAmount, aggregate: 'sum' },
    { field: 'CreditAmt', header: '貸方金額', textAlign: 'right', format: formatAmount, aggregate: 'sum' },
    {
      field: 'ORG_ID', header: '組織代號', type: 'dropdown',
      optionLabel: 'label', optionValue: 'value',
      optionsAsync: true,
      options: () => this.orgIdOptions,
    },
    { field: 'ProjectNo', header: '活動代號', textAlign: 'center' },
    { field: 'PTA', header: '立沖代號', textAlign: 'center' },
    { field: 'SubDetailNo', header: '對象別編號', type: 'input', maxLength: 30 },
  ];

  private receiptInsId = '';

  ngOnInit(): void {
    this.initializePage('ASS14030');
    const receiptInsId = this.rowdata?.RECEIPT_INS_ID;
    if (!receiptInsId) {
      this.messageService.warnBubble('缺少發票維護單號，無法載入資料。');
      return;
    }
    this.receiptInsId = receiptInsId;
    this.loadDetail();
  }

  private loadDetail(): void {
    this.loading = true;
    this.service.queryASS14030Detail({ RECEIPT_INS_ID: this.receiptInsId }).pipe(
      this.withLoading(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(res => {
      const master = res.Data?.Master;
      if (!master) {
        this.messageService.warnBubble('查無此筆資料。');
        return;
      }
      this.dataForm.patchValue({
        VouNo: master.VouNo,
        Voucher_Name: master.Voucher_Name,
        VouTypeName: master.SrcSheetType,
        VouDate: master.VouDate ? new Date(master.VouDate) : null,
        Remark: master.Remark,
        ORI_SLIP: master.ORI_SLIP,
        PostFlagName: master.PostFlagName,
        CRT_USR_Name: master.CRT_USR_No ? `${master.CRT_USR_No} ${master.CRT_USR_Name ?? ''}` : master.CRT_USR_Name,
        CRT_Date: master.CRT_Date,
        UPD_USR_Name: master.UPD_USR_No ? `${master.UPD_USR_No} ${master.UPD_USR_Name ?? ''}` : master.UPD_USR_Name,
        UPD_Date: master.UPD_Date,
      });
      this.data = res.Data?.Details ?? [];
      if (this.isFormReadable) {
        this.dataForm.disable();
      }
    });
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const raw = this.dataForm.getRawValue();
      const payload: UpdateASS14030Request = {
        RECEIPT_INS_ID: this.receiptInsId,
        VouDate: this.formatLocalDate(raw.VouDate),
        Remark: raw.Remark || null,
        Details: this.toUpdateDetails(this.data),
      };
      this.service.updateASS14030(payload).pipe(
        this.withLoading(),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(res => {
        this.messageService.successBubble(res.Data?.ResultMessage || '儲存成功');
        this.onCancel();
      });
    });
  }

  private toUpdateDetails(rows: ASS14030DetailItem[]): UpdateASS14030DetailItem[] {
    return rows.map(row => ({
      GLS6002ID: row.GLS6002ID ?? 0,
      AccNo: row.AccNo ?? '',
      ORG_ID: row.ORG_ID ?? '',
      NoteDesc: row.NoteDesc ?? null,
      SubDetailNo: row.SubDetailNo ?? null,
      ReconcileKey: row.ReconcileKey ?? null,
    }));
  }

  private formatLocalDate(date: Date | null): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
