import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS16020Data, Ass16020Service, DeleteASS16020Request, QueryASS16020Detail, QueryASS16020Request } from '@service/api/ass/ass16020.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { NotificationService } from '../../../shared/components/notification-message/notification.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

@Component({
  selector: 'app-ass16020',
  templateUrl: './ass16020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarRangeComponent,
    InputTextComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TranslateModule,
    MultiSelectComponent,
    DialogModule,
    TableReportComponent
  ]
})
export class ASS16020Component extends BasicQueryPageComponent<ASS16020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    INV_ID: [],
    INV_STATUS: [["1", "2"]],  // 預設選取 ["1", "2"]
    INV_DATE_FROM: [],
    INV_DATE_TO: [],
    CLOSE_DATE_FROM: [],
    CLOSE_DATE_TO: [],
    EMP_ID: [],
    NOTES: [],
    REPORT_TYPE: ["0"],  // 預設選取
  });
  // Table data
  data: QueryASS16020Detail[] = [];
  QueryDialogData: QueryASS16020Detail[] = [];
  selectedItems: QueryASS16020Detail[] = [];

  public readonly totalRecords = signal<number>(0);
  public readonly totalDialogRecords = signal<number>(0);

  // Dialog visibility
  arDialogVisible = false;

  columns = [
    { field: 'INV_ID', header: '盤點單號', visible: true },
    { field: 'INV_STATUS_NAME', header: '盤點狀態', visible: true },
    { field: 'INV_DATE', header: '盤點日期', visible: true },
    { field: 'CLOSE_DATE', header: '結案日期', visible: true },
    { field: 'EMP_NAME', header: '盤點人員', visible: true },
  ];

  QueryDialogColumns = [
    { field: 'INV_ID', header: '盤點單號', visible: true },
    { field: 'INV_STATUS_NAME', header: '盤點狀態', visible: true },
    { field: 'INV_DATE', header: '盤點日期', visible: true },
    { field: 'CLOSE_DATE', header: '結案日期', visible: true },
    { field: 'EMP_NAME', header: '盤點人員', visible: true },
  ];


  // 下拉選單
  INV_STATUS = [
    { value: "1", label: '盤點中' },
    { value: "2", label: '登錄完成' },
    { value: "3", label: '已結案' },

  ];

  REPORT_TYPE = [
    { value: "0", label: '全部' },
    { value: "1", label: '差異' },
  ];

  EMP_ID = signal<{ label: string; value: string }[]>([]);


  constructor(
    private notification: NotificationService,
    private ass16020Service: Ass16020Service,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '310041';
    this.initializePage('ASS16020', 'ass/ass16020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  onSubmit(form: FormGroup) {
    console.log(form.value);
    // 清除盤點單號欄位的驗證
    this.clearInvIdValidator();

    this.handleSubmit(form, () => {
      // form.get('INV_STATUS')?.setValue("3");
      const request: QueryASS16020Request = {
        ...form.getRawValue(),
        INV_STATUS: (form.getRawValue().INV_STATUS ?? []).join(','),
      };
      console.log(request);
      this.ass16020Service.queryASS16020(request)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data?.Details ?? [];
          this.totalRecords.set(response.TotalCount);
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });

  }

  // 登入
  override onCreate(form: FormGroup): void {
    if (!this.checkInvIdRequired()) return;
    if (!this.checkInvStatusForCreate(form.get('INV_STATUS')?.getRawValue())) return;
    console.log(form.get('INV_STATUS')?.getRawValue());

    //form.get('INV_STATUS')?.setValue("1");
    this.ass16020Service.queryDetailASS16020(form.value)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(response => {
        console.log('登入查詢結果', response);
        this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        super.onCreate(response.Data);
      });

  }

  onDelete(selectedItems: QueryASS16020Detail[]) {
    this.messageService.confirm({
      header: '刪除確認',
      message: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        const deleteRequest: DeleteASS16020Request = {
          INV_ID: (selectedItems ?? [])
            .map(item => item.INV_ID)
            .filter(invId => !!invId)
            .join(','),
          UPD_USR_No: this.getUserInfoFromLocal().user_No,
        };
        this.ass16020Service.deleteASS16020(deleteRequest)
          .pipe(untilDestroyed(this))
          .subscribe(response => {
            if (response.Data.ErrCode !== 0) {
              this.messageService.errorBubble(response.Data.ErrMsg || '刪除失敗');
            }
            else {
              this.messageService.successBubble(response.Data.ErrMsg || '刪除成功');
            }
            this.onSubmit(this.queryForm);
          })
      }
    });
  }

  onAdjust(form: FormGroup) {
    if (!this.checkInvIdRequired()) return;
    if (!this.checkInvStatusForAdjust(form.get('INV_STATUS')?.getRawValue())) return;

    this.ass16020Service.queryDetailASS16020(form.value)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(response => {
        this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        if (this.hasPermission(this.Actions.Edit)) {
          this.navigateWithState(CRUDStatus.Edit, response.Data);
        }
      });
  }

  /** 打開應收未收查詢 Dialog */
  onQueryDialog(form: FormGroup) {
    if (!this.checkInvIdRequired()) return;

    // 打開 Dialog
    this.arDialogVisible = true;
    this.cdr.detectChanges();

    // 取得資料
    this.handleSubmit(form, () => {
      form.get('INV_STATUS')?.setValue("3"); // 強制查詢 盤點狀態為已結案
      this.ass16020Service.queryASS16020(form.value)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.QueryDialogData = response.Data?.Details ?? [];
          this.totalDialogRecords.set(response.Data?.Details.length);
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });

  }

  /** 開啟報表 */
  goReport(form: FormGroup): void {
    if (!this.checkInvIdRequired()) return;

    this.router.navigate(['/account/ass/ass16020cru'], {
      state: {
        mode: 'report',
        previousRoute: this.router.url,
        fromRoute: this.router.url,
        queryConditions: form.getRawValue(),
      }
    });

    console.log("開啟報表", form.getRawValue());
  }

  /** 編輯按鈕禁用邏輯 */
  public editDisabled = (rowData: QueryASS16020Detail): boolean => {
    return rowData.INV_STATUS !== '2';
  };

  // 檢查盤點單號是否為必填，若為空則顯示錯誤，並加上必填標記
  private checkInvIdRequired(): boolean {
    const invIdControl = this.queryForm.get('INV_ID');

    if (!invIdControl) return false;

    invIdControl.clearValidators();
    invIdControl.setValidators([Validators.required]);
    invIdControl.updateValueAndValidity();

    const invId = String(invIdControl.value ?? '').trim();

    if (!invId) {
      invIdControl.markAsTouched();
      this.notification.errorBubble('盤點單號為必填', '輸入錯誤');
      return false;
    }

    return true;
  }


  /**
     * 載入下拉選單選項
     */
  private loadDropdownOptions(): void {
    // 盤點人員
    this.ass16020Service.queryTBLUSER_Orgid_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.user_No} - ${item.user_Name}`,
          value: item.user_No,
        }));
        this.EMP_ID.set(options);
      },
    });
  }

  /** 解析 localStorage.UserInfo，回傳 { mid, SYS_StoreNo, user_No, user_Name } */
  private getUserInfoFromLocal(): { mid: number; SYS_StoreNo: string; user_No: string; user_Name: string } {
    let mid = 0;
    let SYS_StoreNo = '';
    let user_No = '';
    let user_Name = '';

    try {
      const raw = localStorage.getItem('UserInfo');
      if (raw) {
        const obj = JSON.parse(raw);
        // 依你的截圖欄位：mid 與 SYS_StoreNo
        mid = Number(obj?.mid ?? 0);
        SYS_StoreNo = String(obj?.SYS_StoreNo ?? '');
        user_No = String(obj?.user_No ?? '');
        user_Name = String(obj?.user_Name ?? '');
      }
    } catch (e) {
      console.error('解析 localStorage.UserInfo 失敗：', e);
    }

    return { mid, SYS_StoreNo, user_No, user_Name };
  }


  // 清除盤點單號欄位的驗證
  private clearInvIdValidator(): void {
    const invIdControl = this.queryForm.get('INV_ID');
    if (!invIdControl) return;

    invIdControl.setValidators(null);
    invIdControl.setErrors(null);
    invIdControl.updateValueAndValidity({ emitEvent: false });
  }

  // 檢查盤點單狀態是否為「盤點中」，若不是則顯示錯誤訊息
  private checkInvStatusForCreate(status: string[] | null | undefined): boolean {
    if (!status || !status.includes('1')) {
      this.notification.errorBubble('此盤點單狀態不可登錄,請重新選擇盤點單');
      return false;
    }

    return true;
  }

  // 檢查盤點單狀態是否為「登錄完成」，若不是則顯示錯誤訊息
  private checkInvStatusForAdjust(status: string[] | null | undefined): boolean {
    if (!status || !status.includes('2')) {
      this.notification.errorBubble('此盤點單狀態不可調整,請重新選擇盤點單');
      return false;
    }

    return true;
  }

}
