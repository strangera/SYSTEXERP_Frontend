import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MultiLocationFilterService } from './multi-location-filter.service';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { MultiSelectComponent } from '../multi-select/multi-select.component';

@Component({
    selector: 'app-multi-location-filter',
    templateUrl: './multi-location-filter.component.html',
    styleUrls: ['./multi-location-filter.component.scss'],
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

  constructor(private multiLocationService: MultiLocationFilterService) {}

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
