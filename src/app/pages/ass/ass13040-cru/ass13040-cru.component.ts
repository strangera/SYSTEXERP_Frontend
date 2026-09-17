import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  ASS13040AssetQueryRow,
  ASS13040DetailItem,
  ASS13040DetailItemRequest,
  ASS13040Header,
  InsertASS13040Request,
  QueryDetailASS13040DetailData,
  UpdateASS13040Request
} from '@pages/ass/ass13040-cru/ass13040-cru.model';
import { ASS13040CRUService } from '@service/api/ass/ass13040-cru.service';
import { IDropdownItem, Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateRequired } from '@shared/components/table-edit/validate-field.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';
import { GalleriaModule } from 'primeng/galleria';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ASS13040AssetDialogComponent } from './ass13040-asset-dialog.component';

interface MediaItem {
  url: string;
  type: 'image';
  name: string;
  slot: 1 | 2 | 3;
}

@UntilDestroy()
@Component({
  selector: 'app-ass13040-cru',
  templateUrl: './ass13040-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    InputTextareaComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
    TableEditComponent,
    FileUploadModule,
    GalleriaModule,
    ASS13040AssetDialogComponent,
  ],
})
export class ASS13040CRUComponent extends BasicCruPageComponent<ASS13040Header> implements OnInit {
  @ViewChild('fileUpload1') fileUpload1!: FileUpload;
  @ViewChild('fileUpload2') fileUpload2!: FileUpload;
  @ViewChild('fileUpload3') fileUpload3!: FileUpload;
  @ViewChild('detailTable') detailTable!: TableEditComponent;

  dataForm = this.formBuilder.nonNullable.group({
    scrapCode: [{ value: '系統自動產生', disabled: true }],
    userCode: [null as string | null, [Validators.required]],
    departmentCode: [null as string | null, [Validators.required]],
    scrapVendor: [null as string | null],
    scrapDate: [null as Date | null, [Validators.required]],
    assetsType: [null as string | null, [Validators.required]],
    remark: [null as string | null, [Validators.maxLength(400)]],
  });

  userCodeOptions: Option[] = [];
  departmentCodeOptions: Option[] = [];
  scrapVendorOptions: Option[] = [];
  assetsTypeOptions: Option[] = [];
  unitOptions: Option[] = [];

  data: ASS13040DetailItem[] = [];
  dialogVisible = false;
  editingRowIndex: number | null = null;

  formFile1?: File | null = null;
  formFile2?: File | null = null;
  formFile3?: File | null = null;

  existingFile1: string | null = null;
  existingFile2: string | null = null;
  existingFile3: string | null = null;

  // 保留後端回傳的原始路徑/檔名（用於組 URL / 傳回給後端）
  rawExistingFile1: string | null = null;
  rawExistingFile2: string | null = null;
  rawExistingFile3: string | null = null;

  // -----------------------------
  // 報廢照片預覽（p-galleria）
  // -----------------------------
  visible = false;
  galleriaItems: MediaItem[] = [];
  galleriaActiveIndex = 0;

  editColumns: EditColumn[] = [
    {
      field: 'ITEM_NO',
      header: '商品管理編號',
      type: 'input',
      validate: [validateRequired],
      onFocus: (_rowData, _value, _col, index) => this.openAssetDialog(index),
    },
    {
      field: 'ASSET_NAME',
      header: '資產名稱',
      type: 'input',
      disabled: () => true,
    },
    {
      field: 'BUY_AMT',
      header: '購入金額',
      type: 'inputNumber',
      validate: [validateRequired],
    },
    {
      field: 'CHANGE_AMT',
      header: '異動金額',
      type: 'inputNumber',
      validate: [validateRequired],
    },
    {
      field: 'TOTAL_AMT',
      header: '合計金額',
      type: 'inputNumber',
      validate: [validateRequired],
    },
    {
      field: 'NOTES',
      header: '單項說明',
      type: 'input',
      validate: [validateRequired],
    },
  ];

  constructor(
    private readonly ass13040CruService: ASS13040CRUService,
    private readonly dropdownApiService: DropdownApiService,
    private readonly http: HttpClient,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13040', this.dataForm);
    this.loadDropdowns();

    if (!this.isFormCreateable) {
      const detailId = this.getDetailIdFromState();
      if (detailId != null) this.loadDetail(detailId);
    }
  }

