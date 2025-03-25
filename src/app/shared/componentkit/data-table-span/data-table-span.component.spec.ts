import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableSpanComponent } from './data-table-span.component';

describe('DataTableSpanComponent', () => {
  let component: DataTableSpanComponent;
  let fixture: ComponentFixture<DataTableSpanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableSpanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTableSpanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
