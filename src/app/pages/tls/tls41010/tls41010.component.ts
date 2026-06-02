import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls46010Service } from '@service/api/tls/tls46010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { finalize } from 'rxjs';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
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
import { AddButton, Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
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
  columns: Column[] = columns;
  queryForm = this.formBuilder.group({
    ECR_No: [null, [Validators.maxLength(10)]],
    ECR_Type: [null, [Validators.maxLength(2)]], // 收銀機號
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
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });
  statusOptions = getSYS1000Options('ECR_Status');
  typeOptions = getSYS1000Options('ECR_Type');
  guiTypeOptions = getSYS1000Options('ECR_GUI_Type');
  salTypeOptions = getSYS1000Options('ECR_SAL_Type');
  areaNoOptions: IDropdownItem[] = [];
  data: TLS41010Data[] = [];
  selectedItems: TLS41010Data[] = [];
  totalRecords = 0;
  floorOption: apiOption[] = []; //樓層
  ECR_TmplNo_Option: IDropdownItem[] = [];
  // 複製設定 Dialog 相關
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
    private readonly tls46010Service: Tls46010Service,
    private readonly tls11010Service: Tls11010Service,
    private readonly counterNameService: CounterNameService,
    private readonly tls14030Service: Tls14030Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService,
    private readonly eCRNoService: ECRNoService,
  ) {
    super();
  }

  callOtherApi() {
    const requestData = {
      queryKey: 'value'
    };

    this.loading = true;
    this.tls46010Service.queryTLS0000(requestData)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          console.log('呼叫 TLS0000 成功', res.Data);
        },
      });
  }

  callTls11010Api(locNo: string) {
    const payload = {
      ECR_LocNo: locNo,
      PageSize: 10,
      PageIndex: 1
    };

    this.loading = true;
    this.tls11010Service.queryData(payload).pipe(finalize(() => this.loading = false)).subscribe({
      next: (res) => {
        if (res?.Data && res.Data.length > 0) {
          const locationData = res.Data[0];
          this.queryForm.patchValue({
            ECR_Group: locationData.building_no ?? '',      // 館別
            ECR_SubGroup: locationData.FLOOR_NO ?? '',      // 樓層
            ECR_AreaNo: locationData.AREA_NO?.trim() ?? ''  // 區域（去除空白）
          }, { emitEvent: false });
        }
      },
    });
  }

  ngOnInit(): void {
    this.initializePage('TLS41010', 'TLS/TLS41010cru', this.queryForm, (form) => this.onSubmit(form));
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          No: x.value,              // 編號
          Name: x.label,            // 名稱
          formLabel: `${x.value} - ${x.label}`, // 下拉顯示
          value: x.value            // 存值
        })) || [];
    });
    this.dropdownApiService.querySys3A00().subscribe(options => {
      this.areaNoOptions = options ?? [];
    });

    //後台主機ip
    this.dropDownListService.queryPOS10015_DropDownList().subscribe(res => {
      if (res?.Data) {
        this.SrvIPOptions = res.Data.map(item => ({
          No: item.No,
          Name: item.Name,
          label: item.No,   // 顯示 IP    (或改成 item.Name)
          value: item.No    // 存 IP 編號
        }));
      }
    });
    this.queryForm.get('ECR_SrvIP')?.valueChanges.subscribe((ECR_SrvIP) => {
      if (ECR_SrvIP) {
        this.callOtherApi();
      }
    });
    // 環境變數下拉選單
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
    //收銀員下拉選單
    this.dropDownListService.queryPOS2001_DropDownList().subscribe(res => {
      if (res?.Data) {
        this.CashierOptions = res.Data.map(item => ({
          No: item.No,
          Name: item.Name,
          label: `${item.No} - ${item.Name}`, // 顯示時更清楚
          value: item.No
        }));
      }
    });
    // 樓層下拉
    this.tls14030Service
      .querySYS3900_DropDownList({})
      .subscribe((response) => {
        this.floorOption = response.Data.map((item: apiOption) => ({
          ...item,
          label: item.Name,
          value: item.No
        }));
      });



    this.queryForm.get('ECR_LocNo')?.valueChanges.subscribe((locNo) => {
      if (locNo) {
        const selected = this.LocOptions.find(opt => opt.value === locNo);
        if (selected) {
          this.queryForm.patchValue({
            ECR_Group: selected.tlt_building,
            ECR_SubGroup: selected.tlt_floor,
            ECR_AreaNo: selected.area_no
          }, { emitEvent: false });
        }
        this.callTls11010Api(locNo);
      }
    });
    this.eCRNoService.getECRNo()
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        // 後端已回傳 label 為「000011-小騎士」，這裡直接沿用即可
        this.dialogOptions = data;
      });
    //位置編號

    this.dropDownListService.queryPOS2002_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.LocOptions = res.Data.map(item => ({
          ...item,
          value: item.No,
          label: item.Name
        }));
      });
  }
  //  Submit 查詢
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.value;
      const body = {
        ...raw,
        pageIndex: 1,
        pageSize: 30,
        SortBy: [{ field: 'ECR_No', order: 1 }],
      };

      this.tls41010Service.queryTLS41010(body)
        .pipe(finalize(() => this.loading = false), untilDestroyed(this))
        .subscribe((res) => {
          this.lastQueryForm = body;
          this.totalRecords = res?.TotalCount || 0;
          this.footerTotal = null;
          const resData = Array.isArray(res?.Data) ? res.Data : [];
          this.data = resData.map(item => {
            let dateValue: Date | null = null;
            if (typeof item.ECR_SettleHHNN === 'string' && item.ECR_SettleHHNN.length === 4) {
              dateValue = new Date(`1970-01-01T${item.ECR_SettleHHNN.substring(0, 2)}:${item.ECR_SettleHHNN.substring(2, 4)}:00`);
            }
            const counter = this.CounterOptions.find(c => c.No === item.ECR_TLT_No);
            return {
              ...item,
              ECR_SettleHHNN: dateValue,
              ECR_TLT_Name: counter ? counter.Name : item.ECR_TLT_Name
            };
          });
          this.queryStateService.setQueryState(this.ProgNo, body);
        });
    });
  }

  saveDialog(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = false;
      // 來源和目標一樣，不能複製
      if (this.isValid) { return; }
      // 組資料，補上四個欄位
      const formValue = frm.value;
      const body: Partial<TLS41010Item> = {
        ...this.dialogSelectItem,
        ECR_Group: formValue.ECR_Group,
        ECR_SubGroup: formValue.ECR_SubGroup,
        ECR_AreaNo: formValue.ECR_AreaNo,
        ECR_LocNo: formValue.ECR_LocNo
      };
      // 判斷是否為新增或更新，假設「new」是新增
      // 更新
      this.tls41010Service.updateTLS41010(body).pipe(untilDestroyed(this)).subscribe({
        next: (res) => {
          console.log('更新成功', res);
          if (res?.Status === '0000') {
            this.messageService.successBubble('複製設定成功');
            this.dialogVisible = false;
            this.onSubmit(this.queryForm);
          } else {
            this.messageService.errorBubble(`複製失敗: ${res?.Message ?? '未知錯誤'}`);
          }
        },
        error: (err) => {
          console.error('更新失敗', err);
          this.messageService.errorBubble('複製失敗');
        }
      });
    });
  }

  onDialogChange(event: DropdownChangeEvent) {
    const selectedValue = event.value;
    const body: QueryTLS41010Request = {
      ECR_No: selectedValue,
      PageSize: 10,
      PageIndex: 0
    };
    this.tls41010Service.queryTLS41010(body).pipe(untilDestroyed(this)).subscribe(res => {
      this.dialogSelectItem = res.Data[0];
    });
  }

  onDialogChange2(event: DropdownChangeEvent) {
    const selectedValue = event.value;
    const body: QueryTLS41010Request = {
      ECR_No: selectedValue,
      PageSize: 10,
      PageIndex: 0,
    };
    this.tls41010Service.queryTLS41010(body).pipe(untilDestroyed(this)).subscribe(res => {
      this.dialogSelectTargetItem = res.Data[0];
    });
  }

  // isValid 判斷來源和目標是否相同
  get isValid(): boolean {
    const Source_ECR_No = this.dialogQueryForm.value.Source_ECR_No ?? '';
    const Target_ECR_No = this.dialogQueryForm.value.Target_ECR_No ?? '';
    return (Source_ECR_No !== '' && Target_ECR_No !== '') && (Source_ECR_No === Target_ECR_No);
  }
  openCru(data: TLS41010Item, mode: string): void {
    console.log(`Opening CRU page with mode: ${mode}`, data);

    // 帶id去 CRU 頁
    this.router.navigate([`/TLS/TLS41010cru`], {
      queryParams: { id: data.id, mode }
    });
  }
  // 刪除項目
  onDelete(rowData: any[]): void {
    const idList = rowData
      .map((item) => item.id) // 主鍵欄位叫 ID
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
                this.selectedItems = []; // 清空選中項目
                this.onSubmit(this.queryForm); // 重新查詢刷新列表
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
