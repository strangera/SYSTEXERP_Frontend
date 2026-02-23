import { Component, Input } from "@angular/core";
import { FormControl } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { DropdownTableComponent, FieldsConfig } from "@shared/componentkit/dropdown-table/dropdown-table.component";
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
export class ProductAutocompleteComponent {
  @Input() control = new FormControl();
  @Input() optionValue = 'PLU_No';
  @Input() submitted = false;
  @Input() extraFilters: any = {};

  suggestions: any[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_No', header: '國際條碼/商品管理編號/廠商貨號 - 商品名稱', mainDataField: true },
  ];

  constructor(private productAutocompleteService: ProductAutocompleteService) { }

  onAutoCompleteInputChange(event: Record<'label', string>) {
    const body = {
      ...this.extraFilters,
      queryNo: event.label || '',
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

    this.productAutocompleteService.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = results.Data.map(item => ({
        ...item,
        label: `${item.PLU_No}/${item.PLU_MagNo}/${item.PLU_OrgPLUNo} - ${item.PLU_Name}`
      }));
    });
  }
}
