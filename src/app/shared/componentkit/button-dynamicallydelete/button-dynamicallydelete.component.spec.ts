import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonDynamicallydeleteComponent } from './button-dynamicallydelete.component';

describe('ButtonDynamicallydeleteComponent', () => {
  let component: ButtonDynamicallydeleteComponent;
  let fixture: ComponentFixture<ButtonDynamicallydeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonDynamicallydeleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonDynamicallydeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
