import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11040Service, QueryASS11040Request, QueryASS11040Response } from '@service/api/ass/ass11040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
//3.1.1.4 品項資料維護作業
@UntilDestroy()
@Component({
  selector: 'app-ass11040',
  templateUrl: './ass11040.component.html',
  standalone: true,
  imports: [InputTextareaComponent, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, InputTextComponent, DropdownComponent, TranslateModule]
})
export class ASS11040Component extends BasicQueryPageComponent<QueryASS11040Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    itemCode: [null, [Validators.maxLength(13)]], // 品項代碼
    itemName: [null, [Validators.maxLength(32)]], // 品項名稱
    bigCategoryCode: [null as string | null], // 大分類代碼
    midCategoryCode: [null as string | null], // 中分類代碼
    smlCategoryCode: [null as string | null], // 小分類代碼
    itemCategory: [null], // 品項類別區分
    itemUnit: [null], // 基本單位
    packageUnit: [null], // 包裝單位
    warrantyMethod: [null], // 保固方式
    maintenanceMethod: [null], // 保養方式
    illustrate: [null], // 說明
  });

  itemCategoryOptions = getSYS1000Options('PROD_TYPE');
  itemUnitOptions = getSYS1000Options('UNIT');
  packageUnitOptions = getSYS1000Options('PACK_UNIT');
  bigCategoryCodeOptions: { value: string; label: string }[] = [];
  midCategoryCodeOptions: { value: string; label: string }[] = [];
  smlCategoryCodeOptions: { value: string; label: string }[] = [];

  warrantyMethodOptions: { value: string; label: string }[] = [
    { value: '0', label: '廠商' },
    { value: '1', label: '公司' },
  ];
  maintenanceMethodOptions: { value: string; label: string }[] = [
    { value: '0', label: '廠商' },
    { value: '1', label: '公司' },
  ];
  data: QueryASS11040Response[] = [];
  selectedRows: QueryASS11040Response[] = [];
  totalRecords = 0;
  lastQuery: QueryASS11040Request | null = null;
  columns: ReportColumn[] = [
    { field: 'GOODS_ID', header: '品項代碼', visible: true },
    { field: 'GOODS_NAME', header: '品項名稱', visible: true },
    { field: 'B_CLASS_ID', header: '大分類代碼', visible: true },
    { field: 'B_CLASS_NAME', header: '大分類名稱', visible: true },
    { field: 'M_CLASS_ID', header: '中分類代碼', visible: true },
    { field: 'M_CLASS_NAME', header: '中分類名稱', visible: true },
    { field: 'S_CLASS_ID', header: '小分類代碼', visible: true },
    { field: 'S_CLASS_NAME', header: '小分類名稱', visible: true },
    { field: 'MATERIAL_TYPE_NAME', header: '品項類別區分', visible: true },
    { field: 'NOTES', header: '說明', visible: true },
  ];
  // ----------------------------------------------------------------

  constructor(
    public readonly ass11040Service: ASS11040Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('ASS11040', 'ass/ass11040cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadBigCategoryOptions();
    this.setupCategoryListeners();
  }

  /** 載入大分類選項 */
  loadBigCategoryOptions(): void {
    this.ass11040Service.queryFACLASSM({}).pipe(untilDestroyed(this)).subscribe(res => {
      this.bigCategoryCodeOptions = (res.Data?.Data || []).map(item => ({
        value: item.CLASS_ID || '',
        label: `${item.CLASS_ID} - ${item.CLASS_NAME}`
      }));
    });
  }

  /** 設定分類連動監聽 */
  setupCategoryListeners(): void {
    // 監聽大分類變更 -> 載入中分類
    this.queryForm.controls.bigCategoryCode.valueChanges.pipe(untilDestroyed(this)).subscribe(bigCode => {
      // 清空中分類和小分類
      this.queryForm.controls.midCategoryCode.setValue(null);
      this.queryForm.controls.smlCategoryCode.setValue(null);
      this.midCategoryCodeOptions = [];
      this.smlCategoryCodeOptions = [];

      if (bigCode) {
        this.loadMidCategoryOptions(bigCode);
      }
    });

    // 監聽中分類變更 -> 載入小分類
    this.queryForm.controls.midCategoryCode.valueChanges.pipe(untilDestroyed(this)).subscribe(midCode => {
      // 清空小分類
      this.queryForm.controls.smlCategoryCode.setValue(null);
      this.smlCategoryCodeOptions = [];

      if (midCode) {
        this.loadSmlCategoryOptions(midCode);
      }
    });
  }

  /** 載入中分類選項 */
  loadMidCategoryOptions(bigCategoryCode: string): void {
    this.ass11040Service.queryFACLASS1({ B_CLASS_ID: bigCategoryCode }).pipe(untilDestroyed(this)).subscribe(res => {
      this.midCategoryCodeOptions = (res.Data?.Data || []).map(item => ({
        value: item.CLASS_ID || '',
        label: `${item.CLASS_ID} - ${item.CLASS_NAME}`
      }));
    });
  }

  /** 載入小分類選項 */
  loadSmlCategoryOptions(midCategoryCode: string): void {
    this.ass11040Service.queryFACLASS2({ M_CLASS_ID: midCategoryCode }).pipe(untilDestroyed(this)).subscribe(res => {
      this.smlCategoryCodeOptions = (res.Data?.Data || []).map(item => ({
        value: item.S_CLASS_ID || '',
        label: `${item.S_CLASS_ID} - ${item.S_CLASS_NAME}`
      }));
    });
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      const request: QueryASS11040Request = {
        GOODS_ID: formValue.itemCode,
        GOODS_NAME: formValue.itemName,
        B_CLASS_ID: formValue.bigCategoryCode,
        M_CLASS_ID: formValue.midCategoryCode,
        S_CLASS_ID: formValue.smlCategoryCode,
        MATERIAL_TYPE: formValue.itemCategory,
        UNIT: formValue.itemUnit,
        PACK_UNIT: formValue.packageUnit,
        MT_MODE: formValue.warrantyMethod,
        IVN_MODE: formValue.maintenanceMethod,
        NOTES_KW: formValue.illustrate,
      };
      this.ass11040Service.queryFASITEM(request).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data?.Data || [];
        this.totalRecords = res.Data?.TotalCount || 0;
        this.lastQuery = request;
        this.queryStateService.setQueryState(this.ProgNo, formValue);
      });
    });
  }


  onDelete(selectedItems: QueryASS11040Response[]) {
    this.messageService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料?`,
      accept: () => {
        const idList = selectedItems.map(item => item.ID);
        // this.ass11040Service.deleteASS11040({ idList }).pipe(untilDestroyed(this)).subscribe(() => {
        //     this.messageService.successBubble('刪除成功');
        //     this.onSubmit(this.queryForm);
        //   });
      }
    });
  }
}
