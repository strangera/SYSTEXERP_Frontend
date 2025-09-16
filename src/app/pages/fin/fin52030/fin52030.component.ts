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
    const data = this.service.FIN52030Data();

    const hasTypeCode = this.qf().typeCode.value && this.qf().typeCode.value?.trim() !== '';
    const hasSubpoenaName = this.qf().subpoenaName.value && this.qf().subpoenaName.value?.trim() !== '';
    const hasSubpoenaType = this.qf().subpoenaType.value && this.qf().subpoenaType.value?.trim() !== '';
    const hasCreator = this.qf().creator.value && this.qf().creator.value?.trim() !== '';
    const hasModifier = this.qf().modifier.value && this.qf().modifier.value?.trim() !== '';

    if (!hasTypeCode && !hasSubpoenaName && !hasSubpoenaType && !hasCreator && !hasModifier) {
      return data;
    }

    // 有篩選條件時進行篩選
    return data.filter(item => {
      let matches = !0;

      if (hasTypeCode) {
        matches = matches && item['typeCode'] === this.qf().typeCode.value;
      }
      if (hasSubpoenaName) {
        matches = matches && item['subpoenaName'] && item['subpoenaName'].includes(this.qf().subpoenaName.value);
      }
      if (hasSubpoenaType) {
        matches = matches && item['subpoenaType'] === this.qf().subpoenaType.value;
      }
      if (hasCreator) {
        matches = matches && item['creator'] === this.qf().creator.value;
      }
      if (hasModifier) {
        matches = matches && item['modifier'] === this.qf().modifier.value;
      }

      return matches;
    });
  });

  public readonly totalRecords = computed(() => this.filteredData().length);

  public columns: Column[] = [
    { field: 'isDeleted', header: '是否刪除', format: v => v === 'Y' ? '是' : '否' },
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

    this.service.test ? this.service.creators.set(creators) : this.service.creators();
    this.service.test ? this.service.modifiers.set(modifiers) : this.service.modifiers();

    this.logger.debug(`init:`, [dummyData]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const payload = {
        ...this.queryForm.getRawValue(),
      };
      this.service.FIN52030Data.set([]);

      this.service.test ? this.service.FIN52030Data.set(dummyData) : this.service.loadFIN52030(payload);

      this.submitted = !0;
      this.loading = !1;
    });
  }

  public onClearForm(): void {
    this.queryForm.reset();
  }
}

const creators = Array.from({ length: 50 }, (_, i) => ({
  No: `U${(i + 1).toString().padStart(3, '0')}`,
  Name: `User ${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  createDate: new Date(new Date().getFullYear(), 0, 1 + Math.floor(Math.random() * 365)),
}));

const modifiers = Array.from({ length: 50 }, (_, i) => ({
  No: `U${(i + 11).toString().padStart(3, '0')}`,
  Name: `User ${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  modifyDate: new Date(new Date().getFullYear(), 0, 1 + Math.floor(Math.random() * 365)),
}));


const dummyData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  isDeleted: i % 2 === 0 ? 'Y' : 'N',
  subpoenaCode: `CODE${i + 1}`,
  subpoenaNumber: `NUM${i + 1}`,
  subpoenaName: `Subpoena Name ${i + 1}`,
  detailCount: Math.floor(Math.random() * 1e5) + 1,
  typeCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
  subpoenaType: ((i % 3) + 1).toString(),
  creator: creators[i % creators.length].Name,
  createDate: creators[i % creators.length].createDate,
}));
