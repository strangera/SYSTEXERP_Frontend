import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateMinNumber, validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { PanelModule } from 'primeng/panel';
import {
  catchError, distinctUntilChanged, finalize, map, of, startWith, switchMap, tap
} from 'rxjs';
import {
  CPM11030DetailItem, Cpm11030Service, QueryCPM11030Row
} from '../../../service/api/cpm/cpm11030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-cpm11030-cru',
  templateUrl: './cpm11030-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    NgIf,
    AsyncPipe,
    TranslateModule,
    CalendarComponent,
    TableEditComponent,
  ],
})
export class CPM11030CRUComponent extends BasicCruPageComponent<QueryCPM11030Row> implements OnInit {

  @ViewChild(TableEditComponent) tableEditRef!: TableEditComponent;

  dataForm = this.formBuilder.group({
    ID: [null as number | null],
    Loan_No: [{ value: '系統自動產生', disabled: true }],
    Service_Id: [
      null as string | null,
      {
        validators: [Validators.required, Validators.maxLength(7)],
        updateOn: 'blur'
      }
    ],
    Loan_Date: [new Date(), [Validators.required]],
    Loan_Time: [new Date()],
    Loan_Status: [{ value: '1', disabled: true }],
    User_Name: [null, [Validators.maxLength(50), Validators.required]],
    Cert_Type: [null],
    Cert_No: [null, [Validators.maxLength(50)]],
    Loan_Phone: [null, [Validators.maxLength(20), Validators.required]],
  });

  counterCodeOptions = this.dropDown.queryCSS1001();
  certTypeOptions = getSYS1000Options('Cert_Type');
  loanStatusOptions = getSYS1000Options('Loan_Status');

  /** 目前出借設備明細清單 */
  detailItems: CPM11030DetailItem[] = [];

  /** 可用設備選項快取（供 table 內 dropdown 使用），含剩餘數量 */
  currentDeviceOptions: { label: string; value: string; Name: string; remainingQty: number }[] = [];

  /** 明細表格欄位設定（Device_ID 用 dropdown，選後自動帶 Device_Name） */
  detailColumns: EditColumn[] = [
    {
      field: 'Device_ID',
      header: '設備代碼/名稱',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      showClear: false,
      validate: [validateRequired],
      /** 過濾已選過的設備（允許當列自己的值）；編輯模式下若設備已借完不在選項中，補入 */
      options: (rowData: CPM11030DetailItem) => {
        const available = this.currentDeviceOptions.filter(opt =>
          opt.value === rowData?.Device_ID ||
          !this.detailItems.some(d => d.Device_ID === opt.value)
        );
        // 編輯模式：若當前列的設備不在 available 中（例如已借完被後端過濾），補入假選項以正常顯示
        if (rowData?.Device_ID && !available.some(o => o.value === rowData.Device_ID)) {
          available.unshift({
            label: `${rowData.Device_ID} - ${rowData.Device_Name || rowData.Device_ID}`,
            value: rowData.Device_ID,
            Name: rowData.Device_Name || '',
            remainingQty: 0
          });
        }
        return available;
      },
    },
    {
      field: 'Device_Name',
      header: '設備名稱',
      disabled: () => true,   // 唯讀，由 Device_ID 選擇後自動填入
    },
    {
      field: 'Qty',
      header: '數量',
      type: 'inputNumber',
      min: 1,
      width: '8rem',
      validate: [
        validateMinNumber(1),
        (value: number, rowData: CPM11030DetailItem) => {
          const opt = this.currentDeviceOptions.find(o => o.value === rowData?.Device_ID);
          if (!opt || opt.remainingQty <= 0) return { isValid: true, errorMessage: [] };
          const isValid = value <= opt.remainingQty;
          return {
            isValid,
            errorMessage: isValid ? [] : [`數量不可超過剩餘量 ${opt.remainingQty}`]
          };
        }
      ],
    },
  ];

