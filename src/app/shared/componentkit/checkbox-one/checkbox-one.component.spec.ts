import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxOneComponent } from './checkbox-one.component';

describe('CheckboxOneComponent', () => {
  let component: CheckboxOneComponent;
  let fixture: ComponentFixture<CheckboxOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxOneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckboxOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
