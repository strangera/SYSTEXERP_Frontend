import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateyyRangeComponent } from './dateyy-range.component';

describe('DateyyRangeComponent', () => {
  let component: DateyyRangeComponent;
  let fixture: ComponentFixture<DateyyRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateyyRangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateyyRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
