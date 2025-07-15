import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fin13050CruComponent } from './fin13050-cru.component';

describe('Fin13050CruComponent', () => {
  let component: Fin13050CruComponent;
  let fixture: ComponentFixture<Fin13050CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fin13050CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fin13050CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
