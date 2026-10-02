import { NgIf } from '@angular/common';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';

import {
  CreateASS11040Request,
  CreateASS11040Response,
  QueryASS11040Response,
  UpdateASS11040Request,
} from '@pages/ass/ass11040/ass11040.model';
import { ASS11040Service } from '@service/api/ass/ass11040.service';
import { SystemOptionsService } from '@service/system/sys1000.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ImageService } from '@service/utility/image.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';
import { GalleriaModule } from 'primeng/galleria';
import { PanelModule } from 'primeng/panel';
import { catchError, EMPTY, finalize, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { getSYS1000Options } from '../../../service/system/sys1000.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  name: string;
}

function sys1000AsNoName(sysType: string): { value: string; label: string }[] {
  const opts = SystemOptionsService.getOptions(sysType);
  return opts.map(item => ({
    value: item.SYS_Code,
    label: `${item.SYS_Code}-${item.SYS_Name}`,
  }));
}

//3.1.1.4 品項資料維護作業 CRU
@UntilDestroy()
@Component({
  selector: 'app-ass11040-cru',
  templateUrl: './ass11040-cru.component.html',
  standalone: true,
  imports: [
    InputTextareaComponent,
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberComponent,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
    FileUploadModule,
    ButtonModule,
    GalleriaModule,
    RadiobuttonComponent,
  ],
})
export class ASS11040CRUComponent extends BasicCruPageComponent<QueryASS11040Response> implements OnInit {
  @ViewChild('fileUpload') fileUpload!: FileUpload;

  dataForm = this.formBuilder.nonNullable.group({
    // 區塊一
    itemCode: [null as string | null, [Validators.required, Validators.maxLength(13)]],
    itemName: ['', [Validators.required, Validators.maxLength(64)]],
    bigCategoryCode: [null as string | null, [Validators.required]],
    midCategoryCode: [null as string | null, [Validators.required]],
    smlCategoryCode: [null as string | null, [Validators.required]],
    itemCategory: [null as string | null, [Validators.required]],
    safeQty: [null as number | null, [Validators.maxLength(18)]],
    highStockQty: [null as number | null, [Validators.maxLength(18)]],
    barCode: [null as string | null, [Validators.maxLength(52)]],
    resiStatus: ['1' as string | null], // 預設不預留
    // 區塊二
    lengthCm: [null as number | null, [Validators.maxLength(18)]],
    widthCm: [null as number | null, [Validators.maxLength(18)]],
    heightCm: [null as number | null, [Validators.maxLength(18)]],
    weightKg: [null as number | null, [Validators.maxLength(18)]],
    itemUnit: [null as string | null, [Validators.required]],
    packageUnit: [null as string | null],
    packNum: [null as number | null],
    costPrice: [null as number | null],
    taxCode: [null as string | null, [Validators.required]],
    deptCode: [null as string | null],
    // 區塊三
    warrantyMethod: [null as string | null],
    mtSupp: [null as string | null],
    mtYear: [null as number | null],
    mtMonth: [null as number | null],
    mtDay: [null as number | null],
    mtPeriod: [null as number | null],
    maintenanceMethod: [null as string | null],
    ivnSupp: [null as string | null],
    ivnYear: [null as number | null],
    ivnMonth: [null as number | null],
    ivnDay: [null as number | null],
    expYear: [null as number | null],
    expMonth: [null as number | null],
    addExpYear: [null as number | null],
    addExpMonth: [null as number | null],
    ivnPeriod: [null as number | null],
    illustrate: [null as string | null, [Validators.maxLength(160)]],
  });

  itemCategoryOptions = getSYS1000Options('PROD_TYPE');
  itemUnitOptions = getSYS1000Options('UNIT');
  packageUnitOptions = getSYS1000Options('PACK_UNIT');

  bigCategoryCodeOptions: Option[] = [];
  midCategoryCodeOptions: Option[] = [];
  smlCategoryCodeOptions: Option[] = [];

