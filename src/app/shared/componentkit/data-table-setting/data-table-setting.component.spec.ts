import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableSettingComponent } from './data-table-setting.component';

describe('DataTableSettingComponent', () => {
  let component: DataTableSettingComponent;
  let fixture: ComponentFixture<DataTableSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableSettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTableSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
