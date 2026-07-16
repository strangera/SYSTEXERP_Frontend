import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN55050Service } from '@service/api/fin/fin55050.service';
import { FIN62030Data, FIN62030Service, InsertFIN62030Request, VoucherDetail } from '@service/api/fin/fin62030.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateRequired } from '@shared/components/table-edit/validate-field.model';
import { formatAmount } from '@others/component/table/table.model';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-fin62030-cru',
  templateUrl: './fin62030-cru.component.html',
  standalone: true,
  imports: [
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
    VouNo: [{ value: '自動產生', disabled: true }],
    VouType: [{ value: '', disabled: true }],
    VouTypeName: [{ value: '', disabled: true }],
    VoucherType: [{ value: '', disabled: true }],
    VouDate: [null as Date | null],
    Remark: [''],
    CRT_USR_No: [{ value: '', disabled: true }],
    CRT_Date: [{ value: null as Date | null, disabled: true }]
  });

  //#region 編輯Table相關
  data: VoucherDetail[] = [];
  originalData: VoucherDetail[] = []; // 原始數據 還原用
  selectedItems: VoucherDetail[] = [];
  columns: EditColumn[] = [];
  //#endregion

  // 下拉選單選項
  SYS3100_Options: any[] = [];
  AccNoOptions: any[] = [];
  ProjectNoOptions: any[] = [];
  SubDetailNoOptions: any[] = [];

  constructor(
    private fin62030Service: FIN62030Service,
    private dropDownListService: DropDownListService,
    private fin55050Service: FIN55050Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN62030', this.dataForm);
    this.loadAndSetupColumns().add(() => {
      this.loadPreviewData();
    });
    setTimeout(() => {
      this.data = [
        {
          Tran_No: '1',
          AccDC: '1',
          SerNo: '1',
          ACC_No: '1',
          ACC_Name: '1',
          DetailNo: '1',
          NoteDesc: '1',
          Debit_Amt: 100,
          Credit_Amt: 0,
          ORG_ID: '1',
          ORG_Name: '1',
          PTA: '1',
          ProjectNo: '1',
          SubDetailNo: '1',
        },
        {
          Tran_No: '1',
          AccDC: '1',
          SerNo: '1',
          ACC_No: '1',
          ACC_Name: '1',
          DetailNo: '1',
          NoteDesc: '1',
          Debit_Amt: 0,
          Credit_Amt: 200,
          ORG_ID: '1',
          ORG_Name: '1',
          PTA: '1',
          ProjectNo: '1',
          SubDetailNo: '1',
        }
      ]
    }, 123);
  }
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      };
      // 2. 借貸平衡卡控
      // 計算借方與貸方的加總 (排除掉新增候選行)
      const totals = this.data.reduce((acc, curr) => {
        // 確保數值有效，若為 undefined 或 null 則視為 0
        const debit = Number(curr.Debit_Amt) || 0;
        const credit = Number(curr.Credit_Amt) || 0;
        return {
          debitSum: acc.debitSum + debit,
          creditSum: acc.creditSum + credit
        };
      }, { debitSum: 0, creditSum: 0 });
      console.log('totals', totals);

      // 判斷是否平衡 (ERP 系統通常建議使用誤差值判斷，或直接比較)
      if (totals.debitSum !== totals.creditSum) {
        this.messageService.errorBubble(`借貸不平衡！借方總計：${totals.debitSum}，貸方總計：${totals.creditSum}`, '驗證失敗');
        this.loading = false;
        return;
      }
      const insertFIN62030Request: InsertFIN62030Request = {
        Tran_Nos: this.rowdata?.map(item => item.Tran_No!) || [],
        Remark: this.dataForm.get('Remark')?.value || '',
        tranNoDetails: this.data.map(item => ({
          Tran_No: item.Tran_No,
          AccDC: item.AccDC,
          IsFee: item.AccDC === 'D' && item.ACC_No?.startsWith('612'),
          AccNo: item.ACC_No,
          NoteDesc: item.NoteDesc,
          ORG_ID: item.ORG_ID,
          ProjectNo: item.ProjectNo,
          SubDetailNo: item.SubDetailNo
        })) || []
      }
      console.log('insertFIN62030Request', insertFIN62030Request);
      this.fin62030Service.insertFIN62030(insertFIN62030Request)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(() => {
          this.messageService.successBubble('拋轉成功');
          this.onCancel();
        });
    });
  }

  // 加載下拉選項 並設定表格欄位
  loadAndSetupColumns() {
    const orgOptions$ = this.dropDownListService.querySYS3100_DropDownList();
    const accNoOptions$ = this.dropDownListService.queryGLS1005_DropDownList();
    const projectNoOptions$ = this.dropDownListService.queryTALPORDERM_DropDownList();
    const subDetailNoOptions$ = this.fin55050Service.queryGLS1016_DropDownList()


    return forkJoin([
      orgOptions$,
      accNoOptions$,
      projectNoOptions$,
      subDetailNoOptions$
    ]).pipe(untilDestroyed(this)).subscribe(([orgOptions, accNoOptions, projectNoOptions, subDetailNoOptions]) => {
      this.SYS3100_Options = orgOptions.Data.map((x: { No: string; Name: string }) => ({ label: `${x.No} - ${x.Name}`, value: x.No }));
      this.AccNoOptions = accNoOptions.Data.map((x: { No: string; Name: string }) => ({ label: `${x.No} - ${x.Name}`, value: x.No }));
      this.ProjectNoOptions = projectNoOptions.Data.map((x: { No: string; Name: string }) => ({ label: `${x.No} - ${x.Name}`, value: x.No }));
      this.SubDetailNoOptions = subDetailNoOptions.Data.map((x: { No: string; Name: string }) => ({ label: `${x.No} - ${x.Name}`, value: x.No }));
      // 設定表格欄位
      this.columns = [
        {
          field: 'ACC_No',
          header: '科目代號',
          // type: 'dropdown',
          // options: this.AccNoOptions,
          // optionLabel: 'label',
          // optionValue: 'value',
          // showClear: false,
          // disabled: (value: any, index?: number, rowData?: any) => !(rowData?._originalACC_No?.startsWith('612') && rowData?.AccDC === 'D')
        },
        { field: 'DetailNo', header: '廠商編號' },
        { field: 'NoteDesc', header: '摘要', type: 'input' },
        { field: 'Debit_Amt', header: '借方金額', format: formatAmount, aggregate: 'sum' },
        { field: 'Credit_Amt', header: '貸方金額', format: formatAmount, aggregate: 'sum' },
        {
          field: 'ORG_ID',
          header: '組織代號',
          type: 'dropdown',
          options: this.SYS3100_Options,
          optionLabel: 'label',
          optionValue: 'value',
          showClear: false,
          validate: [validateRequired]
        },
        { field: 'PTA', header: '立沖代號' },
        {
          field: 'ProjectNo',
          header: '活動代號',
          type: 'dropdown',
          options: this.ProjectNoOptions,
          optionLabel: 'label',
          optionValue: 'value',
          showClear: false
        },
        {
          field: 'SubDetailNo',
          header: '對象別編號',
          type: 'dropdown',
          options: () => this.SubDetailNoOptions,
          optionLabel: 'label',
          optionValue: 'value',
        }
      ];
    });
  }

  // 載入預覽資料
  loadPreviewData() {
    if (this.rowdata && this.rowdata.length > 0) {
      this.loading = true;
      const Tran_Nos = this.rowdata.map(item => item.Tran_No!);

      this.fin62030Service.previewFIN62030({ Tran_Nos: Tran_Nos }).pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe((response: any) => { // 先用 any 避開類型檢查
          // 關鍵點：後端回傳的是陣列，要取第一個物件
          const responseData = Array.isArray(response.Data) ? response.Data[0] : response.Data;
          if (responseData) {
            this.dataForm.patchValue({
              VouType: responseData.VouType,
              VouTypeName: responseData.VouTypeName,
              VoucherType: responseData.VoucherType,
              // 注意：如果格式是 2026/01/29，new Date() 可能因瀏覽器語系解析失敗，建議確認
              VouDate: responseData.VouDate ? new Date(responseData.VouDate) : null,
              Remark: responseData.Remark,
              CRT_USR_No: responseData.CRT_USR_No,
              CRT_Date: responseData.CRT_Date ? new Date(responseData.CRT_Date) : null
            });
            // 處理表格資料
            this.data = (responseData.voucherDetails || []).map((item: any) => ({
              ...item,
              _originalACC_No: item.ACC_No
            }));

            this.originalData = JSON.parse(JSON.stringify(this.data));

            // 強制觸發變化偵測（如果 Table 沒出來可加這行）
            this.data = [...this.data];
          } else {
            this.messageService.errorBubble(response.Message || '預覽資料載入失敗');
          }
        });
    }
  }

  onReset() {
    this.data = JSON.parse(JSON.stringify(this.originalData));
  }
}
