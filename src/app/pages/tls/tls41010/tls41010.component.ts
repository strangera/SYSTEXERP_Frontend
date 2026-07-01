import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { finalize } from 'rxjs';
import { ReportColumn } from 'src/app/shared/componentkit/table-report/table-report.model';
import { QueryTLS41010Request, TLS41010Service } from '../../../service/api/tls/tls41010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { AddButton } from '../../../shared/componentkit/table/table.model';
import { apiOption } from '../../../shared/models/sys/sysb000.model';
import { DropDownListService, IDropdownItem } from './../../../service/utility/dropDownList.service';
import { columns, TLS41010Data, TLS41010Item } from './tls41010.model';

/** 專櫃編號查詢下拉選項（查詢頁：查詢條件不限制合約是否生效中，才能查到歷史/已停用專櫃的機台資料） */
interface CounterFilterOption {
  No: string;
  Name: string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-tls41010',
  templateUrl: './tls41010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarRangeComponent,
    DropdownComponent,
    TranslateModule,
    DialogComponent,
    TableReportComponent
  ],
})
export class TLS41010Component extends BasicQueryPageComponent<TLS41010Data> implements OnInit {
  readonly tls41010Service = inject(TLS41010Service);
  private readonly dropDownListService = inject(DropDownListService);
  private readonly dropdownApiService = inject(DropdownApiService);
  private readonly destroyRef = inject(DestroyRef);
  columns: ReportColumn[] = columns;
  queryForm = this.formBuilder.group({
    ECR_No: [null, [Validators.maxLength(10)]],
    ECR_Type: [null, [Validators.maxLength(2)]],
    ECR_Name: [null, [Validators.maxLength(20)]],
    ECR_TLT_No: [null, [Validators.maxLength(20)]],
    ECR_ActiveDateStart: [null as Date | null],
    ECR_ActiveDateEnd: [null as Date | null],
    ECR_CloseDateStart: [null],
    ECR_CloseDateEnd: [null],
    ECR_Status: ['A'],
    ECR_Group: [null as string | null],
    ECR_SubGroup: [null as string | null],
    ECR_AreaNo: [null as string | null],
    ECR_LocNo: [null, [Validators.maxLength(10)]],
    ECR_SAL_Type: [null, [Validators.maxLength(8)]],
    ECR_GUI_Type: [null, [Validators.maxLength(2)]],
    ECR_USR_No: [null, [Validators.maxLength(8)]],
    ECR_USR_Name: [null, [Validators.maxLength(20)]],
    ECR_ComName: [null, [Validators.maxLength(64)]],
    ECR_IP: [null, [Validators.maxLength(20)]],
    ECR_SrvIP: [null, [Validators.maxLength(20)]],
    ECR_TmplNo: [null, [Validators.maxLength(8)]],
    pageSize: [500],
    pageIndex: [1],
    SortBy: [[{ field: 'ECR_No', order: 1 }]],
  });

