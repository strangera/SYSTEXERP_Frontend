import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { Observable, finalize, forkJoin } from 'rxjs';
import { CPM12050Data, CPM12050Service, InsertCPM12050DetailRequest, InsertCPM12050Request, UpdateCPM12050Request } from '../../../service/api/cpm/cpm12050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';

@Component({
  selector: 'app-cpm12050-cru',
  templateUrl: './cpm12050-cru.component.html',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputTextareaComponent,
    DropdownComponent,
    TranslateModule,
    TableEditComponent,
    CalendarComponent
  ]
})
export class CPM12050CRUComponent extends BasicCruPageComponent<CPM12050Data> implements OnInit {
  // 若觸發高權限編輯，則強制允許編輯 (繞過一般權限判斷)
  forceEditAll = false;

  // 當需要強制高權限編輯時，覆寫 canEdit 判斷
  override canEdit(): boolean {
    if (this.forceEditAll) {
      return true;
    }
    return super.canEdit();
  }
  dataForm = this.formBuilder.nonNullable.group({
    KIND_ID: [null as string | null, Validators.required],                        // 意見類型（必填）
    KIND_ID_SUB: [null as string | null, Validators.required],                    // 意見子類型（必填）
    SUGG_SOURCE: [null as string | null, Validators.required],                    // 建議來源（必填）
    ORG_ID_QUERY: [null as string | null, Validators.required],                   // 組織(查詢責任單位用)
    ORG_ID: [null as string | null, Validators.required],                         // 責任單位（必填）
    COMPLAIN_NOTES: [null, [Validators.required, Validators.maxLength(1000)]],    // 顧客意見內容（必填）
    CUST_NAME: [null, Validators.maxLength(20)],                                  // 客戶姓名
    SEX: [null],                                                                  // 性別
    CONTACT_ADDR: [null],                                                         // 聯絡地址
    CONTACT_TEL: [null, Validators.maxLength(30)],                                // 聯絡電話
    CELL_PHONE: [null, Validators.maxLength(30)],                                 // 手機號碼
    E_MAIL: [null, [Validators.email, Validators.maxLength(100)]],                // Email
    // SUGG_SOURCE_OTHER: [null, Validators.required],                               // 其他建議來源
    MEMBER_ID: [null],                                                            // 會員編號
    CRT_USR_No: [null as string | null],                                           // 建檔人編號
    CRT_USR_Name: [null as string | null],
    COMPLAIN_DATE: [null],
    ALERT_DATE: [null],
    ANSWER_YN: [null],
    STATUS: [null],
    SUGG_TYPE: [null],
    CLASS_EMAIL: [null],
  });
  ANSWER_YNOptions = [
    { label: '已建立', value: 'S' },
    { label: '已派單', value: 'W' },
    { label: '處理中', value: 'Y' },
    { label: '結案', value: 'Z' }
  ];
  SUGG_TYPEOptions = [
    { label: '客訴', value: '0' },
    { label: '表揚', value: '1' },

  ];

  //#region 下拉選單
  // 性別選項
  sexOptions = [
    { label: '男', value: 'M' },
    { label: '女', value: 'F' }
  ];

  // 意見類型選項
  kindIdOptions: any[] = [];

  // 意見子類型選項
  kindIdSubOptions: any[] = [];

  // 建議來源選項
  suggSourceOptions = [
    { label: 'WEB', value: 'WEB' },
    { label: 'APP', value: 'APP' },
  ];

  // 組織選項
  orgIdQueryOptions: any[] = [];

  // 責任單位選項
  orgIdOptions: any[] = [];
  //#endregion

  // 編輯table設定
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  data: any[] = [];
  // 用來記錄明細上次的有效筆數（不含 candidate row），用來判斷是否為第一次新增明細
  private _detailCountPrev = 0;
  columns: EditColumn[] = [
    {
      field: 'ANSWER',
      header: '處理記錄',
      type: 'input',
      validate: [validateRequired]
    },
    {
      field: 'ANSWER_DATE',
      header: '處理日期時間',
      type: 'date',
      validate: [validateRequired]
    },
    {
      field: 'ANSWER_ID',
      header: '處理者',
      type: 'input',
      validate: [validateRequired]
    },

  ];

