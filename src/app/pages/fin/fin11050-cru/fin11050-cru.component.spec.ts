import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fin11050CruComponent } from './fin11050-cru.component';

describe('Fin11050CruComponent', () => {
  let component: Fin11050CruComponent;
  let fixture: ComponentFixture<Fin11050CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fin11050CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fin11050CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
