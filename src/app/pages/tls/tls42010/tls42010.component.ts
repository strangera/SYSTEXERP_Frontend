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
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { finalize } from 'rxjs';
import { POS1004Master, Tls42010MQuery, Tls42010Service, USRLevelOption } from '../../../service/api/tls/tls42010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';

@Component({
  selector: 'app-tls42010',
  templateUrl: './tls42010.component.html',
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
export class TLS42010Component extends BasicQueryPageComponent<POS1004Master> implements OnInit {
  queryForm = this.formBuilder.group({
    USR_Level: [null, Validators.maxLength(6)],
    ECR_KBDesc: [null],
    pageSize: [500],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'USR_Level', order: 1 }]],
  });
  data: POS1004Master[] = [];
  totalRecords = 0;
  lastQueryForm: Tls42010MQuery | null = null;
  columns: ReportColumn[] = [
    { field: 'USR_Level', header: '鍵盤編號' },
    { field: 'ECR_KBType', header: '鍵盤型態' },
    { field: 'TSB_Name', header: '收銀畫面名稱' },
    { field: 'TSB_XCount', header: '按鍵欄數' },
    { field: 'TSB_YCount', header: '按鍵列數' },
    { field: 'TSB_Height', header: '按鍵高度' },
    { field: 'TSB_Width', header: '按鍵寬度' },
    { field: 'ECR_KBDesc', header: '鍵盤備註' },
  ];
  kbFuncOptions: USRLevelOption[] = [];
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    Source_USR_Level: ['', [Validators.required]],
    Target_USR_Level: [null, [Validators.maxLength(6), Validators.required]],
  });
  dialogSelectItem: any | null = null;
  dialogSelectTargetItem: any | null = null;

  constructor(
    public readonly tls42010Service: Tls42010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS42010', '/TLS/TLS42010cru', this.queryForm, (form) => this.onSubmit(form));
    this.tls42010Service.dropdownTLS42010().subscribe((res) => {
      this.kbFuncOptions = res.Data.map((item: USRLevelOption) => ({
        ...item,
        label: `${item.keyUSR_Level} / ${item.ECR_KBType} / ${item.ECR_KBDesc}`,
      }));
    });
  }
  // ---------------- Dialog 行為 ----------------
  onDialogChange(event: DropdownChangeEvent) {
    const selectedValue = event.value;
    const body = { USR_Level: selectedValue, pageSize: 10, pageIndex: 1 };
    this.tls42010Service.queryTLS42010M(body).subscribe((res) => {
      this.dialogSelectItem = res.Data?.[0] ?? null
    });
  }
  saveDialog(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      if (this.isValid) {
        this.messageService.warnBubble('來源與目標鍵盤編號不可相同');
        this.loading = false;
        return;
      }
      if (this.isValid) {
        this.messageService.warnBubble('來源與目標鍵盤編號不可相同');
        this.loading = false;
        return;
      };
      // 加入目標不能超過 6 碼的驗證
      if (typeof frm.value.Target_USR_Level !== 'string' || frm.value.Target_USR_Level.length > 6) {
        this.messageService.warnBubble('目標鍵盤編號不可超過 6 碼');
        this.loading = false;
        return;
      }
      const srcNo = frm.value.Source_USR_Level;
      const tgtNo = frm.value.Target_USR_Level;
      this.tls42010Service.queryTLS42010M({ USR_Level: srcNo, pageSize: 10, pageIndex: 1 }).subscribe((srcRes) => {
        const srcData = srcRes?.Data?.[0];
        if (!srcData) {
          this.loading = false;
          return;
        }
        this.tls42010Service.queryTLS42010_Detail({ USR_Level: [srcNo] }).pipe(finalize(() => (this.loading = false)), untilDestroyed(this)).subscribe((detailRes) => {
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
          this.tls42010Service.insertTLS42010M(body).pipe(finalize(() => (this.loading = false)), untilDestroyed(this)).subscribe((res) => {
            this.messageService.successBubble(res.Message);
            this.dialogVisible = false;
            this.onSubmit(this.queryForm);
          });
        });
      });
    });
  }

  // 判斷來源與目標相同，必須都有值再判斷
  get isValid(): boolean {
    const source = this.dialogQueryForm.value.Source_USR_Level;
    const target = this.dialogQueryForm.value.Target_USR_Level;
    if (!source || !target) {
      return false; // 其中一個沒有值，不進行相同判斷
    }
    return source === target; // 只有當兩者都有值且相同時才回傳 true
  }

  // ---------------- 查詢 ----------------
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.value;
      this.tls42010Service.queryTLS42010M(raw).pipe(finalize(() => (this.loading = false)), untilDestroyed(this)).subscribe((res) => {
        this.data = res.Data;
        this.lastQueryForm = raw;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  // ---------------- 刪除 ----------------
  onDelete(selectedRows: any[]): void {
    // 1. 防呆：檢查是否有選取資料
    if (!selectedRows || selectedRows.length === 0) {
      this.messageService.warnBubble('請至少選取一筆資料');
      return;
    }
    // 2. 依照後端規格，取出 USR_Level 作為識別鍵
    const idList: string[] = selectedRows.map(row => row.USR_Level);
    // 3. 呼叫確認視窗 (建議在刪除前先詢問)
    this.messageService.confirm({
      message: `確定要刪除選中的 ${idList.length} 筆鍵盤設定嗎？`,
      header: '刪除確認',
      accept: () => {
        this.loading = true;
        this.tls42010Service.deleteTLS42010(idList).pipe(finalize(() => (this.loading = false)), untilDestroyed(this)).subscribe((res) => {
          this.messageService.successBubble(res.Message || '刪除成功');
          this.onSubmit(this.queryForm);
        });
      }
    });
  }
}
