import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTextRangeComponent } from './input-text-range.component';

describe('InputNumberRangeComponent', () => {
  let component: InputTextRangeComponent;
  let fixture: ComponentFixture<InputTextRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTextRangeComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(InputTextRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
