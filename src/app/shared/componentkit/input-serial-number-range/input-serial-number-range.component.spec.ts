import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputSerialNumberRangeComponent } from './input-serial-number-range.component';

describe('InputSerialNumberRangeComponent', () => {
  let component: InputSerialNumberRangeComponent;
  let fixture: ComponentFixture<InputSerialNumberRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputSerialNumberRangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputSerialNumberRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
