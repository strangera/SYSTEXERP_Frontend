import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputMultiDialogComponent } from './input-multi-dialog.component';

describe('InputMultiDialogComponent', () => {
  let component: InputMultiDialogComponent;
  let fixture: ComponentFixture<InputMultiDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputMultiDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputMultiDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
