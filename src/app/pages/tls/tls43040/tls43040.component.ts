import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from 'src/app/shared/componentkit/table/table.model';
import { Tls43040Service } from '@service/api/tls/tls43040.service';
import { Column } from 'src/app/shared/componentkit/table/table.model'; // Ensure this path is correct
import { finalize } from 'rxjs';

@Component({
  templateUrl: './tls43040.component.html',
  styleUrls: ['./tls43040.component.scss'],
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, TableComponent, TranslateModule]
})
export class TLS43040Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    ECR_GrpNo: ['', [Validators.maxLength(3)]],// 機台群組編號
    ECR_GrpName: ['', [Validators.maxLength(30)]], // 機台群組名稱
    ECR_GrpDesc: ['', [Validators.maxLength(100)]], // 機台群組備註

    ...createPaginationConfig([{ field: 'ECR_GrpNo', order: 1 }]),

  });

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  selectedRows: any[] = [];
  // 主檔 (外層 table)
  columns7: Column[] = [
    { field: 'ECR_GrpNo', header: '收銀機群組編號', visible: true },
    { field: 'ECR_GrpName', header: '收銀機群組名稱', visible: true },
    { field: 'ECR_GrpDesc', header: '收銀機群組備註', visible: true },
  ];

  // 展開 (內層 table)
  expansionColumns7: Column[] = [
    { field: 'ECR_GrpSeqNo', header: '收銀機群組順序號', visible: true },
    { field: 'ECR_GrpNo', header: '收銀機群組編號', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'ECR_Type', header: '機台類型', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'building_desc', header: '館別顯示名稱', visible: true },
    { field: 'floor_desc', header: '樓層顯示名稱', visible: true },
    { field: 'area_desc', header: '區域顯示名稱', visible: true },
  ];

  constructor(

    private tls43040Service: Tls43040Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS43040', '/TLS/TLS43040cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const payload = this.queryForm.getRawValue();
      this.tls43040Service.queryTLS43040(payload).subscribe({
        next: (res) => {
          // 轉換 Data
          this.data = (res?.Data ?? [])

          this.totalRecords = res?.TotalCount ?? this.data.length;
          console.log('TLS43040 查詢結果:', this.data);

          this.loading = false;
          this.queryStateService.setQueryState(this.ProgNo, payload);
        },
        error: (err) => {
          console.error('查詢 TLS43040 失敗:', err);
          this.loading = false;
        }
      });
    });
  }
  // ===== 事件 =====
  onDelete(rows: any[]) {
    const ECR_GrpNo_List = rows.map(row => row.ECR_GrpNo);
    this.loading = true;
    this.tls43040Service.deleteTLS43040({ ECR_GrpNo_List }).pipe(finalize(() => this.loading = false)).subscribe(res => {
      this.messageService.successBubble(res.Message);
      this.onSubmit(this.queryForm); // 重新查詢以更新資料
    });
  }
}

