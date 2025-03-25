import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateyyOneComponent } from './dateyy-one.component';

describe('DateyyOneComponent', () => {
  let component: DateyyOneComponent;
  let fixture: ComponentFixture<DateyyOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateyyOneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateyyOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