  // 判斷是否為已存在的明細（有 SEQ_ID 的為既有資料，不可編輯）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isExistingDetail = (rowData: Record<string, any>): boolean => !!rowData['SEQ_ID'];

  constructor(
    private cpm12050Service: CPM12050Service,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService
  ) {
    super();
  }

  // ALERT_DATE 與 STATUS 聯動：
  // - 新增時預設 STATUS = 'S'
  // - 若 STATUS 為 'Y' 或 'Z'，則 ALERT_DATE 為必填；若已有值則將其 disable (唯讀)
  // - 若 STATUS 非 'Y'/'Z'，則移除必填並確保 ALERT_DATE 可編輯
  private setupAlertDateValidation(): void {
    const statusCtrl: any = (this.dataForm.controls as any).STATUS;
    const alertCtrl: any = (this.dataForm.controls as any).ALERT_DATE;
    if (!statusCtrl || !alertCtrl) return;

    // 若為新增，預設 STATUS 為 'S'
    if (this.crudstatus === CRUDStatus.Create) {
      try { statusCtrl.setValue('S', { emitEvent: false }); } catch (e) { /* ignore */ }
    }

    const applyRules = (status: any) => {
      const key = status ? String(status).toUpperCase() : '';
      const isRequired = key === 'Y' || key === 'Z';
      if (isRequired) {
        alertCtrl.setValidators([Validators.required]);
        alertCtrl.updateValueAndValidity({ emitEvent: true });
        // 若已有值則設為唯讀
        if (alertCtrl.value) {
          try { alertCtrl.disable({ emitEvent: false }); } catch (e) { }
        } else {
          // 只有在非檢視模式或被強制編輯時才允許啟用
          if (this.crudstatus !== CRUDStatus.Read || this.forceEditAll) {
            try { alertCtrl.enable({ emitEvent: false }); } catch (e) { }
          }
        }
      } else {
        alertCtrl.clearValidators();
        alertCtrl.updateValueAndValidity({ emitEvent: true });
        // 非必填時：若是檢視模式且非強制編輯，保持 disabled；否則 enable
        if (this.crudstatus === CRUDStatus.Read && !this.forceEditAll) {
          try { alertCtrl.disable({ emitEvent: false }); } catch (e) { }
        } else {
          try { alertCtrl.enable({ emitEvent: false }); } catch (e) { }
        }
      }
    };

    // 先套用一次當前狀態
    applyRules(statusCtrl.value);

    // 當 STATUS 改變時套用規則
    statusCtrl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((s: any) => applyRules(s));

    // 當 ALERT_DATE 有使用者輸入值時，若狀態為 Y/Z 則將欄位設為唯讀
    alertCtrl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((v: any) => {
        const status = statusCtrl.value ? String(statusCtrl.value).toUpperCase() : '';
        if ((status === 'Y' || status === 'Z') && v) {
          try { alertCtrl.disable({ emitEvent: false }); } catch (e) { }
        }
        // 如果是檢視模式，確保欄位被 disable（避免其他邏輯啟用它）
        if (this.crudstatus === CRUDStatus.Read && !this.forceEditAll) {
          try { alertCtrl.disable({ emitEvent: false }); } catch (e) { }
        }
      });

    // 若為檢視模式且不允許強制編輯，確保 ALERT_DATE 一開始是 disabled
    if (this.crudstatus === CRUDStatus.Read && !this.forceEditAll) {
      try { alertCtrl.disable({ emitEvent: false }); } catch (e) { }
    }
  }

  getAnswerYnLabel(code: any): string {
    if (code === null || code === undefined || code === '') return '';
    const key = String(code).toUpperCase();
    const found = this.ANSWER_YNOptions.find(o => String(o.value).toUpperCase() === key);
    return found ? found.label : String(code);
  }

