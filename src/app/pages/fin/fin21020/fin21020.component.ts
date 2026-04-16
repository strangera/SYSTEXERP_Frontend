import { DropdownApiService } from './../../../service/utility/dropdown-api.service';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin21020Service, IFin21020Data, IQueryFin21020Request } from '@service/api/fin/fin21020.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AddButton, Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { Actions } from '@shared/service/permission-guard.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize, map } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { ExcelColumn, ExcelExportService } from './../../../shared/service/excel-export.service';
import { Option } from '@service/utility/dropdown-api.model';
// 1.2.1.2 費率對照維護
@Component({
  selector: 'app-fin21020',
  templateUrl: './fin21020.component.html',
  standalone: true,
  imports: [TableReportComponent, DialogComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputNumberRangeComponent, TranslateModule]
})
export class FIN21020Component extends BasicQueryPageComponent<IFin21020Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    BNK_No: [null as string | null], // 公司銀行科目代號
    Remit_BAmount_Start: [null as number | null, [Validators.max(9999999999)]], // 金額下限 - 轉帳最低金額(起)
    Remit_BAmount_End: [null as number | null, [Validators.max(9999999999)]], // 金額下限 - 轉帳最低金額(迄)
    Remit_UAmount_Start: [null as number | null, [Validators.max(9999999999)]], // 金額上限 - 轉帳最高金額(起)
    Remit_UAmount_End: [null as number | null, [Validators.max(9999999999)]], // 金額上限 - 轉帳最高金額(迄)
    Remit_Fee_Start: [null as number | null, [Validators.max(999999)]],
    Remit_Fee_End: [null as number | null, [Validators.max(999999)]],
    Comp_Remit_Fee_Start: [null as number | null, [Validators.max(999999)]],
    Comp_Remit_Fee_End: [null as number | null, [Validators.max(999999)]],
    Cash_Back_Amt_Start: [null as number | null, [Validators.max(999999)]],
    Cash_Back_Amt_End: [null as number | null, [Validators.max(999999)]],
    ...createPaginationConfig([{ field: 'BNK_No', order: 1 }, { field: 'Remit_BAmount', order: 1 }])
  });
  selectedItems: IFin21020Data[] = [];
  columns: Column[] = [
    { field: 'BNK_No', header: '公司銀行科目代號' },
    { field: 'BNK_Name', header: '公司銀行科目名稱' },
    { field: 'Remit_BAmount', header: '金額下限', format: formatAmount },
    { field: 'Remit_UAmount', header: '金額上限', format: formatAmount },
    { field: 'Remit_Fee', header: '廠商負擔電匯手續費', format: formatAmount },
    { field: 'Cash_Back_Amt', header: '廠商負擔電匯手續費回饋收入', format: formatAmount },
    { field: 'Comp_Remit_Fee', header: '公司負擔電匯手續費', format: formatAmount },
  ];
  addButton: AddButton[] = [
    { label: '匯出單筆銀行科目', icon: 'pi pi-file-export', action: (rowData: IFin21020Data) => this.onExport(rowData), disabled: () => !this.hasPermission(Actions.ExportExcel) },
  ]
  btnLoading = false;
  lastQueryBody?: IQueryFin21020Request;
  totalRecords = 0;
  data: IFin21020Data[] = [];
  saveLoading = signal(false);
  bankCodeOptions = signal<Option[]>([]);
  // 2. 互斥選項邏輯 (使用 Computed 效能更好且邏輯清晰)
  sourceOptions = computed(() => {
    const target = this.targetSelected();
    // 使用 == 而非 === 來處理可能的 string/number 型別差異，或者強制轉字串
    return this.bankCodeOptions().filter(opt =>
      target === null || String(opt.value) !== String(target)
    );
  });

  targetOptions = computed(() => {
    const source = this.sourceSelected();
    return this.bankCodeOptions().filter(opt =>
      source === null || String(opt.value) !== String(source)
    );
  });
  sourceSelected = signal<string | null>(null);
  targetSelected = signal<string | null>(null);
  constructor(
    public readonly fin21020Service: Fin21020Service, // 注入新的 service
    private readonly excelExportService: ExcelExportService,
    private readonly dropdownApiService: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN21020', 'fin/fin21020cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropdownApiService.queryAps1002().pipe(
      map(options => options?.filter(opt => opt['ACCCNAME'] !== null && opt['ACCCNAME'] !== undefined) ?? []),
      untilDestroyed(this)
    ).subscribe(options => {
      this.bankCodeOptions.set(options);
    });
    // 監聽來源值變化
    this.dialogForm.get('sourceBnkNo')?.valueChanges.pipe(untilDestroyed(this)).subscribe(val => {
      this.sourceSelected.set(val);
    });

    // 監聽目的值變化
    this.dialogForm.get('targetBnkNo')?.valueChanges.pipe(untilDestroyed(this)).subscribe(val => {
      this.targetSelected.set(val);
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        pageSize: 30,
        pageIndex: 1, // 你將初始頁碼改為 1
        SortBy: [{ field: 'BNK_No', order: 1 }, { field: 'Remit_BAmount', order: 1 }],
      }
      this.fin21020Service.queryFIN21020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.lastQueryBody = body;
        this.totalRecords = res.TotalCount;
        this.data = res.Data;


        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  // ----------------------------------------------------------------
  onDelete(selectedRows: IFin21020Data[]) {
    // 使用 Set 物件來獲取不重複的 BNK_No 列表
    const uniqueBnkNos = [...new Set(selectedRows.map(row => row.BNK_No))];
    // 將不重複的 BNK_No 列表用逗號串接成字串
    const bnkNosDisplay = uniqueBnkNos.join('<br>');
    this.messageService.confirm({
      // 在訊息中顯示不重複的 BNK_No 列表，並加上總筆數
      message: `<div class="flex flex-column justify-content-center align-items-center">
      是否確定要刪除<br><b>公司銀行科目代號為：</b> ${bnkNosDisplay}<br>
      </div>`,
      accept: () => {
        this.loading = true;
        // 呼叫刪除服務，傳入不重複的 BnkNos
        this.fin21020Service.deleteFIN21020(uniqueBnkNos).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
          this.messageService.successBubble(res.Message);
          this.selectedItems = [];
          this.onSubmit(this.queryForm);
        });
      }
    });
  }
  excelColumns: ExcelColumn[] = [
    { field: 'BNK_No', header: '公司銀行科目代號', width: 20 },
    { field: 'Remit_BAmount', header: '金額下限', width: 15 },
    { field: 'Remit_UAmount', header: '金額上限', width: 15 },
    { field: 'Remit_Fee', header: '廠商負擔電匯手續費', width: 25 },
    { field: 'Cash_Back_Amt', header: '廠商負擔電匯手續費回饋收入', width: 30 },
    { field: 'Comp_Remit_Fee', header: '公司負擔電匯手續費', width: 25 },
  ];
  onExport(rowData: IFin21020Data) {
    this.btnLoading = true;
    const bnkNo = rowData.BNK_No || '';
    this.fin21020Service.queryByBnkNo(bnkNo).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe(res => {
      this.excelExportService.exportData(res.Data, `費率對照維護${bnkNo}`, this.excelColumns);
    });
  }
  dialogVisible = signal(false);
  columnsDialog: Column[] = [
    { field: 'No', header: '公司銀行科目代號' },
    { field: 'Name', header: '公司銀行科目名稱' },
  ]
  dialogForm = this.formBuilder.nonNullable.group({
    sourceBnkNo: [null as string | null, [Validators.required]], // 來源
    targetBnkNo: [null as string | null, [Validators.required]], // 目的
  });
  dialogSubmitted = signal(false);
  onCopyRate() {
    this.dialogVisible.set(true);
    this.dialogForm.reset();
    this.dialogSubmitted.set(false);
    this.saveLoading.set(false);
  }
  saveDialog() {
    if (this.dialogForm.invalid) {
      this.dialogSubmitted.set(true);
      return;
    }

    const { sourceBnkNo, targetBnkNo } = this.dialogForm.getRawValue();

    this.messageService.confirm({
      message: `是否確定將來源科目 <b>[${sourceBnkNo}]</b> 的費率資料，<br>覆蓋至目的科目 <b>[${targetBnkNo}]</b>？<br>(注意：目的科目的現有資料將被全數刪除)`,
      accept: () => {
        // 1. 開啟 Loading
        this.saveLoading.set(true);

        const body = {
          sourceBnkNo: sourceBnkNo || '',
          targetBnkNos: [targetBnkNo || '']
        };

        this.fin21020Service.copyFIN21020(body).pipe(
          untilDestroyed(this),
          finalize(() => this.saveLoading.set(false)) // 結束時關閉 Loading
        ).subscribe(res => {
          this.messageService.successBubble(res.Message);
          this.dialogVisible.set(false);
          this.onSubmit(this.queryForm);
        });
      }
    });
  }
}
