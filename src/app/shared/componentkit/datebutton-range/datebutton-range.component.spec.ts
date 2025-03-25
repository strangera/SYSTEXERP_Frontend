import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatebuttonRangeComponent } from './datebutton-range.component';

describe('DatebuttonRangeComponent', () => {
  let component: DatebuttonRangeComponent;
  let fixture: ComponentFixture<DatebuttonRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatebuttonRangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatebuttonRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
