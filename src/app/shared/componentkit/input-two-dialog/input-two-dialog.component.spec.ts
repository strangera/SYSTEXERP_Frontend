import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTwoDialogComponent } from './input-two-dialog.component';

describe('InputTwoDialogComponent', () => {
  let component: InputTwoDialogComponent;
  let fixture: ComponentFixture<InputTwoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTwoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputTwoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
