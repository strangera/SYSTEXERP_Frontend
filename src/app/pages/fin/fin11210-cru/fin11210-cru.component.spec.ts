import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fin11210CruComponent } from './fin11210-cru.component';

describe('Fin11210CruComponent', () => {
  let component: Fin11210CruComponent;
  let fixture: ComponentFixture<Fin11210CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fin11210CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fin11210CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