  statusOptions = getSYS1000Options('ECR_Status');
  typeOptions = getSYS1000Options('ECR_Type');
  guiTypeOptions = getSYS1000Options('ECR_GUI_Type');
  salTypeOptions = getSYS1000Options('ECR_SAL_Type');
  areaNoOptions: IDropdownItem[] = [];
  data: TLS41010Data[] = [];
  selectedItems: TLS41010Data[] = [];
  totalRecords = 0;
  floorOption: apiOption[] = [];
  ECR_TmplNo_Option: IDropdownItem[] = [];

  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    Source_ECR_No: ['', [Validators.required]],
    Target_ECR_No: ['', [Validators.required]],
  });

  SrvIPOptions: IDropdownItem[] = [];
  lastQueryForm: Record<string, unknown> | null = null;
  footerTotal: TLS41010Data | null = null;
  CashierOptions: IDropdownItem[] = [];
  dialogSelectItem: TLS41010Data | null = null;
  dialogOptions: { value: string; label: string }[] = [];
  CounterOptions: CounterFilterOption[] = [];
  LocOptions: IDropdownItem[] = [];

  addButton: AddButton[] = [
    {
      label: '複製',
      icon: 'pi pi-copy text-blue-500',
      action: (rowData: TLS41010Item) => {
        this.onCreate(rowData);
      },
    },
  ];

  ngOnInit(): void {
    this.initializePage('TLS41010', 'TLS/TLS41010cru', this.queryForm, (form) => this.onSubmit(form));

    this.dropdownApiService.queryTltTalent()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.CounterOptions = (res ?? []) as CounterFilterOption[];
      });

    this.dropdownApiService.querySys3A00()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(options => {
        this.areaNoOptions = options ?? [];
      });

    this.dropdownApiService.queryPos10015()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(options => {
        this.SrvIPOptions = (options ?? []) as IDropdownItem[];
      });

    this.dropDownListService.queryPOS1002TML_ALL_DropDownList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res?.Data) {
          this.ECR_TmplNo_Option = res.Data.map(item => ({
            value: item.ECR_TmplNo,
            label: `${item.ECR_TmplNo}-${item.ECR_TmplDesc}`,
            No: item.ECR_TmplNo ?? '',
            Name: item.ECR_TmplDesc,
          }));
        }
      });

    this.dropdownApiService.queryPos2001()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(options => {
        this.CashierOptions = (options ?? []) as IDropdownItem[];
      });

    this.dropdownApiService.querySys3900()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(options => {
        this.floorOption = (options ?? []).map(item => ({ ...item, label: item.Name, value: item.No }));
      });

    // 🌟 初始載入收銀機下拉選單
    this.loadEcrOptions();

    this.dropdownApiService.queryPos2002()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(options => {
        this.LocOptions = (options ?? []) as IDropdownItem[];
      });
  }

  // 🌟【新增獨立方法】：負責向後端撈取最新的收銀機清單，更新下拉選單
  loadEcrOptions(): void {
    this.dropdownApiService.queryPos1002()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.dialogOptions = (data ?? []).map(x => ({ value: x.value, label: x.label }));
      });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.value;
      this.tls41010Service.queryTLS41010(raw)
        .pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
          this.lastQueryForm = raw;
          this.totalRecords = res?.TotalCount || 0;
          this.footerTotal = null;
          const resData = Array.isArray(res?.Data) ? res.Data : [];
          this.data = resData.map(item => {
            let dateValue: Date | null = null;
            if (typeof item.ECR_SettleHHNN === 'string' && item.ECR_SettleHHNN.length === 4) {
              dateValue = new Date(`1970-01-01T${item.ECR_SettleHHNN.substring(0, 2)}:${item.ECR_SettleHHNN.substring(2, 4)}:00`);
            }
            return { ...item, ECR_SettleHHNN: dateValue };
          });
          this.queryStateService.setQueryState(this.ProgNo, this.ProgNo);
        });
    });
  }

  // =================================================================
  // 複製設定 Dialog 邏輯優化版
  // =================================================================
  onDialogChange(event: DropdownChangeEvent) {
    const selectedValue = event.value;
    if (!selectedValue) return;

    const body: QueryTLS41010Request = { ECR_No: selectedValue, PageSize: 10, PageIndex: 0 };
    this.tls41010Service.queryTLS41010(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res?.Data?.length > 0) {
          this.dialogSelectItem = res.Data[0];
        }
      });
  }

  get isSameEcr(): boolean {
    const source = this.dialogQueryForm.value.Source_ECR_No?.trim() ?? '';
    const target = this.dialogQueryForm.value.Target_ECR_No?.trim() ?? '';
    return source !== '' && target !== '' && source === target;
  }

  get isEcrDuplicate(): boolean {
    const target = this.dialogQueryForm.value.Target_ECR_No?.trim() ?? '';
    if (!target) return false;
    return this.dialogOptions.some(opt => opt.value?.trim() === target);
  }

  saveDialog(frm: FormGroup) {
    this.submitted = true;

    if (frm.invalid || this.isSameEcr || this.isEcrDuplicate || !this.dialogSelectItem) {
      return;
    }

    this.handleSubmit(frm, () => {
      this.loading = true;
      const formValue = frm.value;

      const newEcrBody: Partial<TLS41010Data> = {
        ...this.dialogSelectItem,
        id: 0,
        ECR_No: formValue.Target_ECR_No.trim(),
        CRT_Date: null,
        UPD_Date: null
      };

      this.tls41010Service.insertTLS41010(newEcrBody)
        .pipe(
          finalize(() => this.loading = false),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: (res) => {
            console.log('複製設定成功', res);
            if (res?.Status === '0000') {
              this.messageService.successBubble('複製收銀機設定成功');
              this.dialogVisible = false;

              // 🌟【自動更新選單點】
              // 複製成功後，立馬觸發重新加載，把剛建好的新機號洗進 dialogOptions 下拉選單中！
              this.loadEcrOptions();

              this.onSubmit(this.queryForm);
            } else {
              this.messageService.errorBubble(`複製失敗: ${res?.Message ?? '未知錯誤'}`);
            }
          },
          error: (err) => {
            console.error('複製失敗 API 異常', err);
            this.messageService.errorBubble('複製失敗，請聯絡系統管理員');
          }
        });
    });
  }

  onDelete(rowData: TLS41010Data[]): void {
    const idList = rowData
      .map((item) => item.id)
      .filter((id) => id !== undefined && id !== null);

    if (idList.length === 0) {
      this.messageService.warnBubble('無有效的 ID 可供刪除');
      return;
    }

    this.messageService.confirm({
      header: '刪除確認',
      message: '是否刪除所選項目?',
      accept: () => {
        this.tls41010Service.deleteTLS41010(idList)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (res) => {
              if (res.Status === '0000') {
                this.messageService.successBubble('選中項目刪除成功');
                this.selectedItems = [];

                // 🌟【加碼防禦點】：如果收銀機被刪除了，下拉選單也順便重新連動洗乾淨！
                this.loadEcrOptions();

                this.onSubmit(this.queryForm);
              } else {
                console.error('API error:', res.Status, res.Message);
                this.messageService.errorBubble(`刪除失敗: ${res.Message}`);
              }
            },
          });
      }
    });
  }
}
