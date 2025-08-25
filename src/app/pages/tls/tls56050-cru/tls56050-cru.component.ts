import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Column, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { Tls56050Service, ITLS56050Request, ITLS56050Detail, ITLS56050Response } from '@service/api/tls/tls56050.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-tls56050-cru',
  templateUrl: './tls56050-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    NgIf,
    TranslateModule,
    TableComponent,
    InputTextareaComponent,
  ],
  providers: [MessageService]
})
export class TLS56050CRUComponent extends BasicCruPageComponent<ITLS56050Response> implements OnInit {
  // 主檔表單定義
  dataForm = this.formBuilder.nonNullable.group({
    MVM_No: [{ value: '', disabled: true }],
    LOGO_No: [{ value: '', disabled: true }],
    OUT_HOS_No: [{ value: '', disabled: true }],
    IN_HOS_No: [{ value: '', disabled: true }],
    OUTGODS_TotQty: [{ value: 0, disabled: true }],
    OUTGODS_TotBuyNet: [{ value: 0, disabled: true }],
    OUTGODS_TotBuyTax: [{ value: 0, disabled: true }],
    OUTGODS_TotBuyAmt: [{ value: 0, disabled: true }],
    OUTGODS_TotSaleAmt: [{ value: 0, disabled: true }],
    APPLY_Date: [{ value: null as Date | null, disabled: true }],
    APPLY_USR_No: [{ value: '', disabled: true }],
    APRV_Date: [{ value: null as Date | null, disabled: true }],
    APRV_USR_No: [{ value: '', disabled: true }],
    OUTGODS_Date: [{ value: null as Date | null, disabled: true }],
    OUTGODS_USR_No: [{ value: '', disabled: true }],
    MVM_Remark: ['', [Validators.maxLength(200)]],
  });

