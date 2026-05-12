import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { fin13090Detail, Fin13090Service } from '@service/api/fin/fin13090.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { forkJoin } from 'rxjs';


//3.1.4.1  進貨發票建檔作業 CRU
@Component({
  selector: 'app-fin13090-cru',
  standalone: true,
  imports: [
    MenubarComponent,
    MultiSelectComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberComponent,
    DropdownComponent,
    CalendarComponent,
    NgIf,
    TableEditComponent,
    TranslateModule],
  templateUrl: './fin13090-cru.component.html'
})
export class FIN13090CRUComponent extends BasicCruPageComponent<fin13090Detail> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    VouNo: [null], // 傳票編號
    VouDate: [null], // 傳票日期
    PostFlag: [null], // 傳票狀態代碼
    TaxTotal: [null] // 進項稅額貸方
  });
  //---------下拉選單-------------------------------------------------------
  GUIType_Options: { value: string; label: string }[] = []; // 供應商編號 下拉選項 (ass12050: queryPOS2013_DropDownList)
  // ---------明細 表格-------------------------------------------------------
  orgDetailData: fin13090Detail[] = []; // 原始供應商備份
  detailData: fin13090Detail[] = [];
  detailColumn: EditColumn[] = []; //等下拉讀取完成後寫入定義
  defaultdetail = {
    'id': 0, // APS2002 主鍵 新增為0 
    'PUR_VoucherType': null, // 發票格式 (憑證類別 21~29)
    'PUR_GUINo': null, // 發票號碼
    'PUR_GUIDate': null, // 發票日期
    'PUR_RepYYYYMM': null, // 申報年月 (固定為雙數月)
    'PUR_VenUniform': null, // 廠商統一編號
    'PUR_DirectType': null, // 發票用途 (1=營業用 2=共同使用)
    'PUR_Amt': null, // 發票總金額（含稅）

    'PUR_TaxType': null, // 課稅別 (0=免稅 1=應稅 2=零稅)
    'PUR_Net': null, // 發票未稅金額
    'PUR_Tax': null  // 發票稅額
  };
  constructor(
    private fin13090Service: Fin13090Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN13090', this.dataForm);
    this.get13090Detail(this.dataForm.get('VouNo')?.value || null);
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {// 驗證單據明細
    // --------------------------
    //必須至少有一筆明細資料
    if (this.detailData.length < 1) {
      this.messageService.errorBubble('明細資料不可為空。');
      return;
    }
    for (let i = 0; i < this.detailData.length; i++) {
      const row = this.detailData[i];
      const result = this.validateDetail(row);
      if (!result.isValid) {
        this.messageService.unblockUi();
        this.messageService.errorBubble(`明細資料 第 ${i + 1} 筆錯誤: ${result.errorMessage}`);
        return;
      }
    }
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // console.log('提交的payload', payload);
            // this.ass14010Service.insertASS14010(payload).subscribe(() => {
            //   this.messageService.successBubble('新增成功');
            //   this.dataForm.reset();
            //   // 還原子表單
            //   this.supplierData = [];
            //   this.itemData = [];
            // });
            this.loading = false
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.loading = false;
            // this.ass14010Service.updateASS14010(payload).subscribe((res) => {
            //   if (res.Data.O_MSGTYPE === 'S') {
            //     this.messageService.successBubble('更新成功');
            //     this.onCancel();
            //   } else {
            //     this.messageService.errorBubble('更新失敗: ' + res.Data.O_MESSAGE || '更新失敗');
            //   }
            // });
            this.loading = false
          }
          break;
      }
    });
  }
  get13090Detail(VouNo: string | null) {
    if (VouNo) {
      this.fin13090Service
        .queryFIN13090Detail({ VouNo })
        .pipe(untilDestroyed(this))
        .subscribe(res => {
          console.log('明細資料', res);
          // 2. 程式碼存取時要加上索引
          if (res.Data) {
            const detailRow = res.Data.Supplier;
            this.detailData = Array.isArray(detailRow)
              ? [...detailRow]
              : (detailRow ? [detailRow] : []);

            // 深拷備份(切斷與原始資料物件的參考連結)
            this.orgDetailData = JSON.parse(JSON.stringify(this.detailData));
            console.log('明細資料', this.detailData);
          } else {
            // 如果整個 res.Data 都是空的，也要清空表格防止舊資料殘留
            this.detailData = [];
          }
        });

    }
  }

  loadOptions() {
    const quiOption$ = this.fin13090Service.getGUITypeDropdown({});
    forkJoin([quiOption$])
      .pipe(untilDestroyed(this))
      .subscribe(([resSup]) => {
        this.GUIType_Options = (resSup.Data ?? []).map((item: any) => ({
          value: item.INV_GUIType,
          label: `${item.INV_GUIType} - ${item.INV_GUIName}`,
        }));

        this.initSupplierColumns();
      });
  }

  //---發票明細---

  //欄位名稱初始化
  private initSupplierColumns() {
    this.detailColumn = [
      { field: 'PUR_VoucherType', header: '發票格式', type: 'dropdown', options: this.GUIType_Options, optionValue: 'value', optionLabel: 'label' },  // 發票格式 (憑證類別 21~29)
      { field: 'PUR_GUINo', header: '發票號碼', type: 'date' }, // 發票號碼
      { field: 'PUR_GUIDate', header: '發票日期', type: 'date' }, // 發票日期
      { field: 'PUR_RepYYYYMM', header: '申報年月', type: 'input' }, // 申報年月 (固定為雙數月)
      { field: 'PUR_VenUniform', header: '廠商統一編號', type: 'input' },  // 廠商統一編號
      { field: 'PUR_DirectType', header: '發票用途', type: 'input' }, // 發票用途 (1=營業用 2=共同使用)
      { field: 'PUR_Amt', header: '發票總金額（含稅）', type: 'inputNumber' }, // 發票總金額（含稅）

      { field: 'PUR_TaxType', header: '課稅別', type: 'input' },  // 課稅別 (0=免稅 1=應稅 2=零稅)
      { field: 'PUR_Net', header: '發票未稅金額', type: 'inputNumber' },  // 發票未稅金額
      { field: 'PUR_Tax', header: '發票稅額', type: 'inputNumber' }, // 發票稅額
    ];
  }
  onDetailChange(eventData: fin13090Detail[]) {
    console.log('eventData', eventData)
  }


  //驗證供應商資料
  validateDetail = (rowData: fin13090Detail): { isValid: boolean; errorMessage: string } => {
    // 1. 檢查發票號碼是否為空
    // const RECEIPT_NO = rowData?.RECEIPT_NO?.trim();
    // if (!RECEIPT_NO) {
    //   return { isValid: false, errorMessage: '發票號碼不能為空。' };
    // }
    // 2. 檢查發票號碼格式 (假設格式為兩碼英文+八碼數字，例如 AB12345678)
    // const receiptNoPattern = /^[A-Z]{2}\d{8}$/;
    // if (!receiptNoPattern.test(RECEIPT_NO)) {
    //   return { isValid: false, errorMessage: '發票號碼格式不正確，應為兩碼英文加八碼數字。' };
    // }
    // 3. 發票總金額應為未稅金額加稅額總金額
    // const expectedTotal = (Number(rowData.TOTAL_NTX_AMT) || 0) + (Number(rowData.TOTAL_TX_AMT) || 0);
    // if (Number(rowData.TOTAL_AMT) !== expectedTotal) {
    //   return { isValid: false, errorMessage: `含稅金額應為未稅金額加稅額，應為 (${expectedTotal}) 元。` };
    // }

    return { isValid: true, errorMessage: '' };
  }
}
