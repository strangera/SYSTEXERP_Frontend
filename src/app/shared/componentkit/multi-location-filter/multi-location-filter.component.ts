import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MultiLocationFilterService } from './multi-location-filter.service'; // 

@Component({
  selector: 'app-multi-location-filter',
  templateUrl: './multi-location-filter.component.html',
  styleUrls: ['./multi-location-filter.component.scss'],

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

  constructor(private multiLocationService: MultiLocationFilterService,
  ) {}

ngOnInit(): void {
  this.buildingControl = this.form.get('tlt_building') as FormControl;
  this.floorControl = this.form.get('floor_noList') as FormControl;
  this.regionControl = this.form.get('area_noList') as FormControl;

  this.loadBuildings();

  this.buildingControl.valueChanges.subscribe(() => {
    this.floorControl.reset();
    this.regionControl.reset();
    this.floorOptions = [];
    this.regionOptions = [];
    this.loadFloors();
  });

  this.floorControl.valueChanges.subscribe(() => {
    this.regionControl.reset();
    this.regionOptions = [];
    this.loadRegions();
  });
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
