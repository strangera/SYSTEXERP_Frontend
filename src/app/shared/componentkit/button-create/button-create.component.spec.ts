import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonCreateComponent } from './button-create.component';

describe('ButtonCreateComponent', () => {
  let component: ButtonCreateComponent;
  let fixture: ComponentFixture<ButtonCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
