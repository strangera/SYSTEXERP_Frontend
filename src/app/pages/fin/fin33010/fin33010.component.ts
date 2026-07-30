
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Fin33010Service } from '@service/api/fin/fin33010.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableComponent } from '@others/component/table/table.component';
import { createPaginationConfig } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
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
  private isAutoRestore = false;
  // dialog for selecting RCV_No
  rcvDialogVisible = false;
  dialogQueryForm = this.formBuilder.nonNullable.group({
    RCV_No: [''],
    ...createPaginationConfig([{ field: 'RCV_No', order: 1 }]), // 分頁和排序參數
  });
  // 增加排序狀態
  currentSortField = 'RCV_No'; // 預設排序欄位
  currentSortOrder = 1;       // 1 為順排, -1 為反排

  dialogData: any[] = [];
  dialogColumns: any[] = [
    { field: 'RCV_No', header: '收款單號' },
    { field: 'RCV_Date', header: '收款日期' },
    { field: 'Remark', header: '備註' }
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
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    const prevRoute = this.router.lastSuccessfulNavigation?.extras.state?.['fromRoute'] ?? '';
    this.isAutoRestore = prevRoute.toLowerCase().includes('fin33010cru');
    this.initializePage('FIN33010', '/FIN/FIN33010CRU', this.queryForm, (frm) => this.onSubmit(frm));
  }

  openRcvDialog(): void {
    this.rcvDialogVisible = true;
    this.onQueryRcvNo();
  }

  onQueryRcvNo(): void {
    // 1. 取得表單原始值
    const formValue = this.dialogQueryForm.getRawValue();

    const params = {
      MID: 0,
      STO_No: this.authService.getUserInfo()?.SYS_StoreNo || '',
      ...formValue,
    };

    console.log("dialog request", params)

    this.dialogLoading = true;
    this.fin33010Service.queryFIN33010RCVNODropDown(params).subscribe({
      next: (res: any) => {
        if (res.Status === '0000' || res.Status === '200') {
          const queryList: { RCV_No: string; RCV_Date: string; Remark: string }[] = res.Data || [];
          this.dialogData = queryList.map((item) => ({
            RCV_No: item.RCV_No,
            RCV_Date: item.RCV_Date,
            Remark: item.Remark
          }));
          this.dialogTotalRecords = queryList.length;
          this.queryStateService.setQueryState(this.ProgNo, params);
        } else {
          this.dialogData = [];
          this.dialogTotalRecords = 0;
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
      this.queryForm.controls.RCV_No.setValue(sel.RCV_No);
      if (sel.RCV_Date) {
        this.queryForm.controls.VouDate.setValue(new Date(sel.RCV_Date));
      }
      this.rcvDialogVisible = false;
    }
  }

  override onDetail(data: any, queryConditions?: any) {
    this.navigateWithState(CRUDStatus.Read, data, queryConditions);
  }

  onSubmit(frm: FormGroup): void {
    const skipNavigate = this.isAutoRestore;
    this.isAutoRestore = false;
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

            if (skipNavigate) { return; }
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
