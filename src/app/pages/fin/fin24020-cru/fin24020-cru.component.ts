import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin24020Service } from '@service/api/fin/fin24020.service';
import { DropDownListService, IAPS3001Item } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownTableComponent } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { Column } from '@shared/componentkit/table/table.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-fin24020-cru',
  templateUrl: './fin24020-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    InputNumberComponent,
    CalendarComponent,
    DropdownTableComponent,
    InputTextComponent,
  ]
})
export class FIN24020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.group({
    ACP_No: ['', Validators.required],        // string
    VEN_No: ['', Validators.required],        // string
    VEN_Name: ['', Validators.required],      // string
    ACP_Amt: [0, Validators.required],        // number
    ACP_Date: [null as Date | null, Validators.required], // Date | null

    ACP_ReserveAmt: [0, Validators.required],
    ACP_YYYYMM: ['', Validators.required],
    acp_termno: [0, Validators.required],

    RET_Date: [null as Date | null, Validators.required],
    RET_Amt: [0, Validators.required],

    STATUS: ['', Validators.required],
    Remark: [''],
    sam_termno: [0, Validators.required],
    sam: [0, Validators.required],
  });

  // APS3001 應付ID 下拉查詢相關
  dialogQueryForm = this.formBuilder.group({
    ACP_No: [''],
  });
  apsDialogLoading = false;
  apsRawData: IAPS3001Item[] = [];
  apsDialogData: IAPS3001Item[] = [];
  apsSuggestions: IAPS3001Item[] = [];
  apsFieldsConfig = [
    { field: 'ACP_No', header: '應付ID', mainDataField: true },
  ];
  apsDialogColumns: Column[] = [
    { field: 'ACP_No', header: '應付帳款編號' },
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠客名稱' },
    { field: 'ACP_Amt', header: '應付金額' },
    { field: 'ACP_Date', header: '立帳日期' },
  ];

  constructor(
    private readonly datePipe: DatePipe,
    public readonly fin24020Service: Fin24020Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN24020', this.dataForm);
    this.loadAPS3001List();
  }



  onSubmit(frm: FormGroup) {

    this.handleSubmit(frm, () => {
      // 轉換日期格式為 yyyy-MM-dd
      const rawAcpDate = frm.get('ACP_Date')?.value;
      let acpDate: string | null = null;
      if (rawAcpDate) {
        const d = new Date(rawAcpDate);
        acpDate = !isNaN(d.getTime())
          ? this.datePipe.transform(d, 'yyyy-MM-dd') ?? null
          : this.datePipe.transform(rawAcpDate, 'yyyy-MM-dd') ?? null;
      }

      const rawRetDate = frm.get('RET_Date')?.value;
      let retDate: string | null = null;
      if (rawRetDate) {
        const d = new Date(rawRetDate);
        retDate = !isNaN(d.getTime())
          ? this.datePipe.transform(d, 'yyyy-MM-dd') ?? null
          : this.datePipe.transform(rawRetDate, 'yyyy-MM-dd') ?? null;
      }

      const body: any = {
        ACP_No: frm.value.ACP_No ?? '',
        VEN_No: frm.value.VEN_No ?? '',
        VEN_Name: frm.value.VEN_Name ?? '',
        ACP_Amt: frm.value.ACP_Amt ?? 0,
        ACP_Date: acpDate,
        ACP_ReserveAmt: frm.value.ACP_ReserveAmt ?? 0,
        Items: [
          {
            ACP_No: frm.value.ACP_No ?? '',
            ACP_YYYYMM: frm.value.ACP_YYYYMM ?? '',
            acp_termno: frm.value.acp_termno ?? 0,
            RET_Date: retDate,
            RET_Amt: frm.value.RET_Amt ?? 0,
            STATUS: frm.value.STATUS ?? '',
            Remark: frm.value.Remark ?? ''
          }
        ]
      };

      const request$ = this.isFormCreateable
        ? this.fin24020Service.createFIN24020(body)
        : this.fin24020Service.updateFIN24020(body);

      this.loading = true;
      request$
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(res => {
          this.messageService.successBubble(res.Message);
          if (this.isFormCreateable) {
            this.dataForm.reset();
          } else {
            this.onCancel();
          }
        });
    });

  }

  // 讀取 APS3001 應付ID 下拉資料
  private loadAPS3001List(): void {
    this.apsDialogLoading = true;
    this.dropDownListService
      .queryAPS3001_DropDownList()
      .pipe(untilDestroyed(this), finalize(() => (this.apsDialogLoading = false)))
      .subscribe(res => {
        const data = res.Data ?? [];
        this.apsRawData = data;
        this.apsDialogData = data;
        this.apsSuggestions = data;
      });
  }

  // 自動完成輸入變更（依 ACP_No 過濾）
  onApsInputChange(event: Record<string, string>): void {
    const keyword = (event?.['ACP_No'] || '').trim();
    if (!keyword) {
      this.apsDialogData = this.apsRawData;
      this.apsSuggestions = this.apsRawData;
      return;
    }
    const filtered = this.apsRawData.filter(item => item.ACP_No?.includes(keyword));
    this.apsDialogData = filtered;
    this.apsSuggestions = filtered;
  }

  // dialogQueryForm 變更（依 ACP_No 過濾）
  onDialogQueryFormValueChanged(value: Record<string, string>): void {
    const keyword = (value?.['ACP_No'] || '').trim();
    if (!keyword) {
      this.apsDialogData = this.apsRawData;
      this.apsSuggestions = this.apsRawData;
      return;
    }
    const filtered = this.apsRawData.filter(item => item.ACP_No?.includes(keyword));
    this.apsDialogData = filtered;
    this.apsSuggestions = filtered;
  }

  // // 監聽主表單 ACP_No 變化，帶入其他欄位
  private fillFormFromApsItem(item: IAPS3001Item): void {
    this.dataForm.patchValue({
      ACP_No: item.ACP_No ?? '',
      VEN_No: item.VEN_No ?? '',
      VEN_Name: item.VEN_Name ?? '',
      ACP_Amt: item.ACP_Amt ?? 0,
      ACP_Date: item.ACP_Date
        ? new Date(item.ACP_Date + 'T00:00:00')
        : null,
    });
  }


  // 選取一筆 APS3001 應付資料後帶回表單
  onApsSelect(item: IAPS3001Item): void {
    this.fillFormFromApsItem(item);
  }
}