  resiStatusOptions: { value: string; label: string }[] = [
    { value: '0', label: '預留' },
    { value: '1', label: '不預留' },
  ];
  taxCodeOptions: { value: string; label: string }[] = [
    { value: '0', label: '免稅' },
    { value: '1', label: '應稅' },
  ];
  deptCodeOptions: { value: string; label: string }[] = [];
  warrantyMethodOptions: { value: string; label: string }[] = [
    { value: '0', label: '廠商' },
    { value: '1', label: '公司' },
  ];
  maintenanceMethodOptions: { value: string; label: string }[] = [
    { value: '0', label: '廠商' },
    { value: '1', label: '公司' },
  ];
  mtSuppOptions: { value: string; label: string }[] = [];
  ivnSuppOptions: { value: string; label: string }[] = [];

  uploadedFiles: File[] = [];
  mediaItems = signal<MediaItem[]>([]);
  visible = signal(false);
  private patchInProgress = false;

  get itemCodeDisplayValue(): string {
    if (this.isFormCreateable) return '系統自動產生';
    return this.dataForm.controls.itemCode.value ?? '';
  }

  constructor(
    private readonly ass11040Service: ASS11040Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly imageService: ImageService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11040', this.dataForm);
    this.loadBigCategoryOptions();
    if (this.isFormCreateable) {
      this.loadMidCategoryOptions('');
      this.loadSmlCategoryOptions('', '');
      this.setupCategoryListeners(); //大中小分類欄位連動監聽
    }
    this.dropdownApiService.querySys3100().pipe(untilDestroyed(this)).subscribe(res => {
      this.deptCodeOptions = res ?? [];
    });
    this.dropdownApiService.queryPos2013({ VEN_Flag: '' }).pipe(untilDestroyed(this)).subscribe(res => {
      const opts = res ?? [];
      this.mtSuppOptions = opts;
      this.ivnSuppOptions = opts;
    });
    if (!this.isFormCreateable && this.rowdata) {
      this.patchFormFromRow(this.rowdata);
    }
  }

  private initializeMediaFromPhotoUrl(photoUrl?: string | null): void {
    if (!photoUrl) {
      this.mediaItems.set([]);
      return;
    }
    const normalizedUrl = this.toAbsolutePhotoUrl(photoUrl);
    const mediaType = this.detectMediaType(normalizedUrl);
    const fileName = this.extractFileName(normalizedUrl);
    this.mediaItems.set([{ url: normalizedUrl, type: mediaType, name: fileName }]);
  }

  private toAbsolutePhotoUrl(rawUrl: string): string {
    const trimmed = rawUrl.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const withoutTilde = trimmed.replace(/^~+/, '');
    const path = withoutTilde.replace(/^\/+/, '');
    return `${environment.ApiUrl}/${path}`.replace(/([^:]\/)\/+/g, '$1');
  }

  private detectMediaType(url: string): 'image' | 'video' {
    const ext = (url.split('?')[0].split('.').pop() ?? '').toLowerCase();
    if (['mp4', 'webm', 'ogg', 'avi', 'wmv', 'mpeg'].includes(ext)) return 'video';
    return 'image';
  }

  private extractFileName(url: string): string {
    const noQuery = url.split('?')[0];
    const name = noQuery.substring(noQuery.lastIndexOf('/') + 1);
    return name || '已上傳檔案';
  }

