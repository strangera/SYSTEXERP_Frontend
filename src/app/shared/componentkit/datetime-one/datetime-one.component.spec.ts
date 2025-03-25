import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatetimeOneComponent } from './datetime-one.component';

describe('DatetimeOneComponent', () => {
  let component: DatetimeOneComponent;
  let fixture: ComponentFixture<DatetimeOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatetimeOneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatetimeOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
