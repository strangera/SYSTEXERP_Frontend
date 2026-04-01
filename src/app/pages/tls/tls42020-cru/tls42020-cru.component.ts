import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS42020Data, TLS42020DetailData, TLS42020InsertUpdateDetailData, TLS42020Service } from '@service/api/tls/tls42020.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { PanelModule } from 'primeng/panel';
import { finalize, map, Observable, of, shareReplay } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

@Component({
  selector: 'app-tls42020-cru',
  templateUrl: './tls42020-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    TranslateModule,
    NgIf,
    TableEditComponent,
    AsyncPipe
  ]
})
export class TLS42020CRUComponent extends BasicCruPageComponent<TLS42020Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    MID: [{ value: this.authService.currentUserValue?.mid, disabled: true }],
    STO_No: [{ value: this.authService.currentUserValue?.SYS_StoreNo, disabled: true }],
    SBM_Type: ['' as string, Validators.required],
    TLT_No: ['' as string, Validators.required],
    TLT_Name: [{ value: '', disabled: true }],
    SBM_BegDate: ['', Validators.required],
    SBM_EndDate: ['', Validators.required]
  });
  data: TLS42020DetailData[] = [];
  gridDefaultData = { TLT_No: '' };
  private originalDetailData: TLS42020DetailData[] = [];
  menuTypeOptions = getSYS1000Options('SBM_Type');
  tltNoOptions = this.dropDown.queryTltTalent();
  private pluOptionsCache = new Map<string, Observable<any[]>>();
  private latestPluData = new Map<string, any[]>();
  columns: EditColumn[] = [
    { field: 'SBM_BtnNo', header: '菜單按鍵序號', type: 'input', validate: [validateRequired] },
    {
      field: 'PLU_MagNo',
      header: '商品管理碼',
      type: 'dropdown',
      optionsAsync: true,
      triggerFields: ['TLT_No'],
      options: () => {
        const tltNo = this.dataForm.get('TLT_No')?.value;
        if (!tltNo) return of([]);
        if (!this.pluOptionsCache.has(tltNo)) {
          const obs = this.tls42020Service.dropdownTLS42020({ TLT_NO: tltNo }).pipe(
            map(res => res?.Data || []),
            map(data => {
              this.latestPluData.set(tltNo, data);
              return data;
            }),
            shareReplay({ bufferSize: 1, refCount: true })
          );
          this.pluOptionsCache.set(tltNo, obs);
        }
        return this.pluOptionsCache.get(tltNo)!;
      },
      optionLabel: 'PLU_MagNo',
      optionValue: 'PLU_MagNo', // 🎯 使用者要求的字串值
      templateLabel: 'label',
      showClear: true,
      onBlur: (rowData) => this.syncProductData(rowData, 'PLU_MagNo') // 🎯 失焦觸發偵測
    },
    {
      field: 'PLU_No', header: '國際條碼', type: 'input',
      onBlur: (rowData) => this.syncProductData(rowData, 'PLU_No')
    },
    {
      field: 'PLU_Name', header: '商品名稱', type: 'input', validate: [validateRequired],
      onBlur: (rowData) => {
        if (rowData.PLU_Name && !rowData.PLU_PrnName) {
          rowData.PLU_PrnName = rowData.PLU_Name;
        }
      }
    },
    { field: 'PLU_PrnName', header: '商品列印名稱', type: 'input' },
    { field: 'PLU_FixPrc', header: '商品定價', type: 'inputNumber' },
    {
      field: 'PLU_SalePrc', header: '商品售價', type: 'inputNumber', validate: [validateRequired],
      onBlur: (rowData) => {
        if (rowData.PLU_SalePrc !== null && rowData.PLU_SalePrc !== undefined && !rowData.PLU_FixPrc) {
          rowData.PLU_FixPrc = rowData.PLU_SalePrc;
        }
      }
    }
  ];
  /**
   * 🎯 核心連動邏輯：根據目前輸入的欄位值，去商品清單找對應項目並填入
   */
  private syncProductData(rowData: any, triggerField: string) {
    const tltNo = this.dataForm.get('TLT_No')?.value;
    if (!tltNo) return;
    const productList = this.latestPluData.get(tltNo);
    const inputValue = rowData[triggerField];

    if (!productList || !inputValue) return;

    // 尋找匹配的商品
    const found = productList.find(item => String(item[triggerField]) === String(inputValue));

    if (found) {
      rowData.PLU_MagNo = found.PLU_MagNo;
      rowData.PLU_No = found.PLU_No;
      rowData.PLU_Name = found.PLU_Name;
      rowData.PLU_PrnName = found.PLU_PrnName || found.PLU_Name;
      rowData.PLU_FixPrc = found.PLU_FixPrc;
      rowData.PLU_SalePrc = found.PLU_SalePrc;
      this.cdr.markForCheck();
    }
  }
  constructor(
    private readonly tls42020Service: TLS42020Service,
    private readonly datePipe: DatePipe,
    private readonly dropDown: DropdownApiService,
    private readonly cdr: ChangeDetectorRef
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS42020', this.dataForm);
    this.dataForm.get('TLT_No')?.valueChanges.pipe(untilDestroyed(this)).subscribe(newTltNo => {
      this.pluOptionsCache.clear();
      this.gridDefaultData = { ...this.gridDefaultData, TLT_No: newTltNo };
      if (this.data) {
        this.data = this.data.map(row => ({
          ...row,
          TLT_No: newTltNo,
        }));
      }
      this.cdr.markForCheck();
    });
    this.loadDetail();
  }
  private loadDetail() {
    if (this.rowdata && !this.isFormCreateable) {
      this.dataForm.controls['TLT_No'].disable();
      const detailReq = {
        MID: this.rowdata.mid,
        STO_No: this.rowdata.STO_No,
        SBM_Type: this.rowdata.SBM_Type?.toString() ?? '',
        TLT_No: this.rowdata.TLT_No,
        SBM_BegDate: this.datePipe.transform(this.rowdata.SBM_BegDate, 'yyyy-MM-ddTHH:mm:ss') ?? '',
      };
      this.tls42020Service.queryTLS42020Detail(detailReq).pipe(untilDestroyed(this)).subscribe(res => {
        this.data = res.Data;
        this.originalDetailData = [...this.data];
        this.cdr.markForCheck();
      });
    }
  }
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      }
      const formValue = this.dataForm.getRawValue();
      // 🎯 處理明細資料與自動補值
      const detailData: TLS42020InsertUpdateDetailData[] = this.data.map((item) => {
        // 若提交前沒輸入，自動給值
        const finalFixPrc = (item.PLU_FixPrc === null || item.PLU_FixPrc === undefined) ? item.PLU_SalePrc : item.PLU_FixPrc;
        const finalPrnName = (!item.PLU_PrnName || item.PLU_PrnName.trim() === '') ? item.PLU_Name : item.PLU_PrnName;

        return {
          ID: item.ID.toString()?.startsWith('temp-') ? 0 : item.ID ?? 0,
          MID: formValue.MID ?? 0,
          STO_No: formValue.STO_No ?? '',
          SBM_Type: formValue.SBM_Type?.toString() ?? '',
          TLT_No: formValue.TLT_No ?? '',
          TLT_Name: formValue.TLT_Name ?? '',
          SBM_BegDate: formValue.SBM_BegDate ? new Date(formValue.SBM_BegDate).toISOString() : '',
          SBM_EndDate: formValue.SBM_EndDate ? new Date(formValue.SBM_EndDate).toISOString() : '',
          SBM_SeqNo: item.SBM_SeqNo ?? 0,
          PLU_MagNo: item.PLU_MagNo ?? '',
          PLU_No: item.PLU_No || item.PLU_MagNo, // 依照後端邏輯，若 PLU_No 為空則補 MagNo
          PLU_Name: item.PLU_Name,
          PLU_PrnName: finalPrnName,
          PLU_FixPrc: finalFixPrc,
          PLU_SalePrc: item.PLU_SalePrc,
          SBM_BtnNo: item.SBM_BtnNo
        };
      });

      const payload = {
        ID: this.rowdata?.id ?? undefined,
        MID: formValue.MID ?? 0,
        STO_No: formValue.STO_No ?? '',
        TLT_No: formValue.TLT_No ?? undefined,
        TLT_Name: formValue.TLT_Name ?? '',
        SBM_Type: formValue.SBM_Type?.toString() ?? '',
        SBM_BegDate: formValue.SBM_BegDate ? new Date(formValue.SBM_BegDate).toISOString() : '',
        SBM_EndDate: formValue.SBM_EndDate ? new Date(formValue.SBM_EndDate).toISOString() : '',
        POS10271: detailData
      };

      const req = this.isFormCreateable
        ? this.tls42020Service.insertTLS42020(payload)
        : this.tls42020Service.updateTLS42020(payload);

      req.pipe(untilDestroyed(this), finalize(() => (this.loading = false))).subscribe(res => {
        this.messageService.successBubble(res.Message ?? '更新成功');
        if (this.isFormCreateable) {
          this.dataForm.reset();
          this.data = [];
        } else {
          this.onCancel();
        }
      });
    });
  }
}