  constructor(
    private readonly cpm11030Service: Cpm11030Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11030', this.dataForm);

    // 訂閱服務中心變動 → 更新可用設備選項
    this.dataForm.get('Service_Id')!.valueChanges.pipe(
      startWith(this.dataForm.get('Service_Id')?.value),
      distinctUntilChanged(),
      untilDestroyed(this),
      tap(() => {
        if (this.isFormCreateable) this.detailItems = [];
      }),
      map(serviceId => ({ serviceId, loanDate: this.dataForm.get('Loan_Date')?.value })),
      switchMap(({ serviceId, loanDate }) => {
        if (!serviceId || !loanDate) return of([]);
        return this.cpm11030Service.queryCPM11030_DailyEquipAvailability({
          Service_Id: serviceId,
          CSS_Date: this.datePipe.transform(loanDate, 'yyyy-MM-dd') as string
        }).pipe(
          map(res => (res.Data || [])
            .filter(item =>
              !this.isFormCreateable ||          // 編輯模式：不過濾，讓已出借設備仍可顯示
              item.CSS_CurrentQty === null ||
              item.CSS_CurrentQty > 0
            )
            .map(item => ({
              label: `${item.Device_ID} - ${item.Device_Name} (剩餘:${item.CSS_CurrentQty ?? item.Device_TotQty})`,
              value: item.Device_ID,
              Name: item.Device_Name,
              remainingQty: item.CSS_CurrentQty ?? item.Device_TotQty
            }))
          ),
          catchError(() => of([]))
        );
      })
    ).subscribe(opts => {
      this.currentDeviceOptions = opts;
    });

    if (!this.isFormCreateable) {
      this.dataForm.get('Service_Id')?.disable();
      this.dataForm.get('Loan_Date')?.disable();
      // 載入明細
      const row = this.rowdata as QueryCPM11030Row;
      if (row?.Loan_No) {
        this.cpm11030Service.queryCPM11030Detail(row.Loan_No)
          .pipe(untilDestroyed(this))
          .subscribe(res => {
            this.detailItems = (res.Data || []).map(d => ({
              Device_ID: d.Device_ID,
              Device_Name: d.Device_Name,
              Qty: d.Qty,
            }));
          });
      }
    }
  }

  /**
   * table-edit 資料變動時：只在 Device_Name 缺失時補入，避免每次 map() 都產生新陣列觸發 table 重初始化
   */
  onDetailDataChange(data: CPM11030DetailItem[]): void {
    let changed = false;
    const updated = data.map(row => {
      const name = this.currentDeviceOptions.find(o => o.value === row.Device_ID)?.Name;
      if (name && !row.Device_Name) {
        changed = true;
        return { ...row, Device_Name: name };
      }
      return row;
    });
    this.detailItems = changed ? updated : data;
  }

  onSubmit(form: FormGroup): void {
    if (this.detailItems.length === 0) {
      this.messageService.warnBubble('請至少新增一筆出借設備');
      return;
    }
    // 新增模式才需驗證 table（編輯模式 table 為唯讀）
    if (this.isFormCreateable && this.tableEditRef) {
      const valid = this.tableEditRef.validateAndShowErrors();
      if (!valid) return;
    }
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();
      const body = {
        ...raw,
        Loan_Date: raw.Loan_Date instanceof Date
          ? this.datePipe.transform(raw.Loan_Date, 'yyyy-MM-dd')
          : (raw.Loan_Date as string ?? '').substring(0, 10),
        Loan_Time: raw.Loan_Time instanceof Date
          ? this.datePipe.transform(raw.Loan_Time, 'HHmm')
          : ((raw.Loan_Time ?? '') as string).replace(':', ''),
        Details: this.detailItems,
      };
      const request$ = this.isFormCreateable
        ? this.cpm11030Service.insertCPM11030(body)
        : this.cpm11030Service.updateCPM11030(body);
      request$.pipe(untilDestroyed(this), finalize(() => {
        this.loading = false;
        this.messageService.unblockUi();
      })).subscribe({
        next: res => {
          this.messageService.successBubble(res.Message || (this.isFormCreateable ? '新增成功' : '更新成功'));
          if (this.isFormCreateable) {
            this.dataForm.reset({
              Loan_No: '系統自動產生',
              Loan_Date: new Date(),
              Loan_Time: new Date(),
              Loan_Status: '1'
            });
            this.detailItems = [];
          } else {
            this.onCancel();
          }
        },
        error: err => {
          this.messageService.errorBubble(err?.error?.Message || err?.message || '操作失敗，請稍後再試');
        }
      });
    });
  }
}