  get existingAssetNos(): string[] {
    return this.data
      .map(item => item.ITEM_NO ?? '')
      .filter(v => !!v);
  }

  onTableInsert(): void {
    this.editingRowIndex = null;
    this.openAssetDialog();
  }

  openAssetDialog(index?: number): void {
    if (this.isFormReadable) return;
    this.editingRowIndex = typeof index === 'number' ? index : null;
    this.dialogVisible = true;
  }

  onAssetsSelected(rows: ASS13040AssetQueryRow[]): void {
    if (!rows.length) return;
    const mapped = rows.map(row => this.mapAssetToDetail(row));
    if (this.editingRowIndex != null && mapped.length > 0) {
      const copy = [...this.data];
      copy[this.editingRowIndex] = mapped[0];
      if (mapped.length > 1) {
        copy.push(...mapped.slice(1));
      }
      this.data = copy;
    } else {
      this.data = [...this.data, ...mapped];
    }
    this.editingRowIndex = null;
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      if (this.data.length === 0) {
        this.messageService.warnBubble('請至少選取一筆報廢商品');
        this.loading = false;
        return;
      }

      if (!this.detailTable.validateAndShowErrors()) {
        this.loading = false;
        return;
      }

      const raw = this.dataForm.getRawValue();
      const isCreate = this.crudstatus === CRUDStatus.Create;
      const header: ASS13040Header = {
        SCRAP_FORM_NO: isCreate ? undefined : (raw.scrapCode ?? undefined),
        SCRAP_USER_NO: raw.userCode ?? undefined,
        ORG_ID: raw.departmentCode ?? undefined,
        VENDOR_NO: raw.scrapVendor ?? undefined,
        APPLY_DATE: raw.scrapDate ? this.formatDate(raw.scrapDate) : undefined,
        ASSET_TYPE: raw.assetsType ?? undefined,
        NOTES: raw.remark ?? undefined,
      };

      const id = this.getDetailIdFromState();
      const items: ASS13040DetailItemRequest[] = this.data.map(d => ({
        GOODS_ID: d.ITEM_NO ?? null,
        GOODS_UNIT: d.UNIT ?? null,
        QTY: d.QTY ?? null,
        GOODS_COST: d.BUY_AMT ?? null,
        EVAL_COST: d.CHANGE_AMT ?? null,
        AMT: d.TOTAL_AMT ?? null,
        NOTES: d.NOTES ?? null,
      }));

      const requestObj: InsertASS13040Request | UpdateASS13040Request = isCreate
        ? ({
          MID: 0,
          DAMAGEM_ID: raw.scrapCode && raw.scrapCode !== '系統自動產生' ? raw.scrapCode : null,
          EMP_ID: raw.userCode ?? null,
          ORG_ID: raw.departmentCode ?? null,
          SUPPLIER_ID: raw.scrapVendor ?? null,
          APPLY_DATE: raw.scrapDate ? this.formatDate(raw.scrapDate) : null,
          ASSET_TYPE: raw.assetsType ?? null,
          NOTES: raw.remark ?? null,
          IMAGE_URL1: this.rawExistingFile1 ?? null,
          IMAGE_URL2: this.rawExistingFile2 ?? null,
          IMAGE_URL3: this.rawExistingFile3 ?? null,
          Items: items,
        } satisfies InsertASS13040Request)
        : ({
          ID: id ?? 0,
          MID: 0,
          EMP_ID: raw.userCode ?? null,
          ORG_ID: raw.departmentCode ?? null,
          SUPPLIER_ID: raw.scrapVendor ?? null,
          APPLY_DATE: raw.scrapDate ? this.formatDate(raw.scrapDate) : null,
          ASSET_TYPE: raw.assetsType ?? null,
          NOTES: raw.remark ?? null,
          IMAGE_URL1: this.rawExistingFile1 ?? null,
          IMAGE_URL2: this.rawExistingFile2 ?? null,
          IMAGE_URL3: this.rawExistingFile3 ?? null,
          Items: items,
        } satisfies UpdateASS13040Request);

      // 用來確認 FormData 還沒包之前，request 欄位是否正確
      // eslint-disable-next-line no-console
      console.debug('[ASS13040CRU] requestObj:', requestObj);

      const payload = this.buildFormData(requestObj);
      const request$ =
        isCreate
          ? this.ass13040CruService.insertASS13040(payload)
          : this.ass13040CruService.updateASS13040(payload);

      request$
        .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.messageService.successBubble(res.Message || '儲存成功');
            this.onCancel();
          },
        });
    });
  }

  onSelectFile1(event: FileSelectEvent): void {
    this.formFile1 = event.files?.[0] ?? null;
  }

  onSelectFile2(event: FileSelectEvent): void {
    this.formFile2 = event.files?.[0] ?? null;
  }

  onSelectFile3(event: FileSelectEvent): void {
    this.formFile3 = event.files?.[0] ?? null;
  }

  removeFile1(): void {
    this.formFile1 = null;
    this.fileUpload1?.clear();
  }

  removeFile2(): void {
    this.formFile2 = null;
    this.fileUpload2?.clear();
  }

  removeFile3(): void {
    this.formFile3 = null;
    this.fileUpload3?.clear();
  }

  private loadDropdowns(): void {
    forkJoin({
      users: this.dropdownApiService.queryTblUser(),
      orgs: this.dropdownApiService.querySys3100(),
      vendors: this.dropdownApiService.queryPos2013({ VEN_Flag: '' }),
      assetTypeRaw: this.dropdownApiService.querySys1000({ SYS_Type: 'ASSET_TYPE' }),
      units: this.dropdownApiService.querySys1000({ SYS_Type: 'UNIT' }),
    })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: ({ users, orgs, vendors, assetTypeRaw, units }) => {
          this.userCodeOptions = users ?? [];
          this.departmentCodeOptions = orgs ?? [];
          this.scrapVendorOptions = vendors ?? [];
          this.assetsTypeOptions = this.mapAndFilterAssetType(assetTypeRaw ?? []);
          this.unitOptions = (units ?? []).map(item => ({
            value: item.No,
            label: item.Name ?? '',
          }));

          // 若明細已先載入（loadDetail 比 loadDropdowns 更早完成），
          // table-edit 的 OnPush 子元件可能尚未拿到最新 unitOptions，
          // 這裡刷新 data 參考以觸發重新渲染。
          if (this.data?.length) {
            this.data = [...this.data];
          }
        },
      });
  }

  private mapAndFilterAssetType(items: IDropdownItem[]): Option[] {
    return items
      .filter(item => item.Name !== '耗材')
      .map(item => ({
        value: item.No,
        label: `${item.No} - ${item.Name}`,
      }));
  }

  private loadDetail(id: number): void {
    this.loading = true;
    this.ass13040CruService
      .detailASS13040({ ID: id })
      .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          const master = res.Data?.Master;
          const details = res.Data?.Details ?? [];
          if (!master) return;

          this.dataForm.patchValue({
            scrapCode: master.DAMAGEM_ID ?? '',
            userCode: master.EMP_ID ?? null,
            departmentCode: master.ORG_ID ?? null,
            scrapVendor: master.SUPPLIER_ID ?? null,
            scrapDate: master.APPLY_DATE ? new Date(master.APPLY_DATE) : null,
            assetsType: master.ASSET_TYPE ?? null,
            remark: master.NOTES ?? null,
          });

          this.rawExistingFile1 = master.IMAGE_URL1 ?? null;
          this.rawExistingFile2 = master.IMAGE_URL2 ?? null;
          this.rawExistingFile3 = master.IMAGE_URL3 ?? null;

          // UI 顯示只保留檔名（跟 cpm12050-cru 同邏輯）
          this.existingFile1 = this.extractFileName(this.rawExistingFile1);
          this.existingFile2 = this.extractFileName(this.rawExistingFile2);
          this.existingFile3 = this.extractFileName(this.rawExistingFile3);

          // galleriaItems 在點擊時才組裝（避免預覽時把顯示用檔名拿去當 URL）
          this.galleriaItems = [];
          this.galleriaActiveIndex = 0;
          this.visible = false;

          this.data = this.mapApiDetailsToTable(details);
        },
      });
  }

  /** 從 state 取得主檔 ID（報廢單 ID），用於呼叫 detailASS13040 */
  private getDetailIdFromState(): number | null {
    const row = this.rowdata as { FAASSABANM_ID?: number; ID?: number } | undefined;
    const id = row?.FAASSABANM_ID ?? row?.ID;
    return id != null && typeof id === 'number' ? id : null;
  }

  private mapApiDetailsToTable(details: QueryDetailASS13040DetailData[]): ASS13040DetailItem[] {
    return details.map(d => ({
      ITEM_NO: d.GOODS_ID ?? undefined,
      ASSET_NAME: d.GOODS_NAME ?? undefined,
      UNIT: d.GOODS_UNIT ?? undefined,
      QTY: d.QTY ?? undefined,
      BUY_AMT: d.GOODS_COST ?? d.SUBCOST ?? undefined,
      CHANGE_AMT: d.EVAL_COST ?? undefined,
      TOTAL_AMT: d.AMT ?? undefined,
      NOTES: d.NOTES ?? undefined,
    }));
  }

  private mapAssetToDetail(row: ASS13040AssetQueryRow): ASS13040DetailItem {
    return {
      ITEM_NO: row.ASSET_ID ?? '',
      ASSET_NAME: row.AssetName ?? undefined,
      UNIT: row.Unit ?? undefined,
      QTY: 1,
      BUY_AMT: row.PurchaseAmt ?? 0,
      CHANGE_AMT: row.ChangeAmt ?? 0,
      TOTAL_AMT: row.TotalAmt ?? 0,
      NOTES: undefined,
    };
  }

  private toAbsolutePhotoUrl(rawUrl: string): string {
    const trimmed = rawUrl.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;

    // 支援 "~xxx" 或 "/xxx" 類型，統一轉成 `${environment.ApiUrl}/xxx`
    const withoutTilde = trimmed.replace(/^~+/, '');
    const path = withoutTilde.replace(/^\/+/, '');
    return `${environment.ApiUrl}/${path}`.replace(/([^:]\/)\/+/g, '$1');
  }

  private extractFileName(raw: string | null): string | null {
    if (!raw) return null;
    try {
      const s = String(raw);
      return s.split('\\').pop()?.split('/').pop() ?? s;
    } catch {
      return null;
    }
  }

  private resolveImageUrlWithAuthFallback(fullUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(fullUrl);
      img.onerror = () => {
        const token = this.authService.getUserInfo()?.AccessToken;
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        this.http
          .get(fullUrl, { responseType: 'blob', headers: headers as any })
          .pipe(untilDestroyed(this))
          .subscribe({
            next: blob => {
              const objectUrl = globalThis.URL.createObjectURL(blob);
              setTimeout(() => {
                try {
                  globalThis.URL.revokeObjectURL(objectUrl);
                } catch {
                  // ignore
                }
              }, 60000);
              resolve(objectUrl);
            },
            error: err => reject(err),
          });
      };

      img.src = fullUrl;
    });
  }

  async openGalleriaFromSlot(slot: 1 | 2 | 3): Promise<void> {
    const rawMap = [this.rawExistingFile1, this.rawExistingFile2, this.rawExistingFile3] as Array<string | null>;
    const raw = rawMap[slot - 1];
    if (!raw) {
      this.messageService.errorBubble('沒有可預覽的檔案');
      return;
    }

    const full = this.toAbsolutePhotoUrl(raw);
    const name = this.extractFileName(raw) ?? String(raw).split('/').pop() ?? '';

    // 先直接顯示後端 URL；若需要授權且直連失敗，背景換成 blob+token
    this.galleriaItems = [{ url: full, type: 'image', name, slot }];
    this.galleriaActiveIndex = 0;
    this.visible = true;

    try {
      const resolved = await this.resolveImageUrlWithAuthFallback(full);
      if (resolved && resolved !== full) {
        this.galleriaItems = [{ url: resolved, type: 'image', name, slot }];
      }
    } catch {
      // 已在 fallback 內處理錯誤提示與流程；或失敗就維持顯示 fullUrl
    }
  }

  private buildFormData(body: InsertASS13040Request | UpdateASS13040Request): FormData {
    const fd = new FormData();
    fd.append('request', JSON.stringify(body));
    const files = [this.formFile1, this.formFile2, this.formFile3].filter(
      (f): f is File => !!f,
    );
    files.forEach(file => fd.append('files', file, file.name));
    return fd;
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private generateDraftScrapNo(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `TMP${y}${m}${day}${hh}${mm}${ss}`;
  }
}
