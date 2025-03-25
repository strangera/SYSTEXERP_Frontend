import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputThreeDialogComponent } from './input-three-dialog.component';

describe('InputThreeDialogComponent', () => {
  let component: InputThreeDialogComponent;
  let fixture: ComponentFixture<InputThreeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputThreeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputThreeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
