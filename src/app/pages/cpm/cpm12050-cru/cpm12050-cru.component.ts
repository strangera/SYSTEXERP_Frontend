import { NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { ImageService } from '@service/utility/image.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';
import { GalleriaModule } from 'primeng/galleria';
import { PanelModule } from 'primeng/panel';
import { Observable, catchError, finalize, firstValueFrom, forkJoin, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CPM12050Data, CPM12050Service, InsertCPM12050DetailRequest, InsertCPM12050Request, UpdateCPM12050DetailRequest, UpdateCPM12050Request } from '../../../service/api/cpm/cpm12050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';

@Component({
  selector: 'app-cpm12050-cru',
  templateUrl: './cpm12050-cru.component.html',
  styleUrls: ['./cpm12050-cru.component.scss'],
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
    CalendarComponent,
    FileUploadModule,
    GalleriaModule
  ]
})
export class CPM12050CRUComponent extends BasicCruPageComponent<CPM12050Data> implements OnInit {
  // 若觸發高權限編輯，則強制允許編輯 (繞過一般權限判斷)
  forceEditAll = false;

  // 手機號碼驗證：若有填寫，必須至少10碼且只能為數字
  cellPhoneValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || String(value).trim() === '') return null;
    const str = String(value).trim();
    if (!/^\d{10,}$/.test(str)) return { cellPhone: '手機號碼須為至少10碼的純數字' };
    return null;
  };

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
    ORG_ID: [null as string | null, Validators.required],                           // 組織（自動帶入）
    CLASS_ID: [null as string | null, Validators.required],                         // CLASS_ID（必填）
    COMPLAIN_NOTES: [null, [Validators.required, Validators.maxLength(1000)]],    // 顧客意見內容（必填）
    CUST_NAME: [null, Validators.maxLength(20)],                                  // 客戶姓名
    SEX: [null],                                                                  // 性別
    CONTACT_ADDR: [null],                                                         // 聯絡地址
    CONTACT_TEL: [null, Validators.maxLength(20)],                                // 聯絡電話
    CELL_PHONE: [null, [Validators.maxLength(10), this.cellPhoneValidator]],       // 手機號碼
    E_MAIL: [null, [Validators.email, Validators.maxLength(100)]],                // Email
    // SUGG_SOURCE_OTHER: [null, Validators.required],                               // 其他建議來源
    MEMBER_ID: [null],                                                            // 會員編號
    CRT_USR_No: [null as string | null],                                           // 建檔人編號
    CRT_USR_Name: [null as string | null],
    COMPLAIN_DATE: [new Date() as Date | null],
    ALERT_DATE: [null],
    ANSWER_YN: [null],
    STATUS: [null],
    SUGG_TYPE: [null, Validators.required], // 意見類型（必填）
    CLASS_EMAIL: [null],
    CLOSE_DATE: [null],                                                          // 結案日期（唯讀，由結案動作帶入）
    SEQ_ID: [null as string | null],                                             // 客戶意見編號（唯讀顯示用）
  });
  uploadedFiles: any[] = [];
  mediaItems: { url: string; type: 'image' | 'video'; name: string }[] = [];
  visible = false;
  // Galleria items for PrimeNG
  galleriaItems: { url: string; type: 'image' | 'video'; name: string }[] = [];
  galleriaActiveIndex = 0;
  // 三個檔案欄位
  formFile1?: File | null = null;
  formFile2?: File | null = null;
  formFile3?: File | null = null;

  @ViewChild('fileUpload1') fileUpload1!: FileUpload;
  @ViewChild('fileUpload2') fileUpload2!: FileUpload;
  @ViewChild('fileUpload3') fileUpload3!: FileUpload;
  // 已存在後端檔案名稱（若後端有紀錄，顯示下載連結）
  existingFile1: string | null = null;
  existingFile2: string | null = null;
  existingFile3: string | null = null;
  // 後端實際儲存的路徑/檔名（下載/刪除請求需用此值）
  rawExistingFile1: string | null = null;
  rawExistingFile2: string | null = null;
  rawExistingFile3: string | null = null;
  ANSWER_YNOptions = [
    { label: '處理中', value: '1' },
    { label: '結案', value: '2' },
    { label: '已建立', value: '3' },
    { label: '已派單', value: '4' }
  ];
  SUGG_TYPEOptions = [
    { label: '客訴', value: '0' },
    { label: '表揚', value: '1' },
    // deleteImage API usage removed per request: UI no longer offers delete button.

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
  suggSourceOptions = getSYS1000Options('SUGG_SOURCE');
  // 組織選項
  orgIdQueryOptions: any[] = [];

  // 責任單位選項
  orgIdOptions: any[] = [];

  // CSS10031 類別資訊 — 下拉選單選項
  css10031Options: { label: string; value: string }[] = [];
  //#endregion

  // 編輯table設定
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  data: any[] = [];
  private _originalDetails: any[] = [];
  private _detailCountPrev = 0;
  private _alertDateInitiallyProvided = false;
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
  isExistingDetail = (rowData: Record<string, any>): boolean => !!rowData['SEQ_ID'];
  detailRowSelectable: (rowData: any, rowIndex: number, data: any) => boolean | undefined = (rowData) => {
    try {
      if (this.forceEditAll) return true;
      return !this.isExistingDetail(rowData);
    } catch (e) {
      return true;
    }
  }

  // wrapper for row edit disabled logic that respects high-privilege override
  rowEditDisabledWrapper: (rowData: any, rowIndex?: number, data?: any) => boolean = (rowData) => {
    try {
      // 當 forceEditAll 時允許編輯既有明細
      if (this.forceEditAll) return false;
      return this.isExistingDetail(rowData);
    } catch (e) {
      return false;
    }
  }

  constructor(
    private cpm12050Service: CPM12050Service,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService,
    private imageService: ImageService,
    private http: HttpClient
  ) {
    super();
  }

  /** 把 Date 物件格式化為本地時間的 ISO 字串（避免 toISOString() 轉 UTC 造成日期跑掉） */
  private toLocalISOString(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00:00`;
  }

  getImageUrl(): string | null {
    if (this.rowdata && this.rowdata.FileName1) {
      return environment.ApiUrl + '/' + this.rowdata.FileName1;
    }
    return null;
  }

  private openProtectedUrl(url: string) {
    const token = this.authService.getUserInfo()?.AccessToken;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    this.http.get(url, { responseType: 'blob', headers: headers as any })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (blob: Blob) => {
          const objectUrl = window.URL.createObjectURL(blob);
          window.open(objectUrl, '_blank');
          // release after a while
          setTimeout(() => { try { window.URL.revokeObjectURL(objectUrl); } catch (e) { } }, 60000);
        },

      });
  }

  private openUrlWithAuthIfNeeded(url: string) {
    try {
      const apiBase = (environment.ApiUrl || '').replace(/\/$/, '');
      if (apiBase && url.startsWith(apiBase)) {
        this.openProtectedUrl(url);
      } else {
        window.open(url, '_blank');
      }
    } catch (e) {
      window.open(url, '_blank');
    }
  }

  // 用於 template 的公開方法：點擊時在新分頁開啟圖片（會依需帶授權）
  openInNewTab(url: string) {
    if (!url) return;
    this.openUrlWithAuthIfNeeded(url);
  }

  // 嘗試在 galleria 內嵌顯示圖片（先嘗試直接載入，不行再帶授權下載 blob）
  openInGalleria(rawUrl: string) {
    if (!rawUrl) return;
    const makeFull = (u: string) => {
      if (/^https?:\/\//i.test(u)) return u;
      return `${environment.ApiUrl.replace(/\/$/, '')}/${String(u).replace(/^\/+/, '')}`;
    };
    const full = makeFull(rawUrl);

    // 先用瀏覽器 Image 嘗試載入（不帶 header），成功則直接用該 URL 顯示
    const img = new Image();
    img.onload = () => {
      this.galleriaItems = [{ url: full, type: 'image', name: full.split('/').pop() || '' }];
      this.visible = true;
    };
    img.onerror = () => {
      // 直接載入失敗（可能為 401/403/404），改用帶授權的 blob 下載
      const token = this.authService.getUserInfo()?.AccessToken;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      this.http.get(full, { responseType: 'blob', headers: headers as any })
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (blob: Blob) => {
            const objectUrl = window.URL.createObjectURL(blob);
            this.galleriaItems = [{ url: objectUrl, type: 'image', name: full.split('/').pop() || '' }];
            this.visible = true;
            setTimeout(() => { try { window.URL.revokeObjectURL(objectUrl); } catch (e) { } }, 60000);
          },
          error: (err: any) => {
            const msg = err?.status === 404 ? '找不到檔案' : (err?.status === 401 ? '需要授權存取檔案' : '無法載入檔案');
            this.messageService.errorBubble(msg);
          }
        });
    };
    img.src = full;
  }

  // 為點擊檔名建立 galleria 並顯示（一次處理最多三張，依 slot 順序）
  async openGalleriaFromSlot(slot: 1 | 2 | 3) {
    if (!this.rowdata) return;
    const raws = [this.rawExistingFile1, this.rawExistingFile2, this.rawExistingFile3];
    const clickedIndex = slot - 1;
    const candidates = raws.map(r => r ?? null).filter(r => !!r) as string[];
    if (candidates.length === 0) {
      this.messageService.errorBubble('沒有可預覽的檔案');
      return;
    }

    const makeFull = (u: string) => {
      if (/^https?:\/\//i.test(u)) return u;
      return `${environment.ApiUrl.replace(/\/$/, '')}/${String(u).replace(/^\/+/, '')}`;
    };

    const loadOrFetch = (u: string) => new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(makeFull(u));
      img.onerror = () => {
        // try blob with auth
        const token = this.authService.getUserInfo()?.AccessToken;
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        this.http.get(makeFull(u), { responseType: 'blob', headers: headers as any }).pipe(untilDestroyed(this)).subscribe({
          next: (blob: Blob) => {
            const objectUrl = window.URL.createObjectURL(blob);
            // autoset revoke after 60s
            setTimeout(() => { try { window.URL.revokeObjectURL(objectUrl); } catch (e) { } }, 60000);
            resolve(objectUrl);
          },
          error: (err: any) => reject(err)
        });
      };
      img.src = makeFull(u);
    });

    try {
      // only open the clicked slot's file (single image preview)
      const rawMap = [this.rawExistingFile1, this.rawExistingFile2, this.rawExistingFile3];
      const raw = rawMap[clickedIndex];
      if (!raw) {
        this.messageService.errorBubble('沒有可預覽的檔案');
        return;
      }
      const full = makeFull(raw);
      console.log('openGalleriaFromSlot single:', raw, 'full:', full, 'slot', slot);

      // show backend URL immediately
      this.galleriaItems = [{ url: full, type: 'image', name: String(raw).split('/').pop() || '' }];
      this.galleriaActiveIndex = 0;
      this.visible = true;

      // background: if direct load fails, try blob with auth and replace
      try {
        const resolved = await loadOrFetch(raw as string);
        if (resolved && resolved !== full) {
          this.galleriaItems = [{ url: resolved, type: 'image', name: String(raw).split('/').pop() || '' }];
        }
        console.log('openGalleriaFromSlot resolved:', resolved);
      } catch (err) {
        console.warn('openGalleriaFromSlot loadOrFetch failed for', raw, err);
      }
    } catch (e) {
      console.error('openGalleriaFromSlot error', e);
      this.messageService.errorBubble('載入檔案失敗');
    }
  }

  private setupAlertDateValidation(): void {
    const statusCtrl: any = (this.dataForm.controls as any).STATUS;
    const alertCtrl: any = (this.dataForm.controls as any).ALERT_DATE;
    if (!statusCtrl || !alertCtrl) return;

    try {
      alertCtrl.statusChanges.pipe(untilDestroyed(this)).subscribe((s: any) => {
        console.log('DEBUG ALERT_DATE statusChanges ->', s, 'disabled=', alertCtrl.disabled);
      });
    } catch (e) { }

    // 若為新增，預設 STATUS 為 'S'
    if (this.crudstatus === CRUDStatus.Create) {
      try { statusCtrl.setValue('3', { emitEvent: false }); } catch (e) { /* ignore */ }
    }

    const applyRules = (status: any) => {
      const key = status ? String(status).toUpperCase() : '';
      const isRequired = key === '1' || key === '2';
      if (isRequired) {
        alertCtrl.setValidators([Validators.required]);
        alertCtrl.updateValueAndValidity({ emitEvent: true });
        // 不在此處改變 enable/disable，以避免在使用者互動時被自動鎖定
      } else {
        alertCtrl.clearValidators();
        alertCtrl.updateValueAndValidity({ emitEvent: true });
        // 非必填時由後續邏輯決定是否 enable（例如檢視模式）
      }
    };

    // 先套用一次當前狀態（只設定驗證規則）
    applyRules(statusCtrl.value);

    // 當 STATUS 改變時僅更新驗證器，不自動鎖定欄位
    statusCtrl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((s: any) => applyRules(s));

    // 不監聽 ALERT_DATE 的 valueChanges 避免在使用者輸入後被自動鎖住

    // 初始化後：若為檢視模式且不允許強制編輯，或是後端載入時已有 ALERT_DATE 且狀態為 Y/Z，則把欄位設為唯讀
    try {
      const statusKey = statusCtrl.value ? String(statusCtrl.value).toUpperCase() : '';
      const isYorZ = statusKey === '1' || statusKey === '2';
      if (this.crudstatus === CRUDStatus.Read && !this.forceEditAll) {
        console.log('DEBUG: init disable ALERT_DATE because Read mode');
        alertCtrl.disable({ emitEvent: false });
      } else if (this._alertDateInitiallyProvided && isYorZ) {
        // 如果後端原本就有 ALERT_DATE 且狀態為 Y/Z，則初始化為唯讀
        console.log('DEBUG: init disable ALERT_DATE because backend provided + status Y/Z');
        alertCtrl.disable({ emitEvent: false });
      } else {
        // 其他情況（新增、編輯且無後端 ALERT_DATE），保持可編輯
        console.log('DEBUG: init enable ALERT_DATE');
        alertCtrl.enable({ emitEvent: false });
      }
    } catch (e) {
      // ignore
    }
  }

  getAnswerYnLabel(code: any): string {
    if (code === null || code === undefined || code === '') return '';
    const key = String(code).toUpperCase();
    const found = this.ANSWER_YNOptions.find(o => String(o.value).toUpperCase() === key);
    return found ? found.label : String(code);
  }

  // 依據目前模式與狀態回傳 STATUS 下拉選項
  get statusOptions() {
    try {
      const statusCtrl: any = (this.dataForm.controls as any).STATUS;
      const current = statusCtrl && statusCtrl.value ? String(statusCtrl.value).toUpperCase() : (this.rowdata ? String((this.rowdata as any).STATUS ?? '').toUpperCase() : '');
      // 編輯模式且目前為處理中（Y）時，僅允許保留 Y 或變更為 Z
      if (this.crudstatus === CRUDStatus.Edit && current === '1') {
        return this.ANSWER_YNOptions.filter(o => o.value === '1' || o.value === '2');
      }
    } catch (e) {
      // ignore
    }
    return this.ANSWER_YNOptions;
  }

  ngOnInit(): void {
    this.initializePage('CPM12050', this.dataForm);
    const state = this.router.lastSuccessfulNavigation?.extras.state;
    this.forceEditAll = !!state?.['forceEditAll'];
    this.loadOptions();

    // 隱藏的建檔人欄位需自動帶入目前使用者
    const user = this.authService.getUserInfo();
    if (user) {
      this.dataForm.patchValue({
        CRT_USR_No: user.user_No ?? null,
        CRT_USR_Name: user.user_Name ?? null
      });
    }

    // 編輯/檢視模式：打 API 取完整主檔 + 明細資料
    if (this.rowdata) {
      this.cpm12050Service.queryCPM12050Detail({
        ID: this.rowdata.ID,
        SEQ_ID: this.rowdata.SEQ_ID!
      })
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          const allRows = response.Data ?? [];
          const master = allRows[0]; // 主檔資料（每筆都相同，取第一筆）
          if (!master) return;

          // 預先載入下拉選項（需要在 patchValue 前）
          if (master.KIND_ID) this.onKindChange(master.KIND_ID);
          if (master.KIND_ID_SUB) this.onKindSubChange(master.KIND_ID_SUB);
          if (master.ORG_ID) this.onOrgQueryChange(master.ORG_ID);

          // 填主表單
          this.dataForm.patchValue({
            KIND_ID: master.KIND_ID ?? null,
            KIND_ID_SUB: master.KIND_ID_SUB ?? null,
            SUGG_SOURCE: master.SUGG_SOURCE ?? null,
            ORG_ID: master.ORG_ID ?? null,
            CLASS_ID: master.CLASS_ID ?? null,
            COMPLAIN_NOTES: master.COMPLAIN_NOTES ?? null,
            CUST_NAME: master.CUST_NAME ?? null,
            SEX: master.SEX ?? null,
            CONTACT_ADDR: master.CONTACT_ADDR ?? null,
            CONTACT_TEL: master.CONTACT_TEL ?? null,
            CELL_PHONE: master.CELL_PHONE ?? null,
            E_MAIL: master.E_MAIL ?? null,
            MEMBER_ID: master.MEMBER_ID ?? null,
            CLASS_EMAIL: master.CLASS_EMAIL ?? null,
            SUGG_TYPE: master.SUGG_TYPE ?? null,
            COMPLAIN_DATE: master.COMPLAIN_DATE ? new Date(master.COMPLAIN_DATE) : null,
            ALERT_DATE: master.ALERT_DATE ? new Date(master.ALERT_DATE) : null,
            CLOSE_DATE: master.CLOSE_DATE ? new Date(master.CLOSE_DATE) : null,
            SEQ_ID: master.SEQ_ID ?? null,
            ANSWER_YN: master.ANSWER_YN ? String(master.ANSWER_YN).toUpperCase() : null,
            STATUS: master.STATUS ? String(master.STATUS).toUpperCase() : null
          } as any);

          // 既有檔案顯示名稱
          const extractName = (p: any) => {
            if (!p) return null;
            const s = String(p);
            return s.split('\\').pop()?.split('/').pop() ?? s;
          };
          this.rawExistingFile1 = master.FileName1 ?? null;
          this.rawExistingFile2 = master.FileName2 ?? null;
          this.rawExistingFile3 = master.FileName3 ?? null;
          this.existingFile1 = extractName(master.FileName1);
          this.existingFile2 = extractName(master.FileName2);
          this.existingFile3 = extractName(master.FileName3);
          this._alertDateInitiallyProvided = !!master.ALERT_DATE;

          // 明細 table：只取有 DETAIL_ID 的筆數
          this.data = allRows.filter(r => r.DETAIL_ID != null).map(r => ({
            ID: r.DETAIL_ID,
            SEQ_ID: r.SEQ_ID,
            ANSWER: r.ANSWER,
            ANSWER_ID: r.ANSWER_ID,
            ANSWER_DATE: r.ANSWER_DATE
          }));
          this._detailCountPrev = this.data.length;
          this._originalDetails = JSON.parse(JSON.stringify(this.data));

          if (this.crudstatus === CRUDStatus.Read && !this.forceEditAll) {
            try {
              (this.dataForm.controls as any).ANSWER_YN.disable();
              (this.dataForm.controls as any).STATUS.disable();
            } catch (e) { }
          }

          this.configureFormControls();
          this.setupAlertDateValidation();
        });
    } else {
      // 新增模式
      this.configureFormControls();
      this.setupAlertDateValidation();
    }
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
        // 只有在狀態不是 2（結案）時才改為 1（處理中）
        const cur = statusCtrl && statusCtrl.value ? String(statusCtrl.value) : '';
        if (cur !== '2') {
          statusCtrl.setValue('1');
        }
      } catch (e) {
        // ignore
      }
    }
    this._detailCountPrev = curr;
  }

  // 依照 crudstatus 與 forceEditAll 設定各 form 控制項 enable/disable
  configureFormControls() {
    // STATUS、CLOSE_DATE、SEQ_ID 在所有模式下皆為唯讀，由系統自動管理
    const alwaysReadonly = ['STATUS', 'CLOSE_DATE', 'SEQ_ID'];
    const editableOnEdit = ['CONTACT_ADDR', 'CONTACT_TEL', 'CELL_PHONE', 'E_MAIL', 'ALERT_DATE'];
    // 若為高權限，除 CLOSE_DATE 外全部啟用
    if (this.forceEditAll) {
      const ctrls: any = this.dataForm.controls as any;
      Object.keys(ctrls).forEach((name: string) => {
        if (name === 'CLOSE_DATE') {
          ctrls[name].disable();
        } else {
          ctrls[name].enable();
        }
      });
      return;
    }
    // Create：除 alwaysReadonly 外全部啟用
    if (this.crudstatus === CRUDStatus.Create) {
      const ctrls: any = this.dataForm.controls as any;
      Object.keys(ctrls).forEach((name: string) => {
        if (alwaysReadonly.includes(name)) {
          ctrls[name].disable();
        } else {
          ctrls[name].enable();
        }
      });
      return;
    }
    // Edit：只啟用白名單，其餘（含 STATUS、CLOSE_DATE）disable
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

    if (!(this.isFormCreateable || this.isFormEditable)) {
      this.messageService.errorBubble('目前不允許執行此操作（非新增或無編輯權限）');
      return;
    }

    this.handleSubmit(form, () => {
      if (this.tableEditComponent) {
        const valid = this.tableEditComponent.validateAndShowErrors();
        if (!valid) {
          this.loading = false;
          return;
        }
      }

      switch (this.crudstatus) {
        case CRUDStatus.Create: {
          if (!this.canAdd()) {
            this.messageService.errorBubble('沒有新增權限');
            this.loading = false;
            return;
          }

          const insertRequest: InsertCPM12050Request = {
            KIND_ID: formValue.KIND_ID,
            KIND_ID_SUB: formValue.KIND_ID_SUB,
            SUGG_SOURCE: formValue.SUGG_SOURCE,
            ORG_ID: formValue.ORG_ID,
            CLASS_ID: formValue.CLASS_ID,
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
            STATUS: formValue.STATUS ?? formValue.ANSWER_YN ?? '3',
            SUGG_TYPE: formValue.SUGG_TYPE,
            CLASS_EMAIL: formValue.CLASS_EMAIL,
            COMPLAIN_DATE: formValue.COMPLAIN_DATE ? this.toLocalISOString(new Date(formValue.COMPLAIN_DATE)) : undefined,
            ALERT_DATE: formValue.ALERT_DATE ? this.toLocalISOString(new Date(formValue.ALERT_DATE)) : undefined,
            USR_NO: formValue.CRT_USR_No,
            USR_NAME: formValue.CRT_USR_Name
          };

          const formData = new FormData();
          Object.keys(insertRequest || {}).forEach(k => {
            const v = (insertRequest as Record<string, unknown>)[k];
            formData.append(k, v === undefined || v === null ? '' : String(v));
          });
          if (this.formFile1) formData.append('formFile1', this.formFile1, this.formFile1.name);
          if (this.formFile2) formData.append('formFile2', this.formFile2, this.formFile2.name);
          if (this.formFile3) formData.append('formFile3', this.formFile3, this.formFile3.name);

          this.cpm12050Service.insertCPM12050(formData)
            .pipe(untilDestroyed(this), finalize(() => this.loading = false))
            .subscribe((response: Record<string, unknown>) => {
              this.messageService.successBubble('新增成功');
              const seq = (response?.['Data'] as Record<string, unknown>)?.['SEQ_ID'] ?? response?.['SEQ_ID'];
              const dataArr = response?.['Data'];
              const newId = response?.['ID'] ?? (Array.isArray(dataArr) ? (dataArr[0] as Record<string, unknown>)?.['ID'] : undefined);
              if (seq) {
                this.cpm12050Service.queryCPM12050({ SEQ_ID: String(seq) }).pipe(untilDestroyed(this)).subscribe(() => this.onCancel());
                return;
              }
              if (newId) {
                this.cpm12050Service.queryCPM12050({ ID: Number(newId) }).pipe(untilDestroyed(this)).subscribe(() => this.onCancel());
                return;
              }
              this.dataForm.reset();
            });

          break;
        }

        case CRUDStatus.Edit: {
          // build update request
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
            CLASS_ID: formValue.CLASS_ID ?? this.rowdata?.CLASS_ID,
            MEMBER_ID: formValue.MEMBER_ID ?? this.rowdata?.MEMBER_ID,
            SUGG_TYPE: formValue.SUGG_TYPE ?? (this.rowdata as any)?.SUGG_TYPE,
            ANSWER_YN: formValue.ANSWER_YN ? String(formValue.ANSWER_YN).toUpperCase() : this.rowdata?.ANSWER_YN ?? undefined,
            CLASS_EMAIL: formValue.CLASS_EMAIL ?? (this.rowdata as any)?.CLASS_EMAIL,
            STATUS: this.forceEditAll ? (formValue.STATUS ?? this.rowdata?.STATUS) : '1',
            ALERT_DATE: formValue.ALERT_DATE ? this.toLocalISOString(new Date(formValue.ALERT_DATE)) : (this.rowdata?.ALERT_DATE ? this.toLocalISOString(new Date(this.rowdata.ALERT_DATE)) : undefined),
            USR_NO: formValue.CRT_USR_No ?? this.rowdata?.CRT_USR_No,
            USR_NAME: formValue.CRT_USR_Name ?? this.rowdata?.CRT_USR_Name
          };

          const newDetails: InsertCPM12050DetailRequest[] = this.data
            .filter(item => !item.SEQ_ID)
            .map(item => ({ ...item, SEQ_ID: this.rowdata?.SEQ_ID || '', USR_NO: formValue.CRT_USR_No, USR_NAME: formValue.CRT_USR_Name }));

          const payload: any = { ...updateRequest } as any;
          const stringFields = ['KIND_ID', 'KIND_ID_SUB', 'CUST_NAME', 'SEX', 'CONTACT_ADDR', 'CONTACT_TEL', 'CELL_PHONE', 'E_MAIL', 'COMPLAIN_NOTES', 'SUGG_SOURCE', 'SUGG_SOURCE_OTHER', 'ORG_ID', 'MEMBER_ID', 'SUGG_TYPE', 'ANSWER_YN', 'CLASS_EMAIL', 'STATUS', 'ALERT_DATE', 'USR_NO', 'USR_NAME'];
          stringFields.forEach(f => { if (payload[f] === undefined || payload[f] === '') payload[f] = null; if (payload[f] === null) return; if (f === 'STATUS' || f === 'ANSWER_YN') payload[f] = String(payload[f]).toUpperCase(); });

          const requests: Observable<any>[] = [];
          const mainFields = ['KIND_ID', 'KIND_ID_SUB', 'CUST_NAME', 'SEX', 'CONTACT_ADDR', 'CONTACT_TEL', 'CELL_PHONE', 'E_MAIL', 'COMPLAIN_NOTES', 'SUGG_SOURCE', 'SUGG_SOURCE_OTHER', 'ORG_ID', 'MEMBER_ID', 'SUGG_TYPE', 'CLASS_EMAIL', 'ALERT_DATE', 'STATUS', 'USR_NO', 'USR_NAME'];
          const row: any = this.rowdata || {};
          const normalize = (v: any) => (v === undefined || v === null ? null : String(v));
          const mainChanged = mainFields.some(f => { if (f === 'ALERT_DATE') { const a = formValue.ALERT_DATE ? new Date(formValue.ALERT_DATE).toISOString() : null; const b = row.ALERT_DATE ? new Date(row.ALERT_DATE).toISOString() : null; return a !== b; } if (f === 'STATUS' && formValue[f] != null) { return String(formValue[f]).toUpperCase() !== String(row[f] ?? '').toUpperCase(); } return normalize(formValue[f]) !== normalize(row[f]); });

          const hasFilesEdit = !!(this.formFile1 || this.formFile2 || this.formFile3);
          if (hasFilesEdit || mainChanged) {
            const formData = new FormData();
            Object.keys(payload || {}).forEach(k => { const v = payload[k]; formData.append(k, v === undefined || v === null ? '' : String(v)); });
            if (this.formFile1) formData.append('formFile1', this.formFile1, this.formFile1.name);
            if (this.formFile2) formData.append('formFile2', this.formFile2, this.formFile2.name);
            if (this.formFile3) formData.append('formFile3', this.formFile3, this.formFile3.name);
            requests.push(this.cpm12050Service.updateCPM12050(formData));
          }
          if (newDetails.length > 0) requests.push(this.cpm12050Service.insertCPM12050Detail(newDetails));

          const updatedDetails: UpdateCPM12050DetailRequest[] = (this.data || []).filter((item: any) => !!item.SEQ_ID).map((item: any) => {
            const orig = this._originalDetails.find((o: any) => { try { if (o.ID !== undefined && item.ID !== undefined) return String(o.ID) === String(item.ID); return String(o.SEQ_ID) === String(item.SEQ_ID); } catch (e) { return false; } });
            if (!orig) return null;
            const sanitize = (obj: any) => { const copy: any = {}; Object.keys(obj || {}).forEach(k => { if (['ID', 'SEQ_ID', 'USR_NO', 'USR_NAME'].includes(k)) return; const v = obj[k]; if (v instanceof Date) copy[k] = v.toISOString(); else copy[k] = v; }); return copy; };
            const cleanOrig = sanitize(orig); const cleanCur = sanitize(item); if (JSON.stringify(cleanOrig) === JSON.stringify(cleanCur)) return null;
            return { ID: item.ID !== undefined ? item.ID : 0, MAIN_ID: updateRequest.ID ?? this.rowdata?.ID ?? 0, DETAIL_ID: item.ID !== undefined ? item.ID : 0, SEQ_ID: String(item.SEQ_ID ?? ''), ANSWER: item.ANSWER ?? '', ANSWER_ID: item.ANSWER_ID ?? '', USR_NO: formValue.CRT_USR_No ?? '', USR_NAME: formValue.CRT_USR_Name ?? '' } as UpdateCPM12050DetailRequest;
          }).filter((d: any) => d !== null) as UpdateCPM12050DetailRequest[];
          if (updatedDetails.length > 0) requests.push(this.cpm12050Service.updateCPM12050Detail(updatedDetails));

          const wrapped = requests.map((r, idx) => r.pipe(catchError(err => of({ __error: true, __index: idx, err }))));
          if (wrapped.length === 0) {
            this.messageService.successBubble('無變更');
            this.loading = false;
            return;
          }
          forkJoin(wrapped).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((results: any[]) => {
            const failed = (results || []).find(r => r && r.__error);
            if (failed) { const err = failed.err; const msg = err?.error?.Message || err?.message || JSON.stringify(err?.error) || '修改失敗（後端錯誤）'; this.messageService.errorBubble(`修改失敗：${msg}`); return; }
            this.messageService.successBubble('修改成功'); this.onCancel();
          });
          break;
        }
      }
    });
  }


  loadOptions() {
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.orgIdQueryOptions = res.Data.map(item => ({
          ...item,
          value: item.No,
          label: `${item.No} - ${item.Name}`,
        }));
      })
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
    this.dropdownApiService.queryCss1005()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.orgIdOptions = res || [];
      });
  }


  onOrgQueryChange(_orgId: string) {
    // 不更動 orgIdOptions，讓 ORG_ID 與 ORG_ID_QUERY 完全獨立
    return;
  }

  onClassIdChange(classId: string) {
    if (!classId) return;
    const found = (this.orgIdOptions as { value: string; ORG_ID?: string }[]).find(o => o.value === classId);
    if (found?.ORG_ID) {
      this.dataForm.patchValue({ ORG_ID: found.ORG_ID });
    }
  }

  onKindChange(kindId: string) {
    if (!kindId) {
      this.kindIdSubOptions = [];
      this.css10031Options = [];
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

  onKindSubChange(kindSubId: string) {
    if (!kindSubId) {
      this.css10031Options = [];
      return;
    }
    this.cpm12050Service.queryCPM12050CSS10031(kindSubId)
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.css10031Options = (res.Data ?? []).map(item => ({
          value: item.KIND_ItemID,
          label: `${item.KIND_ItemID} - ${item.KIND_Name}`,
        }));
      });
  }

  // 處理三個不同的檔案上傳（各自單檔）
  onSelectFile1(event: FileSelectEvent) {
    const files = [...event.files];
    const picked = files.length > 0 ? files[0] : null;
    if (picked && this.existingFile1) {
      const ok = confirm('目前已有檔案，是否依然要上傳，會刪除原本檔案？');
      if (!ok) {
        try { this.fileUpload1.clear(); } catch (e) { }
        return;
      }
      this.existingFile1 = null;
    }
    this.formFile1 = picked;
  }

  onSelectFile2(event: FileSelectEvent) {
    const files = [...event.files];
    const picked = files.length > 0 ? files[0] : null;
    if (picked && this.existingFile2) {
      const ok = confirm('目前已有檔案，是否依然要上傳，會刪除原本檔案？');
      if (!ok) {
        try { this.fileUpload2.clear(); } catch (e) { }
        return;
      }
      this.existingFile2 = null;
    }
    this.formFile2 = picked;
  }

  onSelectFile3(event: FileSelectEvent) {
    const files = [...event.files];
    const picked = files.length > 0 ? files[0] : null;
    if (picked && this.existingFile3) {
      const ok = confirm('目前已有檔案，是否依然要上傳，會刪除原本檔案？');
      if (!ok) {
        try { this.fileUpload3.clear(); } catch (e) { }
        return;
      }
      this.existingFile3 = null;
    }
    this.formFile3 = picked;
  }

  removeFile1() {
    this.formFile1 = null;
    try { this.fileUpload1.clear(); } catch (e) { }
  }

  removeFile2() {
    this.formFile2 = null;
    try { this.fileUpload2.clear(); } catch (e) { }
  }

  removeFile3() {
    this.formFile3 = null;
    try { this.fileUpload3.clear(); } catch (e) { }
  }

  // 下載既有檔案：使用 ImageService 下載後觸發瀏覽器下載
  downloadExistingFile(slot: 1 | 2 | 3) {
    if (!this.rowdata) return;
    const seq = (this.rowdata as any).SEQ_ID;
    const fileName = slot === 1 ? this.existingFile1 : slot === 2 ? this.existingFile2 : this.existingFile3;
    if (!fileName) return;
    // 優先使用 rowdata 提供的路徑（FileName1/FileName2/FileName3），避免呼叫舊的 Image API
    const raw = slot === 1 ? this.rawExistingFile1 : slot === 2 ? this.rawExistingFile2 : this.rawExistingFile3;
    const rawFromRow = raw ?? (this.rowdata as any).FileName1 ?? (this.rowdata as any).FileName2 ?? (this.rowdata as any).FileName3 ?? null;

    if (rawFromRow) {
      try {
        const s = String(rawFromRow);
        // 如果已經是完整的可用 URL，直接在新分頁開啟
        if (/^https?:\/\//i.test(s)) {
          this.openInGalleria(s);
          return;
        }

        // 從絕對路徑中擷取 'Uploads/...' 的相對路徑（支援反斜線或斜線），再組成 API 可存取的 URL
        const m = s.match(/(Uploads[\\/].*)/i);
        if (m && m[1]) {
          const rel = m[1].replace(/\\/g, '/'); // 將反斜線轉為正斜線
          const url = `${environment.ApiUrl.replace(/\/$/, '')}/${rel.replace(/^\/+/, '')}`;
          this.openInGalleria(url);
          return;
        }
      } catch (e) {
        console.warn('failed to construct image url from rowdata', e);
      }
    }

    // 若 rowdata 未提供路徑，回退到舊的查詢 ImageService 的邏輯
    const seqCandidates = Array.from(new Set([
      String(seq || ''),
      String((this.rowdata as any)?.ID ?? ''),
      String((this.rowdata as any)?.SEQ_ID ?? ''),
      String((this.rowdata as any)?.NOT_No ?? '')
    ].filter(s => s && s !== 'undefined')));

    const tryQuerySequentially = async (): Promise<any[]> => {
      for (const s of seqCandidates) {
        try {
          const res: any = await firstValueFrom(this.imageService.queryImages({ IMG_Type: 'CPM12050', IMG_SeqNo: s }));
          console.log('queryImages for CPM12050 seq', s, res);
          if (res && Array.isArray(res.Data) && res.Data.length > 0) return res.Data;
        } catch (e) {
          console.warn('queryImages failed for seq', s, e);
        }
      }
      return [];
    };

    tryQuerySequentially().then(list => {
      const base = (fileName).split('\\').pop()?.split('/').pop() ?? fileName;
      const found = list.find((f: any) => String(f.IMG_File) === String(base));
      if (found) {
        if (found.IMG_Path) {
          const url = `${environment.ApiUrl}/${String(found.IMG_Path).replace('~', '')}/${found.IMG_File}`;
          this.openInGalleria(url);
          return;
        }
        const rawFile = String(found.IMG_File || '');
        const baseName = rawFile.split('\\').pop()?.split('/').pop() ?? fileName;
        const uploadsMatch = rawFile.match(/(Uploads|IMAGES)[\\/].*/i);
        if (uploadsMatch) {
          const rel = uploadsMatch[0].replace(/\\/g, '/');
          const relDir = rel.split('/').slice(0, -1).join('/');
          const url = `${environment.ApiUrl}/${relDir}/${baseName}`;
          this.openInGalleria(url);
          return;
        }
      }
      // 無法預覽，提示使用者
      this.messageService.errorBubble('找不到可預覽的檔案');
    }).catch(err => {
      console.error('sequential queryImages failed', err);
      this.messageService.errorBubble('查詢檔案失敗');
    });
  }

}

