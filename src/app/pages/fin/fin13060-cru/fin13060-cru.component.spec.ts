import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fin13060CruComponent } from './fin13060-cru.component';

describe('Fin13060CruComponent', () => {
  let component: Fin13060CruComponent;
  let fixture: ComponentFixture<Fin13060CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fin13060CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fin13060CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
