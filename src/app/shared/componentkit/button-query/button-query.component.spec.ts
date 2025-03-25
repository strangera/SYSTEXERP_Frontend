import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonQueryComponent } from './button-query.component';

describe('ButtonQueryComponent', () => {
  let component: ButtonQueryComponent;
  let fixture: ComponentFixture<ButtonQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonQueryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
