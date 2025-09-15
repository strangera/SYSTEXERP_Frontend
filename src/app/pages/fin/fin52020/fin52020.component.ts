import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { config, finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Fin52020Service } from '../../../service/api/fin/fin52020.service';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { columns, TDS52020Data } from './fin52020.model';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';

@Component({
  selector: 'app-fin52020',
  templateUrl: './fin52020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class FIN52020Component extends BasicQueryPageComponent<TDS52020Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    VoucherKind: ['', [Validators.maxLength(3), this.validationService.alphanumericValidator]],
    VoucherName: ['', [Validators.maxLength(30)]],
    ...createPaginationConfig([{ field: 'VoucherName', order: 1 }]),
  });

  totalRecords = 0;
  data: TDS52020Data[] = [];
  selectedRows: TDS52020Data[] = [];
  columns = columns;

  constructor(
    private fin52020Service: Fin52020Service,
    private validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN52020', '/FIN/FIN52020cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup) {
     
    this.handleSubmit(form, () => {
      this.loading = true;
      this.fin52020Service.queryFIN52020(form.value)
        .pipe(finalize(() => this.loading = false), untilDestroyed(this))
        .subscribe(res => {
          this.data = res.Data;
          console.log(this.data)
          this.totalRecords = res.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, form.value);
        });
    });
  }

  onDelete(rows: TDS52020Data[]) {
    const idList = rows.map(row => row.Id);
    this.fin52020Service.deleteFIN52020({ idList }).pipe(untilDestroyed(this)).subscribe(res => {
      this.onSubmit(this.queryForm);
      this.selectedRows = [];
      this.messageService.successBubble(res.Message);
    });
  }
}
