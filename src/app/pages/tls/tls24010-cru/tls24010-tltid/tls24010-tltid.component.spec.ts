import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls24010TltidComponent } from './tls24010-tltid.component';

describe('Tls24010TltidComponent', () => {
  let component: Tls24010TltidComponent;
  let fixture: ComponentFixture<Tls24010TltidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls24010TltidComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls24010TltidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
