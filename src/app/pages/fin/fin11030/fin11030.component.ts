import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { APS2001Data, columns, SAL_GUIPaperOptions } from './fin11030.model';
import { Fin11030Service } from '../../../service/api/fin/fin11030.service';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-fin11030',
    templateUrl: './fin11030.component.html',
    standalone: true,
    imports: [
        MenubarComponent,
        ButtonComponent,
        AccordionModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarRangeComponent,
        InputTextComponent,
        InputTextRangeComponent,
        MultiSelectComponent,
        TableComponent,
        TranslateModule,
    ],
})
//1.1.1.3 銷項品項資料設定
export class FIN11030Component extends BasicQueryPageComponent<APS2001Data> implements OnInit {
  queryForm = this.formBuilder.group({
    SAL_GUIYYYYMM_start: [null, [Validators.required]],
    SAL_GUIYYYYMM_end: [null, [Validators.required]],
    SAL_GUITrack: ['', [Validators.maxLength(2)]],
    SAL_GUINo_start: ['', [Validators.maxLength(8), Validators.max(99999999)]],
    SAL_GUINo_end: ['', [Validators.maxLength(8), Validators.max(99999999)]],
    SAL_GUIPaper: [null],
    ...createPaginationConfig([{ field: 'id', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  SAL_GUIPaperOptions = SAL_GUIPaperOptions;     // 發票類別選項
  data: APS2001Data[] = [];
  selectedRows: APS2001Data[] = [];
  columns: Column[] = columns;
  constructor(private fin11030Service: Fin11030Service) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('FIN11030', '/FIN/FIN11030cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onDelete(selectedRows: APS2001Data[]) {
    const ids = selectedRows.map(row => row.id);
    this.fin11030Service.deleteFIN11030(ids).pipe(untilDestroyed(this)).pipe(untilDestroyed(this)).subscribe({
      next: () => {
        this.onSubmit(this.queryForm);
        this.selectedRows = [];
      },
      error: () => { this.loading = false; },
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.fin11030Service.queryFIN11030(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((response) => {
        this.data = response.Data.map((item: APS2001Data) => ({
          ...item,
          SAL_GUIYYYYMM: this.convertYYYYMMToDate(item.SAL_GUIYYYYMM)
        }));
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  // 將 "YYYYMM" 轉為 Date 物件
  private convertYYYYMMToDate(yyyymm: string): Date | null {
    if (!/^\d{6}$/.test(yyyymm)) return null;
    const year = Number(yyyymm.substring(0, 4));
    const month = Number(yyyymm.substring(4, 6)) - 1; // JS 月份從 0 開始
    return new Date(year, month, 1);
  }
}
