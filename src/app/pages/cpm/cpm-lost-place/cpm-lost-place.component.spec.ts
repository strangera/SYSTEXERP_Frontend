import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpmLostPlaceComponent } from './cpm-lost-place.component';

describe('CpmLostPlaceComponent', () => {
  let component: CpmLostPlaceComponent;
  let fixture: ComponentFixture<CpmLostPlaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpmLostPlaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpmLostPlaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
