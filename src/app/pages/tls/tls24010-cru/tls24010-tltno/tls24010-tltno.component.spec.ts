import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls24010TltnoComponent } from './tls24010-tltno.component';

describe('Tls24010TltnoComponent', () => {
  let component: Tls24010TltnoComponent;
  let fixture: ComponentFixture<Tls24010TltnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls24010TltnoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls24010TltnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
