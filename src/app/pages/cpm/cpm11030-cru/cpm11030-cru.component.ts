import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { PanelModule } from 'primeng/panel';
import { catchError, distinctUntilChanged, finalize, map, Observable, of, startWith, switchMap, tap, withLatestFrom } from 'rxjs';
import { Cpm11030Service, QueryCPM11030Row } from '../../../service/api/cpm/cpm11030.service';
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
    TranslateModule,
    CalendarComponent,
    AsyncPipe,
  ],
})
export class CPM11030CRUComponent extends BasicCruPageComponent<QueryCPM11030Row> implements OnInit {

  /** 依欄位說明：大多 nullable:true，所以不要全部 required（除非你前端想強制） */
  dataForm = this.formBuilder.group({
    /** Update 用 */
    ID: [null as number | null],
    /** 顯示用（後端產生；單據規則 YY+MM+DD+SSS） */
    Loan_No: [{ value: '系統自動產生', disabled: true }],
    /** nullable:true（你要強制必填可加 Validators.required） */
    Service_Id: [
      null as string | null,
      {
        validators: [Validators.required, Validators.maxLength(7)],
        updateOn: 'blur' // 👈 關鍵：告訴 Angular 只有在游標離開（失焦）時才更新 control 的值與觸發 valueChanges
      }
    ],
    /** 出借日期：string($date-time)（通常必填比較合理，但規格寫 nullable:true 就先不強制） */
    Loan_Date: [new Date(), [Validators.required]],
    /** 出借時間：HHMM（nullable:true） */
    Loan_Time: [new Date()],
    /** 出借狀態：1/2（nullable:true） */
    Loan_Status: [{ value: '1', disabled: true }],
    /** 其他欄位皆 nullable:true */
    User_Name: [null, [Validators.maxLength(50), Validators.required]],
    Cert_Type: [null, [Validators.required]],
    Cert_No: [null, [Validators.maxLength(50), Validators.required]],
    Loan_Phone: [null, [Validators.maxLength(20)]],
    Device_ID: [null, [Validators.required, Validators.maxLength(50)]],
    Device_Name: [null, [Validators.maxLength(50)]],
  });
  counterCodeOptions = this.dropDown.queryCSS1001();
  certTypeOptions = getSYS1000Options('Cert_Type');
  deviceNameOptions: Observable<any[] | null> = this.dataForm.get('Service_Id')!.valueChanges.pipe(
    startWith(this.dataForm.get('Service_Id')?.value),
    distinctUntilChanged(),
    untilDestroyed(this),
    // 增加一個 tap：當 Service_Id 改變時，清空舊的設備選值
    tap(() => {
      if (this.isFormCreateable) {
        this.dataForm.patchValue({ Device_ID: null, Device_Name: null }, { emitEvent: false });
      }
    }),
    // 💡 修正：直接用 map 抓取當下的日期數值，徹底切斷 Loan_Date 流的連動
    map(serviceId => {
      const loanDate = this.dataForm.get('Loan_Date')?.value;
      return { serviceId, loanDate };
    }),
    // 此時物件傳下來：{ serviceId, loanDate }
    switchMap(({ serviceId, loanDate }) => {
      if (!serviceId || !loanDate) {
        this.dataForm.get('Device_ID')?.disable({ emitEvent: false });
        return of([]);
      }
      const formattedDate = this.datePipe.transform(loanDate, 'yyyy-MM-dd');
      return this.cpm11030Service.queryCPM11030_DailyEquipAvailability({
        Service_Id: serviceId,
        CSS_Date: formattedDate as string
      }).pipe(
        map(res => {
          const data = res.Data || [];
          if (this.isFormCreateable && data.length > 0) {
            this.dataForm.get('Device_ID')?.enable({ emitEvent: false });
          } else {
            this.dataForm.get('Device_ID')?.disable({ emitEvent: false });
          }
          return data.filter(item => item.CSS_CurrentQty === null || item.CSS_CurrentQty > 0).map(item => ({
            label: `${item.Device_ID} - ${item.Device_Name} (剩餘:${item.CSS_CurrentQty ?? item.Device_TotQty})`,
            value: item.Device_ID,
            Name: item.Device_Name
          }));
        }),
        catchError(() => {
          this.dataForm.get('Device_ID')?.disable({ emitEvent: false });
          return of([]);
        })
      );
    })
  );
  loanStatusOptions = getSYS1000Options('Loan_Status');

  constructor(
    private readonly cpm11030Service: Cpm11030Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('CPM11030', this.dataForm);
    if (this.isFormCreateable) {
      const { Service_Id, Loan_Date } = this.dataForm.value;
      if (!Service_Id || !Loan_Date) {
        this.dataForm.get('Device_ID')?.disable({ emitEvent: false });
      }
    } else {
      this.dataForm.get('Service_Id')?.disable();
      this.dataForm.get('Device_ID')?.disable();
      this.dataForm.get('Device_Name')?.disable();
      this.dataForm.get('Loan_Date')?.disable();
    }
    this.dataForm.get('Device_ID')?.valueChanges.pipe(untilDestroyed(this), withLatestFrom(this.deviceNameOptions)).subscribe(([selectedId, options]) => {
      const selectedDevice = options?.find(opt => opt.value === selectedId);
      if (selectedDevice) {
        this.dataForm.patchValue({ Device_Name: selectedDevice.Name }, { emitEvent: false });
      }
    });
  }
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();
      const body = {
        ...raw,
        Loan_Date: this.datePipe.transform(raw.Loan_Date, 'yyyy-MM-dd'),
        Loan_Time: this.datePipe.transform(raw.Loan_Time, 'HHmm'),
      };
      const request$ = this.isFormCreateable
        ? this.cpm11030Service.insertCPM11030(body)
        : this.cpm11030Service.updateCPM11030(body);
      request$.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.messageService.successBubble(res.Message || (this.isFormCreateable ? '新增成功' : '更新成功'));
        if (this.isFormCreateable) {
          this.dataForm.reset({
            Loan_No: '系統自動產生',
            Loan_Date: new Date(),
            Loan_Time: new Date(),
            Loan_Status: '1'
          }); // 重設時給予預設值
          this.dataForm.get('Device_ID')?.disable();
        } else {
          this.onCancel();
        }
      });
    });
  }
}
