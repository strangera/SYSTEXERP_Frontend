import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTableGroupComponent } from './report-table-group.component';

describe('ReportTableGroupComponent', () => {
  let component: ReportTableGroupComponent;
  let fixture: ComponentFixture<ReportTableGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportTableGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportTableGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
