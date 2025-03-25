import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckbuttonToggleComponent } from './checkbutton-toggle.component';

describe('CheckbuttonToggleComponent', () => {
  let component: CheckbuttonToggleComponent;
  let fixture: ComponentFixture<CheckbuttonToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckbuttonToggleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckbuttonToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
