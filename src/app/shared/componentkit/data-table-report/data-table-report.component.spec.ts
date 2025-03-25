import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableReportComponent } from './data-table-report.component';

describe('DataTableReportComponent', () => {
  let component: DataTableReportComponent;
  let fixture: ComponentFixture<DataTableReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTableReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
