import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { finalize } from 'rxjs';
import { Fin11200Service } from '../../../service/api/fin/fin11200.service';
import { columns, monthOptions, Pos1018 } from './fin11200.model';
import { AddButton, convertDateToYYYYMM, Column, convertYYYYMMToDate } from '../../../shared/componentkit/table/table.model';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Button, ButtonDirective } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { NgStyle } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-fin11200',
  templateUrl: './fin11200.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    MultiSelectComponent,
    TableComponent,
    Button,
    TooltipModule,
    ButtonDirective,
    NgStyle,
    TranslateModule,
  ],
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
  addButton: AddButton[] = [
    {
      label: '停用',
      icon: 'pi pi-ban text-red-500',
      action: (rowData: Pos1018) => { this.onStop(rowData); },
      disabled: (rowData: Pos1018) => rowData.GUI_Status === '02' || rowData.GUI_Status === '03' || rowData.GUI_Status === '00',
    }
  ]
  disabledMonthDates: Date[] = [];

  constructor(
    private fin11200Service: Fin11200Service,
    private eCRNoService: ECRNoService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN11200', '/FIN/FIN11200cru', this.queryForm, (form) => this.onSubmit(form));
    this.eCRNoService.getECRNo().pipe(untilDestroyed(this)).subscribe(data => this.POS_NOSOptions = data.map((item: { value: string; label: string; }) => ({ ...item, label: `${item.value} - ${item.label}` })));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        GUI_YYMM: this.convertDateToYYYYMM2(frm),
        ECR_NoList: frm.get('ECR_No')?.value
      }
      console.log(body);
      this.fin11200Service.queryFIN11200(body).pipe(finalize(() => this.loading = false)).pipe(untilDestroyed(this)).subscribe((response) => {
        this.data = response.Data.map((item: Pos1018) => ({
          ...item,
          GUI_YYMM: convertYYYYMMToDate(item.GUI_YYMM)
        }));
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  private convertDateToYYYYMM2(frm: FormGroup): string {
    const yyDate: Date = frm.get('GUI_YY')?.value;
    const mmRaw = frm.get('GUI_MM')?.value;
    const year = yyDate instanceof Date ? yyDate.getFullYear().toString() : '';
    const monthNum = Number(mmRaw);
    const month = !isNaN(monthNum) ? monthNum.toString().padStart(2, '0') : '';
    return year + month;
  }
  manageLoading = false;
  onStop(rowData: Pos1018) {
    const params = {
      ClosedDetail: {
        ID: rowData.ID,
        STO_No: rowData.STO_No,
        GUI_YYMM: convertDateToYYYYMM(new Date(rowData.GUI_YYMM)),
        SER_NOS: rowData.SER_NOS,
        ECR_No: rowData.ECR_No
      }
    }
    this.manageLoading = true;
    this.fin11200Service.execProcClosed(params).pipe(finalize(() => this.manageLoading = false)).pipe(untilDestroyed(this)).subscribe((response) => {
      if (response.Status === "0000") {
        this.messageService.successBubble(response.Message);
        this.onSubmit(this.queryForm);
      } else {
        this.messageService.errorBubble(response.Message);
      }
    });
  }
  btnLoading = false;
  onUpload() {
    const params = {
      ExportDetails: this.selectedRows.map((item) => ({
        ID: item.ID,
        STO_No: item.STO_No,
        GUI_YYMM: convertDateToYYYYMM(new Date(item.GUI_YYMM)),
        SER_NOS: item.SER_NOS,
        ECR_No: item.ECR_No
      }))
    }
    this.btnLoading = true;
    this.fin11200Service.execProcExport(params).pipe(finalize(() => this.btnLoading = false), untilDestroyed(this)).subscribe((response) => {
      this.messageService.successBubble(response.Message);
      this.selectedRows = [];
      this.onSubmit(this.queryForm);
    });
  }
}
