import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { finalize } from 'rxjs';
import { ReportColumn } from 'src/app/shared/componentkit/table-report/table-report.model';
import { QueryTLS41010Request, TLS41010Service } from '../../../service/api/tls/tls41010.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { AddButton } from '../../../shared/componentkit/table/table.model';
import { apiOption } from '../../../shared/models/sys/sysb000.model';
import { Tls14030Service } from './../../../service/api/tls/tls14030.service';
import { DropDownListService, IDropdownItem } from './../../../service/utility/dropDownList.service';
import { columns, TLS41010Data, TLS41010Item } from './tls41010.model';

@Component({
  selector: 'app-tls41010',
  templateUrl: './tls41010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarRangeComponent,
    DropdownComponent,
    TranslateModule,
    DialogComponent,
    NgIf,
    TableReportComponent
  ],
})
export class TLS41010Component extends BasicQueryPageComponent<TLS41010Data> implements OnInit {
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
    pageSize: [30],
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
  lastQueryForm: any;
  footerTotal: TLS41010Data | null = null;
  CashierOptions: IDropdownItem[] = [];
  dialogSelectItem: TLS41010Data | null = null;
  dialogSelectTargetItem: TLS41010Data | null = null;
  dialogOptions: { value: string; label: string }[] = [];
  CounterOptions: any[] = [];
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

  constructor(
    public tls41010Service: TLS41010Service,
    private readonly counterNameService: CounterNameService,
    private readonly tls14030Service: Tls14030Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService,
    private readonly eCRNoService: ECRNoService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41010', 'TLS/TLS41010cru', this.queryForm, (form) => this.onSubmit(form));

    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = res?.map((x: any) => ({
        No: x.value,
        Name: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value
      })) || [];
    });

    this.dropdownApiService.querySys3A00().subscribe(options => {
      this.areaNoOptions = options ?? [];
    });

    this.dropDownListService.queryPOS10015_DropDownList().subscribe(res => {
      if (res?.Data) {
        this.SrvIPOptions = res.Data.map(item => ({
          No: item.No,
          Name: item.Name,
          label: item.No,
          value: item.No
        }));
      }
    });

    this.dropDownListService.queryPOS1002TML_ALL_DropDownList().subscribe(res => {
      if (res?.Data) {
        this.ECR_TmplNo_Option = res.Data.map(item => ({
          value: item.ECR_TmplNo,
          label: `${item.ECR_TmplNo}-${item.ECR_TmplDesc}`,
          No: item.ECR_TmplNo ?? '',
          Name: item.ECR_TmplDesc,
        }));
      }
    });

    this.dropDownListService.queryPOS2001_DropDownList().subscribe(res => {
      if (res?.Data) {
        this.CashierOptions = res.Data.map(item => ({
          No: item.No,
          Name: item.Name,
          label: `${item.No} - ${item.Name}`,
          value: item.No
        }));
      }
    });

    this.tls14030Service.querySYS3900_DropDownList({}).subscribe((response) => {
      this.floorOption = response.Data.map((item: apiOption) => ({ ...item, label: item.Name, value: item.No }));
    });

    // 🌟 初始載入收銀機下拉選單
    this.loadEcrOptions();

    this.dropDownListService.queryPOS2002_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.LocOptions = res.Data.map(item => ({ ...item, value: item.No, label: item.Name }));
      });
  }

  // 🌟【新增獨立方法】：負責向後端撈取最新的收銀機清單，更新下拉選單
  loadEcrOptions(): void {
    this.eCRNoService.getECRNo()
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        this.dialogOptions = data;
      });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.value;
      this.tls41010Service.queryTLS41010(raw)
        .pipe(finalize(() => this.loading = false), untilDestroyed(this))
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
            const counter = this.CounterOptions.find(c => c.No === item.ECR_TLT_No);
            return { ...item, ECR_SettleHHNN: dateValue, ECR_TLT_Name: counter ? counter.Name : item.ECR_TLT_Name };
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
    this.tls41010Service.queryTLS41010(body).pipe(untilDestroyed(this)).subscribe(res => {
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

      const newEcrBody: any = {
        ...this.dialogSelectItem,
        id: 0,
        ECR_No: formValue.Target_ECR_No.trim(),
        CRT_Date: null,
        UPD_Date: null
      };

      this.tls41010Service.insertTLS41010(newEcrBody)
        .pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
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

  openCru(data: TLS41010Item, mode: string): void {
    console.log(`Opening CRU page with mode: ${mode}`, data);
    this.router.navigate([`/TLS/TLS41010cru`], { queryParams: { id: data.id, mode } });
  }

  onDelete(rowData: any[]): void {
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
          .pipe(untilDestroyed(this))
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
