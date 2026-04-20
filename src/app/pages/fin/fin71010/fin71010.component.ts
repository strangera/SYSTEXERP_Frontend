import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN71010Service } from '@service/api/fin/fin71010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN71010Data } from './fin71010.model';

@Component({
  selector: 'app-fin71010',
  templateUrl: './fin71010.component.html',
  styleUrl: './fin71010.component.scss',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
  ],
})
export class FIN71010Component extends BasicQueryPageComponent<FIN71010Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    SYS_StoreNo: this.formBuilder.control<string | void>(void 0),
    ECR_No: this.formBuilder.control<string | void>(void 0),
    ...createPaginationConfig([{ field: 'SYS_StoreNo', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<FIN71010Data[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(!1);

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading();
  });

  public readonly columns: Column[] = [
    { field: 'SYS_StoreNo', header: '分店代號' },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'APEXP_LID', header: '應付費用科目' },
    { field: 'APEXP_LID_Name', header: '應付費用科目名稱' },
    { field: 'APEXP_LID_COMMON', header: '應付費用科目(共同)' },
    { field: 'APEXP_LID_COMMON_Name', header: '應付費用科目(共同)名稱' },
    { field: 'PTAX_LID', header: '進項稅額科目' },
    { field: 'PTAX_LID_Name', header: '進項稅額科目名稱' },
    { field: 'PTAX_LID_COMMON', header: '進項稅額科目(共同)' },
    { field: 'PTAX_LID_COMMON_Name', header: '進項稅額科目(共同)名稱' },
  ];

  constructor(
    public readonly service: FIN71010Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN71010', '/FIN/FIN71010CRU', this.queryForm, this.onSubmit.bind(this));
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = { ...this.queryForm.getRawValue() };
      const payload = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
        v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0)
      ));

      this.tableLoading.set(!0);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.logger.debug(`onSubmit:`, [raw, payload]);
      this.service.queryFIN71010(payload).pipe(
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.tableData.set(res.Data || []);
          this.totalRecords.set(res.TotalCount || 0);
        },
      });
    });
  }
}
