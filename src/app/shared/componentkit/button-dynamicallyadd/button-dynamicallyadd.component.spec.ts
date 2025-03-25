import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonDynamicallyaddComponent } from './button-dynamicallyadd.component';

describe('ButtonDynamicallyaddComponent', () => {
  let component: ButtonDynamicallyaddComponent;
  let fixture: ComponentFixture<ButtonDynamicallyaddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonDynamicallyaddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonDynamicallyaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
