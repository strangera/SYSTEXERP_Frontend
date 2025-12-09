import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN62030Data, FIN62030Service, InsertFIN62030Request, VoucherDetail } from '@service/api/fin/fin62030.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { formatAmount } from '@shared/componentkit/table/table.model';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-fin62030-cru',
  templateUrl: './fin62030-cru.component.html',
  styleUrl: './fin62030-cru.component.scss',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TranslateModule,
    CalendarComponent,
    TableEditComponent
  ]
})
export class FIN62030CRUComponent extends BasicCruPageComponent<FIN62030Data[]> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    VouNo: [{ value: '自動產生', disabled: true }],        // 傳票號碼
    VouType: [{ value: '', disabled: true }],      // 傳票種類 1:現金收入2:現金支出3:轉帳傳票 (固定為3)
    VouTypeName: [{ value: '', disabled: true }],  // 傳票種類名稱
    VoucherType: [{ value: '', disabled: true }],  // 傳票型態 固定為BT
    VouDate: [{ value: '', disabled: true }],      // 傳票日期
    Remark: [''],       // 傳票摘要
    CRT_USR_No: [{ value: '', disabled: true }],   // 建立者
    CRT_Date: [{ value: '', disabled: true }]      // 建立日
  });

  //#region 編輯Table相關
  @ViewChild('editTable') editTable!: TableEditComponent;
  data: VoucherDetail[] = [];
  selectedItems: VoucherDetail[] = [];
  columns: EditColumn[] = [];
  //#endregion

  // 下拉選單選項
  SYS3100_Options: any[] = [];
  AccNoOptions: any[] = [];

  constructor(
    private fin62030Service: FIN62030Service,
    private changeDetectorRef: ChangeDetectorRef,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN62030', this.dataForm);
    this.loadAndSetupColumns();
    this.loadPreviewData();
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const insertFIN62030Request: InsertFIN62030Request = {
        Tran_Nos: this.rowdata?.map(item => item.Tran_No!) || [],
        Remark: this.dataForm.get('Remark')?.value || '',
        tranNoDetails: this.data
      }
      console.log('insertFIN62030Request', insertFIN62030Request);
    });
  }

  // 加載下拉選項
  loadAndSetupColumns() {
    const orgOptions$ = this.dropDownListService.querySYS3100_DropDownList()
    const accNoOptions$ = this.dropDownListService.queryGLS1005_DropDownList()

    forkJoin([
      orgOptions$,
      accNoOptions$
    ]).pipe(untilDestroyed(this)).subscribe(([
      orgOptions,
      accNoOptions
    ]) => {
      this.SYS3100_Options = orgOptions.Data.map((x: { No: string; Name: string }) => ({ label: `${x.No} - ${x.Name}`, value: x.No }));
      this.AccNoOptions = accNoOptions.Data.map((x: { No: string; Name: string }) => ({ label: `${x.No} - ${x.Name}`, value: x.No }));
      this.columns = [
        {
          field: 'ACC_No',
          header: '科目代號',
          type: 'dropdown',
          options: this.AccNoOptions,
          optionLabel: 'label',
          optionValue: 'value',
          showClear: false,
          disabled: (value, index, rowData) => !(rowData.AccDC === 'D' && rowData.ACC_No === '612003')
        },
        { field: 'DetailNo', header: '廠商代號' },
        { field: 'NoteDesc', header: '摘要', type: 'input' },
        { field: 'Debit_Amt', header: '借方金額', format: formatAmount },
        { field: 'Credit_Amt', header: '貸方金額', format: formatAmount },
        {
          field: 'ORG_ID',
          header: '組織代碼',
          type: 'dropdown',
          options: this.SYS3100_Options,
          optionLabel: 'label',
          optionValue: 'value',
          showClear: false
        },
        // { field: 'ORG_Name', header: '組織名稱' },
        { field: 'PTA', header: '立沖代號' },
        { field: 'ProjectNo', header: '活動代號', type: 'input' },
        { field: 'SubDetailNo', header: '對象別編號', type: 'input' }
      ];
    });
  }

  loadPreviewData() {
    if (this.rowdata && this.rowdata.length > 0) {
      const Tran_Nos = this.rowdata.map(item => item.Tran_No!);
      this.fin62030Service.previewFIN62030({ Tran_Nos: Tran_Nos })
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe((response) => {
          this.dataForm.patchValue({
            VouType: response.Data?.VouType,
            VouTypeName: response.Data?.VouTypeName,
            VoucherType: response.Data?.VoucherType,
            VouDate: response.Data?.VouDate,
            Remark: response.Data?.Remark,
            CRT_USR_No: response.Data?.CRT_USR_No,
            CRT_Date: response.Data?.CRT_Date
          });
          this.data = response.Data?.voucherDetails || [];
        });
    }
  }
}
