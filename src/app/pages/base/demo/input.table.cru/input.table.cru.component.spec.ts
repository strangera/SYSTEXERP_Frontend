import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTableCRUComponent } from './input.table.cru.component';

describe('InputTableCRUComponent', () => {
  let component: InputTableCRUComponent;
  let fixture: ComponentFixture<InputTableCRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTableCRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputTableCRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
