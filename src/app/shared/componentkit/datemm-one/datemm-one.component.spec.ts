import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatemmOneComponent } from './datemm-one.component';

describe('DatemmOneComponent', () => {
  let component: DatemmOneComponent;
  let fixture: ComponentFixture<DatemmOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatemmOneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatemmOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