  data: ITLS56050Detail[] = [];
  columns: Column[] = [
    { field: 'MVD_SeqNo', header: '項次', visible: true },
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'MVD_BuyPrc', header: '進單價', visible: true },
    { field: 'NowHaveQty', header: '目前庫存', visible: true },
    { field: 'APPLY_Qty', header: '調撥申請數量', visible: true },
    { field: 'OUTGODS_QTY', header: '發貨量', visible: true, type: 'inputNumber' },
    { field: 'OUTGODS_BuyNet', header: '發貨未稅進價小計', visible: true },
    { field: 'MVD_Remark', header: '單項說明', visible: true, type: 'input' },
  ];

  brandOptions: { label: string; value: string }[] = [];
  warehouseOptions: { label: string; value: string }[] = [];
  userOptions: { label: string; value: string }[] = [];

  constructor(
    private readonly tls56050Service: Tls56050Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56050', this.dataForm);
    this.loadDropdownOptions();
    this.loadData();
  }

  loadData(): void {
    const mvmNo = this.rowdata?.MVM_No;
    if (mvmNo) {
      this.loading = true;
      this.tls56050Service.getTLS56050Info(mvmNo).pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this)
      ).subscribe(response => {
        const masterData = response.Data.TLS56050Data;
        const detailsData = response.Data.detail_TLS56050;
        this.dataForm.patchValue({
          MVM_No: masterData.MVM_No,
          LOGO_No: masterData.LOGO_No,
          OUT_HOS_No: masterData.OUT_HOS_No,
          IN_HOS_No: masterData.IN_HOS_No,
          APPLY_Date: masterData.APPLY_Date ? new Date(masterData.APPLY_Date) : null,
          APPLY_USR_No: masterData.APPLY_USR_No,
          APRV_Date: masterData.APRV_Date ? new Date(masterData.APRV_Date) : null,
          APRV_USR_No: masterData.APRV_USR_No,
          OUTGODS_Date: masterData.OUTGODS_Date ? new Date(masterData.OUTGODS_Date) : null,
          OUTGODS_USR_No: masterData.OUTGODS_USR_No,
          MVM_Remark: masterData.MVM_Remark,
          // 這些欄位是後端回傳的總計，直接 patch
          OUTGODS_TotQty: masterData.OUTGODS_TotQty,
          OUTGODS_TotBuyNet: masterData.OUTGODS_TotBuyNet,
          OUTGODS_TotBuyTax: masterData.OUTGODS_TotBuyTax,
          OUTGODS_TotBuyAmt: masterData.OUTGODS_TotBuyAmt,
          OUTGODS_TotSaleAmt: masterData.OUTGODS_TotSaleAmt,
        });

        this.data = detailsData.map(item => ({
          ...item,
          OUTGODS_QTY: item.APPLY_Qty, // 發貨量預設等於申請量
          OUTGODS_BuyNet: item.APPLY_BuyAmt
        }));
        this.calculateTotals();
      });
    }
  }

  loadDropdownOptions(): void {
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(options => {
      this.warehouseOptions = options.Data.map(item => ({ label: item.Name, value: item.No }));
    });
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.brandOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.userOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
  }

  onRowEditSave(event: RowEditSaveEvent): void {
    const editedItem = event.data;
    // 驗證發貨量不能大於或小於申請量
    if (editedItem.OUTGODS_QTY !== editedItem.APPLY_Qty) {
      this.messageService.errorBubble('發貨量必須與調撥申請量一致！');
      // 恢復原始值
      const originalItem = this.data.find(item => item.MVD_SeqNo === editedItem.MVD_SeqNo);
      if (originalItem) {
        Object.assign(editedItem, originalItem);
      }
      return;
    }

    // 重新計算發貨相關小計
    const buyNet = editedItem.MVD_BuyPrc * editedItem.OUTGODS_QTY;
    editedItem.OUTGODS_BuyNet = buyNet;

    if (editedItem.PLU_StockTaxType === '1') { // 應稅
      editedItem.OUTGODS_BuyTax = Math.floor(buyNet * 0.05);
    } else { // 免稅
      editedItem.OUTGODS_BuyTax = 0;
    }
    editedItem.OUTGODS_BuyAmt = editedItem.OUTGODS_BuyNet + editedItem.OUTGODS_BuyTax;
    editedItem.OUTGODS_SaleAmt = editedItem.MVD_SalePrc * editedItem.OUTGODS_QTY;

    // 更新 this.data 中的項目
    const index = this.data.findIndex(item => item.MVD_SeqNo === editedItem.MVD_SeqNo);
    if (index !== -1) {
      this.data[index] = editedItem;
    }

    this.calculateTotals();
  }

  calculateTotals(): void {
    // 定義一個輔助函式，用於安全地獲取值
    const getValue = (item: any, outgodsField: string, applyField: string) => {
      // 檢查 OUTGODS 欄位是否有值 (非 null 或 undefined)
      const outgodsValue = item[outgodsField];
      // 如果 OUTGODS 欄位為 null，則使用 APPLY 欄位的值，否則使用 OUTGODS 欄位的值
      return (outgodsValue !== null && outgodsValue !== undefined) ? outgodsValue : (item[applyField] || 0);
    };

    // 根據新的邏輯計算總和
    const totalQty = this.data.reduce((sum, item) => sum + getValue(item, 'OUTGODS_QTY', 'APPLY_Qty'), 0);
    const totalBuyNet = this.data.reduce((sum, item) => sum + getValue(item, 'OUTGODS_BuyNet', 'APPLY_BuyNet'), 0);
    const totalBuyTax = this.data.reduce((sum, item) => sum + getValue(item, 'OUTGODS_BuyTax', 'APPLY_BuyTax'), 0);
    const totalBuyAmt = this.data.reduce((sum, item) => sum + getValue(item, 'OUTGODS_BuyAmt', 'APPLY_BuyAmt'), 0);
    const totalSaleAmt = this.data.reduce((sum, item) => sum + getValue(item, 'OUTGODS_SaleAmt', 'APPLY_SaleAmt'), 0);

    // 更新表單值
    this.dataForm.patchValue({
      OUTGODS_TotQty: totalQty,
      OUTGODS_TotBuyNet: totalBuyNet,
      OUTGODS_TotBuyTax: totalBuyTax,
      OUTGODS_TotBuyAmt: totalBuyAmt,
      OUTGODS_TotSaleAmt: totalSaleAmt,
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const rawFormValue = frm.getRawValue();
      const payload: ITLS56050Request = {
        id: this.rowdata?.id,
        MVM_No: rawFormValue.MVM_No,
        OUTGODS_Date: rawFormValue.OUTGODS_Date,
        OUTGODS_USR_No: rawFormValue.OUTGODS_USR_No,
        OUTGODS_USR_Name: this.userOptions.find(u => u.value === rawFormValue.OUTGODS_USR_No)?.label?.split(' - ')[1] || '',
        OUTGODS_TotQty: rawFormValue.OUTGODS_TotQty,
        OUTGODS_TotBuyNet: rawFormValue.OUTGODS_TotBuyNet,
        OUTGODS_TotBuyTax: rawFormValue.OUTGODS_TotBuyTax,
        OUTGODS_TotBuyAmt: rawFormValue.OUTGODS_TotBuyAmt,
        OUTGODS_TotSaleAmt: rawFormValue.OUTGODS_TotSaleAmt,
        MVM_Remark: rawFormValue.MVM_Remark,
        Details: this.data.map(item => ({
          ...item,
          id: item.id, // 修正：將 item.id 包含進去
          MVM_No: item.MVM_No, // 修正：將 item.MVM_No 包含進去
          OUTGODS_Qty: item.OUTGODS_QTY,
          OUTGODS_BuyNet: item.APPLY_BuyNet,
          OUTGODS_BuyTax: item.APPLY_BuyTax,
          OUTGODS_BuyAmt: item.APPLY_BuyAmt,
          OUTGODS_SaleAmt: item.APPLY_SaleAmt,
          MVD_Remark: item.MVD_Remark,
        }))
      };
      this.tls56050Service.updateTLS56050(payload).pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this)
      ).subscribe(response => {
        this.messageService.successBubble(response.Message);
      });
    });
  }
  onConfirm(frm: FormGroup): void {
    const isQtyValid = this.data.every(item => item.OUTGODS_QTY === item.APPLY_Qty);
    if (!isQtyValid) {
      this.messageService.errorBubble('所有商品的發貨量必須與調撥申請量一致！');
      return;
    }
    const body = {
      DetailList: [
        {
          MVM_No: frm.getRawValue().MVM_No,
          MVM_Status: '3',
        }
      ]
    }
    this.loading = true;
    this.tls56050Service.updateStatusTLS56050(body).pipe(
      finalize(() => this.loading = false),
      untilDestroyed(this)
    ).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onCancel();
    });
  }
}
