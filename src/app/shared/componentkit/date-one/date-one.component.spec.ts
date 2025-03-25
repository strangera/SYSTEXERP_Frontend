import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateOneComponent } from './date-one.component';

describe('DateOneComponent', () => {
  let component: DateOneComponent;
  let fixture: ComponentFixture<DateOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateOneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
