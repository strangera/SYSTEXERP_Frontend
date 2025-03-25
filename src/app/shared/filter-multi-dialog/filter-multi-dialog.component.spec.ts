import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterMultiDialogComponent } from './filter-multi-dialog.component';

describe('FilterMultiDialogComponent', () => {
  let component: FilterMultiDialogComponent;
  let fixture: ComponentFixture<FilterMultiDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterMultiDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterMultiDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