  /** 編輯時由 rowdata 寫入表單 */
  patchFormFromRow(row: QueryASS11040Response): void {
    this.patchInProgress = true;
    this.dataForm.patchValue({
      itemCode: row.GOODS_ID ?? null,
      itemName: row.GOODS_NAME ?? '',
      bigCategoryCode: row.B_CLASS_ID ?? null,
      midCategoryCode: row.M_CLASS_ID ?? null,
      smlCategoryCode: row.S_CLASS_ID ?? null,
      itemCategory: row.MATERIAL_TYPE ?? null,
      safeQty: row.SAFE_QTY ?? null,
      highStockQty: row.HIGH_STOCK_QTY ?? null,
      barCode: row.BAR_CODE ?? null,
      resiStatus: row.RESI_STATUS ?? null,
      lengthCm: row.LENGTH_CM ?? null,
      widthCm: row.WIDTH_CM ?? null,
      heightCm: row.HEIGHT_CM ?? null,
      weightKg: row.WEIGHT_KG ?? null,
      itemUnit: row.UNIT ?? null,
      packageUnit: row.PACK_UNIT ?? null,
      packNum: row.PACK_NUM ?? null,
      taxCode: row.TAX_CODE ?? null,
      deptCode: row.ORG_ID ?? null,
      warrantyMethod: row.MT_MODE ?? null,
      mtSupp: row.MT_SUPP ?? null,
      mtYear: row.MT_YEAR ?? null,
      mtMonth: row.MT_MONTH ?? null,
      mtDay: row.MT_DAY ?? null,
      mtPeriod: row.MT_PERIOD ?? null,
      maintenanceMethod: row.IVN_MODE ?? null,
      ivnSupp: row.IVN_SUPP ?? null,
      ivnYear: row.IVN_YEAR ?? null,
      ivnMonth: row.IVN_MONTH ?? null,
      ivnDay: row.IVN_DAY ?? null,
      expYear: row.EXP_YEAR ?? null,
      expMonth: row.EXP_MONTH ?? null,
      addExpYear: row.ADD_EXP_YEAR ?? null,
      addExpMonth: row.ADD_EXP_MONTH ?? null,
      ivnPeriod: row.IVN_PERIOD ?? null,
      illustrate: row.NOTES ?? null,
    });
    this.initializeMediaFromPhotoUrl(row.PHOTO_URL ?? null);
    if (row.B_CLASS_ID) this.loadMidCategoryOptions(row.B_CLASS_ID);
    if (row.B_CLASS_ID && row.M_CLASS_ID) {
      this.loadSmlCategoryOptions(row.B_CLASS_ID, row.M_CLASS_ID);
    }
    this.patchInProgress = false;
  }

  /** 載入大分類選項 */
  loadBigCategoryOptions(): void {
    this.dropdownApiService
      .queryFaClassM()
      .pipe(untilDestroyed(this))
      .subscribe(opts => {
        this.bigCategoryCodeOptions = opts ?? [];
      });
  }

  /** 設定分類連動監聽 */
  setupCategoryListeners(): void {
    this.dataForm.controls.bigCategoryCode.valueChanges.pipe(untilDestroyed(this)).subscribe(bigCode => {
      if (this.patchInProgress) return;
      this.dataForm.controls.midCategoryCode.setValue(null);
      this.dataForm.controls.smlCategoryCode.setValue(null);
      this.midCategoryCodeOptions = [];
      this.smlCategoryCodeOptions = [];
      if (bigCode) this.loadMidCategoryOptions(bigCode);
    });

    this.dataForm.controls.midCategoryCode.valueChanges.pipe(untilDestroyed(this)).subscribe(midCode => {
      if (this.patchInProgress) return;
      this.dataForm.controls.smlCategoryCode.setValue(null);
      this.smlCategoryCodeOptions = [];
      if (midCode) {
        const bigCode = this.dataForm.controls.bigCategoryCode.value ?? '';
        this.loadSmlCategoryOptions(bigCode, midCode);
      }
    });
  }

  /** 載入中分類選項 */
  loadMidCategoryOptions(bigCategoryCode: string): void {
    this.dropdownApiService
      .queryFaClass1({ B_CLASS_ID: bigCategoryCode })
      .pipe(untilDestroyed(this))
      .subscribe(opts => {
        this.midCategoryCodeOptions = opts ?? [];
      });
  }

