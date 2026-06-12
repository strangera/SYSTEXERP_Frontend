import { Component, Input, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { DropdownTableComponent, FieldsConfig } from "@shared/componentkit/dropdown-table/dropdown-table.component";
import { Subject, switchMap } from "rxjs"; // 引入 switchMap 與 Subject
import { ProductAutocompleteService } from "./product-autocomplete.service";

@UntilDestroy()
@Component({
  selector: 'app-product-autocomplete',
  standalone: true,
  template: `
    <app-dropdown-table
      [showOverlay]="false"
      [control]="control"
      [submitted]="submitted"
      optionLabel="label"
      [optionValue]="optionValue"
      [suggestions]="suggestions"
      [fieldsConfig]="fieldsConfig"
      (inputValueChanged)="onAutoCompleteInputChange($event)">
    </app-dropdown-table>
  `,
  imports: [DropdownTableComponent],
})
export class ProductAutocompleteComponent implements OnInit { // 實作 OnInit
  @Input() control = new FormControl();
  @Input() optionValue = 'PLU_No';
  @Input() submitted = false;
  @Input() extraFilters: any = {};
  suggestions: any[] = [];

  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_No', header: '國際條碼/商品管理編號/廠商貨號 - 商品名稱', mainDataField: true },
  ];

  // 1. 宣告一個專門導流查詢事件的 Subject
  private readonly queryStream$ = new Subject<string>();

  constructor(private productAutocompleteService: ProductAutocompleteService) { }

  ngOnInit(): void {
    // 2. 在 ngOnInit 建立安全的非同步管道
    this.queryStream$.pipe(
      switchMap((queryNo) => {
        // 準備 API 的請求內容
        const body = {
          ...this.extraFilters,
          queryNo: queryNo,
          pageSize: 30,
          pageIndex: 1,
          SortBy: [{ field: 'PLU_No', order: 1 }],
          PLU_Name: this.extraFilters?.PLU_Name || '',
          VEN_No: this.extraFilters?.VEN_No || '',
          LOGO_No: this.extraFilters?.LOGO_No || '',
          HOS_No: this.extraFilters?.HOS_No || '',
          CAT_LNo: this.extraFilters?.CAT_LNo || '',
          CAT_MNo: this.extraFilters?.CAT_LNo || '',
          CAT_SNo: this.extraFilters?.CAT_LNo || ''
        };

        // switchMap 會在這裡自動斬斷舊的、未完成的請求！
        return this.productAutocompleteService.queryPOS2004Detail(body);
      }),
      untilDestroyed(this)
    ).subscribe((results) => {
      // 3. 永遠只有最新那次請求的結果會進到這裡
      this.suggestions = results.Data.map(item => ({
        ...item,
        label: `${item.PLU_No}/${item.PLU_MagNo}/${item.PLU_OrgPLUNo} - ${item.PLU_Name}`
      }));
    });
  }

  onAutoCompleteInputChange(event: Record<'label', string>) {
    console.log('ProductAutocompleteComponent onAutoCompleteInputChange event =', event);
    // 4. 不直接打 API，改把關鍵字丟進管道
    this.queryStream$.next(event.label || '');
  }
}
