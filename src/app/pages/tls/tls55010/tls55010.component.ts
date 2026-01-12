import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CheckTls55010Data, Tls55010DateRequest, Tls55010Service } from '@service/api/tls/tls55010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from "@shared/componentkit/input-text/input-text.component";
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-tls55010',
  templateUrl: './tls55010.component.html',
  standalone: true,
  imports: [DropdownComponent, PanelModule, TableModule, TableComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule, InputTextComponent]
})
export class TLS55010Component extends BasicQueryPageComponent<CheckTls55010Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    TXN_Date: [null as Date | null, Validators.required],
  });
  lastDate?: Tls55010DateRequest;
  data: any = [];
  columns: Column[] = [
    { field: 'check_content', header: '檢查內容' },
    { field: 'isPassed', header: '是否通過' },
  ];
  cls_date?: string;
  expansionColumns: Column[] = [
    { field: 'cls_date', header: '交易日期' },
    { field: 'check_result', header: '結果說明' },
  ]
  constructor(
    private readonly tls55010Service: Tls55010Service,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55010', '/tls/tls55010cru');
    this.tls55010Service.getTLS55010Date().pipe(untilDestroyed(this)).subscribe((res) => {
      this.cls_date = res.Data.CLS_DATE;
      const closeDate = new Date(res.Data.CLS_DATE);
      closeDate.setDate(closeDate.getDate() + 1);
      this.queryForm.patchValue({ TXN_Date: closeDate });
    });
    this.data = getSYS1000Options('IMSCLOSE').map((item: { value: string; label: string }) => ({
      ...item, check_content: item.label, details: []
    }));
  }
  onQuery(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd') || '',
      }
      this.columns = this.columns.map(c => c.field === 'isPassed' ? {
        ...c,
        htmlFormat: true,
        format: () => '<i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>'
      } : c);
      this.messageService.infoBubble('日結檢查中,請稍候...');
      this.tls55010Service.checkTLS55010(body).pipe(untilDestroyed(this), finalize(() => {
        this.loading = false
        this.columns = this.columns.map(c => c.field === 'isPassed' ? {
          ...c, htmlFormat: false, format: undefined
        } : c);
      })).subscribe((res) => {
        this.messageService.successBubble(res.Message);
        this.isConfirmDate = false;
        this.data.forEach((item: any) => {
          item.isPassed = 'OK';
          item.details = [];
        });
        const checkItemMap = new Map<string, any>();
        this.data.forEach((item: any) => {
          checkItemMap.set(item.value, item);
        });
        res.Data.forEach((error: any) => {
          const stepCode = String(error.step_num);
          const targetItem = checkItemMap.get(stepCode);
          if (targetItem) {
            targetItem.isPassed = '有問題';
            const newDetail = {
              cls_date: error.cls_date,
              check_result: error.check_result,
              mid: error.mid,
              master_key: error.master_key
            };
            targetItem.details.push(newDetail);
          }
        });
      });
    });
  }
  insertLoading = false;
  // 宣告是否確定日期變數
  isConfirmDate = false;
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.insertLoading = true;
      const body = {
        TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd') || '',
      }
      this.messageService.infoBubble('日結中,請稍候...');
      this.tls55010Service.insertTLS55010(body).pipe(untilDestroyed(this), finalize(() => this.insertLoading = false)).subscribe((res) => {
        this.messageService.successBubble(res.Message);
        this.isConfirmDate = true;
        this.showReverseBtn = true;
        this.lastDate = body.TXN_Date as unknown as Tls55010DateRequest;
        this.tls55010Service.getTLS55010Date().pipe(untilDestroyed(this)).subscribe((res) => {
          this.cls_date = res.Data.CLS_DATE;
        });
        this.dataForm.patchValue(res.Data.Data._gls6001);
        this.data2 = res.Data.Data._gls6002s.map((item: any) => ({
          ...item,
          DAccAmt: item.AccDC === 'D' ? item.AccAmt : 0,
          CAccAmt: item.AccDC === 'C' ? item.AccAmt : 0,
        }));
      });
    });
  }
  queryLoading = false;
  onQueryVou(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.queryLoading = true;
      const body = {
        TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd') || '',
      }
      this.tls55010Service.queryTLS55010(body).pipe(untilDestroyed(this), finalize(() => this.queryLoading = false)).subscribe((res) => {
        this.messageService.successBubble(res.Message);
        this.lastDate = body.TXN_Date as unknown as Tls55010DateRequest;
        this.isConfirmDate = true;
        this.showReverseBtn = true;
        this.dataForm.patchValue(res.Data.Data._gls6001);
        this.data2 = res.Data.Data._gls6002s.map((item: any) => ({
          ...item,
          DAccAmt: item.AccDC === 'D' ? item.AccAmt : 0,
          CAccAmt: item.AccDC === 'C' ? item.AccAmt : 0,
        }));
      });
    });
  }
  dataForm = this.formBuilder.nonNullable.group({
    VouNo: [{ value: null as string | null, disabled: true }],
    VouType: [{ value: null as string | null, disabled: true }],
    VouDate: [{ value: null as string | null, disabled: true }],
    SrcSheetType: [{ value: null as string | null, disabled: true }],
    SrcSheetNo: [{ value: null as string | null, disabled: true }],
    PostFlag: [{ value: null as string | null, disabled: true }],
    INV_YN: [{ value: null as string | null, disabled: true }],
    Remark: [{ value: null as string | null, disabled: true }],
    CRT_Date: [{ value: null as string | null, disabled: true }],
    CRT_USR_No: [{ value: null as string | null, disabled: true }],
    CRT_USR_Name: [{ value: null as string | null, disabled: true }],
    UPD_Date: [{ value: null as string | null, disabled: true }],
    UPD_USR_No: [{ value: null as string | null, disabled: true }],
    UPD_USR_Name: [{ value: null as string | null, disabled: true }],
  });
  VouTypeOptions = getSYS1000Options('VouType');
  PostFlagOptions = getSYS1000Options('PostFlag');
  columns2: Column[] = [
    { field: 'SerNo', header: '序號', style: 'text-left' },
    { field: 'AccNo', header: '科目代號', style: 'text-left' },
    { field: 'ACCCNAME', header: '科目名稱', style: 'text-left' },
    { field: 'NoteDesc', header: '摘要', style: 'text-left' },
    { field: 'DAccAmt', header: '借方金額', format: formatAmount, isTotal: true, style: 'text-right' },
    { field: 'CAccAmt', header: '貸方金額', format: formatAmount, isTotal: true, style: 'text-right' },
    { field: 'ORG_ID', header: '組織編號', style: 'text-left' },
    { field: 'VEN_NO', header: '廠商編號', style: 'text-left' },
    { field: 'VEN_NAME', header: '廠商名稱', style: 'text-left' },
    { field: 'ProjectNo', header: '活動代號', style: 'text-left' },
    { field: 'PTA', header: '立沖代號' },
  ]
  data2: any[] = []
  reverseLoading = false;
  showReverseBtn = false;
  // 反日節方法
  onReverse(frm: FormGroup) {
    if (!this.lastDate) {
      return;
    }
    this.reverseLoading = true;
    this.messageService.infoBubble('反日結中,請稍候...');
    this.tls55010Service.unLockTLS55010(this.lastDate).pipe(untilDestroyed(this), finalize(() => this.reverseLoading = false)).subscribe((res) => {
      this.messageService.successBubble(res.Message);
      this.showReverseBtn = false;
      this.dataForm.reset();
      this.data2 = [];
    });
  }
}