  /** 載入小分類選項（需大分類 + 中分類代碼） */
  loadSmlCategoryOptions(bigCategoryCode: string, midCategoryCode: string): void {
    if (!midCategoryCode) {
      this.smlCategoryCodeOptions = [];
      return;
    }
    this.dropdownApiService
      .queryFaClass2({
        B_CLASS_ID: bigCategoryCode || undefined,
        M_CLASS_ID: midCategoryCode,
      })
      .pipe(untilDestroyed(this))
      .subscribe(opts => {
        this.smlCategoryCodeOptions = opts ?? [];
      });
  }

  onSelectFile(event: FileSelectEvent): void {
    this.uploadedFiles = [...event.files];
    if (this.uploadedFiles.length > 0) {
      const file = this.uploadedFiles[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase() ?? '';
      const reader = new FileReader();
      reader.onload = e => {
        const fileUrl = e.target?.result as string;
        let fileType: 'image' | 'video';
        if (['bmp', 'jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          fileType = 'image';
        } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
          fileType = 'video';
        } else {
          return;
        }
        this.mediaItems.set([{ url: fileUrl, type: fileType, name: file.name }]);
      };
      reader.readAsDataURL(file);
    } else {
      this.mediaItems.set([]);
    }
  }

  clearUploadedFile(): void {
    this.uploadedFiles = [];
    this.mediaItems.set([]);
    this.fileUpload?.clear();
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();

      if (this.isFormCreateable) {
        const createPayload: CreateASS11040Request = {
          MATERIAL_TYPE: raw.itemCategory ?? null,
          B_CLASS_ID: raw.bigCategoryCode ?? null,
          M_CLASS_ID: raw.midCategoryCode ?? null,
          S_CLASS_ID: raw.smlCategoryCode ?? null,
          GOODS_NAME: raw.itemName ?? null,
          ORG_ID: raw.deptCode ?? null,
          BAR_CODE: raw.barCode ?? null,
          PHOTO_URL: null,
          LENGTH_CM: raw.lengthCm ?? null,
          WIDTH_CM: raw.widthCm ?? null,
          HEIGHT_CM: raw.heightCm ?? null,
          WEIGHT_KG: raw.weightKg ?? null,
          UNIT: raw.itemUnit ?? null,
          PACK_UNIT: raw.packageUnit ?? null,
          PACK_NUM: raw.packNum ?? null,
          MT_MODE: raw.warrantyMethod ?? null,
          MT_SUPP: raw.mtSupp ?? null,
          MT_YEAR: raw.mtYear ?? null,
          MT_MONTH: raw.mtMonth ?? null,
          MT_DAY: raw.mtDay ?? null,
          IVN_MODE: raw.maintenanceMethod ?? null,
          IVN_SUPP: raw.ivnSupp ?? null,
          IVN_YEAR: raw.ivnYear ?? null,
          IVN_MONTH: raw.ivnMonth ?? null,
          IVN_DAY: raw.ivnDay ?? null,
          EXP_YEAR: raw.expYear ?? null,
          EXP_MONTH: raw.expMonth ?? null,
          ADD_EXP_YEAR: raw.addExpYear ?? null,
          ADD_EXP_MONTH: raw.addExpMonth ?? null,
          NOTES: raw.illustrate ?? null,
        };
        this.ass11040Service
          .createASS11040(createPayload)
          .pipe(
            untilDestroyed(this),
            finalize(() => (this.loading = false)),
            switchMap((res: ApiResponse<CreateASS11040Response>) => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble(res.Message ?? '新增失敗');
                return EMPTY;
              }
              const goodid = res.Data?.NewGoodsId;
              const stoNo: string | null = null;
              if (!goodid) {
                this.messageService.errorBubble('新增成功但未取得品項代碼(NewGoodsId)，無法更新圖片');
                return EMPTY;
              }
              if (this.uploadedFiles.length === 0) {
                this.messageService.successBubble(res.Message ?? '新增成功');
                this.onCancel();
                return EMPTY;
              }
              return this.imageService.uploadImages({
                IMG_Type: 'FASITEM',
                IMG_SeqNo: goodid,
                Files: this.uploadedFiles,
              }).pipe(
                switchMap((uploadRes: unknown) => {
                  const data = (uploadRes as { Data?: { ImageUrl?: string; imageUrl?: string }[] })?.Data?.[0];
                  const rawUrl = data?.ImageUrl ?? data?.imageUrl;
                  const photoUrl = rawUrl ?? null;
                  const updatePayload: UpdateASS11040Request = {
                    STO_NO: stoNo,
                    OLD_GOODS_ID: goodid,
                    GOODS_NAME: raw.itemName ?? null,
                    BAR_CODE: raw.barCode ?? null,
                    PHOTO_URL: photoUrl,
                    ORG_ID: raw.deptCode ?? null,
                    MATERIAL_TYPE: raw.itemCategory ?? null,
                    B_CLASS_ID: raw.bigCategoryCode ?? null,
                    M_CLASS_ID: raw.midCategoryCode ?? null,
                    S_CLASS_ID: raw.smlCategoryCode ?? null,
                    LENGTH_CM: raw.lengthCm ?? null,
                    WIDTH_CM: raw.widthCm ?? null,
                    HEIGHT_CM: raw.heightCm ?? null,
                    WEIGHT_KG: raw.weightKg ?? null,
                    UNIT: raw.itemUnit ?? null,
                    PACK_UNIT: raw.packageUnit ?? null,
                    PACK_NUM: raw.packNum ?? null,
                    TAX_CODE: raw.taxCode ?? null,
                    MT_MODE: raw.warrantyMethod ?? null,
                    MT_SUPP: raw.mtSupp ?? null,
                    MT_YEAR: raw.mtYear ?? null,
                    MT_MONTH: raw.mtMonth ?? null,
                    MT_DAY: raw.mtDay ?? null,
                    IVN_MODE: raw.maintenanceMethod ?? null,
                    IVN_SUPP: raw.ivnSupp ?? null,
                    IVN_YEAR: raw.ivnYear ?? null,
                    IVN_MONTH: raw.ivnMonth ?? null,
                    IVN_DAY: raw.ivnDay ?? null,
                    EXP_YEAR: raw.expYear ?? null,
                    EXP_MONTH: raw.expMonth ?? null,
                    ADD_EXP_YEAR: raw.addExpYear ?? null,
                    ADD_EXP_MONTH: raw.addExpMonth ?? null,
                    NOTES: raw.illustrate ?? null,
                    STATUS: null,
                    MT_PERIOD: raw.mtPeriod ?? null,
                    IVN_PERIOD: raw.ivnPeriod ?? null,
                    SAFE_QTY: raw.safeQty ?? null,
                    HIGH_STOCK_QTY: raw.highStockQty ?? null,
                    STORE_SALES_AMT: null,
                    RESI_STATUS: raw.resiStatus ?? null,
                    UPD_USR_No: this.user?.user_No ?? null,
                    UPD_USR_Name: this.user?.user_Name ?? null,
                  };
                  return this.ass11040Service.updateASS11040(updatePayload);
                }),
              );
            }),
            catchError(() => {
              return EMPTY;
            })
          )
          .subscribe({
            next: updateRes => {
              if (!updateRes) return;
              if (updateRes.Status !== '0000') {
                this.messageService.errorBubble(updateRes.Message ?? '更新圖片失敗');
                return;
              }
              this.messageService.successBubble(updateRes.Message ?? '新增成功');
              this.onCancel();
            },
          });
      } else {
        const row = this.rowdata as QueryASS11040Response;
        const buildUpdatePayload = (photoUrl: string | null): UpdateASS11040Request => ({
          STO_NO: row.STO_NO ?? null,
          OLD_GOODS_ID: row?.GOODS_ID ?? null,
          GOODS_NAME: raw.itemName ?? null,
          BAR_CODE: raw.barCode ?? null,
          PHOTO_URL: photoUrl,
          ORG_ID: raw.deptCode ?? null,
          MATERIAL_TYPE: raw.itemCategory ?? null,
          B_CLASS_ID: raw.bigCategoryCode ?? null,
          M_CLASS_ID: raw.midCategoryCode ?? null,
          S_CLASS_ID: raw.smlCategoryCode ?? null,
          LENGTH_CM: raw.lengthCm ?? null,
          WIDTH_CM: raw.widthCm ?? null,
          HEIGHT_CM: raw.heightCm ?? null,
          WEIGHT_KG: raw.weightKg ?? null,
          UNIT: raw.itemUnit ?? null,
          PACK_UNIT: raw.packageUnit ?? null,
          PACK_NUM: raw.packNum ?? null,
          TAX_CODE: raw.taxCode ?? null,
          MT_MODE: raw.warrantyMethod ?? null,
          MT_SUPP: raw.mtSupp ?? null,
          MT_YEAR: raw.mtYear ?? null,
          MT_MONTH: raw.mtMonth ?? null,
          MT_DAY: raw.mtDay ?? null,
          IVN_MODE: raw.maintenanceMethod ?? null,
          IVN_SUPP: raw.ivnSupp ?? null,
          IVN_YEAR: raw.ivnYear ?? null,
          IVN_MONTH: raw.ivnMonth ?? null,
          IVN_DAY: raw.ivnDay ?? null,
          EXP_YEAR: raw.expYear ?? null,
          EXP_MONTH: raw.expMonth ?? null,
          ADD_EXP_YEAR: raw.addExpYear ?? null,
          ADD_EXP_MONTH: raw.addExpMonth ?? null,
          NOTES: raw.illustrate ?? null,
          STATUS: null,
          MT_PERIOD: raw.mtPeriod ?? null,
          IVN_PERIOD: raw.ivnPeriod ?? null,
          SAFE_QTY: raw.safeQty ?? null,
          HIGH_STOCK_QTY: raw.highStockQty ?? null,
          STORE_SALES_AMT: null,
          RESI_STATUS: raw.resiStatus ?? null,
          UPD_USR_No: this.user?.user_No ?? null,
          UPD_USR_Name: this.user?.user_Name ?? null,
        });

        if (this.uploadedFiles.length > 0) {
          this.imageService
            .uploadImages({
              IMG_Type: 'FASITEM',
              IMG_SeqNo: row.GOODS_ID ?? '',
              Files: this.uploadedFiles,
            })
            .pipe(
              switchMap((uploadRes: unknown) => {
                const data = (uploadRes as { Data?: { ImageUrl?: string; imageUrl?: string }[] })?.Data?.[0];
                const rawUrl = data?.ImageUrl ?? data?.imageUrl;
                const photoUrl = rawUrl ?? null;
                return this.ass11040Service.updateASS11040(buildUpdatePayload(photoUrl));
              }),
              untilDestroyed(this),
              finalize(() => (this.loading = false))
            )
            .subscribe({
              next: res => {
                if (res.Status !== '0000') return;
                this.messageService.successBubble(res.Message ?? '更新成功');
                this.clearUploadedFile();
                this.onCancel();
              },
            });
        } else {
          this.ass11040Service
            .updateASS11040(buildUpdatePayload(row.PHOTO_URL ?? null))
            .pipe(
              untilDestroyed(this),
              finalize(() => (this.loading = false))
            )
            .subscribe({
              next: res => {
                if (res.Status !== '0000') return;
                this.messageService.successBubble(res.Message ?? '更新成功');
                this.onCancel();
              },
            });
        }
      }
    });
  }
}
