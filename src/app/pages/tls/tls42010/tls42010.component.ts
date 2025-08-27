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
      this.tls42010Service.queryTLS42010M(frm.value).subscribe({
        next: (res) => {
          this.data = res?.Data ?? [];        // 塞資料到 table
          this.totalRecords = res?.TotalCount ?? this.data.length;
          this.loading = false;
          console.log('查詢成功:', res);
        },
        error: (err) => {
          this.loading = false;
          console.error('TLS42010 查詢失敗', err);
        }
      });
    });
  }
}
