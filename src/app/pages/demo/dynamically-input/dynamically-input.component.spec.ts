import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicallyInputComponent } from './dynamically-input.component';

describe('DynamicallyInputComponent', () => {
  let component: DynamicallyInputComponent;
  let fixture: ComponentFixture<DynamicallyInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicallyInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicallyInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
