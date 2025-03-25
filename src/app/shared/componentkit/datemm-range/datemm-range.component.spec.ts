import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatemmRangeComponent } from './datemm-range.component';

describe('DatemmRangeComponent', () => {
  let component: DatemmRangeComponent;
  let fixture: ComponentFixture<DatemmRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatemmRangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatemmRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
