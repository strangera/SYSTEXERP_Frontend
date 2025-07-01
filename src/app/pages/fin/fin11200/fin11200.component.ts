import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { finalize } from 'rxjs';
import { Fin11200Service } from '../../../service/api/fin/fin11200.service';
import { columns, monthOptions, Pos1018 } from './fin11200.model';
import { AddButton, Column } from '../../../shared/componentkit/table/table.model';
import { ECRNoService } from '../../../service/basic/ECRNo.service';

@Component({
  selector: 'app-fin11200',
  templateUrl: './fin11200.component.html',
})

//FIN11100電子發票配號作業
export class FIN11200Component extends BasicQueryPageComponent<Pos1018> implements OnInit {
  queryForm = this.formBuilder.group({
    GUI_YY: [null, [Validators.required]], // 發票年月
    GUI_MM: [null, [Validators.required]], // 發票年月
    ECR_No: [null, [Validators.required]], // 收銀機編號
  });
  totalRecords = 0;
  monthOptions = monthOptions;
  POS_NOSOptions: { value: string; label: string; }[] = [];
  data: Pos1018[] = [];
  selectedRows: Pos1018[] = [];
  columns: Column[] = columns;
  addButton: AddButton[] = [{
    label: '停用', icon: 'pi pi-ban text-red-500', action: (rowData: Pos1018) => { this.onStop(rowData); },
  }]
  disabledMonthDates: Date[] = [];

  constructor(
    private fin11200Service: Fin11200Service,
    private eCRNoService: ECRNoService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN11200', '/FIN/FIN11200cru', this.queryForm, (form) => this.onSubmit(form));
    this.eCRNoService.getECRNo().subscribe(data => this.POS_NOSOptions = data.map((item: { value: string; label: string; }) => ({ ...item, label: `${item.value} - ${item.label}` })));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        GUI_YYMM: this.convertDateToYYYYMM(frm),
        ECR_NoList: frm.get('ECR_No')?.value
      }
      console.log(body);
      this.fin11200Service.queryFIN11200(body).pipe(finalize(() => this.loading = false)).subscribe((response) => {
        this.data = response.Data.map((item: Pos1018) => ({
          ...item,
          guiYymm: this.convertYYYYMMToDate(item.GUI_YYMM)
        }));
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  private convertDateToYYYYMM(frm: FormGroup): string {
    const yyDate: Date = frm.get('GUI_YY')?.value;
    const mmRaw = frm.get('GUI_MM')?.value;
    const year = yyDate instanceof Date ? yyDate.getFullYear().toString() : '';
    const monthNum = Number(mmRaw);
    const month = !isNaN(monthNum) ? monthNum.toString().padStart(2, '0') : '';
    return year + month;
  }

  // 將 "YYYYMM" 轉為 Date 物件
  private convertYYYYMMToDate(yyyymm: string): Date | null {
    if (!/^\d{6}$/.test(yyyymm)) return null;
    const year = Number(yyyymm.substring(0, 4));
    const month = Number(yyyymm.substring(4, 6)) - 1; // JS 月份從 0 開始
    return new Date(year, month, 1);
  }
  onStop(rowData: Pos1018) {
    const params = {
      ClosedDetail: {
        ID: rowData.ID,
        STO_No: rowData.STO_No,
        GUI_YYMM: rowData.GUI_YYMM,
        SER_NOS: rowData.SER_NOS
      }
    }
    this.fin11200Service.execProcClosed(params).pipe(finalize(() => this.loading = false)).subscribe((response) => {
      if (response.Status === "0000") {
        this.messageService.successBubble(response.Message);
        this.onSubmit(this.queryForm);
      } else {
        this.messageService.errorBubble(response.Message);
      }
    });
  }

  onUpload() {
    const params = {
      ExportDetails: this.selectedRows.map((item) => ({
        ID: item.ID,
        STO_No: item.STO_No,
        GUI_YYMM: item.GUI_YYMM,
        SER_NOS: item.SER_NOS
      }))
    }
    this.fin11200Service.execProcExport(params).pipe(finalize(() => this.loading = false)).subscribe((response) => {
      if (response.Status === "0000") {
        this.messageService.successBubble(response.Message);
        this.onSubmit(this.queryForm);
      }
    });
  }
}
