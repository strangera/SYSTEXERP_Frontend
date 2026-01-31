import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2h010Service } from '@service/api/tls/tls2h010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatAmount, formatYN } from '@shared/componentkit/table-report/table-report.model'; // 引入 ReportColumn
import { AddButton, formatYYYYMM } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { finalize, forkJoin } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

// 2.2.17.1 租金發票套印作業
@Component({
  selector: 'app-tls2h010',
  templateUrl: './tls2h010.component.html',
  standalone: true,
  imports: [ButtonModule, InputNumberRangeComponent, CalendarComponent, SelectButtonModule, TableReportComponent, AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, CheckboxModule, TranslateModule]
})
export class TLS2H010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    // 分頁欄位
    pageSize: [30],
    pageIndex: [1],
    SamYyyymm: [new Date(), Validators.required],
    GuiNoStart: [null],
    GuiNoEnd: [null],
    TltNo: [''],
    SortBy: [[{ field: 'TltNo', order: 1 }]],
  });

  lastQueryBody: any = null;
  totalRecords = 0;
  data: any[] = [];
  selectedItems: any[] = [];
  tlt_noOptions = this.dropdown.queryTltTalent();
  addButton: AddButton[] = [];
  columns: ReportColumn[] = [
    { field: 'SamYyyymm', header: '結算年月', visible: true, format: formatYYYYMM },
    { field: 'TltNo', header: '專櫃編號', visible: true },
    { field: 'TltName', header: '櫃位名稱', visible: true },
    { field: 'ContractNo', header: '契約編號', visible: true },
    { field: 'ContractSubNo', header: '契約子號', visible: true },
    { field: 'PUR_GUIDate', header: '租金', visible: true, format: formatAmount, align: 'right' },
    { field: 'GuiAmt', header: '發票金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'GuiNo', header: '發票號碼', visible: true },
    { field: 'GuiPrintTimes', header: '發票列印次數', visible: true },
    { field: 'IsPrinted', header: '是否已列印', visible: true, format: formatYN },

  ];
  constructor(
    public readonly tls2h010Service: Tls2h010Service,
    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
    this.addButton = [
      { label: '預覽列印', icon: 'fa fa-file-pdf text-blue-500', action: (rowData: any) => { this.previewPrint(rowData); }, disabled: (rowData: any) => !rowData?.GuiNo }
    ];
  }

  previewPrint(rowData: any): void {
    const toYYYYMM = (val: any): string | null => {
      if (val === null || val === undefined || val === '') return null;
      let d: Date;
      if (val instanceof Date) d = val;
      else d = new Date(val);
      if (isNaN(d.getTime())) return null;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    };

    const sam = toYYYYMM(rowData?.SamYyyymm ?? rowData?.sam_yyymm ?? rowData?.SamYyyymm);
    const params: any = {
      GuiNo: rowData?.GuiNo ?? '',
      SamYyyymm: sam ?? '',
      TltNo: rowData?.TltNo ?? ''
    };

    this.loading = true;
    this.messageService.blockUi();
    this.tls2h010Service.PrintTLS2H(params).pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
      .subscribe({
        next: (res: any) => {
          try {
            if (res instanceof Blob) {
              const blob = res as Blob;
              const url = window.URL.createObjectURL(blob);
              window.open(url, '_blank');
            } else if (res && res.Url) {
              window.open(res.Url, '_blank');
            } else {
              if (res && res.File && typeof res.File === 'string') {
                const byteCharacters = atob(res.File);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
              } else {
                this.messageService.successBubble(res?.Message ?? '預覽已送出');
              }
            }
          } catch (e) {
            console.error('PrintTLS2H preview error', e, res);
            this.messageService.errorBubble('預覽列印失敗');
          }
        },

      });
  }

  ngOnInit(): void {
    this.initializePage('TLS2H010', 'tls/tls2h010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  override onCreate() {
    if (!this.selectedItems || this.selectedItems.length === 0) {
      this.messageService.errorBubble('請先選擇資料', '未選取');
      return;
    }

    const toYYYYMM = (val: any): string | null => {
      if (val === null || val === undefined || val === '') return null;
      let d: Date;
      if (val instanceof Date) d = val;
      else d = new Date(val);
      if (isNaN(d.getTime())) return null;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    };

    const samSet = new Set<string>();
    this.selectedItems.forEach(it => {
      const raw = it.SamYyyymm ?? it.sam_yyymm ?? it.SamYyyymm;
      const yyyyMM = toYYYYMM(raw);
      if (yyyyMM) samSet.add(yyyyMM);
    });

    if (samSet.size === 0) {
      this.messageService.errorBubble('所選資料缺少結算年月', '錯誤');
      return;
    }

    const calls = Array.from(samSet).map(sam => this.tls2h010Service.generateTLS2H010({ SamYyyymm: sam }));

    this.loading = true;
    this.messageService.blockUi();

    forkJoin(calls).pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
      .subscribe({
        next: () => {
          this.messageService.successBubble('產生發票成功', '完成');
          // 可按需重新查詢
        },
        error: (err) => {
          console.error('generateTLS2H010 error', err);
          this.messageService.errorBubble('產生發票失敗', '錯誤');
        }
      });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const pageSize = raw.pageSize ?? 0;
      const pageIndex = raw.pageIndex ?? 0;
      const toYYYYMM = (val: any): string | null => {
        if (val === null || val === undefined || val === '') return null;
        let d: Date;
        if (val instanceof Date) d = val;
        else d = new Date(val);
        if (isNaN(d.getTime())) return null;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}${m}`;
      };

      const body = {
        PageSize: pageSize,
        PageIndex: pageIndex,
        OrderBy: '',
        Offset: (Math.max(pageIndex - 1, 0) * pageSize),
        SortBy: raw.SortBy || [],
        SamYyyymm: toYYYYMM(raw.SamYyyymm),
        TltNo: raw.TltNo,
      };

      this.tls2h010Service.queryTLS2H010(body)
        .pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
        .subscribe(res => {
          this.data = res?.Data || [];
          this.lastQueryBody = body;
          this.totalRecords = res?.TotalCount || 0;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }


}
