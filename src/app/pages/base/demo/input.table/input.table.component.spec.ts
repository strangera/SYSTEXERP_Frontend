import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTableComponent } from './input.table.component';

describe('InputTableComponent', () => {
  let component: InputTableComponent;
  let fixture: ComponentFixture<InputTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
