import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputThreeLayerDialogComponent } from './input-three-layer-dialog.component';

describe('InputThreeLayerDialogComponent', () => {
  let component: InputThreeLayerDialogComponent;
  let fixture: ComponentFixture<InputThreeLayerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputThreeLayerDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputThreeLayerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
