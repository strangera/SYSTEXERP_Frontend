
import { NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CPM11080Service } from '@service/api/cpm/cpm11080.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { AddButton, createPaginationConfig, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { DropDownListService } from 'src/app/service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

const formatSubKind = (value: string | null | undefined, fallbackName?: string): string => {
  if (!value && !fallbackName) { return ''; }
  const options = getSYS1000Options('LOST_GOODS_TYPE');
  const found = value ? options.find(opt => opt.value === value) : undefined;
  if (found?.label) { return found.label; }
  if (fallbackName) { return fallbackName; }
  return value ?? '';
};
@Component({
  selector: 'app-cpm11080',
  templateUrl: './cpm11080.component.html',
  standalone: true,
  imports: [DropdownComponent, NgStyle,
    NgIf, ButtonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, ButtonComponent, TableComponent, TranslateModule]
})

export class CPM11080Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    REC_DATE_FROM: [new Date(), [Validators.required]],
    REC_DATE_TO: [new Date(), [Validators.required]],
    KIND: [''],
    ...createPaginationConfig([{ field: 'VouNo', order: 1 }]),
  });
  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
  btnLoading = false;
  selectAll = false;
  get selectedCount(): number {
    return this.selectedItems?.length ?? 0;
  }
  columns: any[] = [
    { field: 'SUB_KIND_TEXT', header: '類別', visible: true },
    { field: 'KIND_NAME', header: '失物類別', visible: true },
    { field: 'NOTES', header: '敘述', visible: true },
    { field: 'SEQ_ID', header: '紀錄編號', visible: true },
    { field: 'REC_DATE', header: '登錄日期', visible: true, format: formatDate },
    { field: 'BY_MISSING_PEOPLE', header: '被尋人姓名', visible: true },
    { field: 'SALUTATION', header: '被尋人稱謂', visible: true },
    { field: 'COLLECTION_SITES', header: '集合地點', visible: true },
    { field: 'REGISTRANT', header: '遺失者/拾獲者姓名', visible: true },
    { field: 'BROADCAST_YN', header: '已廣播', visible: true },
  ];

  SubpoenastatusOptions: any[] = [
    { No: 'L', Name: '遺失' },
    { No: 'F', Name: '拾獲' },
    { No: 'P', Name: '尋人' },
  ];
  addButton: AddButton[] = [
    {
      label: '廣播',
      icon: 'pi pi-volume-up',
      // displayText: '廣播',
      action: (rowData) => this.onBroadcastClick(rowData),
      disabled: (rowData) => rowData?.BROADCAST_YN === 'Y',
      loading: () => false
    }
  ];


  constructor(
    private dropDownListService: DropDownListService,
    private cpm11080Service: CPM11080Service
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('CPM11080', '/CPM/CPM11080CRU', this.queryForm, (frm) => this.onSubmit(frm));

  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();

      const toIsoString = (value: unknown): string | null => {
        if (!value) { return null; }
        const d = new Date(value as any);
        return isNaN(d.getTime()) ? null : d.toISOString();
      };

      const payload = {
        PageSize: raw.pageSize ?? 20,
        PageIndex: raw.pageIndex ?? 1,
        OrderBy: '',
        Offset: 0,
        SortBy: raw.SortBy ?? [{ field: 'SEQ_ID', order: 1 }],
        REC_DATE_FROM: toIsoString(raw.REC_DATE_FROM),
        REC_DATE_TO: toIsoString(raw.REC_DATE_TO),
        KIND: raw.KIND || null,
      };

      this.cpm11080Service
        .queryCPM11080(payload)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            const body = res.body;

            if (body?.Status === '0000') {
              this.data = (body.Data ?? []).map((item: any) => ({
                ...item,
                SUB_KIND_TEXT: formatSubKind(item.SUB_KIND, item.KIND_NAME),
              }));
              this.totalRecords = body.TotalCount ?? this.data.length;
              this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
            } else {
              this.data = [];
              this.totalRecords = 0;
              this.messageService.errorBubble(body?.Message || '查詢失敗');
            }
          },

        });

    });
  }
  onBroadcastClick(rowData: any): void {
    const seqId = rowData?.SEQ_ID;
    const id = rowData?.ID ?? 0;

    if (!seqId) {
      this.messageService.warnBubble('無法取得登錄號碼');
      return;
    }

    const payload = {
      ID: id,
      SEQ_ID: seqId
    };

    this.cpm11080Service
      .updateCPM11080(payload)
      .subscribe({
        next: (res) => {
          const body = res.body;

          if (body?.Status === '0000') {

            rowData.BROADCAST_YN = 'Y';
            this.messageService.successBubble('已成功更新為已廣播');
          } else {
            this.messageService.errorBubble(body?.Message || '更新失敗');
          }
        },

      });
  }


}
