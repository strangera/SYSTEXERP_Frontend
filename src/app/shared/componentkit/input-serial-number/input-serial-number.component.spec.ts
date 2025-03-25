import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputSerialNumberComponent } from './input-serial-number.component';

describe('InputSerialNumberComponent', () => {
  let component: InputSerialNumberComponent;
  let fixture: ComponentFixture<InputSerialNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputSerialNumberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputSerialNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
