import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { BusClassItem, BusSClassItem } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { EnterToTabDirective } from '@shared/directive/enter-to-tab.directive';
import { Subject, debounceTime, of, switchMap, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-category-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MultiSelectComponent, AsyncPipe, EnterToTabDirective],
  template: `
    <div [formGroup]="innerForm" class="grid p-fluid">
      <div class="col-12 md:col-6 lg:col-4">
        <app-multi-select label="大分類代碼/名稱" [options]="bus_type_Option | async" appEnterToTab
          optionLabel="label" optionValue="No" [control]="innerForm.controls.bus_type">
        </app-multi-select>
      </div>
      <div class="col-12 md:col-6 lg:col-4">
        <app-multi-select label="中分類代碼/名稱" [options]="bus_class_Option" optionLabel="label"
          [control]="innerForm.controls.bus_class" [group]="true" optionGroupLabel="label" appEnterToTab
          optionGroupChildren="items" [loading]="loadingClass"></app-multi-select>
      </div>
      <div class="col-12 md:col-6 lg:col-4">
        <app-multi-select label="小分類代碼/名稱" [options]="bus_sclass_Option" optionLabel="label"
          [control]="innerForm.controls.bus_sclass" [group]="true" optionGroupLabel="label" appEnterToTab
          optionGroupChildren="items" [loading]="loadingSClass"></app-multi-select>
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategorySelectComponent),
      multi: true
    }
  ]
})
export class CategorySelectComponent implements ControlValueAccessor, OnInit, OnDestroy {
  innerForm = new FormGroup({
    bus_type: new FormControl<string[]>([]),
    bus_class: new FormControl<BusClassItem[]>([]),
    bus_sclass: new FormControl<BusSClassItem[]>([])
  });

  bus_type_Option = this.dropdown.queryTltBusType();
  bus_class_Option: any[] = [];
  bus_sclass_Option: any[] = [];

  loadingClass = false;
  loadingSClass = false;

  private destroy$ = new Subject<void>();
  onChange: any = () => { };
  onTouched: any = () => { };

  constructor(private dropdown: DropdownApiService) { }

  ngOnInit() {
    this.setupListeners();
    // 監聽整個 innerForm 的變化並傳回父組件
    this.innerForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => {
      this.onChange(val);
    });
  }

  private setupListeners() {
    // 1. 大分類連動
    this.innerForm.controls.bus_type.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$),
      tap(types => {
        // 只有在真的有值要查的時候才轉圈
        if (types?.length) {
          this.loadingClass = true;
        } else {
          this.loadingClass = false; // 沒值就直接關掉
        }
      }),
      switchMap(types => (!types?.length ? of(null) : this.dropdown.queryTltBusClass({ bus_type: types })))
    ).subscribe(data => {
      this.bus_class_Option = data ? this.groupBy(data, 'bus_type', (item) => `${item.bus_type} - ${item.bus_type_name}`) : [];
      if (!data) this.innerForm.controls.bus_class.setValue([], { emitEvent: true });
      this.loadingClass = false;
    });

    // 2. 中分類連動
    this.innerForm.controls.bus_class.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$),
      tap(selectedClasses => {
        if (selectedClasses?.length) {
          this.loadingSClass = true;
        } else {
          this.loadingSClass = false;
        }
      }),
      switchMap(selectedClasses => {
        if (!selectedClasses?.length) return of(null);
        const payload = { queryTLTBUSSCLASSInfos: selectedClasses.map(c => ({ bus_type: c.bus_type, bus_class: c.No })) };
        return this.dropdown.queryTltBusSClass(payload);
      })
    ).subscribe(data => {
      this.bus_sclass_Option = data ? this.groupBy(data, (item: BusSClassItem) => `${item.bus_type}_${item.bus_class}`, (item) => `${item.bus_type_name} - ${item.bus_class_name}`) : [];
      if (!data) this.innerForm.controls.bus_sclass.setValue([], { emitEvent: true });
      this.loadingSClass = false;
    });
  }

  /** 通用分組工具函數 */
  private groupBy<T>(
    data: T[],
    keyGetter: ((item: T) => string) | keyof T,
    labelGetter: (item: T) => string
  ): any[] {
    const grouped = data.reduce((acc, item) => {
      // 判斷 keyGetter 是函式還是屬性名稱
      const key = typeof keyGetter === 'function'
        ? keyGetter(item)
        : String(item[keyGetter]); // 使用 String() 確保轉換為字串索引

      if (!acc[key]) {
        acc[key] = { label: labelGetter(item), items: [] };
      }

      acc[key].items.push({
        ...item,
        label: `${(item as any).No} - ${(item as any).Name}`
      });
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }

  // ControlValueAccessor 介面實作
  writeValue(value: any): void {
    if (value) this.innerForm.patchValue(value, { emitEvent: false });
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
