import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize, map } from 'rxjs';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';


@Component({
    selector: 'app-tls26020',
    templateUrl: './tls26020.component.html',
    standalone: true,
    imports: [
        MenubarComponent,
        AccordionModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonComponent,
        TranslateModule,
    ],
})
export class TLS26020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    saleDateStart: [null, Validators.required],
    saleDateEnd: [null, Validators.required],
    FLOOR_NO: [null],
    tlt_building: [null],
    org_id: [null]
  });

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

  floorOptions: { label: string; value: string }[] = [];
  BUILDING_NO_Options: { label: string; value: string }[] = [];
  OrganizationCodeOptions: { formLabel: string; value: string }[] = [];

  columns: Column[] = [
    { field: 'LOCATION_No', header: '位置編號', visible: true },
    { field: 'LOCATION_Name', header: '位置名稱', visible: true },
    { field: 'LOCATION_Floor', header: '樓層', visible: true },
    { field: 'LOCATION_Building', header: '館別', visible: true },
    { field: 'org_id', header: '組織代碼', visible: true },
    { field: 'org_name', header: '組織名稱', visible: true },
  ];

  constructor(
    // private dropDownListService: DropDownListService,
    // private tls26020Service: Tls26020Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26020', 'TLS/TLS26020cru', this.queryForm, (form) => this.onSubmit(form));
    // this.loadOptions();
  }


  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const formValue = { ...form.value };
      this.loading = true;
      // this.tls26020Service.queryTLS26020(formValue).pipe(
      //   finalize(() => (this.loading = false))
      // ).subscribe({
      //   next: (res: any) => {
      //     this.data = res.Data;
      //     this.totalRecords = res.TotalCount;
      //     this.queryStateService.setQueryState(this.ProgNo, formValue);
      //   },
      // });
    });
  }

  // onEdit(row: any): void {
  //   console.log('編輯 row:', row);
  // }

  // onDetail(row: any): void {
  //   console.log('查看 row:', row);
  // }
  // onDelete(rows: any[]): void {
  //   console.log('刪除 rows:', rows);
  // }
}
