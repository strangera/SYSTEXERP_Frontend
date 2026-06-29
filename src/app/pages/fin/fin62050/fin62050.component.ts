import { DatePipe, DecimalPipe, KeyValuePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Fin62050Service } from '@service/api/fin/fin62050.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { finalize, take } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { FIN62050QueryRequest, FIN62050ResponseItem } from './fin62050.types';

@Component({
  selector: 'app-fin62050',
  templateUrl: './fin62050.component.html',
  standalone: true,
  imports: [
    DecimalPipe,
    KeyValuePipe,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    CheckboxModule,
    TableModule,
    ButtonComponent,
    TranslateModule,
  ]
})
export class FIN62050Component extends BasicQueryPageComponent<FIN62050ResponseItem> implements OnInit {
  private readonly fin62050Service = inject(Fin62050Service);
  private readonly dropdownApiService = inject(DropdownApiService);
  private readonly fileExportService = inject(FileExportService);
  private readonly datePipe = inject(DatePipe);
  protected readonly destroyRef = inject(DestroyRef);

  queryForm = this.formBuilder.nonNullable.group({
    StartDate: [null as string | null, Validators.required],
    EndDate: [null as string | null, Validators.required],
    ShowUnCheckYN: [true],
    BankList: [null as string[] | null],
  });

  data = signal<FIN62050ResponseItem[]>([]);
  bankGroups = signal<Map<string, FIN62050ResponseItem[]>>(new Map());
  lastQueryBody = signal<FIN62050QueryRequest | null>(null);
  btnLoading = signal(false);
  bankOptions = signal<Option[]>([]);

  ngOnInit(): void {
    this.initializePage('FIN62050');
    this.dropdownApiService.queryAps1002ForBankFilter()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(opts => {
        this.bankOptions.set(opts ?? []);
      });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const body = {
        ...frm.value,
        StartDate: this.datePipe.transform(this.queryForm.value.StartDate, 'yyyy-MM-dd'),
        EndDate: this.datePipe.transform(this.queryForm.value.EndDate, 'yyyy-MM-dd'),
      }
      this.fin62050Service.queryFIN62050(body as FIN62050QueryRequest)
        .pipe(
          take(1),
          finalize(() => this.loading = false)
        )
        .subscribe(res => {
          this.data.set(res);
          this.bankGroups.set(this.groupByBank(res));
          this.lastQueryBody.set(body as FIN62050QueryRequest);
        });
    });
  }

  onExportPDF(): void {
    if (!this.lastQueryBody()) return;
    this.fileExportService.executeFileExport(
      this.fin62050Service.exportFIN62050PDF(this.lastQueryBody()!),
      '.pdf',
      (isLoading) => this.btnLoading.set(isLoading)
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  onExportExcel(): void {
    if (!this.lastQueryBody()) return;
    this.fileExportService.executeFileExport(
      this.fin62050Service.exportFIN62050Excel(this.lastQueryBody()!),
      '.xlsx',
      (isLoading) => this.btnLoading.set(isLoading)
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  hasUncheckedRows(rows: FIN62050ResponseItem[]): boolean {
    return rows.some(r => r.RowType === 'UD');
  }

  getSectionA(rows: FIN62050ResponseItem[]): FIN62050ResponseItem[] {
    return rows.filter(r => r.RowType === 'INIT' || r.RowType === 'D' || r.RowType === 'A');
  }

  getSectionB(rows: FIN62050ResponseItem[]): FIN62050ResponseItem[] {
    return rows.filter(r => r.RowType === 'UD' || r.RowType === 'B');
  }

  getCRow(rows: FIN62050ResponseItem[]): FIN62050ResponseItem | undefined {
    return rows.find(r => r.RowType === 'C');
  }

  private groupByBank(items: FIN62050ResponseItem[]): Map<string, FIN62050ResponseItem[]> {
    const map = new Map<string, FIN62050ResponseItem[]>();
    for (const item of items) {
      if (!map.has(item.BNK_id)) map.set(item.BNK_id, []);
      map.get(item.BNK_id)!.push(item);
    }
    return map;
  }
}
