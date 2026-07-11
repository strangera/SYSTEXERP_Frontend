import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DropdownComponent } from '../../componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../componentkit/multi-select/multi-select.component';
import { MultiLocationFilterService } from './multi-location-filter.service';

@Component({
  selector: 'app-multi-location-filter',
  templateUrl: './multi-location-filter.component.html',
  standalone: true,
  imports: [DropdownComponent, MultiSelectComponent],
})
export class MultiLocationFilterComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() submitted = false;

  buildingOptions: any[] = [];
  floorOptions: any[] = [];
  regionOptions: any[] = [];

  buildingControl!: FormControl;
  floorControl!: FormControl;
  regionControl!: FormControl;

  constructor(private readonly multiLocationService: MultiLocationFilterService) { }

  ngOnInit(): void {
    this.buildingControl = this.form.get('tlt_building') as FormControl;
    this.floorControl = this.form.get('floor_noList') as FormControl;
    this.regionControl = this.form.get('area_noList') as FormControl;

    this.loadBuildings();
    this.loadFloors();
    this.loadRegions();
  }

  loadBuildings() {
    this.multiLocationService.getBuildingOptions().subscribe(res => this.buildingOptions = res);
  }

  loadFloors() {
    this.multiLocationService.getFloors().subscribe(res => this.floorOptions = res);
  }

  loadRegions() {
    this.multiLocationService.getRegionOptions().subscribe(res => this.regionOptions = res);
  }


  handleEnterKey(event: Event): void {
    // 將 event 轉型為 KeyboardEvent
    const keyboardEvent = event as KeyboardEvent;
    const target = keyboardEvent.target as HTMLElement;

    // 之後的邏輯使用 keyboardEvent 或 target 即可
    if (target.tagName === 'BUTTON' || target.tagName === 'TEXTAREA') {
      return;
    }

    keyboardEvent.preventDefault();

    // 定義所有可被跳轉到的選擇器
    const focusableSelector = 'input:not([disabled]), select:not([disabled]), p-dropdown, p-calendar, [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(document.querySelectorAll(focusableSelector)) as HTMLElement[];

    const index = focusableElements.indexOf(target);

    if (index > -1 && focusableElements[index + 1]) {
      const nextElement = focusableElements[index + 1];

      // 針對 PrimeNG 這類包裝元件，嘗試找到內部的 input
      const pInput = nextElement.querySelector('input');
      if (pInput) {
        pInput.focus();
      } else {
        nextElement.focus();
      }
    }
  }
}
