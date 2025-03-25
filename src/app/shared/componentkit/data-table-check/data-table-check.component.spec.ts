import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableCheckComponent } from './data-table-check.component';

describe('DataTableCheckComponent', () => {
  let component: DataTableCheckComponent;
  let fixture: ComponentFixture<DataTableCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableCheckComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTableCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
