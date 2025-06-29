import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls14040Component } from './tls14040.component';

describe('Tls14040Component', () => {
  let component: Tls14040Component;
  let fixture: ComponentFixture<Tls14040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls14040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls14040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
