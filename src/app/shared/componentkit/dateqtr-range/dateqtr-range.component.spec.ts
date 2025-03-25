import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateqtrRangeComponent } from './dateqtr-range.component';

describe('DateqtrRangeComponent', () => {
  let component: DateqtrRangeComponent;
  let fixture: ComponentFixture<DateqtrRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateqtrRangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateqtrRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
