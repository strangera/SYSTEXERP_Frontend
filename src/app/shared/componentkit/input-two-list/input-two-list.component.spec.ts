import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTwoListComponent } from './input-two-list.component';

describe('InputTwoListComponent', () => {
  let component: InputTwoListComponent;
  let fixture: ComponentFixture<InputTwoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTwoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputTwoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
