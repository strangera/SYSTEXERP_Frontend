
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52030Service } from '@service/api/fin/fin52030.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-fin52030',
  templateUrl: './fin52030.component.html',
  styleUrl: './fin52030.component.scss',
  standalone: !0,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
  ],
})
export class FIN52030Component extends BasicQueryPageComponent<unknown> implements OnInit {
  public readonly queryForm = this.formBuilder.group({
    typeCode: new FormControl<string | void>(void 0),
    subpoenaName: new FormControl<string | void>(void 0),
    subpoenaType: new FormControl<string | void>(void 0),
    creator: new FormControl<string | void>(void 0),
    modifier: new FormControl<string | void>(void 0),
    ...createPaginationConfig([{ field: 'id', order: 1 }])
  });
  public readonly qf = signal(this.queryForm.controls);

  public filteredData = computed(() => {
    return this.service.FIN52030Data();
  });

  public readonly totalRecords = computed(() => this.filteredData().length);

  public columns: Column[] = [
    { field: 'isDeleted', header: '是否刪除' },
    { field: 'subpoenaCode', header: '常用傳票代號' },
    { field: 'subpoenaNumber', header: '常用傳票號碼' },
    { field: 'subpoenaName', header: '常用傳票名稱' },
    { field: 'detailCount', header: '明細筆數' },
  ];

  constructor(
    public service: FIN52030Service,
    private logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN52030', '/FIN/FIN52030CRU', this.queryForm, this.onSubmit.bind(this));

    this.logger.debug(`init:`, []);
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const payload = {
        ...this.queryForm.getRawValue(),
      };

      this.service.loadFIN52030(payload);

      this.submitted = !0;
      this.loading = !1;
    });
  }

  public onClearForm(): void {
    this.queryForm.reset();
  }
}
