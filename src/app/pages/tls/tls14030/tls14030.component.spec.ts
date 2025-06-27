import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls14030Component } from './tls14030.component';

describe('Tls14030Component', () => {
  let component: Tls14030Component;
  let fixture: ComponentFixture<Tls14030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls14030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls14030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
