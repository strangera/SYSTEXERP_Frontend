import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13040CRUService } from '@service/api/ass/ass13040-cru.service';
import {
  ASS13040AssetQueryRow,
  ASS13040DetailItem,
  ASS13040Header,
  ASS13040InsertRequest,
  ASS13040UpdateRequest,
} from '@pages/ass/ass13040-cru/ass13040-cru.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { IDropdownItem, Option } from '@service/utility/dropdown-api.model';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ASS13040AssetDialogComponent } from './ass13040-asset-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-ass13040-cru',
  templateUrl: './ass13040-cru.component.html',
  styleUrl: './ass13040-cru.component.scss',
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
    ASS13040AssetDialogComponent,
  ],
})
export class ASS13040CRUComponent extends BasicCruPageComponent<ASS13040Header> implements OnInit {
  @ViewChild('fileUpload1') fileUpload1!: FileUpload;
  @ViewChild('fileUpload2') fileUpload2!: FileUpload;
  @ViewChild('fileUpload3') fileUpload3!: FileUpload;

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

  editColumns: EditColumn[] = [
    {
      field: 'ITEM_NO',
      header: '商品管理編號',
      type: 'input',
      validate: [validateRequired],
      onFocus: (_rowData, _value, _col, index) => this.openAssetDialog(index),
    },
    {
      field: 'UNIT',
      header: '商品單位',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.unitOptions,
      validate: [validateRequired],
    },
    {
      field: 'QTY',
      header: '數量',
      type: 'inputNumber',
      validate: [validateRequired],
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
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13040', this.dataForm);
    this.loadDropdowns();

    if (!this.isFormCreateable) {
      const scrapNo = this.getScrapNoFromState();
      if (scrapNo) this.loadDetail(scrapNo);
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

      const raw = this.dataForm.getRawValue();
      const header: ASS13040Header = {
        SCRAP_FORM_NO: this.crudstatus === CRUDStatus.Create ? undefined : (raw.scrapCode ?? undefined),
        SCRAP_USER_NO: raw.userCode ?? undefined,
        ORG_ID: raw.departmentCode ?? undefined,
        VENDOR_NO: raw.scrapVendor ?? undefined,
        APPLY_DATE: raw.scrapDate ? this.formatDate(raw.scrapDate) : undefined,
        ASSET_TYPE: raw.assetsType ?? undefined,
        NOTES: raw.remark ?? undefined,
      };

      const requestBody =
        this.crudstatus === CRUDStatus.Create
          ? ({
            ...header,
            Items: this.data,
          } as ASS13040InsertRequest)
          : ({
            ...header,
            SCRAP_FORM_NO: raw.scrapCode ?? '',
            Items: this.data,
          } as ASS13040UpdateRequest);

      const payload = this.buildFormData(requestBody);
      const request$ =
        this.crudstatus === CRUDStatus.Create
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
            label: `${item.No} - ${item.Name}`,
          }));
        },
      });
  }

  private mapAndFilterAssetType(items: IDropdownItem[]): Option[] {
    return items
      .filter(item => item.Name !== '耗材' && item.Name !== '其他資產(無形)')
      .map(item => ({
        value: item.No,
        label: `${item.No} - ${item.Name}`,
      }));
  }

  private loadDetail(scrapNo: string): void {
    this.loading = true;
    this.ass13040CruService
      .detailASS13040({ SCRAP_FORM_NO: scrapNo })
      .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          const header = res.Data?.Header;
          const details = res.Data?.Details ?? [];
          if (!header) return;

          this.dataForm.patchValue({
            scrapCode: header.SCRAP_FORM_NO ?? '',
            userCode: header.SCRAP_USER_NO ?? null,
            departmentCode: header.ORG_ID ?? null,
            scrapVendor: header.VENDOR_NO ?? null,
            scrapDate: header.APPLY_DATE ? new Date(header.APPLY_DATE) : null,
            assetsType: header.ASSET_TYPE ?? null,
            remark: header.NOTES ?? null,
          });
          this.existingFile1 = header.IMAGE_URL1 ?? null;
          this.existingFile2 = header.IMAGE_URL2 ?? null;
          this.existingFile3 = header.IMAGE_URL3 ?? null;
          this.data = details;
        },
      });
  }

  private getScrapNoFromState(): string | null {
    return this.rowdata?.SCRAP_FORM_NO ?? null;
  }

  private mapAssetToDetail(row: ASS13040AssetQueryRow): ASS13040DetailItem {
    return {
      ITEM_NO: row.ITEM_NO ?? row.ASSET_NO ?? '',
      UNIT: row.UNIT ?? undefined,
      QTY: 1,
      BUY_AMT: row.BUY_AMT ?? 0,
      CHANGE_AMT: row.CHANGE_AMT ?? 0,
      TOTAL_AMT: row.TOTAL_AMT ?? 0,
      NOTES: row.NOTES ?? '',
    };
  }

  private buildFormData(body: ASS13040InsertRequest | ASS13040UpdateRequest): FormData {
    const fd = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value == null) return;
      if (key === 'Items') return;
      fd.append(key, String(value));
    });
    fd.append('Items', JSON.stringify(body.Items ?? []));
    if (this.formFile1) fd.append('formFile1', this.formFile1);
    if (this.formFile2) fd.append('formFile2', this.formFile2);
    if (this.formFile3) fd.append('formFile3', this.formFile3);
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
