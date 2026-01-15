import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { ASS11060Service, QueryASS11060Response } from '../../../service/api/ass/ass11060.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column } from '../../../shared/componentkit/table/table.model';

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
    DropdownComponent,
    CalendarRangeComponent,
    EditorTextComponent,
    ButtonComponent,
    ButtonModule,
    TableComponent,
    TranslateModule
  ]
})
export class ASS11060Component extends BasicQueryPageComponent<QueryASS11060Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    VENDOR_ID: ['', [Validators.maxLength(12)]], // 廠商編號
    GUI_ID: ['', [Validators.maxLength(10)]], // 廠商統一編號
    VENDOR_NAME: ['', [Validators.maxLength(60)]], // 廠商名稱(中文)
    VENDOR_NAME_E: ['', [Validators.maxLength(60)]], // 廠商名稱(英文)
    VENDOR_NAME_S: ['', [Validators.maxLength(10)]], // 廠商簡稱
    VENDOR_REG_ADDR: ['', [Validators.maxLength(60)]], // 發票地址
    // 負責人相關
    CHARGE_STAFF: ['', [Validators.maxLength(12)]], // 負責人
    CHARGE_TITLE: ['', [Validators.maxLength(16)]], // 負責人職稱
    CHARGE_PID: ['', [Validators.maxLength(10)]], // 負責人身份証字號
    CHARGE_TEL: ['', [Validators.maxLength(15)]], // 負責人電話
    CHARGE_ADDR: ['', [Validators.maxLength(100)]], // 負責人聯絡地址
    CHARGE_EMAIL: ['', [Validators.maxLength(60)]], // 負責人電子郵件
    // 公司相關
    companyAddress: ['', [Validators.maxLength(100)]], // 公司登記地址(中文)
    VENDOR_REG_TEL: ['', [Validators.maxLength(15)]], // 公司登記電話
    VENDOR_FAX: ['', [Validators.maxLength(15)]], // 公司傳真
    // 訂貨相關
    ORDER_ADDR: ['', [Validators.maxLength(100)]], // 訂貨地址
    ORDER_TEL: ['', [Validators.maxLength(12)]], // 訂貨電話
    ORDER_FAX: ['', [Validators.maxLength(12)]], // 訂貨傳真
    // 工廠相關
    FACTO_ADDR: ['', [Validators.maxLength(100)]], // 工廠地址
    FACTO_TEL: ['', [Validators.maxLength(12)]], // 工廠電話
    FACTO_FAX: ['', [Validators.maxLength(12)]], // 工廠傳真
    // 其他
    DELIVERY: [null as string | null], // 送貨方式
    RETURN_ORDER: [null as string | null], // 退貨處理方式
    DELIVERY_LIMIT_FROM: [null as number | null], // 廠商送貨期限起
    DELIVERY_LIMIT_TO: [null as number | null], // 廠商送貨期限迄
    NOTES: [''], // 附註
    // 分頁排序
    pageSize: [20],
    pageIndex: [1],
    SortBy: [[{ field: 'VENDOR_ID', order: 1 }]],
  });

  // 表格資料
  data: QueryASS11060Response[] = [];
  totalRecords = 0;

  // 匯出按鈕 loading 狀態
  btnPDFLoading = false;
  btnExcelLoading = false;

  // 下拉選項
  deliveryMethodOptions = [
    { value: '1', label: '貨運' },
    { value: '2', label: '自取' },
    { value: '3', label: '其他' },
  ];
  returnMethodOptions = [
    { value: '1', label: '貨運' },
    { value: '2', label: '自取' },
    { value: '3', label: '其他' },
  ];

  // 表格欄位定義
  columns: Column[] = [
    { field: 'VENDOR_ID', header: '廠商編號', visible: true },
    { field: 'GUI_ID', header: '廠商統一編號', visible: true },
    { field: 'VENDOR_NAME', header: '廠商名稱(中文)', visible: true },
    { field: 'VENDOR_NAME_E', header: '廠商名稱(英文)', visible: true },
    { field: 'VENDOR_NAME_S', header: '廠商簡稱', visible: true },
    { field: 'VENDOR_REG_ADDR', header: '發票地址', visible: true },
    { field: 'CHARGE_STAFF', header: '負責人', visible: true },
    { field: 'CHARGE_TITLE', header: '負責人職稱', visible: true },
    { field: 'CHARGE_PID', header: '負責人身份証字號', visible: true },
    { field: 'CHARGE_TEL', header: '負責人電話', visible: true },
    { field: 'CHARGE_ADDR', header: '負責人聯絡地址', visible: true },
    { field: 'CHARGE_EMAIL', header: '負責人電子郵件', visible: true },
  ];

  constructor(
    private readonly ass11060Service: ASS11060Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11060', 'ass/ass11060cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const rawValue = frm.getRawValue();

      const payload = {
        PageSize: rawValue.pageSize,
        PageIndex: rawValue.pageIndex,
        SortBy: rawValue.SortBy,
        VENDOR_ID: rawValue.VENDOR_ID || null,
        GUI_ID: rawValue.GUI_ID || null,
        VENDOR_NAME: rawValue.VENDOR_NAME || null,
        VENDOR_NAME_E: rawValue.VENDOR_NAME_E || null,
        VENDOR_NAME_S: rawValue.VENDOR_NAME_S || null,
        VENDOR_REG_ADDR: rawValue.VENDOR_REG_ADDR || null,
        CHARGE_STAFF: rawValue.CHARGE_STAFF || null,
        CHARGE_TITLE: rawValue.CHARGE_TITLE || null,
        CHARGE_PID: rawValue.CHARGE_PID || null,
        CHARGE_TEL: rawValue.CHARGE_TEL || null,
        CHARGE_ADDR: rawValue.CHARGE_ADDR || null,
        CHARGE_EMAIL: rawValue.CHARGE_EMAIL || null,
        VENDOR_REG_TEL: rawValue.VENDOR_REG_TEL || null,
        VENDOR_FAX: rawValue.VENDOR_FAX || null,
        ORDER_ADDR: rawValue.ORDER_ADDR || null,
        ORDER_TEL: rawValue.ORDER_TEL || null,
        ORDER_FAX: rawValue.ORDER_FAX || null,
        FACTO_ADDR: rawValue.FACTO_ADDR || null,
        FACTO_TEL: rawValue.FACTO_TEL || null,
        FACTO_FAX: rawValue.FACTO_FAX || null,
        DELIVERY: rawValue.DELIVERY || null,
        RETURN_ORDER: rawValue.RETURN_ORDER || null,
        DELIVERY_LIMIT: rawValue.DELIVERY_LIMIT_FROM || null,
        NOTES: rawValue.NOTES || null,
      };

      this.ass11060Service.queryASS11060(payload)
        .pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
        )
        .subscribe(res => {
          this.data = res.Data.Data || [];
          this.totalRecords = res.Data.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  onClearForm() {
    this.queryForm.reset();
  }

  // 建立匯出用的 payload
  private buildExportPayload(frm: FormGroup) {
    const rawValue = frm.getRawValue();
    return {
      PageSize: rawValue.pageSize,
      PageIndex: rawValue.pageIndex,
      SortBy: rawValue.SortBy,
      VENDOR_ID: rawValue.VENDOR_ID || null,
      GUI_ID: rawValue.GUI_ID || null,
      VENDOR_NAME: rawValue.VENDOR_NAME || null,
      VENDOR_NAME_E: rawValue.VENDOR_NAME_E || null,
      VENDOR_NAME_S: rawValue.VENDOR_NAME_S || null,
      VENDOR_REG_ADDR: rawValue.VENDOR_REG_ADDR || null,
      CHARGE_STAFF: rawValue.CHARGE_STAFF || null,
      CHARGE_TITLE: rawValue.CHARGE_TITLE || null,
      CHARGE_PID: rawValue.CHARGE_PID || null,
      CHARGE_TEL: rawValue.CHARGE_TEL || null,
      CHARGE_ADDR: rawValue.CHARGE_ADDR || null,
      CHARGE_EMAIL: rawValue.CHARGE_EMAIL || null,
      VENDOR_REG_TEL: rawValue.VENDOR_REG_TEL || null,
      VENDOR_FAX: rawValue.VENDOR_FAX || null,
      ORDER_ADDR: rawValue.ORDER_ADDR || null,
      ORDER_TEL: rawValue.ORDER_TEL || null,
      ORDER_FAX: rawValue.ORDER_FAX || null,
      FACTO_ADDR: rawValue.FACTO_ADDR || null,
      FACTO_TEL: rawValue.FACTO_TEL || null,
      FACTO_FAX: rawValue.FACTO_FAX || null,
      DELIVERY: rawValue.DELIVERY || null,
      RETURN_ORDER: rawValue.RETURN_ORDER || null,
      DELIVERY_LIMIT: rawValue.DELIVERY_LIMIT_FROM || null,
      NOTES: rawValue.NOTES || null,
    };
  }

  // 匯出 PDF
  onExportPDF(frm: FormGroup) {
    const payload = this.buildExportPayload(frm);

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

  // 匯出 Excel
  onExportExcel(frm: FormGroup) {
    const payload = this.buildExportPayload(frm);

    this.btnExcelLoading = true;
    this.ass11060Service.exportASS11060(payload)
      .pipe(finalize(() => this.btnExcelLoading = false), untilDestroyed(this))
      .subscribe(blob => {
        if (blob) {
          const now = new Date();
          const timestamp = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0') +
            now.getSeconds().toString().padStart(2, '0');
          const fileName = `供應商資料${timestamp}.xlsx`;

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
