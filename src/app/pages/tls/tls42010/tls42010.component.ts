import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column } from '@shared/componentkit/table/table.model';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { Tls42010Service } from '../../../service/api/tls/tls42010.service';  // 引入 service
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';

@Component({
  selector: 'app-tls42010',
  templateUrl: './tls42010.component.html',
  styleUrl: './tls42010.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextareaComponent,
    TableReportComponent,
    TranslateModule,
    DropdownComponent
  ]
})
export class TLS42010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    USR_Level: ['', Validators.maxLength(6)],
    ECR_KBDesc: [''],
    ...createPaginationConfig([{ field: 'USR_Level', order: 1 }]),
  });
  lastQueryForm: any;
  footerTotal: any | null = null;
  data: any[] = [];
  totalRecords: any = 0;
  columns: Column[] = [
    { field: 'USR_Level', header: '鍵盤編號', visible: true },
    { field: 'ECR_KBType', header: '鍵盤型態', visible: true },
    { field: 'TSB_Name', header: '收銀畫面名稱', visible: true },
    { field: 'ECR_KBDesc', header: '鍵盤備註', visible: true },
  ];
  override loading = false;

  // 下拉選單選項
  kbFuncOptions: { label: string; value: string }[] = [];

  constructor(
    private validationService: ValidationService,
    private counterCodeService: CounterCodeService,
    public readonly tls42010Service: Tls42010Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS42010', '/TLS/TLS42010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadKeyboardOptions();
  }

  private loadKeyboardOptions(): void {
    this.dropDownListService.queryTLS42010DropDownList().subscribe({
      next: (res) => {
        console.log('TLS42010 dropdown 回傳:', res);

        const list = res.Data;
        this.kbFuncOptions = list.map((func: { KB_Desc: string; KB_Func: string }) => ({
          label: func.KB_Desc,
          value: func.KB_Func
        }));
      },
    });


  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 取得原始表單值
      const raw = frm.value;

      // 組查詢 body，依需求轉換欄位
      const body = {
        ...raw,
        PageSize: raw.PageSize || 20,
        PageIndex: raw.PageIndex || 1,
        OrderBy: raw.OrderBy || '',
        Offset: raw.Offset || 0,
        SortBy: raw.SortBy || [{ field: 'USR_Level', order: 1 }],
        USR_Level: raw.USR_Level || '',
        ECR_KBDesc: raw.ECR_KBDesc || ''
      };

      this.tls42010Service.queryTLS42010M(body).subscribe({
        next: (res) => {
          const rawData: { USR_Level: string;[key: string]: any }[] = res?.Data ?? [];
          const uniqueMap = new Map();
          rawData.forEach((item) => {
            if (!uniqueMap.has(item.USR_Level)) {
              uniqueMap.set(item.USR_Level, item);
            }
          });
          this.data = Array.from(uniqueMap.values());
          this.totalRecords = res.TotalCount;
          this.footerTotal = res.FooterTotal;
          this.loading = false;

        },
      });
    });
  }

}
