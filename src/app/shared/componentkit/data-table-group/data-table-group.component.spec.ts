import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableGroupComponent } from './data-table-group.component';

describe('DataTableGroupComponent', () => {
  let component: DataTableGroupComponent;
  let fixture: ComponentFixture<DataTableGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTableGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
