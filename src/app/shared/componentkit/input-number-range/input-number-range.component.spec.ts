import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputNumberRangeComponent } from './input-number-range.component';

describe('InputNumberRangeComponent', () => {
  let component: InputNumberRangeComponent;
  let fixture: ComponentFixture<InputNumberRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputNumberRangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputNumberRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
