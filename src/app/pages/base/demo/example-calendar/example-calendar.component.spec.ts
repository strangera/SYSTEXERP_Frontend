import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleCalendarComponent } from './example-calendar.component';

describe('ExampleCalendarComponent', () => {
  let component: ExampleCalendarComponent;
  let fixture: ComponentFixture<ExampleCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExampleCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
