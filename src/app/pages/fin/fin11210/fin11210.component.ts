import { Component, OnInit } from '@angular/core';
import { FIN11210Data } from '../../../service/api/fin/fin11210.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { FIN11210Service } from '../../../service/api/fin/fin11210.service';
import { DropdownOption } from '../../tls/tls13010/tls13010.dropdown';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-fin11210',
    templateUrl: './fin11210.component.html',
    styleUrl: './fin11210.component.scss',
    standalone: true,
    imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, TableComponent, TranslateModule]
})
export class FIN11210Component extends BasicQueryPageComponent<FIN11210Data> implements OnInit {
  queryForm = this.formBuilder.group({
    code: ['', [Validators.maxLength(20)]], // 參數代碼
    description: ['', [Validators.maxLength(100)]], // 參數說明
    cashierNo: ['', [Validators.maxLength(20)]], // 收銀機號
    ...createPaginationConfig([{ field: 'code', order: 0 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  data: FIN11210Data[] = [];
  selectedItems: FIN11210Data[] = [];
  columns: Column[] = [
    { field: 'code', header: '參數代碼', visible: true },
    { field: 'description', header: '參數說明', visible: true },
    { field: 'content', header: '參數內容', visible: true },
  ];

  constructor(
    private FIN11210Service: FIN11210Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11210', 'fin/fin11210cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.FIN11210Service.queryFIN11210(frm.value).pipe(finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    })
  }

  isRowSelectable(rowData: FIN11210Data): boolean {
    return true;
  }

  get codeOptions(): DropdownOption[] {
    return [
      { label: '本期發票年月結束前幾天自動分配下期發票', value: 'EcrGUIAutoCnfgDayBeforeMonEnd' },
      { label: '電子發票應用API APP ID', value: 'EInvAppApiAppId' },
      { label: '電子發票應用API Key', value: 'EInvAppApiKey' },
      { label: '電子發票應用API路徑', value: 'EInvAppApiPath' },
    ];
  }
}
