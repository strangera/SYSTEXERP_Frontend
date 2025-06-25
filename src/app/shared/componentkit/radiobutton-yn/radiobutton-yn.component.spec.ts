import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiobuttonYNComponent } from './radiobutton-yn.component';

describe('RadiobuttonYNComponent', () => {
  let component: RadiobuttonYNComponent;
  let fixture: ComponentFixture<RadiobuttonYNComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiobuttonYNComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiobuttonYNComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
