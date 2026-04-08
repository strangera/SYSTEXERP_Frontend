import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, Observable } from 'rxjs';
import { QueryASS11060Request, QueryASS11060Response } from '../../../service/api/ass/ass11060.model';
import { ASS11060Service } from '../../../service/api/ass/ass11060.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

//3.1.1.6 供應商資料維護作業
@Component({
  selector: 'app-ass11060',
  templateUrl: './ass11060.component.html',
  styleUrl: './ass11060.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberComponent,
    DropdownComponent,
    EditorTextComponent,
    ButtonComponent,
    ButtonModule,
    TableReportComponent,
    TranslateModule,
    InputTextareaComponent,
  ]
})
export class ASS11060Component extends BasicQueryPageComponent<QueryASS11060Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    /** 廠商編號 */
    VEN_No: ['', [Validators.maxLength(12)]],
    /** 廠商統一編號 */
    VEN_Uniform: ['', [Validators.maxLength(10)]],
    /** 廠商名稱(中文) */
    VEN_Name: ['', [Validators.maxLength(60)]],
    /** 廠商名稱(英文) */
    VEN_EngName: ['', [Validators.maxLength(60)]],
    /** 廠商簡稱 */
    VEN_ShortName: ['', [Validators.maxLength(10)]],
    /** 公司登記地址 */
    VEN_Address: ['', [Validators.maxLength(60)]],
    /** 負責人 */
    CHARGE_STAFF: ['', [Validators.maxLength(12)]],
    /** 負責人職稱 */
    CHARGE_TITLE: ['', [Validators.maxLength(16)]],
    /** 負責人身分證 */
    CHARGE_PID: ['', [Validators.maxLength(10)]],
    /** 負責人電話 */
    CHARGE_TEL: ['', [Validators.maxLength(15)]],
    /** 負責人地址 */
    CHARGE_ADDR: ['', [Validators.maxLength(100)]],
    /** 負責人電子郵件 */
    CHARGE_EMAIL: ['', [Validators.maxLength(60)]],
    /** 公司登記電話 */
    VEN_Tel: ['', [Validators.maxLength(15)]],
    /** 公司傳真 */
    VEN_Fax: ['', [Validators.maxLength(15)]],
    /** 訂貨地址 */
    ORDER_ADDR: ['', [Validators.maxLength(100)]],
    /** 訂貨電話 */
    ORDER_TEL: ['', [Validators.maxLength(12)]],
    /** 訂貨傳真 */
    ORDER_FAX: ['', [Validators.maxLength(12)]],
    /** 工廠地址 */
    FACTO_ADDR: ['', [Validators.maxLength(100)]],
    /** 工廠電話 */
    FACTO_TEL: ['', [Validators.maxLength(12)]],
    /** 工廠傳真 */
    FACTO_FAX: ['', [Validators.maxLength(12)]],
    /** 送貨方式 */
    DELIVERY: [null as string | null],
    /** 退貨處理方式 */
    RETURN_ORDER: [null as string | null],
    /** 廠商送貨期限 */
    DELIVERY_LIMIT: [null as number | null],
    /** 附註 */
    VEN_Remark: [''],
    pageSize: [30],
    pageIndex: [1],
  });

  readonly tableData = signal<QueryASS11060Response[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: QueryASS11060Request;

  btnPDFLoading = false;

  /** 送貨方式下拉選項 */
  deliveryMethodOptions = [
    { value: '1', label: '貨運' },
    { value: '2', label: '自取' },
    { value: '3', label: '其他' },
  ];
  /** 退貨處理方式下拉選項 */
  returnMethodOptions = [
    { value: '1', label: '貨運' },
    { value: '2', label: '自取' },
    { value: '3', label: '其他' },
  ];

  readonly columns: ReportColumn[] = [
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'VEN_Uniform', header: '廠商統一編號' },
    { field: 'VEN_Name', header: '廠商名稱(中文)' },
    { field: 'VEN_EngName', header: '廠商名稱(英文)' },
    { field: 'VEN_ShortName', header: '廠商簡稱' },
    { field: 'VEN_Address', header: '公司地址' },
    { field: 'CHARGE_STAFF', header: '負責人' },
    { field: 'CHARGE_TITLE', header: '負責人職稱' },
    { field: 'CHARGE_PID', header: '負責人身份証字號' },
    { field: 'CHARGE_TEL', header: '負責人電話' },
    { field: 'CHARGE_ADDR', header: '負責人聯絡地址' },
    { field: 'CHARGE_EMAIL', header: '負責人電子郵件' },
  ];

  constructor(
    private readonly ass11060Service: ASS11060Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11060', 'ass/ass11060cru', this.queryForm, () => this.onSubmit());
  }

  queryFunction = (body: QueryASS11060Request): Observable<ApiResponse<QueryASS11060Response[]>> => {
    const rawValue = this.queryForm.getRawValue();

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const payload: QueryASS11060Request = {
      VEN_No: rawValue.VEN_No || undefined,
      VEN_Uniform: rawValue.VEN_Uniform || undefined,
      VEN_Name: rawValue.VEN_Name || undefined,
      VEN_EngName: rawValue.VEN_EngName || undefined,
      VEN_ShortName: rawValue.VEN_ShortName || undefined,
      VEN_Address: rawValue.VEN_Address || undefined,
      CHARGE_STAFF: rawValue.CHARGE_STAFF || undefined,
      CHARGE_TITLE: rawValue.CHARGE_TITLE || undefined,
      CHARGE_PID: rawValue.CHARGE_PID || undefined,
      CHARGE_TEL: rawValue.CHARGE_TEL || undefined,
      CHARGE_ADDR: rawValue.CHARGE_ADDR || undefined,
      CHARGE_EMAIL: rawValue.CHARGE_EMAIL || undefined,
      VEN_Tel: rawValue.VEN_Tel || undefined,
      VEN_Fax: rawValue.VEN_Fax || undefined,
      ORDER_ADDR: rawValue.ORDER_ADDR || undefined,
      ORDER_TEL: rawValue.ORDER_TEL || undefined,
      ORDER_FAX: rawValue.ORDER_FAX || undefined,
      FACTO_ADDR: rawValue.FACTO_ADDR || undefined,
      FACTO_TEL: rawValue.FACTO_TEL || undefined,
      FACTO_FAX: rawValue.FACTO_FAX || undefined,
      DELIVERY: rawValue.DELIVERY || undefined,
      RETURN_ORDER: rawValue.RETURN_ORDER || undefined,
      DELIVERY_LIMIT: rawValue.DELIVERY_LIMIT ?? undefined,
      VEN_Remark: rawValue.VEN_Remark || undefined,
      PageSize: (body as any).pageSize ?? body.PageSize,
      PageIndex: (body as any).pageIndex ?? body.PageIndex,
      SortBy: body.SortBy,
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */

    return this.ass11060Service.queryASS11060(removeEmptyValues(payload) as QueryASS11060Request);
  };

  onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const rawValue = this.queryForm.getRawValue();

      this.lastQueryBody = {
        VEN_No: rawValue.VEN_No || undefined,
        VEN_Uniform: rawValue.VEN_Uniform || undefined,
        VEN_Name: rawValue.VEN_Name || undefined,
        VEN_EngName: rawValue.VEN_EngName || undefined,
        VEN_ShortName: rawValue.VEN_ShortName || undefined,
        VEN_Address: rawValue.VEN_Address || undefined,
        CHARGE_STAFF: rawValue.CHARGE_STAFF || undefined,
        CHARGE_TITLE: rawValue.CHARGE_TITLE || undefined,
        CHARGE_PID: rawValue.CHARGE_PID || undefined,
        CHARGE_TEL: rawValue.CHARGE_TEL || undefined,
        CHARGE_ADDR: rawValue.CHARGE_ADDR || undefined,
        CHARGE_EMAIL: rawValue.CHARGE_EMAIL || undefined,
        VEN_Tel: rawValue.VEN_Tel || undefined,
        VEN_Fax: rawValue.VEN_Fax || undefined,
        ORDER_ADDR: rawValue.ORDER_ADDR || undefined,
        ORDER_TEL: rawValue.ORDER_TEL || undefined,
        ORDER_FAX: rawValue.ORDER_FAX || undefined,
        FACTO_ADDR: rawValue.FACTO_ADDR || undefined,
        FACTO_TEL: rawValue.FACTO_TEL || undefined,
        FACTO_FAX: rawValue.FACTO_FAX || undefined,
        DELIVERY: rawValue.DELIVERY || undefined,
        RETURN_ORDER: rawValue.RETURN_ORDER || undefined,
        DELIVERY_LIMIT: rawValue.DELIVERY_LIMIT ?? undefined,
        VEN_Remark: rawValue.VEN_Remark || undefined,
        PageSize: rawValue.pageSize || 30,
        PageIndex: rawValue.pageIndex || 1,
      } as QueryASS11060Request;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, rawValue);
      this.queryFunction(this.lastQueryBody).pipe(
        finalize(() => {
          this.tableLoading.set(false);
          this.loading = false;
        }),
        untilDestroyed(this),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.tableData.set(res.Data);
          this.totalRecords.set(res.TotalCount || 0);
        },
      });
    });
  }

  private buildExportPayload() {
    const rawValue = this.queryForm.getRawValue();
    return removeEmptyValues({
      PageSize: rawValue.pageSize,
      PageIndex: rawValue.pageIndex,
      VEN_No: rawValue.VEN_No || undefined,
      VEN_Uniform: rawValue.VEN_Uniform || undefined,
      VEN_Name: rawValue.VEN_Name || undefined,
      VEN_EngName: rawValue.VEN_EngName || undefined,
      VEN_ShortName: rawValue.VEN_ShortName || undefined,
      VEN_Address: rawValue.VEN_Address || undefined,
      CHARGE_STAFF: rawValue.CHARGE_STAFF || undefined,
      CHARGE_TITLE: rawValue.CHARGE_TITLE || undefined,
      CHARGE_PID: rawValue.CHARGE_PID || undefined,
      CHARGE_TEL: rawValue.CHARGE_TEL || undefined,
      CHARGE_ADDR: rawValue.CHARGE_ADDR || undefined,
      CHARGE_EMAIL: rawValue.CHARGE_EMAIL || undefined,
      VEN_Tel: rawValue.VEN_Tel || undefined,
      VEN_Fax: rawValue.VEN_Fax || undefined,
      ORDER_ADDR: rawValue.ORDER_ADDR || undefined,
      ORDER_TEL: rawValue.ORDER_TEL || undefined,
      ORDER_FAX: rawValue.ORDER_FAX || undefined,
      FACTO_ADDR: rawValue.FACTO_ADDR || undefined,
      FACTO_TEL: rawValue.FACTO_TEL || undefined,
      FACTO_FAX: rawValue.FACTO_FAX || undefined,
      DELIVERY: rawValue.DELIVERY || undefined,
      RETURN_ORDER: rawValue.RETURN_ORDER || undefined,
      DELIVERY_LIMIT: rawValue.DELIVERY_LIMIT ?? undefined,
      VEN_Remark: rawValue.VEN_Remark || undefined,
    }) as QueryASS11060Request;
  }

  onExportPDF() {
    const payload = this.buildExportPayload();

    this.btnPDFLoading = true;
    this.ass11060Service.exportASS11060PDF(payload)
      .pipe(finalize(() => this.btnPDFLoading = false), untilDestroyed(this))
      .subscribe(blob => {
        if (blob) {
          const now = new Date();
          const timestamp = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0') +
            now.getSeconds().toString().padStart(2, '0');
          const fileName = `供應商資料${timestamp}.pdf`;

          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(blobUrl);
        }
      });
  }

}
