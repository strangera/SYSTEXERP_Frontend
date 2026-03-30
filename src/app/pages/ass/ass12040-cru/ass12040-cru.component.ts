import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS12040Service } from '@service/api/ass/ass12040.service';
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
import { ASS12040DetailResponse, ASS12040QueryRow } from '../ass12040/ass12040.model';

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
  extends BasicCruPageComponent<ASS12040QueryRow | ASS12040DetailResponse>
  implements OnInit
{
  public readonly dataForm = this.formBuilder.nonNullable.group({
    remark: new FormControl<string | null>(null),
    purchaseNumber: new FormControl<string | null>(null),
    paperStatus: new FormControl<string | null>(null),
    supplierCode: new FormControl<string | null>(null),
    applicantCode: new FormControl<string | null>(null),
    organizationNumber: new FormControl<string | null>(null),
    applicationDate: new FormControl<Date | string | null>(null),
    noTaxAmount: new FormControl<number | null>(null),
    taxAmount: new FormControl<number | null>(null),
    totalTaxAmount: new FormControl<number | null>(null),
    itemCode: new FormControl<string | null>(null),
    itemNumber: new FormControl<number | null>(null),
    singlePrice: new FormControl<number | null>(null),
    totalPrice: new FormControl<number | null>(null),
    storage: new FormControl<string | null>(null),
    department: new FormControl<string | null>(null),
    itemRemark: new FormControl<string | null>(null),
  });
  public readonly df = computed(() => this.dataForm.controls);

  /** 申請人、部門、委託部門、採購單狀態：依規格載入 */
  public readonly applicantCodeOptions = signal<{ label: string; value: string }[]>([]);
  public readonly orgIdOptions = signal<{ label: string; value: string }[]>([]);
  public readonly paperStatusOptions = signal<{ label: string; value: string }[]>([]);
  /** TODO: 供應商編號、品項編號、倉別下拉未實作，待 API 或規格提供後接上 */
  public readonly supplierCodeOptions = signal<{ label: string; value: string }[]>([]);
  public readonly itemCodeOptions = signal<{ label: string; value: string }[]>([]);
  public readonly storageOptions = signal<{ label: string; value: string }[]>([]);

  constructor(
    private readonly ass12040Service: ASS12040Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS12040', this.dataForm);
    this.loadDropdownOptions();
    const state = this.router.lastSuccessfulNavigation?.extras?.state as {
      crudstatus?: string;
      rowdata?: ASS12040QueryRow | ASS12040DetailResponse;
    };
    if (state?.rowdata) {
      this.patchFromRow(state.rowdata);
      this.dataForm.disable();
    }
  }

  private patchFromRow(row: ASS12040QueryRow | ASS12040DetailResponse): void {
    const r = row as Record<string, unknown>;
    this.dataForm.patchValue({
      remark: (r['REMARK'] ?? r['remark']) as string | null,
      purchaseNumber: (r['SUBPOENA_ID'] ?? r['purchaseNumber']) as string | null,
      paperStatus: (r['SUBPOENA_STATUS'] ?? r['paperStatus']) as string | null,
      supplierCode: (r['SUPPLIER_ID'] ?? r['supplierCode']) as string | null,
      applicantCode: (r['EMP_ID'] ?? r['applicantCode']) as string | null,
      organizationNumber: (r['ORG_ID'] ?? r['organizationNumber']) as string | null,
      applicationDate: (r['APPLY_DATE'] ?? r['applicationDate']) as Date | string | null,
      noTaxAmount: (r['NTAX_AMT'] ?? r['noTaxAmount']) as number | null,
      taxAmount: (r['TAX_AMT'] ?? r['taxAmount']) as number | null,
      totalTaxAmount: (r['AMT'] ?? r['totalTaxAmount']) as number | null,
      itemCode: (r['GOODS_ID'] ?? r['itemCode']) as string | null,
      itemNumber: (r['ITEM_QTY'] ?? r['itemNumber']) as number | null,
      singlePrice: (r['UNIT_PRICE'] ?? r['singlePrice']) as number | null,
      totalPrice: (r['TOTAL_PRICE'] ?? r['totalPrice']) as number | null,
      storage: (r['WH_ID'] ?? r['storage']) as string | null,
      department: (r['ENTRUST_ORG_ID'] ?? r['department']) as string | null,
      itemRemark: (r['NOTES'] ?? r['itemRemark']) as string | null,
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

    // TODO: 供應商編號、品項編號、倉別下拉未實作，待 API 或規格提供後接上
  }

  override onCancel(): void {
    super.onCancel();
  }

  onApproveConfirm(): void {
    this.runApprove();
  }

  private runApprove(): void {
    const key =
      this.rowdata &&
      ((this.rowdata as ASS12040QueryRow).SUBPOENA_ID ??
        (this.rowdata as ASS12040DetailResponse).SUBPOENA_ID);
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
