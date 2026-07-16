import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EnterToTabDirective } from '@shared/directive/enter-to-tab.directive';
import { DropdownComponent } from '../../components/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../components/multi-select/multi-select.component';
import { MultiLocationFilterService } from './multi-location-filter.service';

@Component({
  selector: 'app-multi-location-filter',
  templateUrl: './multi-location-filter.component.html',
  standalone: true,
  imports: [DropdownComponent, MultiSelectComponent, EnterToTabDirective],
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


}
