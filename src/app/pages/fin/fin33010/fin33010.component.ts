
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Fin33010Service } from '@service/api/fin/fin33010.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
@Component({
  selector: 'app-fin33010',
  templateUrl: './fin33010.component.html',
  standalone: true,
  imports: [CalendarComponent
    , ButtonModule, InputTextComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, ButtonComponent, TranslateModule, DialogComponent, TableComponent]
})

export class FIN33010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    RCV_No: ['', [Validators.required, Validators.maxLength(15)]],
    VouDate: [new Date() as Date | null, [Validators.required]],
    ...createPaginationConfig([{ field: 'AccNo', order: 1 }]),
  });
  selectedItems: any[] = [];
  totalRecords = 0;
  // dialog for selecting RCV_No
  rcvDialogVisible = false;
  dialogQueryForm = this.formBuilder.nonNullable.group({ RCV_No: [''] });
  dialogData: any[] = [];
  dialogColumns: any[] = [
    { field: 'No', header: '收款單號' },
    { field: 'Name', header: '收款日期' },
    { field: 'Name', header: '備註' }
  ];
  dialogLoading = false;
  selectedItemsDialog: any[] = [];
  dialogTotalRecords = 0;
  data: any[] = [];
  selectAll = false;
  get selectedCount(): number {
    return this.selectedItems?.length ?? 0;
  }

  constructor(
    private fin33010Service: Fin33010Service,
    private dropDownListService: DropDownListService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN33010', '/FIN/FIN33010CRU', this.queryForm, (frm) => this.onSubmit(frm));

  }

  onQueryRcvNo(): void {
    const params = {
      MID: 0,
      STO_No: '10'
    };
    this.dialogLoading = true;
    this.dropDownListService.queryARS4001RCVNO_DropDownList(params).subscribe({
      next: (res: any) => {
        if (res.Status === '0000' || res.Status === '200') {
          // 將後端回傳可能為字串陣列或物件結構轉成 table 需要的 { No, Name } 陣列
          const raw = res.Data || {};
          let list: any[] = [];
          if (Array.isArray(raw)) {
            list = raw.map((d: any) => (typeof d === 'string' ? { No: d, Name: d } : { No: d.No || d, Name: d.Name || d }));
          } else if (Array.isArray(raw.RCV_No)) {
            list = raw.RCV_No.map((d: any) => (typeof d === 'string' ? { No: d, Name: d } : { No: d.No || d, Name: d.Name || d }));
          } else if (Array.isArray(raw.data)) {
            list = raw.data.map((d: any) => (typeof d === 'string' ? { No: d, Name: d } : { No: d.No || d, Name: d.Name || d }));
          }
          this.dialogData = list;
          this.dialogTotalRecords = this.dialogData.length;
        } else {
          this.messageService?.errorBubble?.(res.Message || '查詢失敗');
        }
      },
      error: () => {
        this.dialogLoading = false;
      },
      complete: () => {
        this.dialogLoading = false;
      }
    });
  }

  onSelectRCVNo(): void {
    if (this.selectedItemsDialog && this.selectedItemsDialog.length) {
      const sel = this.selectedItemsDialog[0];
      this.queryForm.controls.RCV_No.setValue(sel.No);
      this.rcvDialogVisible = false;
    }
  }

  override onDetail(data: any, queryConditions?: any) {
    this.navigateWithState(CRUDStatus.Read, data, queryConditions);
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const v = frm.getRawValue();
      const payload = {
        PageSize: 0,
        PageIndex: 0,
        OrderBy: '',
        Offset: 0,
        SortBy: [{ field: 'AccNo', order: 1 }],
        RCV_No: v.RCV_No || '',
        VouDate: v.VouDate ? v.VouDate.toISOString() : ''
      };

      this.loading = true;
      this.messageService.blockUi();

      this.fin33010Service.queryFIN33010(payload).subscribe({
        next: (res: any) => {
          if (res.Status === '0000' || res.Status === '200') {
            const data = res.Data;
            const rawDetails = Array.isArray(data?.DetailItem) ? data.DetailItem : [];

            if (!rawDetails.length) {
              this.messageService?.warnBubble?.('查無資料');
              return;
            }
            // 後端欄位轉成 CRU 畫面及 TableEdit 使用的欄位命名
            const details = rawDetails.map((item: any) => ({
              SerNo: item.SerNo,
              dc: item.DC,
              AccNo: item.AccNo,
              AccCName: item.AccCName,
              Ven_No: item.Ven_No,
              NoteDesc: item.NoteDesc,
              D_Amt: item.D_Amt,
              C_Amt: item.C_Amt,
              Org_Id: item.Org_Id,
              PTA: item.PTA,
              // 若後續需要對象別編號，可共用 Ven_No
              VEN_No: item.Ven_No,
            }));

            const header = data;
            const queryConditions = {
              form: frm.getRawValue(),
              details,
              header,
            };

            // 直接進入 CRU 顯示欄位與明細表
            this.onDetail(header, queryConditions);
          } else {
            this.messageService?.errorBubble?.(res.Message || '查詢失敗');
          }
        },

        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }

}
