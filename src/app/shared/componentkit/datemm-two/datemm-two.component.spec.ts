import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatemmTwoComponent } from './datemm-two.component';

describe('DatemmTwoComponent', () => {
  let component: DatemmTwoComponent;
  let fixture: ComponentFixture<DatemmTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatemmTwoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatemmTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
