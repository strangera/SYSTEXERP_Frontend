import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TLS51130Service } from '../../../service/api/tls/tls51130.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-tls51130',
    templateUrl: './tls51130.component.html',
    styleUrls: ['./tls51130.component.scss'],
    standalone: true,
    imports: [
        MenubarComponent,
        ButtonComponent,
        AccordionModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownComponent,
        TableComponent,
        TranslateModule,
    ],
})
export class TLS51130Component extends BasicQueryPageComponent<any> {
  selectedItems: any[] = [];

  queryForm = this.formBuilder.group({
    LOGO_No: [''],
    CAT_LNo: [''],
    ...createPaginationConfig([{ field: 'LOGO_No', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;
  CAT_LOptions: any[] = [];
  LOGOOptions: any[] = [];

columns: any[] = [
  { field: 'LOGO_No', header: '品牌', visible: true },
  { field: 'CAT_LDisplay', header: '大分類編號/名稱', visible: true },
  { field: 'CAT_MDisplay', header: '中分類編號/名稱', visible: true },
  { field: 'CAT_SDisplay', header: '小分類編號/名稱', visible: true },
  { field: 'PLU_OrderPrcRate', header: '進貨折數', visible: true },
  { field: 'DISC_Remark', header: '備註', visible: true },
];

  constructor(
    private TLS51130Service: TLS51130Service,

    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51130', '/tls/tls51130cru', this.queryForm);

    this.dropDownListService.queryPOS2003_DropDownList().subscribe((res) => {
      const nestedData = res?.Data || [];
      this.CAT_LOptions = nestedData.map((item) => ({
        label: item.Name,
        value: item.No,
      }));
    });

    this.dropDownListService.queryPLULOGO_HOS_No_DropDownList().subscribe((res: any) => {
      const nestedData = res?.Data || [];
      this.LOGOOptions = nestedData.map((item: { Name: string; No: string }) => ({
        label: item.Name,
        value: item.No,
      }));
    });
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    const formValue = { ...form.value };

    // 去除空字串並轉為 null
    Object.keys(formValue).forEach((key) => {
      if (typeof formValue[key] === 'string') {
        formValue[key] = formValue[key].trim() || null;
      }
    });

    this.loading = true;
    this.messageService.blockUi();

    this.TLS51130Service.queryTLS51130(formValue).subscribe({
    next: (res: any) => {
  if (res.Status === '0000') {
    const combine = (code?: any, name?: any) => {
      const a = (code ?? '').toString().trim();
      const b = (name ?? '').toString().trim();
      return a && b ? `${a}/${b}` : (a || b || '');
    };

    const raw = res.Data || [];
    this.data = raw.map((r: any) => ({
      ...r,
      CAT_LDisplay: combine(r.CAT_LNo, r.CAT_LName),
      CAT_MDisplay: combine(r.CAT_MNo, r.CAT_MName),
      CAT_SDisplay: combine(r.CAT_SNo, r.CAT_SName),
    }));

    this.totalRecords = res.TotalCount || this.data.length;
    this.queryStateService.setQueryState(this.ProgNo, formValue);
  } else {
    
  }
},
      error: () => {
        
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  onDelete(selectedItems: any[]): void {
    if (!selectedItems || !selectedItems.length) return;

    const confirmDelete = window.confirm('是否確定刪除選取項目？');
    if (!confirmDelete) return;

    const idList = selectedItems.map((item) => item.id);

    this.TLS51130Service.deleteTLS51130(idList).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.onSubmit(this.queryForm); // 重新查詢
      },
      error: () => {
        this.messageService.errorBubble('刪除失敗');
      },
    });
  }
}