  ngOnInit(): void {
    this.initializePage('CPM12050', this.dataForm);
    // 讀取導航 state 是否帶入 forceEditAll
    const state = this.router.lastSuccessfulNavigation?.extras.state;
    this.forceEditAll = !!state?.['forceEditAll'];
    this.loadOptions();
    // 若為編輯或檢視狀態，帶回資料
    if (this.rowdata) {
      // 設定 ALERT_DATE 與 STATUS 的互動行為（必填、disable 規則）
      this.setupAlertDateValidation();

      // 預先載入下拉選項
      this.onKindChange(this.rowdata.KIND_ID!);
      this.onOrgQueryChange(this.rowdata.ORG_ID!);
      // 設定表單值（帶入 master 欄位）
      this.dataForm.patchValue({
        KIND_ID: this.rowdata.KIND_ID,
        KIND_ID_SUB: this.rowdata.KIND_ID_SUB,
        ORG_ID_QUERY: this.rowdata.ORG_ID,
        ORG_ID: this.rowdata.CLASS_ID,
        COMPLAIN_NOTES: this.rowdata.COMPLAIN_NOTES ?? null,
        CUST_NAME: this.rowdata.CUST_NAME ?? null,
        SEX: this.rowdata.SEX ?? null,
        CONTACT_ADDR: this.rowdata.CONTACT_ADDR ?? null,
        CONTACT_TEL: this.rowdata.CONTACT_TEL ?? null,
        CELL_PHONE: this.rowdata.CELL_PHONE ?? null,
        E_MAIL: this.rowdata.E_MAIL ?? null,
        MEMBER_ID: this.rowdata.MEMBER_ID ?? null,
        CLASS_EMAIL: (this.rowdata as any).CLASS_EMAIL ?? null,
        COMPLAIN_DATE: this.rowdata.COMPLAIN_DATE ? new Date(this.rowdata.COMPLAIN_DATE) : null,
        ALERT_DATE: this.rowdata.ALERT_DATE ? new Date(this.rowdata.ALERT_DATE) : null,
        ANSWER_YN: (this.rowdata.ANSWER_YN ?? (this.rowdata as any).STATUS)
          ? String((this.rowdata.ANSWER_YN ?? (this.rowdata as any).STATUS)).toUpperCase()
          : null,
        SUGG_TYPE: (this.rowdata as any).SUGG_TYPE ?? null,
        STATUS: (this.rowdata as any).STATUS ? String((this.rowdata as any).STATUS).toUpperCase() : null
      } as any);
      // 如果是檢視模式（Read），將 ANSWER_YN 與 STATUS 設為唯讀
      if (this.crudstatus === CRUDStatus.Read && !this.forceEditAll) {
        try {
          (this.dataForm.controls as any).ANSWER_YN.disable();
          (this.dataForm.controls as any).STATUS.disable();
        } catch (e) {
          // ignore if controls not exist
        }
      }
      // 帶回明細資料
      this.cpm12050Service.queryCPM12050Detail({
        ID: this.rowdata.ID,
        SEQ_ID: this.rowdata.SEQ_ID!
      })
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          // 初始化 prev count
          this._detailCountPrev = Array.isArray(this.data) ? this.data.length : 0;
        });
    }

    // 隱藏的建檔人欄位需自動帶入目前使用者，送出時傳至後端
    const user = this.authService.getUserInfo();
    if (user) {
      this.dataForm.patchValue({
        CRT_USR_No: user.user_No ?? null,
        CRT_USR_Name: user.user_Name ?? null
      });
    }

    // 設定表單控制項的可編輯狀態：
    // - 若由高權限打開（forceEditAll），則全部可編輯
    // - 若為 Edit 模式，僅允許特定欄位可編輯，其餘欄位設為唯讀/disabled
    this.configureFormControls();
    // 一般情況也要啟動 ALERT_DATE 與 STATUS 的互動規則
    this.setupAlertDateValidation();
  }

  // 當 table-edit 發生 dataChange（clean data）時會觸發此處理
  // 若從 0 筆變成 >0 筆（使用者新增第一筆處理紀錄），則自動將 STATUS 設為 'Y'（處理中）
  onTableDataChange(cleanData: any[]) {
    const prev = this._detailCountPrev || 0;
    const curr = Array.isArray(cleanData) ? cleanData.length : 0;
    // 更新本地 data
    this.data = cleanData || [];
    // 若先前為 0，且現在大於 0，代表使用者新增了第一筆明細
    if (prev === 0 && curr > 0) {
      const statusCtrl: any = (this.dataForm.controls as any).STATUS;
      try {
        // 只有在狀態不是 Z（結案）時才改為 Y
        const cur = statusCtrl && statusCtrl.value ? String(statusCtrl.value).toUpperCase() : '';
        if (cur !== 'Z') {
          statusCtrl.setValue('Y');
        }
      } catch (e) {
        // ignore
      }
    }
    this._detailCountPrev = curr;
  }

  // 依照 crudstatus 與 forceEditAll 設定各 form 控制項 enable/disable
  configureFormControls() {
    const editableOnEdit = ['CONTACT_ADDR', 'CONTACT_TEL', 'CELL_PHONE', 'E_MAIL', 'ALERT_DATE', 'STATUS'];
    // 若為高權限，全部啟用
    if (this.forceEditAll) {
      const ctrls: any = this.dataForm.controls as any;
      Object.keys(ctrls).forEach((name: string) => {
        ctrls[name].enable();
      });
      return;
    }
    // Create：全部啟用； Read：保持現狀（initializePage 會處理 disable）； Edit：只啟用白名單
    if (this.crudstatus === CRUDStatus.Create) {
      const ctrls: any = this.dataForm.controls as any;
      Object.keys(ctrls).forEach((name: string) => {
        ctrls[name].enable();
      });
      return;
    }
    if (this.crudstatus === CRUDStatus.Edit) {
      const ctrls: any = this.dataForm.controls as any;
      Object.keys(ctrls).forEach((name: string) => {
        if (editableOnEdit.includes(name)) {
          ctrls[name].enable();
        } else {
          ctrls[name].disable();
        }
      });
      return;
    }
    // Read 模式：由 initializePage 控制是否 disable，這裡不強制修改
  }

  onSubmit(form: FormGroup): void {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      if (this.tableEditComponent) {
        const valid = this.tableEditComponent.validateAndShowErrors();
        if (!valid) {
          this.loading = false;
          return;
        }
      }
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // 新增主檔request
            const insertRequest: InsertCPM12050Request = {
              KIND_ID: formValue.KIND_ID,
              KIND_ID_SUB: formValue.KIND_ID_SUB,
              SUGG_SOURCE: formValue.SUGG_SOURCE,
              ORG_ID: formValue.ORG_ID,
              COMPLAIN_NOTES: formValue.COMPLAIN_NOTES,
              CUST_NAME: formValue.CUST_NAME,
              SEX: formValue.SEX,
              CONTACT_ADDR: formValue.CONTACT_ADDR,
              CONTACT_TEL: formValue.CONTACT_TEL,
              CELL_PHONE: formValue.CELL_PHONE,
              E_MAIL: formValue.E_MAIL,
              SUGG_SOURCE_OTHER: (formValue as any).SUGG_SOURCE_OTHER ?? '',
              MEMBER_ID: formValue.MEMBER_ID,
              ANSWER_YN: formValue.ANSWER_YN ? String(formValue.ANSWER_YN).toUpperCase() : formValue.ANSWER_YN,
              STATUS: formValue.STATUS ?? formValue.ANSWER_YN ?? 'S',
              SUGG_TYPE: formValue.SUGG_TYPE,
              CLASS_EMAIL: formValue.CLASS_EMAIL,
              USR_NO: formValue.CRT_USR_No,
              USR_NAME: formValue.CRT_USR_Name
            };

            // 只呼叫主檔新增（新增模式無明細資料）
            this.cpm12050Service.insertCPM12050(insertRequest)
              .pipe(
                untilDestroyed(this),
                finalize(() => this.loading = false)
              )
              .subscribe((response: any) => {
                console.log('insertCPM12050 response', response);
                // 嘗試從 response 中找回新建立的識別（優先 SEQ_ID，否則 ID）
                const seq = response?.Data?.SEQ_ID ?? (Array.isArray(response?.Data) ? response.Data[0]?.SEQ_ID : undefined) ?? response?.SEQ_ID;
                const newId = response?.ID ?? (Array.isArray(response?.Data) ? response.Data[0]?.ID : undefined);

                this.messageService.successBubble('新增成功');

                // 若能取得 SEQ_ID 或 ID，立即呼叫查詢剛新增的那筆，確保 UI 與後端同步
                if (seq) {
                  this.cpm12050Service.queryCPM12050({ SEQ_ID: seq })
                    .pipe(untilDestroyed(this))
                    .subscribe(r => {
                      // 如果需要把查到的資料帶入 CRU 或轉導到編輯頁，可在此處處理
                      console.log('queried new record by SEQ_ID', r);
                      // 例如回列表或關閉 CRU
                      this.onCancel();
                    });
                  // ALERT_DATE 與 STATUS 聯動：
                  // - 新增時預設 STATUS = 'S'
                  // - 若 STATUS 為 'Y' 或 'Z'，則 ALERT_DATE 為必填；若已有值則將其 disable (唯讀)
                  // - 若 STATUS 非 'Y'/'Z'，則移除必填並確保 ALERT_DATE 可編輯
                  return;
                }

                if (newId) {
                  this.cpm12050Service.queryCPM12050({ ID: newId })
                    .pipe(untilDestroyed(this))
                    .subscribe(r => {
                      console.log('queried new record by ID', r);
                      this.onCancel();
                    });
                  return;
                }

                // 無法取得識別則維持原行為
                this.dataForm.reset(); // 重置表單
              });

          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // 修改主檔request
            const updateRequest: UpdateCPM12050Request = {
              ID: this.rowdata?.ID || 0,
              KIND_ID: formValue.KIND_ID ?? this.rowdata?.KIND_ID,
              KIND_ID_SUB: formValue.KIND_ID_SUB ?? this.rowdata?.KIND_ID_SUB,
              CUST_NAME: formValue.CUST_NAME ?? this.rowdata?.CUST_NAME,
              SEX: formValue.SEX ?? this.rowdata?.SEX,
              CONTACT_ADDR: formValue.CONTACT_ADDR ?? this.rowdata?.CONTACT_ADDR,
              CONTACT_TEL: formValue.CONTACT_TEL ?? this.rowdata?.CONTACT_TEL,
              CELL_PHONE: formValue.CELL_PHONE ?? this.rowdata?.CELL_PHONE,
              E_MAIL: formValue.E_MAIL ?? this.rowdata?.E_MAIL,
              COMPLAIN_NOTES: formValue.COMPLAIN_NOTES ?? this.rowdata?.COMPLAIN_NOTES,
              SUGG_SOURCE: formValue.SUGG_SOURCE ?? this.rowdata?.SUGG_SOURCE,
              SUGG_SOURCE_OTHER: (formValue as any).SUGG_SOURCE_OTHER ?? this.rowdata?.SUGG_SOURCE_OTHER ?? '',
              ORG_ID: formValue.ORG_ID ?? this.rowdata?.ORG_ID,
              MEMBER_ID: formValue.MEMBER_ID ?? this.rowdata?.MEMBER_ID,
              SUGG_TYPE: formValue.SUGG_TYPE ?? (this.rowdata as any)?.SUGG_TYPE,
              ANSWER_YN: formValue.ANSWER_YN ? String(formValue.ANSWER_YN).toUpperCase() : this.rowdata?.ANSWER_YN ?? undefined,
              CLASS_EMAIL: formValue.CLASS_EMAIL ?? (this.rowdata as any)?.CLASS_EMAIL,
              // If forceEditAll (高權限) allow STATUS from form; otherwise default to 'Y'
              STATUS: this.forceEditAll ? (formValue.STATUS ?? this.rowdata?.STATUS) : 'Y',
              USR_NO: formValue.CRT_USR_No ?? this.rowdata?.CRT_USR_No,
              USR_NAME: formValue.CRT_USR_Name ?? this.rowdata?.CRT_USR_Name
            };
            // 過濾出新增的明細（沒有 SEQ_ID 的是新資料）
            const newDetails: InsertCPM12050DetailRequest[] = this.data
              .filter(item => !item.SEQ_ID)
              .map(item => ({
                ...item,
                SEQ_ID: this.rowdata?.SEQ_ID || '',
                USR_NO: formValue.CRT_USR_No,
                USR_NAME: formValue.CRT_USR_Name
              }));

            // 組合 API 請求：主檔修改 + 新明細新增（若有）
            // 對後端容易受 null 影響的 string 欄位做清理（null -> ''），並印出 payload 便於檢查
            const payload: any = { ...updateRequest } as any;
            const stringFields = [
              'KIND_ID', 'KIND_ID_SUB', 'CUST_NAME', 'SEX', 'CONTACT_ADDR', 'CONTACT_TEL', 'CELL_PHONE', 'E_MAIL',
              'COMPLAIN_NOTES', 'SUGG_SOURCE', 'SUGG_SOURCE_OTHER', 'ORG_ID', 'MEMBER_ID', 'SUGG_TYPE', 'ANSWER_YN', 'CLASS_EMAIL', 'STATUS', 'USR_NO', 'USR_NAME'
            ];
            stringFields.forEach(f => {
              // keep null for missing optional fields (backend may expect null rather than empty string)
              if (payload[f] === undefined || payload[f] === '') payload[f] = null;
              if (payload[f] === null) return;
              // ensure status and answer flags are upper-case strings
              if (f === 'STATUS' || f === 'ANSWER_YN') payload[f] = String(payload[f]).toUpperCase();
            });
            console.log('updateCPM12050 req', payload);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const requests: Observable<any>[] = [
              this.cpm12050Service.updateCPM12050(payload)
            ];
            if (newDetails.length > 0) {
              requests.push(this.cpm12050Service.insertCPM12050Detail(newDetails));
            }

            forkJoin(requests)
              .pipe(
                untilDestroyed(this),
                finalize(() => this.loading = false)
              )
              .subscribe({
                next: () => {
                  this.messageService.successBubble('修改成功');
                  this.onCancel();
                },
                error: (err) => {
                  console.error('updateCPM12050 error', err);
                  const msg = err?.error?.Message || err?.message || '修改失敗（後端錯誤）';
                  this.messageService.errorBubble(msg);
                }
              });
          }
          break;
      }
    });
  }

  loadOptions() {
    // 獲取組織下拉選項
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.orgIdQueryOptions = res.Data.map(item => ({
          ...item,
          value: item.No,
          label: `${item.No} - ${item.Name}`,
        }));
      })
    // 獲取意見類型下拉選項
    this.dropDownListService.queryCSS1002DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.kindIdOptions = this.kindIdOptions.concat(
          res.Data.map(item => ({
            value: item.No,
            label: `${item.No} - ${item.Name}`,
          }))
        );
      })
    // 直接載入責任單位選項，與 ORG_ID_QUERY 無關，保持獨立
    this.dropdownApiService.queryCss1005()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.orgIdOptions = res || [];
      });
  }

  onOrgQueryChange(orgId: string) {
    // 不更動 orgIdOptions，讓 ORG_ID 與 ORG_ID_QUERY 完全獨立
    return;
  }

  onKindChange(kindId: string) {
    if (!kindId) {
      this.kindIdSubOptions = [];
      this.dataForm.patchValue({ KIND_ID_SUB: null });
      return;
    }
    this.dropDownListService.queryCSS1003DropDownList(kindId)
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.kindIdSubOptions = res.Data.map(item => ({
          value: item.No,
          label: `${item.No} - ${item.Name}`,
        }));
      })
  }
}
