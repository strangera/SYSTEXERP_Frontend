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
    TaxTotal: [null] // 進項稅額貸方
  });
  //---------下拉選單-------------------------------------------------------
  GUIType_Options: { value: string; label: string }[] = []; // 發票格式 (憑證類別 21~29)
  VEN_Uniform_Option: { value: string; label: string }[] = []; // 廠商編號
  PUR_DirectType_Options: { value: string; label: string }[] = []; // 發票用途
  PUR_TaxType_Options: { value: string; label: string }[] = []; // 課稅別
  // ---------明細 表格-------------------------------------------------------
  detailloading = false;
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
    // --------------------------
    //必須至少有一筆明細資料
    if (this.detailData.length < 1) {
      this.messageService.errorBubble('明細資料不可為空。');
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
            PUR_VenNo: item.PUR_VenUniform, // 廠商編號（由 PUR_VenUniform 帶出）
            PUR_VenUniform: item.PUR_VenUniform,
            // ACP_Type: item.ACP_Type,
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
  get13090Detail(VouNo: string | null) {
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
          value: item.VEN_No,
          label: `${item.VEN_No} - ${item.Name}`,
        }));
        this.PUR_DirectType_Options = (directType ?? []).map((item: any) => ({ // 發票用途
          value: item.No,
          label: item.Name,
        }));
        this.PUR_TaxType_Options = (taxType ?? []).map((item: any) => ({ // 課稅別
          value: item.No,
          label: item.Name,
        }));
        this.initSupplierColumns();
      });
  }

  //---明細---
  private initSupplierColumns() {
    this.detailColumn = [
      { field: 'PUR_VoucherType', header: '發票格式', type: 'dropdown', validate: [validateRequired], options: this.GUIType_Options, optionValue: 'value', optionLabel: 'label' },  // 發票格式 (憑證類別 21~29)
      { field: 'PUR_GUINo', header: '發票號碼', type: 'input', validate: [validateRequired, validateMinLength(10), validateMaxLength(10)] }, // 發票號碼
      { field: 'PUR_GUIDate', header: '發票日期', type: 'date', validate: [validateRequired] }, // 發票日期
      {
        field: 'PUR_RepYYYYMM', header: '申報年月', type: 'input',
        validate: [this.validateEvenMonth]
      }, // 申報年月 (固定為雙數月)
      { field: 'PUR_VenUniform', header: '廠商統一編號', type: 'dropdown', validate: [validateRequired], options: this.VEN_Uniform_Option, optionValue: 'value', optionLabel: 'label' },  // 廠商統一編號
      { field: 'PUR_DirectType', header: '發票用途', type: 'dropdown', options: this.PUR_DirectType_Options, optionValue: 'value', optionLabel: 'label' }, // 發票用途 (1=營業用 2=共同使用)
      { field: 'PUR_Amt', header: '發票總金額（含稅）', type: 'inputNumber', validate: [validateRequired] }, // 發票總金額（含稅）

      { field: 'PUR_TaxType', header: '課稅別', type: 'dropdown', validate: [validateRequired], options: this.PUR_TaxType_Options, optionValue: 'value', optionLabel: 'label' },  // 課稅別 (0=免稅 1=應稅 2=零稅)
      { field: 'PUR_Net', header: '發票未稅金額', type: 'inputNumber', validate: [validateRequired] },  // 發票未稅金額
      { field: 'PUR_Tax', header: '發票稅額', type: 'inputNumber', validate: [validateRequired] }, // 發票稅額
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
