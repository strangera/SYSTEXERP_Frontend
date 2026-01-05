import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { finalize } from 'rxjs';
import { Tls42010Service } from '../../../service/api/tls/tls42010.service';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';

@Component({
  selector: 'app-tls42010',
  templateUrl: './tls42010.component.html',
  styleUrls: ['./tls42010.component.scss'],
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
    DropdownComponent,
    DialogComponent,
    NgIf,
    InputTextComponent,
  ],
})
export class TLS42010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    USR_Level: ['', Validators.maxLength(6)],
    ECR_KBDesc: [''],
    ...createPaginationConfig([{ field: 'USR_Level', order: 1 }]),
  });
  data: any[] = [];
  totalRecords = 0;
  footerTotal: any | null = null;
  lastQueryForm: any;

  columns: Column[] = [
    { field: 'USR_Level', header: '鍵盤編號', visible: true },
    { field: 'ECR_KBType', header: '鍵盤型態', visible: true },
    { field: 'TSB_Name', header: '收銀畫面名稱', visible: true },
    { field: 'ECR_KBDesc', header: '鍵盤備註', visible: true },
  ];
  kbFuncOptions: { label: string; value: string }[] = [];
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    Source_USR_Level: ['', Validators.required],
    Target_USR_Level: [[Validators.maxLength(6), Validators.required]],
  });
  dialogOptions: { No?: string; Name?: string; label?: string }[] = [];
  dialogSelectItem: any | null = null;
  dialogSelectTargetItem: any | null = null;

  constructor(
    public readonly tls42010Service: Tls42010Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS42010', '/TLS/TLS42010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadKeyboardOptions();
    this.loadDialogKeyboardList();
  }
  private loadKeyboardOptions(): void {
    this.dropDownListService.queryTLS42010DropDownList().subscribe({
      next: (res) => {
        if (res?.Status === '0000' && res.Data) {
          this.kbFuncOptions = res.Data.map((item: any) => ({
            label: item.valueUSR_Level,
            value: item.keyUSR_Level,
          }));
        }
      },
    });
  }
  private loadDialogKeyboardList(): void {
    this.dropDownListService.queryTLS42010DropDownList().subscribe({
      next: (res) => {
        if (res?.Status === '0000' && res.Data) {
          this.dialogOptions = res.Data.map((item: any) => ({
            label: item.valueUSR_Level,
            No: item.keyUSR_Level,
            Name: item.valueUSR_Level,
          }));
        }
      },
    });
  }

  // ---------------- Dialog 行為 ----------------
  onDialogChange(event: DropdownChangeEvent) {
    const selectedValue = event.value;
    const body = { USR_Level: selectedValue, pageSize: 10, pageIndex: 1 };
    this.tls42010Service.queryTLS42010M(body).subscribe({
      next: (res) => (this.dialogSelectItem = res.Data?.[0] ?? null),
    });
  }
  saveDialog(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      if (this.isValid) return;

      const srcNo = frm.value.Source_USR_Level;
      const tgtNo = frm.value.Target_USR_Level;

      this.tls42010Service.queryTLS42010M({ USR_Level: srcNo, pageSize: 10, pageIndex: 1 }).subscribe({
        next: (srcRes) => {
          const srcData = srcRes?.Data?.[0];
          if (!srcData) {
            this.loading = false;
            return;
          }

          this.tls42010Service.queryTLS42010_Detail({ USR_Level: [srcNo] }).subscribe({
            next: (detailRes) => {
              const details = detailRes?.Data ?? [];
              const body = {
                ECR_KBType: srcData.ECR_KBType || 'TCHBTN',
                USR_Level: tgtNo,
                ECR_KBDesc: srcData.ECR_KBDesc || '',
                TSB_Name: srcData.TSB_Name || '',
                POS1004Disc: details.map((d: any) => {
                  const copy = { ...d };
                  delete copy.MID;
                  delete copy.ID;

                  return {
                    ...copy,
                    ID: 0,
                    USR_Level: tgtNo,
                    ECR_KBType: srcData.ECR_KBType || 'TCHBTN'
                  };
                })
              };
              this.tls42010Service
                .insertTLS42010M(body)
                .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
                .subscribe({
                  next: (res) => {
                    this.messageService.successBubble(res.Message);
                    this.dialogVisible = false;
                    this.onSubmit(this.queryForm);
                  },

                  complete: () => (this.loading = false)
                });
            },

          });
        },

      });
    });
  }


  // 判斷來源與目標相同
  get isValid(): boolean {
    const Source = this.dialogQueryForm.value.Source_USR_Level ?? '';
    const Target = this.dialogQueryForm.value.Target_USR_Level ?? '';
    return typeof Source === 'string' && typeof Target === 'string' && Source === Target;
  }

  // ---------------- 查詢 ----------------
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.value;
      const body = {
        ...raw,
        pageSize: 30,
        pageIndex: 1,
        SortBy: [{ field: 'USR_Level', order: 1 }],
      };

      this.lastQueryForm = body;
      this.loading = true;

      this.tls42010Service
        .queryTLS42010M(body)
        .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
        .subscribe((res) => {
          this.data = res?.Data ?? [];
          this.totalRecords = res.TotalCount;
          this.footerTotal = res.FooterTotal;
        });
    });
  }

  // ---------------- Lazy Load ----------------
  onReportLazyLoad(event: any) {
    const { first, rows } = event;
    const pageIndex = Math.floor(first / rows) + 1;

    const queryBody = {
      ...this.queryForm.value,
      pageSize: rows,
      pageIndex: pageIndex,
      SortBy: [{ field: 'USR_Level', order: 1 }],
    };
    this.lastQueryForm = queryBody;
    this.loading = true;

    this.tls42010Service
      .queryTLS42010M(queryBody)
      .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
      .subscribe({
        next: (res) => {
          if (res?.Data) {
            this.data = [...this.data, ...res.Data];
            this.totalRecords = res.TotalCount;
          }
          this.loading = false;
        },
      });
  }
  // ---------------- 刪除 ----------------
  onDelete(selectedRows: any[]): void {
    if (!selectedRows || selectedRows.length === 0) {
      this.messageService.warnBubble('請選擇要刪除的資料');
      return;
    }
    const idList = selectedRows
      .map((item) => item.id)
      .filter((id) => id !== undefined && id !== null);

    if (idList.length === 0) {
      this.messageService.warnBubble('選取的資料沒有有效的 ID');
      return;
    }
    const payload = { idList };
    this.loading = true;
    this.tls42010Service
      .deleteTLS42010(payload)
      .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.messageService.successBubble('刪除成功');
            this.onSubmit(this.queryForm);
          } else {
            this.messageService.errorBubble(`刪除失敗：${res.Message || '未知錯誤'}`);
          }
        },

      });
  }

}
