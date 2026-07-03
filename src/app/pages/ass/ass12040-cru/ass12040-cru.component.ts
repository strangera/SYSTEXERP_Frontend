import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { ASS12040Service } from '@service/api/ass/ass12040.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { ASS12040QueryRow } from '../ass12040/ass12040.model';

/** 3.1.2.4 採購單審核作業 - 詳細頁（僅唯讀，僅支援從查詢頁「查看」進入） */
@Component({
  selector: 'app-ass12040-cru',
  templateUrl: './ass12040-cru.component.html',
  styleUrl: './ass12040-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextareaComponent,
    InputNumberComponent,
    DropdownComponent,
    CalendarComponent,
    InputTextComponent,
    ButtonComponent,
    TranslateModule,
  ],
})
export class ASS12040CRUComponent
  extends BasicCruPageComponent<ASS12040QueryRow>
  implements OnInit
{
  public readonly dataForm = this.formBuilder.group({
    remark: [null as string | null],
    purchaseNumber: [null as string | null],
    paperStatus: [null as string | null],
    supplierCode: [null as string | null],
    applicantCode: [null as string | null],
    organizationNumber: [null as string | null],
    applicationDate: [null as Date | string | null],
    noTaxAmount: [null as number | null],
    taxAmount: [null as number | null],
    totalTaxAmount: [null as number | null],
    itemCode: [null as string | null],
    itemNumber: [null as number | null],
    singlePrice: [null as number | null],
    totalPrice: [null as number | null],
    storage: [null as string | null],
    department: [null as string | null],
    itemRemark: [null as string | null],
  });
  public readonly df = computed(() => this.dataForm.controls);

  /** 申請人、部門、委託部門、採購單狀態：依規格載入 */
  public readonly applicantCodeOptions = signal<{ label: string; value: string }[]>([]);
  public readonly orgIdOptions = signal<{ label: string; value: string }[]>([]);
  public readonly paperStatusOptions = signal<{ label: string; value: string }[]>([]);
  /** 品項編號下拉：queryASS11040_DropDownList（GOODS_ID / 名稱） */
  public readonly itemCodeOptions = signal<{ label: string; value: string }[]>([]);
  /** 倉別下拉（來源 ASS11100） */
  public readonly storageOptions = signal<{ label: string; value: string }[]>([]);
  /** 供應商下拉（來源 queryPos2013） */
  public readonly supplierCodeOptions = signal<{ label: string; value: string }[]>([]);

  constructor(
    private readonly ass12040Service: ASS12040Service,
    private readonly ass11100Service: ASS11100Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS12040', this.dataForm);
    this.loadDropdownOptions();
    if (this.rowdata) {
      this.patchFromRow(this.rowdata);
      this.dataForm.disable();
    }
  }

  private patchFromRow(row: ASS12040QueryRow): void {
    const r = row as Record<string, unknown>;
    const toNum = (v: unknown): number | null =>
      v == null || v === '' ? null : Number(v);
    this.dataForm.patchValue({
      remark: (r['NOTES'] ?? r['REMARK'] ?? r['remark']) as string | null,
      // 說明 (itemRemark)：查詢回應無對應明細說明欄位，維持空白
      purchaseNumber: (r['SUBPOENA_ID'] ?? r['purchaseNumber']) as string | null,
      paperStatus: (r['SUBPOENA_STATUS'] ?? r['paperStatus']) as string | null,
      supplierCode: (r['SUPPLIER_ID'] ?? r['supplierCode']) as string | null,
      applicantCode: (r['EMP_ID'] ?? r['applicantCode']) as string | null,
      organizationNumber: (r['ORG_ID'] ?? r['organizationNumber']) as string | null,
      applicationDate: (r['APPLY_DATE'] ?? r['applicationDate']) as Date | string | null,
      noTaxAmount: toNum(r['NTAX_AMT'] ?? r['noTaxAmount']),
      taxAmount: toNum(r['TAX_AMT'] ?? r['taxAmount']),
      totalTaxAmount: toNum(r['AMT'] ?? r['totalTaxAmount']),
      itemCode: (r['GOODS_ID'] ?? r['itemCode']) as string | null,
      itemNumber: toNum(r['QTY'] ?? r['itemNumber']),
      singlePrice: toNum(r['GOODS_PRICE'] ?? r['singlePrice']),
      totalPrice: toNum(r['D_NTAX_AMT'] ?? r['totalPrice']),
      storage: (r['WH_ID'] ?? r['storage']) as string | null,
      department: (r['D_ORG_ID'] ?? r['department']) as string | null,
      itemRemark: (r['itemRemark'] ?? null) as string | null,
    });
  }

  private loadDropdownOptions(): void {
    const toOpt = (items: { No?: string; Name?: string }[]) =>
      (items ?? []).map(item => ({
        label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        value: item.No ?? '',
      }));

    this.dropDownListService.queryTBLUSER_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.applicantCodeOptions.set(toOpt(res.Data ?? []));
      },
    });

    this.dropDownListService.queryPOS2013_DropDownList({}).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.orgIdOptions.set(toOpt(res.Data ?? []));
      },
    });

    this.dropDownListService
      .querySYS1000_DropDownList({ SYS_Type: 'SUBPOENA_STATUS' })
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.paperStatusOptions.set(toOpt(res.Data ?? []));
        },
      });

    this.dropdownApiService.queryASS11040_DropDownList().subscribe(options => {
      this.itemCodeOptions.set(options ?? []);
    });

    // 倉別下拉：比照查詢頁，取 ASS11100 倉別清單
    this.ass11100Service.queryASS11100({ PageSize: 9999, PageIndex: 1 }).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = (res.Data ?? [])
          .filter(item => item.WH_ID != null && item.WH_ID !== '')
          .map(item => ({
            label: `${item.WH_ID} - ${item.WH_NAME ?? ''}`,
            value: item.WH_ID!,
          }));
        this.storageOptions.set(options);
      },
    });

    // 供應商下拉：比照查詢頁，取 queryPos2013
    this.dropdownApiService.queryPos2013({ VEN_Flag: '' }).subscribe(options => {
      this.supplierCodeOptions.set(options ?? []);
    });
  }

  override onCancel(): void {
    super.onCancel();
  }

  onApproveConfirm(): void {
    this.runApprove();
  }

  private runApprove(): void {
    const key = this.rowdata?.SUBPOENA_ID;
    if (!key) {
      this.messageService.warnBubble('無法取得單據識別，無法執行審核');
      return;
    }
    const label = '審核確認';
    this.messageService.confirm({
      message: `確定要${label}嗎？`,
      header: `${label}確認`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '確定',
      rejectLabel: '取消',
      accept: () => {
        this.messageService.blockUi();
        this.ass12040Service
          .approveASS12040({ SUBPOENA_ID: String(key) })
          .pipe(finalize(() => this.messageService.unblockUi()))
          .subscribe({
            next: res => {
              if (res.Status === '0000') {
                this.messageService.successBubble(`${label}成功`);
                this.onCancel();
              } else {
                this.messageService.errorBubble(res.Message ?? `${label}失敗`);
              }
            },
            error: () =>
              this.messageService.errorBubble(`${label}失敗，請重試或聯繫管理員`),
          });
      },
      reject: () => this.messageService.infoBubble(`已取消${label}`),
    });
  }
}
