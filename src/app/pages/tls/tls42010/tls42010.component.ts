import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column } from '@shared/componentkit/table/table.model';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { Tls42010Service } from '../../../service/api/tls/tls42010.service';  // 引入 service

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
    TableComponent,
    TranslateModule,
    InputTextComponent
  ]
})
export class TLS42010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    USR_Level: ['', Validators.maxLength(6)],
    ECR_KBDesc: [''],
    ...createPaginationConfig([{ field: 'USR_Level', order: 1 }]),
  });

  data: any[] = [];
  columns: Column[] = [
    { field: 'USR_Level', header: '鍵盤編號', visible: true },
    { field: 'ECR_KBType', header: '鍵盤型態', visible: true },
    { field: 'TSB_Name', header: '收銀畫面名稱', visible: true },
    { field: 'ECR_KBDesc', header: '鍵盤備註', visible: true },
  ];
  totalRecords = 0;
  override loading = false;


  constructor(
    private validationService: ValidationService,
    private counterCodeService: CounterCodeService,
    private tls42010Service: Tls42010Service //  注入 service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS42010', '/TLS/TLS42010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;

      const queryParams = {
        PageSize: frm.value.PageSize || 20,   // 預設 20 筆
        PageIndex: frm.value.PageIndex || 1,
        OrderBy: frm.value.OrderBy || '',
        Offset: frm.value.Offset || 0,
        SortBy: frm.value.SortBy || [{ field: 'USR_Level', order: 1 }],
        USR_Level: frm.value.USR_Level || '',
        ECR_KBDesc: frm.value.ECR_KBDesc || ''
      };

      console.log('查詢 payload:', queryParams);

      this.tls42010Service.queryTLS42010M(queryParams).subscribe({
        next: (res) => {
          const rawData: { USR_Level: string; [key: string]: any }[] = res?.Data ?? [];

          // 以 USR_Level 當 key 過濾掉重複
          const uniqueMap = new Map();
          rawData.forEach((item: { USR_Level: string; [key: string]: any }) => {
            if (!uniqueMap.has(item.USR_Level)) {
              uniqueMap.set(item.USR_Level, item);
            }
          });

          this.data = Array.from(uniqueMap.values());
          this.totalRecords = res?.TotalCount ?? this.data.length;
          this.loading = false;
          console.log('查詢成功 (過濾後):', this.data);
        },
        error: (err) => {
          this.loading = false;
          console.error('TLS42010 查詢失敗', err);
        }
      });

    });
  }

}
