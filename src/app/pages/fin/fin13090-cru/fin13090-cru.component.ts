import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { fin13090Detail, Fin13090Service } from '@service/api/fin/fin13090.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
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
import { validateMaxLength, validateMinLength, validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';

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
    CommonModule,
    NgIf,
    TableEditComponent,
    TranslateModule],
  templateUrl: './fin13090-cru.component.html'
})
export class FIN13090CRUComponent extends BasicCruPageComponent<fin13090Detail> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    VouNo: [null, [Validators.required]], // 傳票編號
    // VouDate: [null], // 傳票日期
    // PostFlag: [null], // 傳票狀態代碼
    TaxTotal: [0] // 進項稅額貸方
  });
  //---------下拉選單-------------------------------------------------------
  GUIType_Options: { value: string; label: string }[] = []; // 發票格式 (憑證類別 21~29)
  VEN_Uniform_Option: { No: string, Name: string, VEN_No: string, Label: string }[] = []; // 廠商編號
  PUR_DirectType_Options: { value: string; label: string }[] = []; // 發票用途
  PUR_TaxType_Options: { value: string; label: string }[] = []; // 課稅別
  ACP_Type_Options: { value: string; label: string }[] = []; // 應付帳款類別（1=進退貨帳款2=專櫃帳款3=事務性帳款4=預付貨款5=電子商務6=發票媒申7=總帳管理9=固定資產）
  // ---------明細 表格-------------------------------------------------------
  detailloading = false;
  orgDetailData: fin13090Detail[] = []; // 原始供應商備份
  detailData: fin13090Detail[] = [];
  detailColumn: EditColumn[] = []; //等下拉讀取完成後寫入定義
  defaultdetail = {
    'id': 0, // APS2002 主鍵 新增為0
    'ACP_Type': "7", // 應付帳款類別 (預設值7總帳管理)
    'PUR_VoucherType': null, // 發票格式 (憑證類別 21~29)
    'PUR_GUINo': null, // 發票號碼
    'PUR_GUIDate': null, // 發票日期
    'PUR_RepYYYYMM': null, // 申報年月 (固定為雙數月)
    'PUR_VenNo': null, // 廠商編號
    'PUR_VenName': null, // 廠商名稱
    'PUR_VenUniform': null, // 廠商統一編號
    'PUR_DirectType': null, // 發票用途 (1=營業用 2=共同使用)
    'PUR_Amt': null, // 發票總金額（含稅）

    'PUR_TaxType': "1", // 課稅別 (0=免稅 1=應稅 2=零稅) 預設值1應稅
    'PUR_Net': null, // 發票未稅金額
    'PUR_Tax': null  // 發票稅額
  };
  constructor(
    private fin13090Service: Fin13090Service,
    private dropdownApiService: DropdownApiService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN13090', this.dataForm);
    this.get13090Detail(this.dataForm.get('VouNo')?.value || null);
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {// 驗證單據明細
    // 檢查明細必填欄位
    if (!this.validateAllRows()) {
      return;
    }
    this.handleSubmit(frm, () => {
      const getVouNo = this.dataForm.get('VouNo')?.value
      if (getVouNo) {
        const payload = {
          VouNo: getVouNo,
          Details: this.detailData.map(item => ({
            id: item.id,
            PUR_VoucherType: item.PUR_VoucherType,
            PUR_GUINo: item.PUR_GUINo,
            PUR_GUIDate: item.PUR_GUIDate,
            PUR_RepYYYYMM: item.PUR_RepYYYYMM,
            PUR_VenNo: item.PUR_VenNo,
            PUR_VenName: item.PUR_VenName,
            PUR_VenUniform: item.PUR_VenUniform,
            ACP_Type: item.ACP_Type,
            PUR_DirectType: item.PUR_DirectType,
            PUR_TaxType: item.PUR_TaxType,
            PUR_Net: item.PUR_Net,
            PUR_Tax: item.PUR_Tax,
            PUR_Amt: item.PUR_Amt
          }))
        }
        console.log('送出請求', payload);
        switch (this.crudstatus) {
          case CRUDStatus.Create:
            if (this.canAdd()) {
              this.fin13090Service.saveFIN13090(payload).subscribe((res) => {
                if (res.Status === '0000') {
                  this.messageService.successBubble('新增成功');
                  this.dataForm.reset();
                  // 還原子表單
                  this.detailData = [];
                } else {
                  this.messageService.errorBubble('新增失敗: ' + res.Message || '新增失敗');
                }
              });
              this.loading = false
            }
            break;
          case CRUDStatus.Edit:
            if (this.canEdit()) {
              this.loading = false;
              this.fin13090Service.saveFIN13090(payload).subscribe((res) => {
                if (res.Status === '0000') {
                  this.messageService.successBubble('更新成功');
                  this.onCancel();
                } else {
                  this.messageService.errorBubble('更新失敗: ' + res.Message || '更新失敗');
                }
              });
              this.loading = false
            }
            break;
        }
      }
    });
  }
  get13090Detail(VouNo: string | null) { // 20140116003
    if (VouNo) {
      this.detailloading = true
      this.fin13090Service
        .queryFIN13090Detail({ VouNo })
        .pipe(untilDestroyed(this), finalize(() => (this.detailloading = false)))
        .subscribe(res => {
          console.log('明細資料', res);
          // 2. 程式碼存取時要加上索引
          if (res.Data) {
            const detailRow = res.Data.Details;
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
    const GUIType$ = this.fin13090Service.getGUITypeDropdown({});
    const PUR_DirectType$ = this.dropdownApiService.querySys1000({ SYS_Type: 'PUR_DirectType' })
    const PUR_TaxType$ = this.dropdownApiService.querySys1000({ SYS_Type: 'PUR_TaxType' })
    const VEN_Uniform$ = this.dropdownApiService.queryPos2013({ VEN_Flag: '' })

    forkJoin([GUIType$, VEN_Uniform$, PUR_DirectType$, PUR_TaxType$])
      .pipe(untilDestroyed(this))
      .subscribe(([guiType, venUniform, directType, taxType]) => {
        this.GUIType_Options = (guiType.Data ?? []).map((item: any) => ({ //發票格式
          value: item.INV_GUIType,
          label: `${item.INV_GUIType} - ${item.INV_GUIName}`,
        }));
        this.VEN_Uniform_Option = (venUniform ?? []).map((item: any) => ({ // 廠商統一編號 (有-)
          No: item.No,
          VEN_No: item.VEN_No,
          Name: item.Name,
          Label: `${item.VEN_No} - ${item.Name}`,
        }));
        this.PUR_DirectType_Options = (directType ?? []).map((item: any) => ({ // 發票用途
          value: item.No,
          label: item.Name,
        }));
        this.PUR_TaxType_Options = (taxType ?? []).map((item: any) => ({ // 課稅別
          value: item.No,
          label: item.Name,
        }));
        this.ACP_Type_Options = [
          { value: "1", label: "1-進退貨帳款" },
          { value: "2", label: "2-專櫃帳款" },
          { value: "3", label: "3-事務性帳款" },
          { value: "4", label: "4-預付貨款" },
          { value: "5", label: "5-電子商務" },
          { value: "6", label: "6-發票媒申" },
          { value: "7", label: "7-總帳管理" },
          { value: "9", label: "9-固定資產" },
        ]
        this.initSupplierColumns();
      });
  }

  //---明細---
  private initSupplierColumns() {
    this.detailColumn = [
      { field: 'PUR_VoucherType', header: '發票格式', type: 'dropdown', validate: [validateRequired], options: this.GUIType_Options, optionValue: 'value', optionLabel: 'label' },  // 發票格式 (憑證類別 21~29)
      { field: 'PUR_GUINo', header: '發票號碼', type: 'input', validate: [validateRequired, validateMinLength(10), validateMaxLength(10)] }, // 發票號碼
      {
        field: 'PUR_GUIDate', header: '發票日期', type: 'date', validate: [validateRequired]
      }, // 發票日期
      {
        field: 'PUR_RepYYYYMM', header: '申報年月', type: 'input',
        validate: [this.validateEvenMonth], disabled: () => true //雙數月檢查
      }, // 申報年月 (固定為雙數月)
      {
        field: 'PUR_VenNo', header: '廠商編號', type: 'dropdown', validate: [validateRequired]
        , options: this.VEN_Uniform_Option, optionValue: 'VEN_No', optionLabel: 'Label',
        onChange: (event: string, row: fin13090Detail) => {
          const selectedValue = event;
          console.log('PUR_VenNo', selectedValue);
          const vendor = this.VEN_Uniform_Option.find(v => v.VEN_No === selectedValue);
          if (vendor) {
            // 自動帶入對應欄位 (PUR_VenName、PUR_VenUniform)
            row.PUR_VenName = vendor.Name;      // 廠商名稱
            row.PUR_VenUniform = vendor.No;     // 廠商統一編號
          }
        }
      },  // 廠商統一編號
      { field: 'PUR_VenUniform', header: '廠商統一編號', type: 'input', disabled: () => true }, //檢查帶入項目
      { field: 'PUR_VenName', header: '廠商名稱', type: 'input', disabled: () => true }, //檢查帶入項目

      { field: 'PUR_DirectType', header: '發票用途', type: 'dropdown', options: this.PUR_DirectType_Options, optionValue: 'value', optionLabel: 'label' }, // 發票用途 (1=營業用 2=共同使用)
      // { field: 'ACP_Type', header: '應付帳款類別', type: 'dropdown', validate: [validateRequired], options: this.ACP_Type_Options, optionValue: 'value', optionLabel: 'label' }, // 應付帳款類別(前端都帶入7)
      { field: 'PUR_Amt', header: '發票總金額（含稅）', type: 'inputNumber', validate: [validateRequired] }, // 發票總金額（含稅）

      { field: 'PUR_TaxType', header: '課稅別', type: 'dropdown', validate: [validateRequired], options: this.PUR_TaxType_Options, optionValue: 'value', optionLabel: 'label' },  // 課稅別 (0=免稅 1=應稅 2=零稅)
      { field: 'PUR_Net', header: '發票未稅金額', type: 'inputNumber', validate: [validateRequired], disabled: () => true },  // 發票未稅金額(稅額自動計算)
      { field: 'PUR_Tax', header: '發票稅額', type: 'inputNumber', validate: [validateRequired], disabled: () => true }, // 發票稅額(稅額自動計算)
    ];
  }

  // 驗證申報年月 (必須為偶數月)
  validateEvenMonth = (value: any) => {
    // 1. 檢查是否為空 (若非必填可直接通過，若必填則交由 validateRequired)
    if (!value) return { isValid: true, errorMessage: [] };

    const valStr = String(value);
    const month = parseInt(valStr.substring(4, 6), 10);

    // 2. 基本格式檢查 (YYYYMM)
    if (!/^\d{6}$/.test(valStr) || month < 1 || month > 12) {
      return {
        isValid: false,
        errorMessage: [`格式錯誤，應為 YYYYMM (如 202402)`]
      };
    }

    // 3. 偶數月檢查
    if (month % 2 !== 0) {
      return {
        isValid: false,
        errorMessage: [`必須為雙數月`]
      };
    }

    return { isValid: true, errorMessage: [] };
  };

  // 明細送出前的驗證
  validateAllRows(): boolean {
    //必填
    for (let i = 0; i < this.detailData.length; i++) {
      const row = this.detailData[i];
      for (const col of this.detailColumn) {
        const isRequired = col.validate?.includes(validateRequired);

        // 1. 必填欄位驗證
        if (isRequired) {
          const value = (row as any)[col.field];
          if (value === null || value === undefined || value === '') {
            this.messageService.errorBubble(`第 ${i + 1} 筆明細的「${col.header}」為必填項目。`);
            return false;
          }
        }

        // 2. 金額邏輯驗證：總金額 = 未稅金額 + 稅額
        const amt = Number(row.PUR_Amt) || 0;
        const net = Number(row.PUR_Net) || 0;
        const tax = Number(row.PUR_Tax) || 0;

        // 檢查是否符合加總邏輯 (若不相等則報錯)
        if (amt !== (net + tax)) {
          this.messageService.errorBubble(
            `第 ${i + 1} 筆明細金額計算有誤：總金額(${amt}) 應等於 未稅金額(${net}) + 稅額(${tax}) 相加`
          );
          return false;
        }
      }
    }

    return true;
  }

  //明細變動檢查
  onDetailChange(newData: fin13090Detail[]) {
    // 遍歷每一筆資料進行檢查與自動帶入
    newData.forEach(row => {
      // --- 處理日期連動申報年月 ---
      if (row.PUR_GUIDate) {
        const dateValue = new Date(row.PUR_GUIDate); // 確保轉為 Date 物件
        if (!isNaN(dateValue.getTime())) {
          const year = dateValue.getFullYear();
          let month = dateValue.getMonth() + 1;

          if (month % 2 !== 0) month += 1; // 轉雙數月

          const formattedMonth = month.toString().padStart(2, '0');
          const targetYYYYMM = `${year}${formattedMonth}`;

          // 只有在值不同時才更新，避免無限迴圈
          if (row.PUR_RepYYYYMM !== targetYYYYMM) {
            row.PUR_RepYYYYMM = targetYYYYMM;
          }
        }
      }
      // --- 明細稅額計算 (課稅別 變更)---
      const amt = Number(row.PUR_Amt) || 0;
      const taxType = String(row.PUR_TaxType); // 確保是字串比較

      if (taxType === '1') {
        // 應稅：稅額 = round(總額 / 21), 未稅 = 總額 - 稅額
        const tax = Math.round(amt / 21);
        row.PUR_Tax = tax;
        row.PUR_Net = amt - tax;
      } else if (taxType === '0' || taxType === '2') {
        // 免稅 或 零稅：稅額 = 0, 未稅 = 總額
        row.PUR_Tax = 0;
        row.PUR_Net = amt;
      } else {
        // 預防萬一其他稅別
        row.PUR_Tax = 0;
        row.PUR_Net = amt;
      }
    });

    // 更新資料源並重新計算總計
    this.detailData = [...newData];
    this.calculateTaxTotal();
  }

  // 2. 實作加總邏輯
  calculateTaxTotal() {
    // 使用 reduce 累加所有明細的 PUR_Tax
    const total = this.detailData.reduce((sum, item) => {
      const tax = Number(item.PUR_Tax) || 0; // 確保是數字，避免 null 或 undefined
      return sum + tax;
    }, 0);

    // 3. 更新到 dataForm 的 TaxTotal 欄位
    this.dataForm.patchValue({
      TaxTotal: total
    });
  }

  //清除明細內容
  clearSubForm() {
    // 1. 先從備份中深拷貝出一份原始資料 (此時日期會變成字串)
    const restoredData = JSON.parse(JSON.stringify(this.orgDetailData));
    this.detailData = restoredData.map((item: any) => ({
      ...item,
      // 修正日期欄位
      PUR_GUIDate: item.PUR_GUIDate ? new Date(item.PUR_GUIDate) : null,
    }));
  }
}
