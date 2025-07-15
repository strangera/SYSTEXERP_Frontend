import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fin13060Component } from './fin13060.component';

describe('Fin13060Component', () => {
  let component: Fin13060Component;
  let fixture: ComponentFixture<Fin13060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fin13060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fin13060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
