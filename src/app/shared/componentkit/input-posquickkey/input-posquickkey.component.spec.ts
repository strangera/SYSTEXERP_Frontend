import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputPOSQuickkeyComponent } from './input-posquickkey.component';

describe('InputPOSQuickkeyComponent', () => {
  let component: InputPOSQuickkeyComponent;
  let fixture: ComponentFixture<InputPOSQuickkeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputPOSQuickkeyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputPOSQuickkeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
